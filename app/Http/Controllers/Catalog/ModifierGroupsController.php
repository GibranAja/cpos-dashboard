<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModifierGroupsController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(): Response
    {
        return Inertia::render('catalog/modifier-groups/index', [
            'groups' => fn () => $this->api->get('/modifier-groups')['data'] ?? [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('catalog/modifier-groups/form', ['group' => null]);
    }

    public function edit(string $group): Response
    {
        return Inertia::render('catalog/modifier-groups/form', [
            'group' => fn () => collect($this->api->get('/modifier-groups')['data'] ?? [])->firstWhere('id', $group),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post('/modifier-groups', $this->validatedGroup($request)),
            'Grup modifier berhasil dibuat.',
            'name',
            route('modifier-groups.index'),
        );
    }

    public function update(Request $request, string $group): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->patch("/modifier-groups/{$group}", $this->validatedGroup($request)),
            'Grup modifier berhasil diperbarui.',
            'name',
            route('modifier-groups.index'),
        );
    }

    public function destroy(string $group): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->delete("/modifier-groups/{$group}"),
            'Grup modifier dihapus.',
        );
    }

    public function storeModifier(Request $request, string $group): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post("/modifier-groups/{$group}/modifiers", $this->validatedModifier($request)),
            'Modifier berhasil ditambahkan.',
        );
    }

    public function updateModifier(Request $request, string $group, string $modifier): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->patch("/modifier-groups/{$group}/modifiers/{$modifier}", $this->validatedModifier($request)),
            'Modifier berhasil diperbarui.',
        );
    }

    public function destroyModifier(string $group, string $modifier): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->delete("/modifier-groups/{$group}/modifiers/{$modifier}"),
            'Modifier dihapus.',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedGroup(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'selection' => ['required', 'in:single,multi'],
            'isRequired' => ['boolean'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['boolean'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedModifier(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'priceDelta' => ['required', 'integer'],
            'isDefault' => ['boolean'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['boolean'],
        ]);
    }
}
