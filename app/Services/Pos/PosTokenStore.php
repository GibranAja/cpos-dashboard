<?php

namespace App\Services\Pos;

use Illuminate\Contracts\Session\Session;

/**
 * Server-side, httpOnly storage of the POS API tokens and the authenticated
 * user. Tokens never leave the Laravel session — the browser only ever sees
 * the sanitized user object shared through Inertia.
 */
class PosTokenStore
{
    private const ACCESS = 'pos.access_token';

    private const REFRESH = 'pos.refresh_token';

    private const USER = 'pos.user';

    public function __construct(private readonly Session $session) {}

    public function accessToken(): ?string
    {
        return $this->session->get(self::ACCESS);
    }

    public function refreshToken(): ?string
    {
        return $this->session->get(self::REFRESH);
    }

    public function setTokens(string $accessToken, string $refreshToken): void
    {
        $this->session->put(self::ACCESS, $accessToken);
        $this->session->put(self::REFRESH, $refreshToken);
    }

    /**
     * @return array<string, mixed>|null
     */
    public function user(): ?array
    {
        return $this->session->get(self::USER);
    }

    /**
     * @param  array<string, mixed>  $user
     */
    public function setUser(array $user): void
    {
        $this->session->put(self::USER, $user);
    }

    public function hasSession(): bool
    {
        return $this->accessToken() !== null && $this->user() !== null;
    }

    public function role(): ?string
    {
        return $this->user()['role'] ?? null;
    }

    public function forget(): void
    {
        $this->session->forget([self::ACCESS, self::REFRESH, self::USER]);
    }
}
