<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoriesController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(): Response
    {
        return Inertia::render('catalog/categories/index', [
            'categories' => fn () => $this->api->get('/categories')['data'] ?? [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('catalog/categories/form', ['category' => null]);
    }

    public function edit(string $category): Response
    {
        return Inertia::render('catalog/categories/form', [
            'category' => fn () => collect($this->api->get('/categories')['data'] ?? [])->firstWhere('id', $category),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post('/categories', $this->validated($request)),
            'Kategori berhasil dibuat.',
            'name',
            route('categories.index'),
        );
    }

    public function update(Request $request, string $category): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->patch("/categories/{$category}", $this->validated($request)),
            'Kategori berhasil diperbarui.',
            'name',
            route('categories.index'),
        );
    }

    public function destroy(string $category): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->delete("/categories/{$category}"),
            'Kategori dihapus.',
        );
    }

    public function restore(string $category): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post("/categories/{$category}/restore"),
            'Kategori dipulihkan.',
        );
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['string'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->post('/categories/bulk-delete', $data),
            'Kategori terpilih dihapus.',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['boolean'],
        ]);
    }
}
