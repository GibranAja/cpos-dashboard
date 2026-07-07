<?php

namespace App\Http\Controllers;

use App\Services\Pos\PosApiClient;
use App\Services\Pos\PosApiException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    /** Ranges the API accepts for time-based reports. */
    private const RANGES = ['7d', '30d', '90d'];

    public function __construct(private readonly PosApiClient $api) {}

    public function index(Request $request): Response
    {
        $range = in_array($request->query('range'), self::RANGES, true)
            ? $request->query('range')
            : '7d';

        $date = $request->date('date')?->format('Y-m-d') ?? now(config('pos.timezone'))->format('Y-m-d');

        return Inertia::render('reports/index', [
            'range' => $range,
            'date' => $date,
            'summary' => Inertia::defer(fn () => $this->safe(fn () => $this->api->get('/reports/summary', ['date' => $date]))),
            'timeseries' => Inertia::defer(fn () => $this->safe(fn () => $this->api->get('/reports/sales-timeseries', ['range' => $range]))),
            'topProducts' => Inertia::defer(fn () => $this->safe(fn () => $this->api->get('/reports/top-products', ['range' => $range, 'limit' => 10]))),
            'cogsMargin' => Inertia::defer(fn () => $this->safe(fn () => $this->api->get('/reports/cogs-margin', ['range' => $range]))),
        ]);
    }

    /**
     * Stream that day's orders CSV, proxied from the API.
     */
    public function export(Request $request): StreamedResponse
    {
        $date = $request->date('date')?->format('Y-m-d') ?? now(config('pos.timezone'))->format('Y-m-d');

        $csv = $this->api->raw('/reports/export', ['format' => 'csv', 'date' => $date]);

        return response()->streamDownload(
            fn () => print($csv),
            "laporan-{$date}.csv",
            ['Content-Type' => 'text/csv'],
        );
    }

    /**
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T|null
     */
    private function safe(callable $callback): mixed
    {
        try {
            return $callback();
        } catch (PosApiException) {
            return null;
        }
    }
}
