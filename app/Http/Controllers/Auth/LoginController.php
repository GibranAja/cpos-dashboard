<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use App\Services\Pos\PosApiException;
use App\Services\Pos\PosTokenStore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function __construct(
        private readonly PosApiClient $api,
        private readonly PosTokenStore $tokens,
    ) {}

    public function create(): Response|RedirectResponse
    {
        if ($this->tokens->hasSession()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        try {
            $payload = $this->api->login($credentials['email'], $credentials['password']);
        } catch (PosApiException $e) {
            throw ValidationException::withMessages([
                'email' => $this->loginErrorMessage($e),
            ]);
        }

        $user = $payload['user'];

        if (! in_array($user['role'] ?? null, config('pos.dashboard_roles'), true)) {
            throw ValidationException::withMessages([
                'email' => 'Akun ini tidak memiliki akses ke dashboard. Gunakan aplikasi mobile.',
            ]);
        }

        if (($user['isActive'] ?? true) === false) {
            throw ValidationException::withMessages([
                'email' => 'Akun ini telah dinonaktifkan.',
            ]);
        }

        $request->session()->regenerate();
        $this->tokens->setTokens($payload['accessToken'], $payload['refreshToken']);
        $this->tokens->setUser($user);

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        $this->api->logout();
        $this->tokens->forget();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function loginErrorMessage(PosApiException $e): string
    {
        return match ($e->status) {
            401 => 'Email atau kata sandi salah.',
            403 => 'Akun ini telah dinonaktifkan.',
            429 => 'Terlalu banyak percobaan. Coba lagi sebentar.',
            default => $e->getMessage(),
        };
    }
}
