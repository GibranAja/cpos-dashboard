import { useEffect, useMemo, useRef, useState } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/*
| Custom form controls — Bubblegum theme, no native select/checkbox/date UI.
| Every control renders through FieldShell for consistent label + error.
*/

/* ------------------------------------------------------------- FieldShell */

function FieldShell({
    label,
    error,
    hint,
    children,
}: {
    label?: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div className="w-full">
            {label && <span className="mb-1 block text-sm font-medium text-ink">{label}</span>}
            {children}
            {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
            {error && <span className="mt-1 block text-sm text-primary-dark">{error}</span>}
        </div>
    );
}

const controlClass = (error?: string, extra?: string) =>
    cn(
        'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-ink outline-none transition',
        'focus:border-primary focus:ring-2 focus:ring-primary/20',
        'disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted',
        error ? 'border-primary' : 'border-line',
        extra,
    );

/* -------------------------------------------------------------- TextInput */

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    label?: string;
    error?: string;
    hint?: string;
};

export function TextInput({ label, error, hint, ...props }: TextInputProps) {
    return (
        <FieldShell label={label} error={error} hint={hint}>
            <input className={controlClass(error)} {...props} />
        </FieldShell>
    );
}

/* --------------------------------------------------------------- TextArea */

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
    label?: string;
    error?: string;
    hint?: string;
};

export function TextArea({ label, error, hint, rows = 3, ...props }: TextAreaProps) {
    return (
        <FieldShell label={label} error={error} hint={hint}>
            <textarea rows={rows} className={controlClass(error, 'resize-y')} {...props} />
        </FieldShell>
    );
}

/* ------------------------------------------------------------ NumberInput */

export function NumberInput({
    label,
    error,
    hint,
    value,
    onChange,
    min,
    max,
    step = 1,
    prefix,
    suffix,
    disabled,
    required,
}: {
    label?: string;
    error?: string;
    hint?: string;
    value: number | string;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    prefix?: string;
    suffix?: string;
    disabled?: boolean;
    required?: boolean;
}) {
    const clamp = (n: number) => {
        if (min !== undefined && n < min) {
return min;
}

        if (max !== undefined && n > max) {
return max;
}

        return n;
    };

    const current = Number(value) || 0;

    return (
        <FieldShell label={label} error={error} hint={hint}>
            <div
                className={cn(
                    'flex items-stretch overflow-hidden rounded-xl border bg-white transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
                    error ? 'border-primary' : 'border-line',
                    disabled && 'bg-canvas',
                )}
            >
                <button
                    type="button"
                    tabIndex={-1}
                    disabled={disabled}
                    onClick={() => onChange(clamp(current - step))}
                    className="px-3 text-muted transition hover:bg-soft hover:text-primary-dark disabled:opacity-40"
                    aria-label="Kurangi"
                >
                    −
                </button>
                <div className="flex flex-1 items-center gap-1 px-2">
                    {prefix && <span className="text-sm text-muted">{prefix}</span>}
                    <input
                        inputMode="decimal"
                        value={String(value)}
                        required={required}
                        disabled={disabled}
                        onChange={(e) => {
                            const n = Number(e.target.value.replace(',', '.'));
                            onChange(Number.isNaN(n) ? 0 : clamp(n));
                        }}
                        className="w-full bg-transparent py-2.5 text-center text-sm text-ink outline-none disabled:text-muted"
                    />
                    {suffix && <span className="text-sm text-muted">{suffix}</span>}
                </div>
                <button
                    type="button"
                    tabIndex={-1}
                    disabled={disabled}
                    onClick={() => onChange(clamp(current + step))}
                    className="px-3 text-muted transition hover:bg-soft hover:text-primary-dark disabled:opacity-40"
                    aria-label="Tambah"
                >
                    +
                </button>
            </div>
        </FieldShell>
    );
}

/* ---------------------------------------------------------------- Popover */

function usePopover() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
return;
}

        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);

        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return { open, setOpen, ref };
}

const chevron = (open: boolean) => (
    <svg
        className={cn('h-4 w-4 shrink-0 text-muted transition-transform', open && 'rotate-180')}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
    >
        <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
        />
    </svg>
);

/* ---------------------------------------------------------------- Select */

export type SelectOption = { value: string; label: string; description?: string };

export function Select({
    label,
    error,
    hint,
    value,
    onChange,
    options,
    placeholder = 'Pilih…',
    disabled,
    searchable,
}: {
    label?: string;
    error?: string;
    hint?: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    searchable?: boolean;
}) {
    const { open, setOpen, ref } = usePopover();
    const [query, setQuery] = useState('');
    const selected = options.find((o) => o.value === value);

    const visible = useMemo(
        () => (query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options),
        [options, query],
    );

    return (
        <FieldShell label={label} error={error} hint={hint}>
            <div ref={ref} className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        setOpen(!open);
                        setQuery('');
                    }}
                    className={controlClass(error, 'flex items-center justify-between gap-2 text-left')}
                >
                    <span className={cn('truncate', !selected && 'text-muted')}>
                        {selected?.label ?? placeholder}
                    </span>
                    {chevron(open)}
                </button>

                {open && (
                    <div className="animate-pop absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-line bg-white shadow-soft">
                        {searchable && (
                            <div className="border-b border-line p-2">
                                <input
                                    autoFocus
                                    placeholder="Cari…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full rounded-lg bg-canvas px-2 py-1.5 text-sm text-ink outline-none"
                                />
                            </div>
                        )}
                        <ul className="max-h-56 overflow-y-auto py-1" role="listbox">
                            {visible.length === 0 && <li className="px-3 py-2 text-sm text-muted">Tidak ada opsi.</li>}
                            {visible.map((o) => (
                                <li key={o.value}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={o.value === value}
                                        onClick={() => {
                                            onChange(o.value);
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition',
                                            o.value === value
                                                ? 'bg-soft font-medium text-primary-dark'
                                                : 'text-ink hover:bg-soft/50',
                                        )}
                                    >
                                        <span className="truncate">
                                            {o.label}
                                            {o.description && <span className="block text-xs text-muted">{o.description}</span>}
                                        </span>
                                        {o.value === value && <span className="text-primary-dark">✓</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </FieldShell>
    );
}

/* ------------------------------------------------------------ MultiSelect */

export function MultiSelect({
    label,
    error,
    hint,
    values,
    onChange,
    options,
    placeholder = 'Pilih beberapa…',
    disabled,
}: {
    label?: string;
    error?: string;
    hint?: string;
    values: string[];
    onChange: (values: string[]) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
}) {
    const { open, setOpen, ref } = usePopover();

    const toggle = (v: string) =>
        onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

    return (
        <FieldShell label={label} error={error} hint={hint}>
            <div ref={ref} className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpen(!open)}
                    className={controlClass(error, 'flex min-h-[42px] items-center justify-between gap-2 text-left')}
                >
                    {values.length === 0 ? (
                        <span className="text-muted">{placeholder}</span>
                    ) : (
                        <span className="flex flex-wrap gap-1">
                            {values.map((v) => {
                                const o = options.find((x) => x.value === v);

                                return (
                                    <span
                                        key={v}
                                        className="inline-flex items-center gap-1 rounded-full bg-soft px-2 py-0.5 text-xs font-medium text-primary-dark"
                                    >
                                        {o?.label ?? v}
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`Hapus ${o?.label ?? v}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggle(v);
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && toggle(v)}
                                            className="cursor-pointer hover:text-ink"
                                        >
                                            ×
                                        </span>
                                    </span>
                                );
                            })}
                        </span>
                    )}
                    {chevron(open)}
                </button>

                {open && (
                    <div className="animate-pop absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-line bg-white shadow-soft">
                        <ul className="max-h-56 overflow-y-auto py-1">
                            {options.length === 0 && <li className="px-3 py-2 text-sm text-muted">Tidak ada opsi.</li>}
                            {options.map((o) => {
                                const active = values.includes(o.value);

                                return (
                                    <li key={o.value}>
                                        <button
                                            type="button"
                                            onClick={() => toggle(o.value)}
                                            className={cn(
                                                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition',
                                                active ? 'text-primary-dark' : 'text-ink hover:bg-soft/50',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex h-4 w-4 items-center justify-center rounded border text-[10px] text-white',
                                                    active ? 'border-primary bg-primary' : 'border-line bg-white',
                                                )}
                                            >
                                                {active && '✓'}
                                            </span>
                                            <span className="truncate">{o.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </FieldShell>
    );
}

/* ----------------------------------------------------------------- Toggle */

export function Toggle({
    label,
    checked,
    onChange,
    disabled,
    description,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    description?: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className="flex w-full items-center justify-between gap-3 text-left disabled:opacity-50"
        >
            <span>
                <span className="block text-sm font-medium text-ink">{label}</span>
                {description && <span className="block text-xs text-muted">{description}</span>}
            </span>
            <span
                className={cn(
                    'relative h-6 w-11 shrink-0 rounded-full transition',
                    checked ? 'bg-primary' : 'bg-line',
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                        checked ? 'left-[22px]' : 'left-0.5',
                    )}
                />
            </span>
        </button>
    );
}

/* -------------------------------------------------------------- FileInput */

export function FileInput({
    label,
    error,
    hint,
    accept,
    onSelect,
    disabled,
    buttonText = 'Pilih file…',
}: {
    label?: string;
    error?: string;
    hint?: string;
    accept?: string;
    onSelect: (file: File) => void;
    disabled?: boolean;
    buttonText?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState('');

    return (
        <FieldShell label={label} error={error} hint={hint}>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                    className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary-dark transition hover:bg-soft disabled:opacity-50"
                >
                    {buttonText}
                </button>
                <span className="truncate text-sm text-muted">{name || 'Belum ada file.'}</span>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];

                        if (f) {
                            setName(f.name);
                            onSelect(f);
                        }

                        e.target.value = '';
                    }}
                />
            </div>
        </FieldShell>
    );
}

/* -------------------------------------------------------------- DateInput */

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const toIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function DateInput({
    label,
    error,
    hint,
    value,
    onChange,
    placeholder = 'Pilih tanggal…',
    clearable,
    disabled,
}: {
    label?: string;
    error?: string;
    hint?: string;
    /** ISO date string (YYYY-MM-DD) or empty. */
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    clearable?: boolean;
    disabled?: boolean;
}) {
    const { open, setOpen, ref } = usePopover();
    const selected = value ? new Date(`${value}T00:00:00`) : null;
    const [view, setView] = useState(() => selected ?? new Date());

    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayIso = toIso(new Date());

    const cells: (number | null)[] = [
        ...Array.from({ length: firstDay }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    return (
        <FieldShell label={label} error={error} hint={hint}>
            <div ref={ref} className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        setOpen(!open);

                        if (selected) {
                            setView(selected);
                        }
                    }}
                    className={controlClass(error, 'flex items-center justify-between gap-2 text-left')}
                >
                    <span className={cn(!selected && 'text-muted')}>
                        {selected ? selected.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : placeholder}
                    </span>
                    <span className="flex items-center gap-1">
                        {clearable && value && (
                            <span
                                role="button"
                                tabIndex={0}
                                aria-label="Bersihkan tanggal"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange('');
                                    setOpen(false);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && onChange('')}
                                className="cursor-pointer text-muted hover:text-primary-dark"
                            >
                                ×
                            </span>
                        )}
                        <svg className="h-4 w-4 text-muted" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                            <path d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-2.25 6v7.25c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V8h-13z" />
                        </svg>
                    </span>
                </button>

                {open && (
                    <div className="animate-pop absolute z-50 mt-1 w-72 rounded-xl border border-line bg-white p-3 shadow-soft">
                        <div className="mb-2 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setView(new Date(year, month - 1, 1))}
                                className="rounded-lg px-2 py-1 text-muted transition hover:bg-soft hover:text-primary-dark"
                                aria-label="Bulan sebelumnya"
                            >
                                ‹
                            </button>
                            <span className="font-display text-sm font-semibold text-ink">
                                {MONTHS[month]} {year}
                            </span>
                            <button
                                type="button"
                                onClick={() => setView(new Date(year, month + 1, 1))}
                                className="rounded-lg px-2 py-1 text-muted transition hover:bg-soft hover:text-primary-dark"
                                aria-label="Bulan berikutnya"
                            >
                                ›
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {DAYS.map((d) => (
                                <span key={d} className="py-1 text-[10px] font-semibold text-muted uppercase">
                                    {d}
                                </span>
                            ))}
                            {cells.map((day, i) => {
                                if (day === null) {
                                    return <span key={`x${i}`} />;
                                }

                                const iso = toIso(new Date(year, month, day));
                                const isSelected = iso === value;
                                const isToday = iso === todayIso;

                                return (
                                    <button
                                        key={iso}
                                        type="button"
                                        onClick={() => {
                                            onChange(iso);
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            'rounded-lg py-1.5 text-sm transition',
                                            isSelected
                                                ? 'bg-primary font-semibold text-white'
                                                : isToday
                                                  ? 'bg-soft text-primary-dark'
                                                  : 'text-ink hover:bg-soft/60',
                                        )}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </FieldShell>
    );
}
