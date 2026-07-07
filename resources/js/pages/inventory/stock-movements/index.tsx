import { Head, router } from '@inertiajs/react';
import { Select } from '@/components/form';
import { Pager } from '@/components/pager';
import { Badge, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import stockMovements from '@/routes/stock-movements';
import type { Ingredient, Paginated, StockMovement } from '@/types/pos';

type Props = { movements: Paginated<StockMovement>; ingredients: Ingredient[]; ingredientId: string | null };

const TYPE_TONE: Record<string, 'neutral' | 'active' | 'muted'> = {
    purchase: 'active',
    sale: 'neutral',
    adjustment: 'muted',
    waste: 'neutral',
};

export default function StockMovements({ movements: page, ingredients, ingredientId }: Props) {
    const ingredientName = (id: string) => ingredients.find((i) => i.id === id)?.name ?? id;

    return (
        <AppLayout title="Kartu Stok">
            <Head title="Kartu Stok" />
            <PageHeader
                title="Kartu Stok (Ledger)"
                description="Riwayat pergerakan stok +/−."
                action={
                    <div className="w-56">
                        <Select
                            value={ingredientId ?? ''}
                            onChange={(v) =>
                                router.get(stockMovements.index().url, v ? { ingredientId: v } : {}, {
                                    preserveState: true,
                                })
                            }
                            options={[
                                { value: '', label: 'Semua bahan' },
                                ...ingredients.map((i) => ({ value: i.id, label: i.name })),
                            ]}
                            searchable
                        />
                    </div>
                }
            />

            {page.data.length === 0 ? (
                <EmptyState>Belum ada pergerakan stok.</EmptyState>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-line text-left text-muted">
                            <tr>
                                <th className="p-4 font-medium">Waktu</th>
                                <th className="p-4 font-medium">Bahan</th>
                                <th className="p-4 font-medium">Tipe</th>
                                <th className="p-4 font-medium">Delta</th>
                                <th className="p-4 font-medium">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {page.data.map((m) => (
                                <tr key={m.id}>
                                    <td className="p-4 text-muted">{new Date(m.createdAt).toLocaleString('id-ID')}</td>
                                    <td className="p-4 text-ink">{ingredientName(m.ingredientId)}</td>
                                    <td className="p-4">
                                        <Badge tone={TYPE_TONE[m.type] ?? 'muted'}>{m.type}</Badge>
                                    </td>
                                    <td className={'p-4 font-medium ' + (Number(m.qtyDelta) < 0 ? 'text-primary-dark' : 'text-mint')}>
                                        {Number(m.qtyDelta) > 0 ? '+' : ''}
                                        {m.qtyDelta}
                                    </td>
                                    <td className="p-4 text-ink">{m.balanceAfter}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pager nextCursor={page.nextCursor} baseUrl={stockMovements.index().url} />
        </AppLayout>
    );
}
