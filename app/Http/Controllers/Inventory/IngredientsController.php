<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IngredientsController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(): Response
    {
        return Inertia::render('inventory/ingredients/index', [
            'ingredients' => fn () => $this->api->get('/ingredients')['data'] ?? [],
            'uom' => fn () => $this->api->get('/uom')['data'] ?? [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('inventory/ingredients/form', [
            'ingredient' => null,
            'uom' => fn () => $this->api->get('/uom')['data'] ?? [],
            'suppliers' => fn () => $this->api->get('/suppliers')['data'] ?? [],
        ]);
    }

    public function edit(string $ingredient): Response
    {
        return Inertia::render('inventory/ingredients/form', [
            'ingredient' => function () use ($ingredient) {
                $response = $this->api->get("/ingredients/{$ingredient}");

                return $response['ingredient'] ?? $response;
            },
            'uom' => fn () => $this->api->get('/uom')['data'] ?? [],
            'suppliers' => fn () => $this->api->get('/suppliers')['data'] ?? [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post('/ingredients', $this->validated($request)),
            'Bahan berhasil dibuat.',
            'name',
            route('ingredients.index'),
        );
    }

    public function update(Request $request, string $ingredient): RedirectResponse
    {
        $payload = $this->validated($request);
        // Optimistic-lock version is mandatory on updates.
        $payload['version'] = $request->integer('version');

        return $this->runPosWrite(
            fn () => $this->api->patch("/ingredients/{$ingredient}", $payload),
            'Bahan berhasil diperbarui.',
            'name',
            route('ingredients.index'),
        );
    }

    public function destroy(string $ingredient): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->delete("/ingredients/{$ingredient}"),
            'Bahan dihapus. Bisa dipulihkan.',
        );
    }

    public function restore(string $ingredient): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post("/ingredients/{$ingredient}/restore"),
            'Bahan dipulihkan.',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'uomId' => ['required', 'string'],
            'currentStock' => ['nullable', 'numeric'],
            'reorderLevel' => ['nullable', 'numeric'],
            'costPerUnit' => ['nullable', 'integer', 'min:0'],
            'supplierId' => ['nullable', 'string'],
            'isActive' => ['boolean'],
        ]);

        return array_filter($data, fn ($v) => $v !== null && $v !== '');
    }
}
