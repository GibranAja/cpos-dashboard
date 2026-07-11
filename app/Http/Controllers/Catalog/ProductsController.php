<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use App\Services\Pos\PosApiException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductsController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(): Response
    {
        return Inertia::render('catalog/products/index', [
            'products' => fn () => $this->api->get('/products')['data'] ?? [],
            'categories' => fn () => $this->api->get('/categories')['data'] ?? [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('catalog/products/form', [
            'product' => null,
            'categories' => fn () => $this->api->get('/categories')['data'] ?? [],
            'modifierGroups' => fn () => $this->api->get('/modifier-groups')['data'] ?? [],
        ]);
    }

    public function edit(string $product): Response
    {
        return Inertia::render('catalog/products/form', [
            'product' => fn () => $this->findProduct($product),
            'categories' => fn () => $this->api->get('/categories')['data'] ?? [],
            'modifierGroups' => fn () => $this->api->get('/modifier-groups')['data'] ?? [],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function findProduct(string $id): array
    {
        $response = $this->api->get("/products/{$id}");

        return $response['product'] ?? $response;
    }

    /**
     * Price history panel — fetched on demand (partial reload).
     */
    public function priceHistory(string $product): JsonResponse
    {
        try {
            $data = $this->api->get("/products/{$product}/price-history")['data'] ?? [];
        } catch (PosApiException $e) {
            return response()->json(['error' => $e->toArray()], $e->status);
        }

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): RedirectResponse
    {
        $payload = $this->validated($request);

        return $this->runPosWrite(
            fn () => $this->api->post('/products', $payload),
            'Produk berhasil dibuat.',
            'name',
            route('products.index'),
        );
    }

    public function update(Request $request, string $product): RedirectResponse
    {
        $payload = $this->validated($request);
        // Optimistic-lock version is mandatory on updates.
        $payload['version'] = $request->integer('version');

        return $this->runPosWrite(
            fn () => $this->api->patch("/products/{$product}", $payload),
            'Produk berhasil diperbarui.',
            'name',
            route('products.index'),
        );
    }

    public function destroy(string $product): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->delete("/products/{$product}"),
            'Produk dihapus. Anda masih bisa memulihkannya.',
        );
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['string'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->post('/products/bulk-delete', $data),
            'Produk terpilih dihapus.',
        );
    }

    /**
     * Upload/replace the product image. The API stores it on Cloudinary and
     * returns the updated product ({imageUrl, imagePublicId}).
     */
    public function uploadImage(Request $request, string $product): RedirectResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'], // API limit: 5 MB
        ]);

        $file = $request->file('image');

        return $this->runPosWrite(
            fn () => $this->api->upload(
                "/products/{$product}/image",
                'file',
                $file->get(),
                $file->getClientOriginalName(),
            ),
            'Gambar produk berhasil diunggah.',
            'image',
        );
    }

    /**
     * Remove the product image (deletes the Cloudinary asset via the API).
     */
    public function deleteImage(string $product): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->delete("/products/{$product}/image"),
            'Gambar produk dihapus.',
            'image',
        );
    }

    public function restore(string $product): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post("/products/{$product}/restore"),
            'Produk berhasil dipulihkan.',
        );
    }

    /**
     * Bulk import. Always runs a dry-run first; only commits when the client
     * explicitly confirms via ?commit=1 after reviewing the preview.
     */
    public function import(Request $request): RedirectResponse|JsonResponse
    {
        $rows = $request->input('rows', []);
        $commit = $request->boolean('commit');

        try {
            $report = $this->api->post('/products/import?dryRun='.($commit ? 'false' : 'true'), ['rows' => $rows]);
        } catch (PosApiException $e) {
            return response()->json(['error' => $e->toArray()], $e->status);
        }

        if ($commit) {
            return back()->with('success', 'Impor produk berhasil diterapkan.');
        }

        // Return the dry-run validation/preview report for the UI to display.
        return response()->json($report);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'basePrice' => ['required', 'integer', 'min:0'],
            'categoryId' => ['nullable', 'string'],
            'imageUrl' => ['nullable', 'url'],
            'sku' => ['nullable', 'string'],
            'sellsBy' => ['required', 'in:recipe,finished_good'],
            'finishedStockQty' => ['nullable', 'numeric'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['boolean'],
            'modifierGroupIds' => ['array'],
            'modifierGroupIds.*' => ['string'],
        ]);

        // Drop nulls so the API keeps its own defaults.
        return array_filter($data, fn ($v) => $v !== null);
    }
}
