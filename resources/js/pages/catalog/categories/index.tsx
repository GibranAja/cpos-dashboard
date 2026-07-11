import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { Badge, Button, Checkbox, EmptyState, PageHeader, SelectionBar } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { usePermissions } from '@/lib/permissions';
import { useRowSelection } from '@/lib/use-row-selection';
import categories from '@/routes/categories';
import type { Category } from '@/types/pos';

export default function Categories({ categories: items }: { categories: Category[] }) {
    const { canManage } = usePermissions();

    const selectableIds = useMemo(() => items.filter((c) => !c.deletedAt).map((c) => c.id), [items]);
    const sel = useRowSelection(selectableIds);
    const bulkDelete = () =>
        router.post('/categories/bulk-delete', { ids: sel.selectedIds }, { preserveScroll: true, onSuccess: () => sel.clear() });

    return (
        <AppLayout title="Kategori">
            <Head title="Kategori" />

            <PageHeader
                title="Kategori"
                description="Kelola kategori produk."
                action={
                    canManage && (
                        <Link href={categories.create().url}>
                            <Button>+ Kategori</Button>
                        </Link>
                    )
                }
            />

            {items.length === 0 ? (
                <EmptyState>Belum ada kategori.</EmptyState>
            ) : (
                <div className="card divide-y divide-line">
                    {canManage && selectableIds.length > 0 && (
                        <label className="flex items-center gap-3 p-4 text-sm text-muted">
                            <Checkbox
                                checked={sel.allSelected}
                                indeterminate={sel.someSelected}
                                onChange={sel.toggleAll}
                                ariaLabel="Pilih semua kategori"
                            />
                            Pilih semua
                        </label>
                    )}
                    {items.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <div className="flex items-center gap-3">
                                {canManage && !c.deletedAt && (
                                    <Checkbox
                                        checked={sel.isSelected(c.id)}
                                        onChange={() => sel.toggle(c.id)}
                                        ariaLabel={`Pilih ${c.name}`}
                                    />
                                )}
                                <span className="font-medium text-ink">{c.name}</span>
                                {c.isActive ? <Badge tone="active">Aktif</Badge> : <Badge tone="muted">Nonaktif</Badge>}
                                {c.deletedAt && <Badge>Terhapus</Badge>}
                            </div>
                            {canManage && (
                                <div className="flex items-center gap-2">
                                    {c.deletedAt ? (
                                        <Button variant="ghost" onClick={() => router.post(categories.restore(c.id).url)}>
                                            Pulihkan
                                        </Button>
                                    ) : (
                                        <>
                                            <Link href={categories.edit(c.id).url}>
                                                <Button variant="ghost">Ubah</Button>
                                            </Link>
                                            <Button
                                                variant="danger"
                                                onClick={() => {
                                                    if (confirm(`Hapus kategori "${c.name}"? Bisa dipulihkan nanti.`)) {
                                                        router.delete(categories.destroy(c.id).url);
                                                    }
                                                }}
                                            >
                                                Hapus
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {canManage && (
                <SelectionBar count={sel.count} itemLabel="kategori" onClear={sel.clear} onDelete={bulkDelete} />
            )}
        </AppLayout>
    );
}
