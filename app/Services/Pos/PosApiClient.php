<?php

namespace App\Services\Pos;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Typed HTTP client for the CIAAAA POS API.
 *
 * Responsibilities:
 *  - Inject the bearer access token from the session-backed token store.
 *  - Transparently refresh the access token on a 401 and retry the request once.
 *  - Retry transient connection failures.
 *  - Map the API's uniform error envelope to {@see PosApiException}.
 *
 * All domain data flows through here — this application keeps no domain data in
 * its own database.
 */
class PosApiClient
{
    public function __construct(private readonly PosTokenStore $tokens) {}

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    public function get(string $path, array $query = []): array
    {
        return $this->send('get', $path, $query);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array<string, mixed>
     */
    public function post(string $path, array $body = []): array
    {
        return $this->send('post', $path, $body);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array<string, mixed>
     */
    public function patch(string $path, array $body = []): array
    {
        return $this->send('patch', $path, $body);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array<string, mixed>
     */
    public function put(string $path, array $body = []): array
    {
        return $this->send('put', $path, $body);
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array<string, mixed>
     */
    public function delete(string $path, array $body = []): array
    {
        return $this->send('delete', $path, $body);
    }

    /**
     * Authenticate a user. Returns the raw login payload
     * { accessToken, refreshToken, user }. Does NOT persist anything — the
     * caller decides whether the user is allowed into the dashboard first.
     *
     * @return array{accessToken: string, refreshToken: string, user: array<string, mixed>}
     */
    public function login(string $email, string $password): array
    {
        $body = ['email' => $email, 'password' => $password];

        /** @var array{accessToken: string, refreshToken: string, user: array<string, mixed>} $payload */
        $payload = $this->dispatch(
            fn (PendingRequest $r) => $r->post('/auth/login', $body),
        );

        return $payload;
    }

    /**
     * Upload a file as multipart/form-data (e.g. product image → Cloudinary via
     * the API). Refreshes the token once on a 401.
     *
     * @return array<string, mixed>
     */
    public function upload(string $path, string $field, string $contents, string $filename): array
    {
        $call = fn (): array => $this->dispatchUpload($path, $field, $contents, $filename);

        try {
            return $call();
        } catch (PosApiException $e) {
            if (! $e->isUnauthorized() || ! $this->refreshAccessToken()) {
                throw $e;
            }

            return $call();
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function dispatchUpload(string $path, string $field, string $contents, string $filename): array
    {
        // Built without asJson() — a pinned JSON Content-Type would clobber the
        // multipart boundary and break the API's upload parsing.
        $request = $this->baseRequest(json: false)
            ->attach($field, $contents, $filename);

        if ($token = $this->tokens->accessToken()) {
            $request = $request->withToken($token);
        }

        try {
            $response = $request->post($path);
        } catch (ConnectionException $e) {
            throw PosApiException::connection($e->getMessage(), $e);
        }

        return $this->decode($response);
    }

    /**
     * Fetch a raw (non-JSON) response body — e.g. a CSV export. Refreshes the
     * token once on a 401. Returns the body string.
     *
     * @param  array<string, mixed>  $query
     */
    public function raw(string $path, array $query = []): string
    {
        $call = function (): Response {
            try {
                $response = $this->authorized()->get($path, $query);
            } catch (ConnectionException $e) {
                throw PosApiException::connection($e->getMessage(), $e);
            }

            if ($response->failed()) {
                throw PosApiException::fromResponse(
                    $response->status(),
                    is_array($response->json()) ? $response->json() : [],
                );
            }

            return $response;
        };

        try {
            return $call()->body();
        } catch (PosApiException $e) {
            if (! $e->isUnauthorized() || ! $this->refreshAccessToken()) {
                throw $e;
            }

            return $call()->body();
        }
    }

    /**
     * Invalidate the current session's tokens on the API. Best-effort.
     */
    public function logout(): void
    {
        $refreshToken = $this->tokens->refreshToken();

        try {
            $this->authorized()->post('/auth/logout', $refreshToken ? compact('refreshToken') : []);
        } catch (\Throwable $e) {
            Log::warning('POS logout failed', ['message' => $e->getMessage()]);
        }
    }

    /**
     * Send an authorized request, refreshing the token once on a 401.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function send(string $method, string $path, array $payload): array
    {
        $isRead = in_array($method, ['get', 'delete'], true);

        $call = fn (): array => $this->dispatch(function (PendingRequest $request) use ($method, $path, $payload, $isRead) {
            return $isRead
                ? $request->{$method}($path, $payload)
                : $request->{$method}($path, $payload);
        }, authorized: true);

        try {
            return $call();
        } catch (PosApiException $e) {
            if (! $e->isUnauthorized() || ! $this->refreshAccessToken()) {
                throw $e;
            }

            // Retry once with the freshly rotated token.
            return $call();
        }
    }

    /**
     * Attempt to rotate the access token using the stored refresh token.
     */
    private function refreshAccessToken(): bool
    {
        $refreshToken = $this->tokens->refreshToken();

        if ($refreshToken === null) {
            return false;
        }

        try {
            /** @var array{accessToken: string, refreshToken: string} $payload */
            $payload = $this->dispatch(
                fn (PendingRequest $r) => $r->post('/auth/refresh', ['refreshToken' => $refreshToken]),
            );
        } catch (PosApiException) {
            return false;
        }

        $this->tokens->setTokens($payload['accessToken'], $payload['refreshToken']);

        return true;
    }

    /**
     * Execute a request against the API and decode/validate the response.
     *
     * @param  callable(PendingRequest): Response  $callback
     * @return array<string, mixed>
     */
    private function dispatch(callable $callback, bool $authorized = false): array
    {
        $request = $authorized ? $this->authorized() : $this->baseRequest();

        try {
            $response = $callback($request);
        } catch (ConnectionException $e) {
            throw PosApiException::connection($e->getMessage(), $e);
        }

        return $this->decode($response);
    }

    /**
     * @return array<string, mixed>
     */
    private function decode(Response $response): array
    {
        if ($response->successful()) {
            // 204 and empty bodies decode to an empty array.
            return $response->json() ?? [];
        }

        throw PosApiException::fromResponse(
            $response->status(),
            is_array($response->json()) ? $response->json() : [],
        );
    }

    private function authorized(): PendingRequest
    {
        $request = $this->baseRequest();
        $token = $this->tokens->accessToken();

        return $token ? $request->withToken($token) : $request;
    }

    private function baseRequest(bool $json = true): PendingRequest
    {
        $request = Http::baseUrl(config('pos.base_url'))
            ->acceptJson()
            ->timeout(config('pos.timeout'))
            ->connectTimeout(config('pos.connect_timeout'))
            ->retry(
                config('pos.retry.times'),
                config('pos.retry.sleep_ms'),
                when: fn ($e) => $e instanceof ConnectionException,
                throw: false,
            );

        return $json ? $request->asJson() : $request;
    }
}
