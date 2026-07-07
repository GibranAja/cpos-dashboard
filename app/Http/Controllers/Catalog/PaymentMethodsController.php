<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodsController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(): Response
    {
        return Inertia::render('catalog/payment-methods/index', [
            'methods' => fn () => $this->api->get('/payment-methods')['data'] ?? [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('catalog/payment-methods/form', ['method' => null]);
    }

    public function edit(string $method): Response
    {
        return Inertia::render('catalog/payment-methods/form', [
            'method' => fn () => collect($this->api->get('/payment-methods')['data'] ?? [])->firstWhere('id', $method),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post('/payment-methods', $this->validated($request)),
            'Metode pembayaran berhasil dibuat.',
            'code',
            route('payment-methods.index'),
        );
    }

    public function update(Request $request, string $method): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->patch("/payment-methods/{$method}", $this->validated($request)),
            'Metode pembayaran berhasil diperbarui.',
            'code',
            route('payment-methods.index'),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'label' => ['required', 'string', 'max:255'],
            'isEnabled' => ['boolean'],
            'sortOrder' => ['nullable', 'integer'],
        ]);
    }
}
