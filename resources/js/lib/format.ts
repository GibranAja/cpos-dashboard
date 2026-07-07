/** Format an integer rupiah amount from the API as `Rp 32.000`. */
export function rupiah(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) {
        return 'Rp 0';
    }

    return `Rp ${new Intl.NumberFormat('id-ID').format(Math.round(amount))}`;
}

/** Format a percentage (the API sends fractions like 0.42 for 42%). */
export function percent(fraction: number | null | undefined, digits = 1): string {
    if (fraction === null || fraction === undefined) {
        return '—';
    }

    return `${(fraction * 100).toFixed(digits)}%`;
}

/** Format an integer count with id-ID grouping. */
export function count(value: number | null | undefined): string {
    return new Intl.NumberFormat('id-ID').format(value ?? 0);
}
