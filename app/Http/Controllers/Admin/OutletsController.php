<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OutletsController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(): Response
    {
        return Inertia::render('admin/outlets/index', [
            'outlets' => fn () => $this->api->get('/outlets')['data'] ?? [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/outlets/form', ['outlet' => null]);
    }

    public function edit(string $outlet): Response
    {
        return Inertia::render('admin/outlets/form', [
            'outlet' => fn () => collect($this->api->get('/outlets')['data'] ?? [])->firstWhere('id', $outlet),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post('/outlets', $this->validated($request)),
            'Outlet berhasil dibuat.',
            'name',
            route('outlets.index'),
        );
    }

    public function update(Request $request, string $outlet): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->patch("/outlets/{$outlet}", $this->validated($request)),
            'Outlet berhasil diperbarui.',
            'name',
            route('outlets.index'),
        );
    }

    public function destroy(string $outlet): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->delete("/outlets/{$outlet}"),
            'Outlet dihapus.',
        );
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['string'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->post('/outlets/bulk-delete', $data),
            'Outlet terpilih dihapus.',
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'timezone' => ['nullable', 'string'],
            'isActive' => ['boolean'],
        ]);
    }
}
