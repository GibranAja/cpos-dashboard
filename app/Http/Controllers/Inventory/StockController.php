<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use App\Services\Pos\PosApiException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function __construct(private readonly PosApiClient $api) {}

    /**
     * Kartu Stok — the +/- movement ledger, filterable by ingredient.
     */
    public function movements(Request $request): Response
    {
        $ingredientId = $request->query('ingredientId');
        $cursor = $request->query('cursor');

        return Inertia::render('inventory/stock-movements/index', [
            'ingredientId' => $ingredientId,
            'movements' => fn () => $this->api->get('/stock-movements', array_filter([
                'ingredientId' => $ingredientId,
                'limit' => 30,
                'cursor' => $cursor,
            ])),
            'ingredients' => fn () => $this->api->get('/ingredients')['data'] ?? [],
        ]);
    }

    /**
     * Ringkasan inventaris & low-stock.
     */
    public function summary(): Response
    {
        return Inertia::render('inventory/summary/index', [
            'summary' => fn () => $this->safe(fn () => $this->api->get('/inventory/summary')),
            'lowStock' => fn () => $this->safe(fn () => $this->api->get('/inventory/low-stock')['data'] ?? []) ?? [],
        ]);
    }

    /**
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
