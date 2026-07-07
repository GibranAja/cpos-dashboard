<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentsController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(Request $request): Response
    {
        $cursor = $request->query('cursor');

        return Inertia::render('inventory/stock-adjustments/index', [
            'adjustments' => fn () => $this->api->get('/stock-adjustments', array_filter(['limit' => 20, 'cursor' => $cursor])),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('inventory/stock-adjustments/form', [
            'mode' => $request->query('mode') === 'waste' ? 'waste' : 'adjust',
            'ingredients' => fn () => $this->api->get('/ingredients')['data'] ?? [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post('/stock-adjustments', $this->validated($request)),
            'Penyesuaian stok berhasil dicatat.',
            'reason',
            route('stock-adjustments.index'),
        );
    }

    public function waste(Request $request): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post('/stock-adjustments/waste', $this->validated($request)),
            'Wastage berhasil dicatat.',
            'reason',
            route('stock-adjustments.index'),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'reason' => ['required', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.ingredientId' => ['required', 'string'],
            'items.*.qtyDelta' => ['required', 'numeric'],
            'items.*.note' => ['nullable', 'string'],
        ]);
    }
}
