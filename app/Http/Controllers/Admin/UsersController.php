<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\InteractsWithPosApi;
use App\Http\Controllers\Controller;
use App\Services\Pos\PosApiClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    use InteractsWithPosApi;

    public function __construct(private readonly PosApiClient $api) {}

    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => fn () => $this->api->get('/users')['data'] ?? [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/form', ['user' => null]);
    }

    public function edit(string $user): Response
    {
        return Inertia::render('admin/users/form', [
            'user' => fn () => collect($this->api->get('/users')['data'] ?? [])->firstWhere('id', $user),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:admin,manager,kasir'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->post('/users', $data),
            'Pengguna berhasil dibuat.',
            'email',
            route('users.index'),
        );
    }

    public function update(Request $request, string $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'in:admin,manager,kasir'],
            'isActive' => ['boolean'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->patch("/users/{$user}", $data),
            'Pengguna berhasil diperbarui.',
            'name',
            route('users.index'),
        );
    }

    public function resetPassword(Request $request, string $user): RedirectResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->post("/users/{$user}/reset-password", $data),
            'Kata sandi berhasil direset.',
            'password',
        );
    }

    public function destroy(string $user): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->delete("/users/{$user}"),
            'Pengguna dinonaktifkan (soft-delete).',
        );
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['string'],
        ]);

        return $this->runPosWrite(
            fn () => $this->api->post('/users/bulk-delete', $data),
            'Pengguna terpilih dinonaktifkan.',
        );
    }

    public function restore(string $user): RedirectResponse
    {
        return $this->runPosWrite(
            fn () => $this->api->post("/users/{$user}/restore"),
            'Pengguna dipulihkan.',
        );
    }
}
