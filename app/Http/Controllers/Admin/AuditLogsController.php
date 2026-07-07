<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogsController extends Controller
{
    public function __construct(private readonly PosApiClient $api) {}

    public function index(Request $request): Response
    {
        $cursor = $request->query('cursor');
        $entity = $request->query('entity');

        return Inertia::render('admin/audit-logs/index', [
            'entity' => $entity,
            'logs' => fn () => $this->api->get('/audit-logs', array_filter([
                'entity' => $entity,
                'limit' => 30,
                'cursor' => $cursor,
            ])),
        ]);
    }
}
