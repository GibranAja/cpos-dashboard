import { Head } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLayout from '@/layouts/app-layout';

/**
 * Shared layout for dedicated create/edit pages. Location is conveyed by the
 * header breadcrumb (no back button); submit lives inside the child form.
 *
 * `backHref` is kept in the signature so callers stay unchanged and Inertia's
 * browser back still works, but it is intentionally not rendered.
 */
export function FormPage({
    title,
    children,
}: PropsWithChildren<{ title: string; backHref?: string; backLabel?: string }>) {
    return (
        <AppLayout title={title}>
            <Head title={title} />

            <h2 className="mb-6 font-display text-2xl font-semibold text-ink">{title}</h2>

            <div className="card max-w-2xl p-6">{children}</div>
        </AppLayout>
    );
}
