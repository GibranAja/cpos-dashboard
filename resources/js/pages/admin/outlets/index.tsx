import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { Badge, Button, Checkbox, EmptyState, PageHeader, SelectionBar } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { useRowSelection } from '@/lib/use-row-selection';
import outlets from '@/routes/outlets';
import type { Outlet } from '@/types/pos';

export default function Outlets({ outlets: items }: { outlets: Outlet[] }) {
    const myOutletId = usePage().props.auth.user?.outletId;

    // Don't let an admin bulk-delete their own outlet (would self-lock).
    const selectableIds = useMemo(() => items.filter((o) => o.id !== myOutletId).map((o) => o.id), [items, myOutletId]);
    const sel = useRowSelection(selectableIds);
    const bulkDelete = () =>
        router.post('/outlets/bulk-delete', { ids: sel.selectedIds }, { preserveScroll: true, onSuccess: () => sel.clear() });

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
                    {selectableIds.length > 0 && (
                        <label className="flex items-center gap-3 p-4 text-sm text-muted">
                            <Checkbox
                                checked={sel.allSelected}
                                indeterminate={sel.someSelected}
                                onChange={sel.toggleAll}
                                ariaLabel="Pilih semua outlet"
                            />
                            Pilih semua
                        </label>
                    )}
                    {items.map((o) => (
                        <div key={o.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <div className="flex items-center gap-3">
                                {o.id !== myOutletId && (
                                    <Checkbox
                                        checked={sel.isSelected(o.id)}
                                        onChange={() => sel.toggle(o.id)}
                                        ariaLabel={`Pilih ${o.name}`}
                                    />
                                )}
                                <div>
                                    <p className="flex items-center gap-2 font-medium text-ink">
                                        {o.name}{' '}
                                        {o.isActive ? <Badge tone="active">Aktif</Badge> : <Badge tone="muted">Nonaktif</Badge>}
                                    </p>
                                    {o.address && <p className="text-sm text-muted">{o.address}</p>}
                                </div>
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

            <SelectionBar count={sel.count} itemLabel="outlet" onClear={sel.clear} onDelete={bulkDelete} />
        </AppLayout>
    );
}
