<?php

namespace App\Http\Middleware;

use App\Services\Pos\PosTokenStore;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gates the whole dashboard behind an authenticated POS session whose role is
 * permitted (admin or manager). Kasir users are turned away — they use the
 * mobile app.
 */
class EnsureDashboardAccess
{
    public function __construct(private readonly PosTokenStore $tokens) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->tokens->hasSession()) {
            return redirect()->guest(route('login'));
        }

        if (! in_array($this->tokens->role(), config('pos.dashboard_roles'), true)) {
            $this->tokens->forget();

            return redirect()->route('login')->with('error', 'Akun ini tidak memiliki akses ke dashboard.');
        }

        return $next($request);
    }
}
