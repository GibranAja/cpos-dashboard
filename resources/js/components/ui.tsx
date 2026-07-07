import {     useEffect } from 'react';
import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------- Button */

type ButtonVariant = 'primary' | 'ghost' | 'danger';

export function Button({
    variant = 'primary',
    className,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
    const variants: Record<ButtonVariant, string> = {
        primary: 'bg-primary text-white hover:bg-primary-dark shadow-soft',
        ghost: 'border border-line text-ink hover:bg-soft/60',
        danger: 'border border-primary/40 text-primary-dark hover:bg-primary/10',
    };

    return (
        <button
            className={cn(
                'rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60',
                variants[variant],
                className,
            )}
            {...props}
        />
    );
}

/* ----------------------------------------------------------------- Badge */

export function Badge({ tone = 'neutral', children }: PropsWithChildren<{ tone?: 'neutral' | 'active' | 'muted' }>) {
    const tones = {
        neutral: 'bg-soft text-primary-dark',
        active: 'bg-mint/15 text-mint',
        muted: 'bg-line text-muted',
    };

    return <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone])}>{children}</span>;
}

/* ----------------------------------------------------------------- Modal */

export function Modal({
    open,
    onClose,
    title,
    children,
}: PropsWithChildren<{ open: boolean; onClose: () => void; title: string }>) {
    useEffect(() => {
        if (!open) {
return;
}

        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) {
return null;
}

    return (
        <div className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4" onClick={onClose}>
            <div
                className="card animate-pop max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
                    <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Tutup">
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------- EmptyState */

export function EmptyState({ children }: { children: ReactNode }) {
    return <div className="card p-8 text-center text-sm text-muted">{children}</div>;
}

/* --------------------------------------------------------------- PageHeader */

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="mb-6 flex items-start justify-between gap-4">
            <div>
                <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            {action}
        </div>
    );
}
