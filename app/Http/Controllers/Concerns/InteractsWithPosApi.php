<?php

namespace App\Http\Controllers\Concerns;

use App\Services\Pos\PosApiException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

/**
 * Shared translation of the POS API's uniform error envelope into Laravel-native
 * responses so every resource controller behaves consistently.
 */
trait InteractsWithPosApi
{
    /**
     * Convert a POS API error into a redirect-back with the right UX:
     *  - 409 duplicate (details.field) → inline field error.
     *  - 409 optimistic-lock (expectedVersion) → "diubah orang lain" warning.
     *  - 422 validation (details) → field errors.
     *  - everything else → a flash error banner.
     */
    protected function throwPosError(PosApiException $e, string $defaultField = 'name'): never
    {
        // Optimistic-lock conflict: the record changed underneath the user.
        if ($e->isConflict() && isset($e->details['expectedVersion'])) {
            throw ValidationException::withMessages([
                $defaultField => 'Data ini baru saja diubah orang lain. Muat ulang halaman lalu terapkan lagi perubahan Anda.',
            ]);
        }

        // Duplicate detection: a named field already exists.
        if ($e->isConflict() && isset($e->details['field'])) {
            $field = (string) $e->details['field'];

            throw ValidationException::withMessages([
                $field => "Nilai untuk \"{$field}\" sudah digunakan.",
            ]);
        }

        // Field-level validation errors from the API.
        if ($e->status === 422 && is_array($e->details)) {
            $messages = [];

            foreach ($e->details as $field => $message) {
                $messages[is_string($field) ? $field : $defaultField] = is_array($message)
                    ? implode(' ', array_map('strval', $message))
                    : (string) $message;
            }

            throw ValidationException::withMessages($messages ?: [$defaultField => $e->getMessage()]);
        }

        throw ValidationException::withMessages([$defaultField => $e->getMessage()]);
    }

    /**
     * Run an API write, redirecting back with a success flash or a mapped error.
     *
     * @param  callable(): mixed  $callback
     */
    protected function runPosWrite(callable $callback, string $successMessage, string $defaultField = 'name', ?string $redirectTo = null): RedirectResponse
    {
        try {
            $callback();
        } catch (PosApiException $e) {
            $this->throwPosError($e, $defaultField);
        }

        $redirect = $redirectTo ? redirect($redirectTo) : back();

        return $redirect->with('success', $successMessage);
    }
}
