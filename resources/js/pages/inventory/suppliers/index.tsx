import { Head, Link, router } from '@inertiajs/react';
import { Button, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { usePermissions } from '@/lib/permissions';
import suppliers from '@/routes/suppliers';
import type { Supplier } from '@/types/pos';

export default function Suppliers({ suppliers: items }: { suppliers: Supplier[] }) {
    const { canManage } = usePermissions();

    return (
        <AppLayout title="Supplier">
            <Head title="Supplier" />
            <PageHeader
                title="Supplier"
                action={
                    canManage && (
                        <Link href={suppliers.create().url}>
                            <Button>+ Supplier</Button>
                        </Link>
                    )
                }
            />

            {items.length === 0 ? (
                <EmptyState>Belum ada supplier.</EmptyState>
            ) : (
                <div className="card divide-y divide-line">
                    {items.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <div>
                                <p className="font-medium text-ink">{s.name}</p>
                                {s.contact && <p className="text-sm text-muted">{s.contact}</p>}
                            </div>
                            {canManage && (
                                <div className="flex gap-2">
                                    <Link href={suppliers.edit(s.id).url}>
                                        <Button variant="ghost">Ubah</Button>
                                    </Link>
                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            if (confirm(`Hapus supplier "${s.name}"?`)) {
                                                router.delete(suppliers.destroy(s.id).url);
                                            }
                                        }}
                                    >
                                        Hapus
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
