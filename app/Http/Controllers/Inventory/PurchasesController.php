<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchasesController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(Request $request): Response
    {
        $cursor = $request->query('cursor');

        return Inertia::render('inventory/purchases/index', [
            'purchases' => fn () => $this->api->get('/purchases', array_filter(['limit' => 20, 'cursor' => $cursor])),
            'suppliers' => fn () => $this->api->get('/suppliers')['data'] ?? [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('inventory/purchases/form', [
            'ingredients' => fn () => $this->api->get('/ingredients')['data'] ?? [],
            'suppliers' => fn () => $this->api->get('/suppliers')['data'] ?? [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'supplierId' => ['nullable', 'string'],
            'note' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.ingredientId' => ['required', 'string'],
            'items.*.qty' => ['required', 'numeric', 'min:0'],
            'items.*.unitCost' => ['required', 'integer', 'min:0'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->post('/purchases', array_filter($data, fn ($v) => $v !== null && $v !== '')),
            'Pembelian berhasil dicatat. Stok telah bertambah.',
            'items',
            route('purchases.index'),
        );
    }
}
