import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { Badge, Button, Checkbox, EmptyState, PageHeader, SelectionBar } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { rupiah } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import { useRowSelection } from '@/lib/use-row-selection';
import modifierGroups from '@/routes/modifier-groups';
import type { ModifierGroup } from '@/types/pos';

export default function ModifierGroups({ groups }: { groups: ModifierGroup[] }) {
    const { canManage } = usePermissions();

    const selectableIds = useMemo(() => groups.map((g) => g.id), [groups]);
    const sel = useRowSelection(selectableIds);
    const bulkDelete = () =>
        router.post('/modifier-groups/bulk-delete', { ids: sel.selectedIds }, { preserveScroll: true, onSuccess: () => sel.clear() });

    return (
        <AppLayout title="Grup Modifier">
            <Head title="Grup Modifier" />

            <PageHeader
                title="Grup Modifier"
                description="Contoh: Ukuran (Reguler/Large), Tingkat Gula."
                action={
                    canManage && (
                        <Link href={modifierGroups.create().url}>
                            <Button>+ Grup</Button>
                        </Link>
                    )
                }
            />

            {groups.length === 0 ? (
                <EmptyState>Belum ada grup modifier.</EmptyState>
            ) : (
                <div className="flex flex-col gap-4">
                    {canManage && selectableIds.length > 0 && (
                        <label className="flex items-center gap-3 px-1 text-sm text-muted">
                            <Checkbox
                                checked={sel.allSelected}
                                indeterminate={sel.someSelected}
                                onChange={sel.toggleAll}
                                ariaLabel="Pilih semua grup"
                            />
                            Pilih semua
                        </label>
                    )}
                    {groups.map((g) => (
                        <div key={g.id} className="card p-5 transition hover:shadow-soft">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    {canManage && (
                                        <Checkbox
                                            checked={sel.isSelected(g.id)}
                                            onChange={() => sel.toggle(g.id)}
                                            ariaLabel={`Pilih ${g.name}`}
                                        />
                                    )}
                                    <h3 className="font-display text-lg font-semibold text-ink">{g.name}</h3>
                                    <Badge>{g.selection === 'single' ? 'Pilih 1' : 'Pilih banyak'}</Badge>
                                    {g.isRequired && <Badge tone="active">Wajib</Badge>}
                                </div>
                                {canManage && (
                                    <div className="flex gap-2">
                                        <Link href={modifierGroups.edit(g.id).url}>
                                            <Button variant="ghost">Ubah</Button>
                                        </Link>
                                        <Button
                                            variant="danger"
                                            onClick={() => {
                                                if (confirm(`Hapus grup "${g.name}"?`)) {
                                                    router.delete(modifierGroups.destroy(g.id).url);
                                                }
                                            }}
                                        >
                                            Hapus
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <ul className="mt-3 flex flex-wrap gap-2">
                                {g.modifiers.map((m) => (
                                    <li key={m.id}>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-xs font-medium text-primary-dark">
                                            {m.name}
                                            <span className="text-muted">{m.priceDelta === 0 ? '+0' : `+${rupiah(m.priceDelta)}`}</span>
                                        </span>
                                    </li>
                                ))}
                                {g.modifiers.length === 0 && <li className="text-sm text-muted">Belum ada modifier.</li>}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {canManage && (
                <SelectionBar count={sel.count} itemLabel="grup" onClear={sel.clear} onDelete={bulkDelete} />
            )}
        </AppLayout>
    );
}
