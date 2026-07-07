import { Head, Link } from '@inertiajs/react';
import { Pager } from '@/components/pager';
import { Badge, Button, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { usePermissions } from '@/lib/permissions';
import stockAdjustments from '@/routes/stock-adjustments';
import type { Paginated, StockAdjustment } from '@/types/pos';

export default function StockAdjustments({ adjustments: page }: { adjustments: Paginated<StockAdjustment> }) {
    const { canManage } = usePermissions();

    return (
        <AppLayout title="Penyesuaian Stok">
            <Head title="Penyesuaian Stok" />
            <PageHeader
                title="Penyesuaian Stok"
                description="Alasan wajib diisi — semua penyesuaian diaudit."
                action={
                    canManage && (
                        <div className="flex gap-2">
                            <Link href={stockAdjustments.create({ query: { mode: 'waste' } }).url}>
                                <Button variant="ghost">Catat Waste</Button>
                            </Link>
                            <Link href={stockAdjustments.create().url}>
                                <Button>+ Penyesuaian</Button>
                            </Link>
                        </div>
                    )
                }
            />

            {page.data.length === 0 ? (
                <EmptyState>Belum ada penyesuaian stok.</EmptyState>
            ) : (
                <div className="card divide-y divide-line">
                    {page.data.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <div>
                                <p className="font-medium text-ink">{a.reason}</p>
                                <p className="text-sm text-muted">{new Date(a.createdAt).toLocaleString('id-ID')}</p>
                            </div>
                            <Badge tone="muted">{a.items?.length ?? 0} item</Badge>
                        </div>
                    ))}
                </div>
            )}
            <Pager nextCursor={page.nextCursor} baseUrl={stockAdjustments.index().url} />
        </AppLayout>
    );
}
