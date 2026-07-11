import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { Button, Checkbox, EmptyState, PageHeader, SelectionBar } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { usePermissions } from '@/lib/permissions';
import { useRowSelection } from '@/lib/use-row-selection';
import suppliers from '@/routes/suppliers';
import type { Supplier } from '@/types/pos';

export default function Suppliers({ suppliers: items }: { suppliers: Supplier[] }) {
    const { canManage } = usePermissions();

    const selectableIds = useMemo(() => items.map((s) => s.id), [items]);
    const sel = useRowSelection(selectableIds);
    const bulkDelete = () =>
        router.post('/suppliers/bulk-delete', { ids: sel.selectedIds }, { preserveScroll: true, onSuccess: () => sel.clear() });

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
                    {canManage && selectableIds.length > 0 && (
                        <label className="flex items-center gap-3 p-4 text-sm text-muted">
                            <Checkbox
                                checked={sel.allSelected}
                                indeterminate={sel.someSelected}
                                onChange={sel.toggleAll}
                                ariaLabel="Pilih semua supplier"
                            />
                            Pilih semua
                        </label>
                    )}
                    {items.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <div className="flex items-center gap-3">
                                {canManage && (
                                    <Checkbox
                                        checked={sel.isSelected(s.id)}
                                        onChange={() => sel.toggle(s.id)}
                                        ariaLabel={`Pilih ${s.name}`}
                                    />
                                )}
                                <div>
                                    <p className="font-medium text-ink">{s.name}</p>
                                    {s.contact && <p className="text-sm text-muted">{s.contact}</p>}
                                </div>
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

            {canManage && (
                <SelectionBar count={sel.count} itemLabel="supplier" onClear={sel.clear} onDelete={bulkDelete} />
            )}
        </AppLayout>
    );
}
