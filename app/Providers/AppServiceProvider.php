<?php

namespace App\Providers;

use App\Services\Pos\PosTokenStore;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Token store is request/session scoped; PosApiClient depends on it and
        // is resolved automatically via constructor injection.
        $this->app->scoped(PosTokenStore::class, fn ($app): PosTokenStore => new PosTokenStore($app['session.store']));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        // Emit absolute https URLs when explicitly enabled (production behind a
        // TLS proxy) so Storage image URLs handed to the API/mobile app are
        // reachable. Gated by a flag so plain-http local runs still work.
        if (config('pos.force_https')) {
            URL::forceScheme('https');
        }

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
