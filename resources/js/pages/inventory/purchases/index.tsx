import { Head, Link } from '@inertiajs/react';
import { Pager } from '@/components/pager';
import { Button, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { rupiah } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import purchases from '@/routes/purchases';
import type { Paginated, Purchase, Supplier } from '@/types/pos';

type Props = { purchases: Paginated<Purchase>; suppliers: Supplier[] };

export default function Purchases({ purchases: page, suppliers }: Props) {
    const { canManage } = usePermissions();
    const supplierName = (id: string | null) => suppliers.find((s) => s.id === id)?.name ?? '—';

    return (
        <AppLayout title="Pembelian">
            <Head title="Pembelian" />
            <PageHeader
                title="Pembelian / Restock"
                description="Mencatat pembelian akan menambah stok bahan."
                action={
                    canManage && (
                        <Link href={purchases.create().url}>
                            <Button>+ Pembelian</Button>
                        </Link>
                    )
                }
            />

            {page.data.length === 0 ? (
                <EmptyState>Belum ada pembelian.</EmptyState>
            ) : (
                <div className="card divide-y divide-line">
                    {page.data.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <div>
                                <p className="font-medium text-ink">{supplierName(p.supplierId)}</p>
                                <p className="text-sm text-muted">{new Date(p.createdAt).toLocaleString('id-ID')}</p>
                            </div>
                            <span className="font-semibold text-ink">{rupiah(p.total)}</span>
                        </div>
                    ))}
                </div>
            )}
            <Pager nextCursor={page.nextCursor} baseUrl={purchases.index().url} />
        </AppLayout>
    );
}
