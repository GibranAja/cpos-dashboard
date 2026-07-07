import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { NumberInput, Select, TextInput, Toggle } from '@/components/form';
import { FormPage } from '@/components/form-page';
import { Badge, Button } from '@/components/ui';
import { rupiah } from '@/lib/format';
import modifierGroups from '@/routes/modifier-groups';
import modifierRoutes from '@/routes/modifier-groups/modifiers';
import type { Modifier, ModifierGroup } from '@/types/pos';

export default function ModifierGroupForm({ group }: { group: ModifierGroup | null }) {
    const isEdit = !!group;
    const { data, setData, submit, processing, errors } = useForm({
        name: group?.name ?? '',
        selection: group?.selection ?? 'single',
        isRequired: group?.isRequired ?? false,
        sortOrder: group?.sortOrder ?? 0,
        isActive: group?.isActive ?? true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(isEdit ? modifierGroups.update(group!.id) : modifierGroups.store(), { preserveScroll: true });
    };

    return (
        <FormPage title={isEdit ? `Ubah Grup · ${group!.name}` : 'Grup Modifier Baru'} backHref={modifierGroups.index().url}>
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <TextInput
                    label="Nama"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    autoFocus
                    required
                />
                <Select
                    label="Tipe Pilihan"
                    value={data.selection}
                    onChange={(v) => setData('selection', v as 'single' | 'multi')}
                    options={[
                        { value: 'single', label: 'Pilih satu (single)', description: 'Pelanggan memilih tepat satu opsi.' },
                        { value: 'multi', label: 'Pilih banyak (multi)', description: 'Pelanggan bisa memilih beberapa opsi.' },
                    ]}
                    error={errors.selection}
                />
                <NumberInput label="Urutan" min={0} value={data.sortOrder} onChange={(v) => setData('sortOrder', v)} error={errors.sortOrder} />
                <Toggle label="Wajib dipilih" description="Kasir harus memilih salah satu opsi." checked={data.isRequired} onChange={(v) => setData('isRequired', v)} />
                <Toggle label="Aktif" checked={data.isActive} onChange={(v) => setData('isActive', v)} />

                <div className="flex justify-end border-t border-line pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Grup'}
                    </Button>
                </div>
            </form>

            {isEdit ? (
                <ModifiersManager group={group!} />
            ) : (
                <p className="mt-5 rounded-xl bg-soft/60 p-3 text-xs text-primary-dark">
                    Simpan grup terlebih dahulu — pengelolaan modifier tersedia di halaman ubah.
                </p>
            )}
        </FormPage>
    );
}

/** Inline management of the group's modifiers on the edit page. */
function ModifiersManager({ group }: { group: ModifierGroup }) {
    const [editing, setEditing] = useState<Modifier | null>(null);
    const [adding, setAdding] = useState(false);

    return (
        <div className="mt-6 border-t border-line pt-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-ink">Modifier</h3>
                {!adding && !editing && (
                    <Button variant="ghost" onClick={() => setAdding(true)}>
                        + Modifier
                    </Button>
                )}
            </div>

            <ul className="divide-y divide-line">
                {group.modifiers.map((m) =>
                    editing?.id === m.id ? (
                        <li key={m.id} className="py-3">
                            <ModifierInlineForm groupId={group.id} modifier={m} onDone={() => setEditing(null)} />
                        </li>
                    ) : (
                        <li key={m.id} className="flex items-center justify-between py-2.5 text-sm transition hover:bg-soft/20">
                            <span className="flex items-center gap-2 text-ink">
                                {m.name}
                                {m.isDefault && <Badge tone="active">Default</Badge>}
                            </span>
                            <span className="flex items-center gap-3">
                                <span className={m.priceDelta === 0 ? 'text-muted' : 'text-primary-dark'}>
                                    {m.priceDelta === 0 ? '+0' : `+${rupiah(m.priceDelta)}`}
                                </span>
                                <button
                                    type="button"
                                    className="text-xs text-muted transition hover:text-ink"
                                    onClick={() => {
                                        setAdding(false);
                                        setEditing(m);
                                    }}
                                >
                                    Ubah
                                </button>
                                <button
                                    type="button"
                                    className="text-xs text-primary-dark transition hover:underline"
                                    onClick={() => {
                                        if (confirm(`Hapus modifier "${m.name}"?`)) {
                                            router.delete(modifierRoutes.destroy([group.id, m.id]).url, { preserveScroll: true });
                                        }
                                    }}
                                >
                                    Hapus
                                </button>
                            </span>
                        </li>
                    ),
                )}
                {group.modifiers.length === 0 && !adding && <li className="py-2 text-sm text-muted">Belum ada modifier.</li>}
            </ul>

            {adding && (
                <div className="mt-3 rounded-xl border border-line p-4">
                    <ModifierInlineForm groupId={group.id} onDone={() => setAdding(false)} />
                </div>
            )}
        </div>
    );
}

function ModifierInlineForm({ groupId, modifier, onDone }: { groupId: string; modifier?: Modifier; onDone: () => void }) {
    const isEdit = !!modifier;
    const { data, setData, submit, processing, errors } = useForm({
        name: modifier?.name ?? '',
        priceDelta: modifier?.priceDelta ?? 0,
        isDefault: modifier?.isDefault ?? false,
        sortOrder: modifier?.sortOrder ?? 0,
        isActive: modifier?.isActive ?? true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const action = isEdit ? modifierRoutes.update([groupId, modifier!.id]) : modifierRoutes.store(groupId);
        submit(action, { onSuccess: onDone, preserveScroll: true });
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
                <TextInput label="Nama" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} autoFocus required />
                <NumberInput label="Selisih Harga" prefix="Rp" step={500} value={data.priceDelta} onChange={(v) => setData('priceDelta', v)} error={errors.priceDelta} />
            </div>
            <Toggle label="Pilihan default" checked={data.isDefault} onChange={(v) => setData('isDefault', v)} />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onDone}>
                    Batal
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Menyimpan…' : 'Simpan Modifier'}
                </Button>
            </div>
        </form>
    );
}
