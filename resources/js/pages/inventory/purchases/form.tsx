import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { NumberInput, Select, TextInput } from '@/components/form';
import { FormPage } from '@/components/form-page';
import { Button } from '@/components/ui';
import { rupiah } from '@/lib/format';
import purchases from '@/routes/purchases';
import type { Ingredient, Supplier } from '@/types/pos';

type Props = { ingredients: Ingredient[]; suppliers: Supplier[] };

type Line = { ingredientId: string; qty: number; unitCost: number };

export default function PurchaseForm({ ingredients, suppliers }: Props) {
    const [lines, setLines] = useState<Line[]>([{ ingredientId: ingredients[0]?.id ?? '', qty: 0, unitCost: 0 }]);
    const { data, setData, transform, submit, processing, errors } = useForm({
        supplierId: '',
        note: '',
        items: [] as Line[],
    });

    const grandTotal = lines.reduce((sum, l) => sum + l.qty * l.unitCost, 0);

    const setLine = (i: number, patch: Partial<Line>) =>
        setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((d) => ({ ...d, items: lines.filter((l) => l.ingredientId && l.qty > 0) }));
        submit(purchases.store(), { preserveScroll: true });
    };

    const ingredientOptions = ingredients.map((ing) => ({ value: ing.id, label: ing.name }));

    return (
        <FormPage title="Pembelian Baru" backHref={purchases.index().url}>
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <Select
                    label="Supplier"
                    placeholder="Tanpa supplier"
                    value={data.supplierId}
                    onChange={(v) => setData('supplierId', v)}
                    options={[{ value: '', label: 'Tanpa supplier' }, ...suppliers.map((s) => ({ value: s.id, label: s.name }))]}
                    error={errors.supplierId}
                    searchable
                />

                <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-ink">Item Pembelian</span>
                    {lines.map((l, i) => (
                        <div key={i} className="rounded-xl border border-line p-3 transition hover:border-primary/40">
                            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                                <Select
                                    label="Bahan"
                                    value={l.ingredientId}
                                    onChange={(v) => setLine(i, { ingredientId: v })}
                                    options={ingredientOptions}
                                    searchable
                                />
                                <div className="w-full sm:w-32">
                                    <NumberInput label="Qty" min={0} value={l.qty} onChange={(v) => setLine(i, { qty: v })} />
                                </div>
                                <div className="w-full sm:w-40">
                                    <NumberInput label="Harga/Unit" prefix="Rp" min={0} step={100} value={l.unitCost} onChange={(v) => setLine(i, { unitCost: v })} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}
                                    className="pb-2.5 text-muted transition hover:text-primary-dark"
                                    aria-label="Hapus baris"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="mt-2 text-right text-xs text-muted">
                                Subtotal: <span className="font-medium text-ink">{rupiah(l.qty * l.unitCost)}</span>
                            </p>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="ghost"
                        className="self-start"
                        onClick={() => setLines((ls) => [...ls, { ingredientId: ingredients[0]?.id ?? '', qty: 0, unitCost: 0 }])}
                    >
                        + Tambah item
                    </Button>
                    {errors.items && <p className="text-sm text-primary-dark">{errors.items}</p>}
                </div>

                <TextInput label="Catatan (opsional)" value={data.note} onChange={(e) => setData('note', e.target.value)} error={errors.note} />

                <div className="flex items-center justify-between border-t border-line pt-4">
                    <span className="text-sm text-muted">Total Pembelian</span>
                    <span className="font-display text-xl font-semibold text-ink">{rupiah(grandTotal)}</span>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan…' : 'Catat Pembelian'}
                    </Button>
                </div>
            </form>
        </FormPage>
    );
}
