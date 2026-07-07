import { Deferred, Head, router } from '@inertiajs/react';
import { BarChart } from '@/components/bar-chart';
import { Button, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { count, percent, rupiah } from '@/lib/format';
import reports from '@/routes/reports';
import type { CogsMargin, ReportSummary, Timeseries, TopProducts } from '@/types/pos';

type Props = {
    range: string;
    date: string;
    summary?: ReportSummary | null;
    timeseries?: Timeseries | null;
    topProducts?: TopProducts | null;
    cogsMargin?: CogsMargin | null;
};

const RANGES = [
    { value: '7d', label: '7 hari' },
    { value: '30d', label: '30 hari' },
    { value: '90d', label: '90 hari' },
];

export default function Reports({ range, date, summary, timeseries, topProducts, cogsMargin }: Props) {
    const setRange = (value: string) => router.get(reports.index().url, { date, range: value }, { preserveState: true });

    return (
        <AppLayout title="Laporan">
            <Head title="Laporan" />

            <PageHeader
                title="Laporan"
                description={`Rentang ${range} · tanggal ${date}`}
                action={
                    <div className="flex items-center gap-2">
                        {RANGES.map((r) => (
                            <Button
                                key={r.value}
                                variant={r.value === range ? 'primary' : 'ghost'}
                                onClick={() => setRange(r.value)}
                            >
                                {r.label}
                            </Button>
                        ))}
                        <a href={reports.export({ query: { date } }).url}>
                            <Button variant="ghost">Ekspor CSV</Button>
                        </a>
                    </div>
                }
            />

            <Deferred data="summary" fallback={<SkeletonRow />}>
                <SummaryRow summary={summary ?? null} />
            </Deferred>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="card p-5">
                    <h3 className="mb-4 font-display text-lg font-semibold text-ink">Penjualan Harian</h3>
                    <Deferred data="timeseries" fallback={<div className="h-44 animate-pulse rounded-xl bg-line" />}>
                        <TimeseriesChart timeseries={timeseries ?? null} />
                    </Deferred>
                </div>

                <div className="card p-5">
                    <h3 className="mb-4 font-display text-lg font-semibold text-ink">Produk Terlaris</h3>
                    <Deferred data="topProducts" fallback={<ListSkeleton />}>
                        <TopProductsList topProducts={topProducts ?? null} />
                    </Deferred>
                </div>
            </div>

            <div className="mt-6">
                <Deferred data="cogsMargin" fallback={<SkeletonRow />}>
                    <CogsRow cogs={cogsMargin ?? null} />
                </Deferred>
            </div>
        </AppLayout>
    );
}

function SummaryRow({ summary }: { summary: ReportSummary | null }) {
    if (!summary) {
return <ErrorCard />;
}

    const kpis = [
        { label: 'Penjualan Kotor', value: rupiah(summary.grossSales) },
        { label: 'Pesanan', value: count(summary.orderCount) },
        { label: 'Rata-rata', value: rupiah(summary.averageOrder) },
        { label: 'Margin', value: percent(summary.marginPct) },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
                <div key={k.label} className="card p-5">
                    <p className="text-sm text-muted">{k.label}</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-ink">{k.value}</p>
                </div>
            ))}
        </div>
    );
}

function TimeseriesChart({ timeseries }: { timeseries: Timeseries | null }) {
    if (!timeseries) {
return <ErrorCard />;
}

    return (
        <BarChart
            data={timeseries.series.map((s) => ({ label: s.date.slice(5), value: s.sales }))}
        />
    );
}

function TopProductsList({ topProducts }: { topProducts: TopProducts | null }) {
    if (!topProducts) {
return <ErrorCard />;
}

    if (topProducts.data.length === 0) {
return <p className="text-sm text-muted">Belum ada penjualan.</p>;
}

    return (
        <ul className="flex flex-col gap-2">
            {topProducts.data.map((p, i) => (
                <li key={p.productId} className="flex items-center justify-between text-sm">
                    <span className="min-w-0 truncate text-ink">
                        <span className="mr-2 text-muted">{i + 1}.</span>
                        {p.name}
                    </span>
                    <span className="shrink-0 text-muted">
                        {count(p.qty)}× · <span className="text-ink">{rupiah(p.sales)}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}

function CogsRow({ cogs }: { cogs: CogsMargin | null }) {
    if (!cogs) {
return <ErrorCard />;
}

    const kpis = [
        { label: 'Penjualan Kotor', value: rupiah(cogs.grossSales) },
        { label: 'HPP (COGS)', value: rupiah(cogs.cogs) },
        { label: 'Laba Kotor', value: rupiah(cogs.grossMargin) },
        { label: 'Margin', value: percent(cogs.marginPct) },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
                <div key={k.label} className="card p-5">
                    <p className="text-sm text-muted">{k.label}</p>
                    <p className="mt-1 font-display text-xl font-semibold text-ink">{k.value}</p>
                </div>
            ))}
        </div>
    );
}

function ErrorCard() {
    return <div className="card border-primary/30 bg-primary/5 p-5 text-sm text-primary-dark">Data tidak dapat dimuat.</div>;
}

function SkeletonRow() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card animate-pulse p-5">
                    <div className="h-4 w-20 rounded bg-line" />
                    <div className="mt-3 h-7 w-28 rounded bg-line" />
                </div>
            ))}
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="flex animate-pulse flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-5 rounded bg-line" />
            ))}
        </div>
    );
}
