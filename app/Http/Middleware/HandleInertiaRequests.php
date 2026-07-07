<?php

namespace App\Http\Middleware;

use App\Services\Pos\PosTokenStore;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $tokens = $request->getSession()->isStarted()
            ? app(PosTokenStore::class)
            : null;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                // The POS user comes from the API and is stored server-side in
                // the session. Tokens are never shared with the browser.
                'user' => $tokens?->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
