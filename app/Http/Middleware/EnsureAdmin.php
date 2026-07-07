<?php

namespace App\Http\Middleware;

use App\Services\Pos\PosTokenStore;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts admin-only surfaces (Users, Outlets writes, Audit logs) so managers
 * never reach them. Mirrors the API's server-side RBAC.
 */
class EnsureAdmin
{
    public function __construct(private readonly PosTokenStore $tokens) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->tokens->role() !== 'admin') {
            abort(403, 'Hanya admin yang dapat mengakses halaman ini.');
        }

        return $next($request);
    }
}
