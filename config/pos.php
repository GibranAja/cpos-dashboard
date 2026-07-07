<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CIAAAA POS API
    |--------------------------------------------------------------------------
    |
    | The dashboard is a pure HTTP client of the live CIAAAA POS API. No domain
    | data lives in this application's database — the API is the single source
    | of truth. These knobs configure the typed PosApiClient.
    |
    */

    'base_url' => rtrim(env('POS_API_BASE_URL', 'https://cpos-api.kuadrattech.my.id/v1'), '/'),

    // Request timeouts (seconds).
    'timeout' => (int) env('POS_API_TIMEOUT', 15),
    'connect_timeout' => (int) env('POS_API_CONNECT_TIMEOUT', 5),

    // Transient connection-error retries (does not retry non-idempotent 4xx/5xx).
    'retry' => [
        'times' => (int) env('POS_API_RETRY_TIMES', 2),
        'sleep_ms' => (int) env('POS_API_RETRY_SLEEP_MS', 200),
    ],

    // Roles permitted to use the dashboard. Kasir uses the mobile app.
    'dashboard_roles' => ['admin', 'manager'],

    // Force https on generated URLs (set true in production behind a TLS proxy
    // so Storage image URLs are https). Leave false for plain-http local runs.
    'force_https' => (bool) env('FORCE_HTTPS', false),

    'locale' => 'id-ID',
    'timezone' => 'Asia/Jakarta',
];
