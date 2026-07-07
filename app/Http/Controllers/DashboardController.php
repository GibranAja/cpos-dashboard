<?php

namespace App\Http\Controllers;

use App\Services\Pos\PosApiClient;
use App\Services\Pos\PosApiException;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly PosApiClient $api) {}

    public function index(): Response
    {
        return Inertia::render('dashboard', [
            // Deferred so the shell paints instantly; each widget fails in
            // isolation so one broken call never blanks the page.
            'summary' => Inertia::defer(fn () => $this->safe(fn () => $this->api->get('/reports/summary'))),
            'timeseries' => Inertia::defer(fn () => $this->safe(fn () => $this->api->get('/reports/sales-timeseries', ['range' => '7d']))),
            'topProducts' => Inertia::defer(fn () => $this->safe(fn () => $this->api->get('/reports/top-products', ['range' => '7d', 'limit' => 5]))),
            'lowStock' => Inertia::defer(fn () => $this->safe(fn () => $this->api->get('/inventory/low-stock'))),
        ]);
    }

    /**
     * Run an API call, returning null on failure so one broken widget never
     * takes down the whole dashboard.
     *
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T|null
     */
    private function safe(callable $callback): mixed
    {
        try {
            return $callback();
        } catch (PosApiException) {
            return null;
        }
    }
}
