import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { NumberInput, Select } from '@/components/form';
import { Button, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { usePermissions } from '@/lib/permissions';
import recipes from '@/routes/recipes';
import type { Ingredient, ModifierGroup, Product, RecipeLine, Uom } from '@/types/pos';

type Props = {
    products: Product[];
    modifierGroups: ModifierGroup[];
    ingredients: Ingredient[];
    uom: Uom[];
};

type Target = { kind: 'product' | 'modifier'; id: string; name: string };

export default function Recipes({ products, modifierGroups, ingredients, uom }: Props) {
    const { canManage } = usePermissions();
    const [target, setTarget] = useState<Target | null>(null);

    const modifiers = modifierGroups.flatMap((g) => g.modifiers.map((m) => ({ ...m, groupName: g.name })));

    return (
        <AppLayout title="Resep">
            <Head title="Resep" />
            <PageHeader title="Resep Produk & Modifier" description="Kelola BOM (bill of materials) per produk/modifier." />

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <div className="flex flex-col gap-4">
                    <div className="card p-4">
                        <p className="mb-2 text-sm font-semibold text-ink">Produk</p>
                        <ul className="flex flex-col gap-1">
                            {products.map((p) => (
                                <li key={p.id}>
                                    <button
                                        className={
                                            'w-full rounded-lg px-3 py-1.5 text-left text-sm ' +
                                            (target?.kind === 'product' && target.id === p.id
                                                ? 'bg-soft text-primary-dark'
                                                : 'text-ink hover:bg-soft/60')
                                        }
                                        onClick={() => setTarget({ kind: 'product', id: p.id, name: p.name })}
                                    >
                                        {p.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="card p-4">
                        <p className="mb-2 text-sm font-semibold text-ink">Modifier</p>
                        <ul className="flex flex-col gap-1">
                            {modifiers.map((m) => (
                                <li key={m.id}>
                                    <button
                                        className={
                                            'w-full rounded-lg px-3 py-1.5 text-left text-sm ' +
                                            (target?.kind === 'modifier' && target.id === m.id
                                                ? 'bg-soft text-primary-dark'
                                                : 'text-ink hover:bg-soft/60')
                                        }
                                        onClick={() =>
                                            setTarget({ kind: 'modifier', id: m.id, name: `${m.groupName} · ${m.name}` })
                                        }
                                    >
                                        {m.groupName} · {m.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {target ? (
                    <RecipeEditor
                        key={`${target.kind}-${target.id}`}
                        target={target}
                        ingredients={ingredients}
                        uom={uom}
                        canManage={canManage}
                    />
                ) : (
                    <EmptyState>Pilih produk atau modifier untuk mengedit resepnya.</EmptyState>
                )}
            </div>
        </AppLayout>
    );
}

function RecipeEditor({
    target,
    ingredients,
    uom,
    canManage,
}: {
    target: Target;
    ingredients: Ingredient[];
    uom: Uom[];
    canManage: boolean;
}) {
    const isProduct = target.kind === 'product';
    const qtyKey = isProduct ? 'qtyPerUnit' : 'qtyDelta';
    const [lines, setLines] = useState<RecipeLine[] | null>(null);
    const [saving, setSaving] = useState(false);

    const readUrl = isProduct ? recipes.readProduct(target.id).url : recipes.readModifier(target.id).url;
    const saveUrl = isProduct ? recipes.saveProduct(target.id).url : recipes.saveModifier(target.id).url;

    useEffect(() => {
        fetch(readUrl, { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((j) => setLines(j.data ?? []))
            .catch(() => setLines([]));
    }, [readUrl]);

    const setLine = (i: number, patch: Partial<RecipeLine>) =>
        setLines((ls) => (ls ? ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) : ls));

    const addLine = () =>
        setLines((ls) => [
            ...(ls ?? []),
            { ingredientId: ingredients[0]?.id ?? '', [qtyKey]: 0, uomId: uom[0]?.id ?? '' } as RecipeLine,
        ]);

    const save = () => {
        if (!lines) {
return;
}

        setSaving(true);
        const payload = {
            lines: lines.map((l) => ({
                ingredientId: l.ingredientId,
                [qtyKey]: Number((l as Record<string, unknown>)[qtyKey] ?? 0),
                uomId: l.uomId,
            })),
        };
        router.put(saveUrl, payload, { preserveScroll: true, onFinish: () => setSaving(false) });
    };

    if (lines === null) {
        return <div className="card h-40 animate-pulse" />;
    }

    return (
        <div className="card p-5">
            <h3 className="mb-4 font-display text-lg font-semibold text-ink">{target.name}</h3>

            <div className="flex flex-col gap-2">
                {lines.map((l, i) => (
                    <div key={i} className="grid items-end gap-2 rounded-xl border border-line p-3 transition hover:border-primary/40 sm:grid-cols-[1fr_8rem_7rem_auto]">
                        <Select
                            label="Bahan"
                            value={l.ingredientId}
                            onChange={(v) => setLine(i, { ingredientId: v })}
                            options={ingredients.map((ing) => ({ value: ing.id, label: ing.name }))}
                            disabled={!canManage}
                            searchable
                        />
                        <NumberInput
                            label={isProduct ? 'Qty' : 'Delta (±)'}
                            min={isProduct ? 0 : undefined}
                            value={Number((l as Record<string, unknown>)[qtyKey] ?? 0)}
                            onChange={(v) => setLine(i, { [qtyKey]: v } as Partial<RecipeLine>)}
                            disabled={!canManage}
                        />
                        <Select
                            label="Satuan"
                            value={l.uomId}
                            onChange={(v) => setLine(i, { uomId: v })}
                            options={uom.map((u) => ({ value: u.id, label: u.code }))}
                            disabled={!canManage}
                        />
                        {canManage && (
                            <button
                                type="button"
                                className="pb-3 text-muted transition hover:text-primary-dark"
                                onClick={() => setLines((ls) => (ls ? ls.filter((_, idx) => idx !== i) : ls))}
                                aria-label="Hapus baris"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                {lines.length === 0 && <p className="text-sm text-muted">Belum ada bahan pada resep ini.</p>}
            </div>

            {canManage && (
                <div className="mt-4 flex items-center justify-between">
                    <button type="button" className="text-sm font-medium text-primary-dark hover:underline" onClick={addLine}>
                        + Tambah bahan
                    </button>
                    <Button onClick={save} disabled={saving}>
                        {saving ? 'Menyimpan…' : 'Simpan Resep'}
                    </Button>
                </div>
            )}
        </div>
    );
}
