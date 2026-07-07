import { Head } from '@inertiajs/react';
import { Badge, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { count, rupiah } from '@/lib/format';
import type { InventorySummary, LowStockItem } from '@/types/pos';

type Props = { summary: InventorySummary | null; lowStock: LowStockItem[] };

export default function Summary({ summary, lowStock }: Props) {
    return (
        <AppLayout title="Ringkasan Inventaris">
            <Head title="Ringkasan Inventaris" />
            <PageHeader title="Ringkasan & Low-stock" description="Stok tersedia + valuasi." />

            {!summary ? (
                <div className="card border-primary/30 bg-primary/5 p-5 text-sm text-primary-dark">
                    Ringkasan tidak dapat dimuat.
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Kpi label="Jumlah Bahan" value={count(summary.ingredientCount)} />
                        <Kpi label="Stok Menipis" value={count(summary.lowStockCount)} />
                        <Kpi label="Valuasi Stok" value={rupiah(summary.valuation)} />
                    </div>

                    <div className="mt-6 card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-line text-left text-muted">
                                <tr>
                                    <th className="p-4 font-medium">Bahan</th>
                                    <th className="p-4 font-medium">Stok</th>
                                    <th className="p-4 font-medium">Reorder</th>
                                    <th className="p-4 font-medium">Nilai</th>
                                    <th className="p-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {summary.items.map((it) => (
                                    <tr key={it.id}>
                                        <td className="p-4 font-medium text-ink">{it.name}</td>
                                        <td className="p-4 text-ink">
                                            {it.currentStock} {it.uom}
                                        </td>
                                        <td className="p-4 text-muted">
                                            {it.reorderLevel} {it.uom}
                                        </td>
                                        <td className="p-4 text-ink">{rupiah(it.lineValue)}</td>
                                        <td className="p-4">
                                            {it.isLow ? <Badge>Menipis</Badge> : <Badge tone="active">Aman</Badge>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {lowStock.length > 0 && (
                <div className="mt-6 card border-primary/30 bg-primary/5 p-5">
                    <h3 className="mb-2 font-display font-semibold text-primary-dark">⚠ Perlu Restock</h3>
                    <ul className="flex flex-wrap gap-2">
                        {lowStock.map((i) => (
                            <li key={i.id}>
                                <Badge>
                                    {i.name}: {i.currentStock}/{i.reorderLevel} {i.uom}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </AppLayout>
    );
}

function Kpi({ label, value }: { label: string; value: string }) {
    return (
        <div className="card p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
        </div>
    );
}
