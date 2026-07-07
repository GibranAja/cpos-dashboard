import { Head, Link, router } from '@inertiajs/react';
import { Badge, Button, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import outlets from '@/routes/outlets';
import type { Outlet } from '@/types/pos';

export default function Outlets({ outlets: items }: { outlets: Outlet[] }) {
    return (
        <AppLayout title="Outlet">
            <Head title="Outlet" />
            <PageHeader
                title="Outlet"
                description="Data tetap terikat outlet Anda (tidak ada pengalih antar-outlet)."
                action={
                    <Link href={outlets.create().url}>
                        <Button>+ Outlet</Button>
                    </Link>
                }
            />

            {items.length === 0 ? (
                <EmptyState>Belum ada outlet.</EmptyState>
            ) : (
                <div className="card divide-y divide-line">
                    {items.map((o) => (
                        <div key={o.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <div>
                                <p className="flex items-center gap-2 font-medium text-ink">
                                    {o.name}{' '}
                                    {o.isActive ? <Badge tone="active">Aktif</Badge> : <Badge tone="muted">Nonaktif</Badge>}
                                </p>
                                {o.address && <p className="text-sm text-muted">{o.address}</p>}
                            </div>
                            <div className="flex gap-2">
                                <Link href={outlets.edit(o.id).url}>
                                    <Button variant="ghost">Ubah</Button>
                                </Link>
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        if (confirm(`Hapus outlet "${o.name}"?`)) {
                                            router.delete(outlets.destroy(o.id).url);
                                        }
                                    }}
                                >
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
