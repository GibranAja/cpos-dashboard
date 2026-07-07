<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuppliersController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(): Response
    {
        return Inertia::render('inventory/suppliers/index', [
            'suppliers' => fn () => $this->api->get('/suppliers')['data'] ?? [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('inventory/suppliers/form', ['supplier' => null]);
    }

    public function edit(string $supplier): Response
    {
        return Inertia::render('inventory/suppliers/form', [
            'supplier' => fn () => collect($this->api->get('/suppliers')['data'] ?? [])->firstWhere('id', $supplier),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post('/suppliers', $this->validated($request)),
            'Supplier berhasil dibuat.',
            'name',
            route('suppliers.index'),
        );
    }

    public function update(Request $request, string $supplier): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->patch("/suppliers/{$supplier}", $this->validated($request)),
            'Supplier berhasil diperbarui.',
            'name',
            route('suppliers.index'),
        );
    }

    public function destroy(string $supplier): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->delete("/suppliers/{$supplier}"),
            'Supplier dihapus.',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string'],
        ]);
    }
}
