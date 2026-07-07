import { rupiah } from '@/lib/format';

type Point = { label: string; value: number };

/**
 * Minimal dependency-free bar chart for the sales timeseries. On-brand
 * (primary bars, soft grid), accessible via per-bar titles.
 */
export function BarChart({ data, height = 180 }: { data: Point[]; height?: number }) {
    if (data.length === 0) {
        return <p className="text-sm text-muted">Belum ada data.</p>;
    }

    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className="flex items-end gap-2" style={{ height }}>
            {data.map((d) => (
                <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                    <div
                        className="w-full rounded-t-lg bg-primary/80 transition-all hover:bg-primary"
                        style={{ height: `${Math.max((d.value / max) * (height - 28), 2)}px` }}
                        title={`${d.label}: ${rupiah(d.value)}`}
                    />
                    <span className="truncate text-[10px] text-muted">{d.label}</span>
                </div>
            ))}
        </div>
    );
}
