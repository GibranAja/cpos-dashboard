import { Deferred, Head } from '@inertiajs/react';
import { BarChart } from '@/components/bar-chart';
import AppLayout from '@/layouts/app-layout';
import { count, percent, rupiah } from '@/lib/format';
import type { LowStock, ReportSummary, Timeseries, TopProducts } from '@/types/pos';

type Props = {
    summary?: ReportSummary | null;
    timeseries?: Timeseries | null;
    topProducts?: TopProducts | null;
    lowStock?: LowStock | null;
};

export default function Dashboard({ summary, timeseries, topProducts, lowStock }: Props) {
    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <Deferred data="summary" fallback={<KpiSkeleton />}>
                <KpiRow summary={summary ?? null} />
            </Deferred>

            <div className="mt-6 card p-5">
                <h2 className="mb-4 font-display text-lg font-semibold text-ink">Penjualan 7 Hari</h2>
                <Deferred data="timeseries" fallback={<div className="h-44 animate-pulse rounded-xl bg-line" />}>
                    <TimeseriesChart timeseries={timeseries ?? null} />
                </Deferred>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Deferred data="summary" fallback={<CardSkeleton title="Metode Pembayaran" />}>
                    <PaymentBreakdown summary={summary ?? null} />
                </Deferred>

                <Deferred data="topProducts" fallback={<CardSkeleton title="Produk Terlaris" />}>
                    <TopProductsCard topProducts={topProducts ?? null} />
                </Deferred>

                <Deferred data="lowStock" fallback={<CardSkeleton title="Stok Menipis" />}>
                    <LowStockWidget lowStock={lowStock ?? null} />
                </Deferred>
            </div>
        </AppLayout>
    );
}

function TimeseriesChart({ timeseries }: { timeseries: Timeseries | null }) {
    if (!timeseries) {
return <ErrorCard message="Grafik tidak dapat dimuat." />;
}

    return <BarChart data={timeseries.series.map((s) => ({ label: s.date.slice(5), value: s.sales }))} />;
}

function TopProductsCard({ topProducts }: { topProducts: TopProducts | null }) {
    if (!topProducts) {
return <ErrorCard message="Data tidak dapat dimuat." />;
}

    return (
        <div className="card p-5">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Produk Terlaris</h2>
            {topProducts.data.length === 0 ? (
                <p className="text-sm text-muted">Belum ada penjualan.</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {topProducts.data.map((p, i) => (
                        <li key={p.productId} className="flex items-center justify-between text-sm">
                            <span className="min-w-0 truncate text-ink">
                                <span className="mr-2 text-muted">{i + 1}.</span>
                                {p.name}
                            </span>
                            <span className="shrink-0 text-muted">{count(p.qty)}×</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function KpiRow({ summary }: { summary: ReportSummary | null }) {
    if (!summary) {
        return <ErrorCard message="Ringkasan penjualan tidak dapat dimuat." />;
    }

    const kpis = [
        { label: 'Penjualan Kotor', value: rupiah(summary.grossSales) },
        { label: 'Jumlah Pesanan', value: count(summary.orderCount) },
        { label: 'Rata-rata Pesanan', value: rupiah(summary.averageOrder) },
        { label: 'Margin Kotor', value: percent(summary.marginPct) },
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

function PaymentBreakdown({ summary }: { summary: ReportSummary | null }) {
    const entries = Object.entries(summary?.byPaymentMethod ?? {});

    return (
        <div className="card p-5">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Metode Pembayaran</h2>
            {entries.length === 0 ? (
                <p className="text-sm text-muted">Belum ada transaksi hari ini.</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {entries.map(([code, { count: c, total }]) => (
                        <li key={code} className="flex items-center justify-between text-sm">
                            <span className="font-medium text-ink capitalize">{code}</span>
                            <span className="text-muted">
                                {count(c)} × · <span className="text-ink">{rupiah(total)}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function LowStockWidget({ lowStock }: { lowStock: LowStock | null }) {
    const items = lowStock?.data ?? [];

    return (
        <div className="card p-5">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Stok Menipis</h2>
            {items.length === 0 ? (
                <p className="text-sm text-mint">Semua stok aman. 🎉</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between text-sm">
                            <span className="font-medium text-ink">{item.name}</span>
                            <span className="text-primary-dark">
                                {item.currentStock} / {item.reorderLevel} {item.uom}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function ErrorCard({ message }: { message: string }) {
    return (
        <div className="card border-primary/30 bg-primary/5 p-5 text-sm text-primary-dark">{message}</div>
    );
}

function KpiSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card animate-pulse p-5">
                    <div className="h-4 w-24 rounded bg-line" />
                    <div className="mt-3 h-7 w-32 rounded bg-line" />
                </div>
            ))}
        </div>
    );
}

function CardSkeleton({ title }: { title: string }) {
    return (
        <div className="card p-5">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">{title}</h2>
            <div className="flex animate-pulse flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-5 rounded bg-line" />
                ))}
            </div>
        </div>
    );
}
