<?php

namespace App\Services\Pos;

use RuntimeException;
use Throwable;

/**
 * Represents an error returned by the CIAAAA POS API using its uniform envelope:
 * { "error": { "code", "message", "details?", "requestId?" } }.
 */
class PosApiException extends RuntimeException
{
    /**
     * @param  array<string, mixed>|null  $details
     */
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message,
        public readonly ?array $details = null,
        public readonly ?string $requestId = null,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, $status, $previous);
    }

    /**
     * Build an exception from a decoded API error response body.
     *
     * @param  array<string, mixed>  $body
     */
    public static function fromResponse(int $status, array $body): self
    {
        $error = is_array($body['error'] ?? null) ? $body['error'] : [];

        return new self(
            status: $status,
            errorCode: (string) ($error['code'] ?? 'UNKNOWN'),
            message: (string) ($error['message'] ?? 'Terjadi kesalahan pada server.'),
            details: isset($error['details']) && is_array($error['details']) ? $error['details'] : null,
            requestId: isset($error['requestId']) ? (string) $error['requestId'] : null,
        );
    }

    public static function connection(string $message, ?Throwable $previous = null): self
    {
        return new self(
            status: 503,
            errorCode: 'CONNECTION_ERROR',
            message: 'Tidak dapat terhubung ke server. Coba lagi sebentar.',
            previous: $previous,
        );
    }

    public function isConflict(): bool
    {
        return $this->status === 409;
    }

    public function isUnauthorized(): bool
    {
        return $this->status === 401;
    }

    public function isForbidden(): bool
    {
        return $this->status === 403;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'status' => $this->status,
            'code' => $this->errorCode,
            'message' => $this->getMessage(),
            'details' => $this->details,
            'requestId' => $this->requestId,
        ];
    }
}
