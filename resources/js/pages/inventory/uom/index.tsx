import { Head, Link } from '@inertiajs/react';
import { Button, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { usePermissions } from '@/lib/permissions';
import uomRoutes from '@/routes/uom';
import type { Uom } from '@/types/pos';

export default function UomPage({ uom }: { uom: Uom[] }) {
    const { canManage } = usePermissions();

    return (
        <AppLayout title="Satuan">
            <Head title="Satuan" />
            <PageHeader
                title="Satuan (UoM)"
                description="Unit global: ml, g, pcs, dll."
                action={
                    canManage && (
                        <Link href={uomRoutes.create().url}>
                            <Button>+ Satuan</Button>
                        </Link>
                    )
                }
            />

            {uom.length === 0 ? (
                <EmptyState>Belum ada satuan.</EmptyState>
            ) : (
                <div className="card divide-y divide-line">
                    {uom.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <span className="font-medium text-ink">{u.name}</span>
                            <code className="text-sm text-muted">{u.code}</code>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
