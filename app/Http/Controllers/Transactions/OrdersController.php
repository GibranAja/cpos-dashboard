<?php

namespace App\Http\Controllers\Transactions;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use App\Services\Pos\PosApiException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrdersController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(Request $request): Response
    {
        $date = $request->date('date')?->format('Y-m-d');
        $cursor = $request->query('cursor');

        return Inertia::render('transactions/orders/index', [
            'date' => $date,
            'orders' => fn () => $this->api->get('/orders', array_filter([
                'date' => $date,
                'limit' => 20,
                'cursor' => $cursor,
            ])),
        ]);
    }

    public function show(string $order): Response
    {
        return Inertia::render('transactions/orders/show', [
            'order' => fn () => $this->api->get("/orders/{$order}"),
        ]);
    }

    public function void(Request $request, string $order): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->post("/orders/{$order}/void", $data),
            'Pesanan berhasil dibatalkan (void).',
            'reason',
        );
    }
}
