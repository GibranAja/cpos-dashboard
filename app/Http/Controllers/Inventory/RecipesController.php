<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use App\Services\Pos\PosApiException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecipesController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    /**
     * Recipe workbench — pick a product/modifier and edit its BOM lines.
     */
    public function index(): Response
    {
        return Inertia::render('inventory/recipes/index', [
            'products' => fn () => $this->api->get('/products')['data'] ?? [],
            'modifierGroups' => fn () => $this->api->get('/modifier-groups')['data'] ?? [],
            'ingredients' => fn () => $this->api->get('/ingredients')['data'] ?? [],
            'uom' => fn () => $this->api->get('/uom')['data'] ?? [],
        ]);
    }

    public function productRecipe(string $product): JsonResponse
    {
        return $this->readRecipe('/product-recipes', ['productId' => $product]);
    }

    public function modifierRecipe(string $modifier): JsonResponse
    {
        return $this->readRecipe('/modifier-recipes', ['modifierId' => $modifier]);
    }

    public function saveProductRecipe(Request $request, string $product): RedirectResponse
    {
        $data = $request->validate([
            'lines' => ['present', 'array'],
            'lines.*.ingredientId' => ['required', 'string'],
            'lines.*.qtyPerUnit' => ['required', 'numeric', 'min:0'],
            'lines.*.uomId' => ['required', 'string'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->put("/product-recipes/{$product}", $data),
            'Resep produk berhasil disimpan.',
            'lines',
        );
    }

    public function saveModifierRecipe(Request $request, string $modifier): RedirectResponse
    {
        $data = $request->validate([
            'lines' => ['present', 'array'],
            'lines.*.ingredientId' => ['required', 'string'],
            'lines.*.qtyDelta' => ['required', 'numeric'],
            'lines.*.uomId' => ['required', 'string'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->put("/modifier-recipes/{$modifier}", $data),
            'Resep modifier berhasil disimpan.',
            'lines',
        );
    }

    /**
     * @param  array<string, mixed>  $query
     */
    private function readRecipe(string $path, array $query): JsonResponse
    {
        try {
            return response()->json(['data' => $this->api->get($path, $query)['data'] ?? []]);
        } catch (PosApiException $e) {
            return response()->json(['error' => $e->toArray()], $e->status);
        }
    }
}
