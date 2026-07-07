<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UomController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(): Response
    {
        return Inertia::render('inventory/uom/index', [
            'uom' => fn () => $this->api->get('/uom')['data'] ?? [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('inventory/uom/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:20'],
            'name' => ['required', 'string', 'max:100'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->post('/uom', $data),
            'Satuan berhasil dibuat.',
            'code',
            route('uom.index'),
        );
    }
}
