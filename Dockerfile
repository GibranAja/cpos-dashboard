# syntax=docker/dockerfile:1

# ------------------------------------------------------------------- 1. Build
# The Wayfinder Vite plugin runs `php artisan wayfinder:generate` during the
# asset build, so this stage needs PHP + Composer *and* Node together.
FROM php:8.4-cli-alpine AS build

# Composer from the official image.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN apk add --no-cache nodejs npm git unzip \
    && docker-php-ext-install bcmath

WORKDIR /app

# PHP deps first (artisan needs the autoloader to run wayfinder:generate).
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction --optimize-autoloader

# Node deps.
COPY package.json package-lock.json ./
RUN npm ci

# App source, then build assets (generates Wayfinder routes + Vite bundle).
COPY . .
# A throwaway key (build-time only) so artisan can boot during Wayfinder codegen.
RUN APP_KEY=base64:2fl7dOZBQ2gGZ3aQ4rN9pXK8vJ1sYcT6uEwH0iLmA4= npm run build

# ------------------------------------------------------------------ 2. Runtime
FROM php:8.4-fpm-alpine AS app

RUN apk add --no-cache nginx supervisor bash \
    && docker-php-ext-install bcmath pdo pdo_mysql opcache \
    && rm -rf /var/cache/apk/*

WORKDIR /var/www/html

# App + built vendor + built assets from the build stage.
COPY --from=build /app ./
RUN rm -rf node_modules

# Container defaults: no database needed — the dashboard stores no domain data.
ENV APP_ENV=production \
    APP_DEBUG=false \
    SESSION_DRIVER=file \
    CACHE_STORE=file \
    QUEUE_CONNECTION=sync \
    LOG_CHANNEL=stderr

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint \
    && chown -R www-data:www-data storage bootstrap/cache \
    # nginx workers run as www-data; Alpine ships /var/lib/nginx owned by the
    # `nginx` user, which breaks client-body buffering on file uploads.
    && chown -R www-data:www-data /var/lib/nginx /var/log/nginx

EXPOSE 80

ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
