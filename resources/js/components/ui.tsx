import {     useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

        // Lock background scroll while the modal is open.
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    if (!open || typeof document === 'undefined') {
return null;
}

    // Portal to <body>: escapes any ancestor that establishes a containing block
    // for fixed elements (e.g. the layout <main>'s transform animation), so the
    // overlay is truly viewport-fixed and never scrolls with the page content.
    return createPortal(
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
        </div>,
        document.body,
    );
}

/* -------------------------------------------------------------- Checkbox */

export function Checkbox({
    checked,
    indeterminate = false,
    onChange,
    ariaLabel,
}: {
    checked: boolean;
    indeterminate?: boolean;
    onChange: () => void;
    ariaLabel?: string;
}) {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate && !checked;
        }
    }, [indeterminate, checked]);

    return (
        <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            aria-label={ariaLabel}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 cursor-pointer rounded border-line text-primary accent-primary focus:ring-primary"
        />
    );
}

/* ------------------------------------------------------------ SelectionBar */

/**
 * Sticky bulk-action bar shown when ≥1 row is selected. Portaled to <body> so it
 * is viewport-fixed regardless of any transformed ancestor. Confirms via Modal.
 */
export function SelectionBar({
    count,
    itemLabel,
    onClear,
    onDelete,
}: {
    count: number;
    itemLabel: string;
    onClear: () => void;
    onDelete: () => void;
}) {
    const [confirming, setConfirming] = useState(false);

    if (count === 0 || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <>
            <div className="animate-overlay fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-6 py-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                    <span className="text-sm font-medium text-ink">
                        {count} {itemLabel} terpilih
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={onClear}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={() => setConfirming(true)}>
                            Hapus terpilih ({count})
                        </Button>
                    </div>
                </div>
            </div>

            {confirming && (
                <Modal open onClose={() => setConfirming(false)} title="Hapus data terpilih?">
                    <p className="text-sm text-muted">
                        {count} {itemLabel} akan dihapus. Sebagian entitas masih bisa dipulihkan setelahnya.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setConfirming(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                setConfirming(false);
                                onDelete();
                            }}
                        >
                            Hapus ({count})
                        </Button>
                    </div>
                </Modal>
            )}
        </>,
        document.body,
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
