#!/usr/bin/env bash
set -e

cd /var/www/html

# Generate an APP_KEY on first boot if the platform didn't supply one.
if [ -z "${APP_KEY:-}" ] && ! grep -q "^APP_KEY=base64" .env 2>/dev/null; then
    php artisan key:generate --force || true
fi

# Ensure the storage symlink exists so uploaded images are served at /storage/*.
# storage/app/public should be mounted as a persistent volume in Dokploy.
php artisan storage:link || true

# Make sure runtime dirs are writable (bind-mounted volumes can reset ownership).
mkdir -p storage/framework/{sessions,views,cache} storage/app/public bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Warm production caches (routes contain no closures, so caching is safe).
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
