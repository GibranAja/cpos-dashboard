import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { Badge, Button, Checkbox, EmptyState, PageHeader, SelectionBar } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { useRowSelection } from '@/lib/use-row-selection';
import users from '@/routes/users';
import type { AdminUser } from '@/types/pos';

export default function Users({ users: items }: { users: AdminUser[] }) {
    const meId = usePage().props.auth.user?.id;

    // Own account can't be bulk-deleted (API rejects it too), so exclude it.
    const selectableIds = useMemo(
        () => items.filter((u) => !u.deletedAt && u.id !== meId).map((u) => u.id),
        [items, meId],
    );
    const sel = useRowSelection(selectableIds);
    const bulkDelete = () =>
        router.post('/users/bulk-delete', { ids: sel.selectedIds }, { preserveScroll: true, onSuccess: () => sel.clear() });

    return (
        <AppLayout title="Pengguna">
            <Head title="Pengguna" />
            <PageHeader
                title="Pengguna"
                description="Kelola akun outlet ini."
                action={
                    <Link href={users.create().url}>
                        <Button>+ Pengguna</Button>
                    </Link>
                }
            />

            {items.length === 0 ? (
                <EmptyState>Belum ada pengguna.</EmptyState>
            ) : (
                <div className="card divide-y divide-line">
                    {selectableIds.length > 0 && (
                        <label className="flex items-center gap-3 p-4 text-sm text-muted">
                            <Checkbox
                                checked={sel.allSelected}
                                indeterminate={sel.someSelected}
                                onChange={sel.toggleAll}
                                ariaLabel="Pilih semua pengguna"
                            />
                            Pilih semua
                        </label>
                    )}
                    {items.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <div className="flex items-center gap-3">
                                {!u.deletedAt && u.id !== meId && (
                                    <Checkbox
                                        checked={sel.isSelected(u.id)}
                                        onChange={() => sel.toggle(u.id)}
                                        ariaLabel={`Pilih ${u.name}`}
                                    />
                                )}
                                <div>
                                    <p className="flex items-center gap-2 font-medium text-ink">
                                        {u.name} {u.deletedAt && <Badge>Nonaktif</Badge>}
                                    </p>
                                    <p className="text-sm text-muted">{u.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge tone={u.role === 'admin' ? 'active' : 'neutral'}>{u.role}</Badge>
                                {u.deletedAt ? (
                                    <Button variant="ghost" onClick={() => router.post(users.restore(u.id).url)}>
                                        Pulihkan
                                    </Button>
                                ) : (
                                    <>
                                        <Link href={users.edit(u.id).url}>
                                            <Button variant="ghost">Ubah</Button>
                                        </Link>
                                        <Button
                                            variant="danger"
                                            onClick={() => {
                                                if (confirm(`Nonaktifkan "${u.name}"?`)) {
                                                    router.delete(users.destroy(u.id).url);
                                                }
                                            }}
                                        >
                                            Nonaktifkan
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <SelectionBar count={sel.count} itemLabel="pengguna" onClear={sel.clear} onDelete={bulkDelete} />
        </AppLayout>
    );
}
