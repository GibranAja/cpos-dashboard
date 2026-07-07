<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use App\Services\Pos\PosApiException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreProfileController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function edit(): Response
    {
        return Inertia::render('admin/store-profile/index', [
            'profile' => fn () => $this->safeProfile(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'displayName' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'qrisNmid' => ['nullable', 'string', 'max:255'],
            'qrisImageUrl' => ['nullable', 'string'],
            'receiptFooter' => ['nullable', 'string'],
            'currency' => ['required', 'string', 'max:10'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->put('/store-profile', $data),
            'Profil toko berhasil disimpan.',
            'displayName',
        );
    }

    /**
     * @return array<string, mixed>|null
     */
    private function safeProfile(): ?array
    {
        try {
            return $this->api->get('/store-profile')['storeProfile'] ?? null;
        } catch (PosApiException) {
            return null;
        }
    }
}
