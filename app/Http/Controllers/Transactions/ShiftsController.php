<?php

namespace App\Http\Controllers\Transactions;

use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use App\Services\Pos\PosApiException;
use Inertia\Inertia;
use Inertia\Response;

class ShiftsController extends Controller
{
    public function __construct(private readonly PosApiClient $api) {}

    /**
     * Read-only current shift oversight. Opening/closing a shift is a mobile
     * (cashier) action — there is intentionally no write here.
     */
    public function current(): Response
    {
        return Inertia::render('transactions/shifts/index', [
            'shift' => fn () => $this->safeShift(),
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function safeShift(): ?array
    {
        try {
            return $this->api->get('/shifts/current')['shift'] ?? null;
        } catch (PosApiException) {
            return null;
        }
    }
}
