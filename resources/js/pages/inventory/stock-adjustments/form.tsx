import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { NumberInput, Select, TextInput } from '@/components/form';
import { FormPage } from '@/components/form-page';
import { Button } from '@/components/ui';
import stockAdjustments from '@/routes/stock-adjustments';
import type { Ingredient } from '@/types/pos';

type Props = { mode: 'adjust' | 'waste'; ingredients: Ingredient[] };

type Line = { ingredientId: string; qtyDelta: number };

export default function StockAdjustmentForm({ mode, ingredients }: Props) {
    const isWaste = mode === 'waste';
    const [lines, setLines] = useState<Line[]>([{ ingredientId: ingredients[0]?.id ?? '', qtyDelta: 0 }]);
    const { data, setData, transform, submit, processing, errors } = useForm({
        reason: '',
        items: [] as { ingredientId: string; qtyDelta: number }[],
    });

    const setLine = (i: number, patch: Partial<Line>) =>
        setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm('Simpan penyesuaian stok? Efek ledger tidak bisa dibatalkan.')) {
            return;
        }

        transform((d) => ({
            ...d,
            items: lines
                .filter((l) => l.ingredientId && l.qtyDelta !== 0)
                // Waste is always a reduction — send negative deltas.
                .map((l) => ({ ingredientId: l.ingredientId, qtyDelta: isWaste ? -Math.abs(l.qtyDelta) : l.qtyDelta })),
        }));
        submit(isWaste ? stockAdjustments.waste() : stockAdjustments.store(), { preserveScroll: true });
    };

    const ingredientOptions = ingredients.map((ing) => ({ value: ing.id, label: ing.name }));

    return (
        <FormPage title={isWaste ? 'Catat Waste' : 'Penyesuaian Stok'} backHref={stockAdjustments.index().url}>
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <TextInput
                    label="Alasan (wajib)"
                    value={data.reason}
                    onChange={(e) => setData('reason', e.target.value)}
                    error={errors.reason}
                    hint="Semua penyesuaian diaudit."
                    autoFocus
                    required
                />

                <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-ink">
                        Item {!isWaste && <span className="font-normal text-muted">(delta +/−)</span>}
                    </span>
                    {lines.map((l, i) => (
                        <div key={i} className="grid gap-3 rounded-xl border border-line p-3 transition hover:border-primary/40 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                            <Select label="Bahan" value={l.ingredientId} onChange={(v) => setLine(i, { ingredientId: v })} options={ingredientOptions} searchable />
                            <div className="w-full sm:w-36">
                                <NumberInput
                                    label={isWaste ? 'Jumlah' : 'Delta (±)'}
                                    min={isWaste ? 0 : undefined}
                                    value={l.qtyDelta}
                                    onChange={(v) => setLine(i, { qtyDelta: v })}
                                />
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
                    ))}
                    <Button
                        type="button"
                        variant="ghost"
                        className="self-start"
                        onClick={() => setLines((ls) => [...ls, { ingredientId: ingredients[0]?.id ?? '', qtyDelta: 0 }])}
                    >
                        + Tambah item
                    </Button>
                    {errors.items && <p className="text-sm text-primary-dark">{errors.items}</p>}
                </div>

                <p className="rounded-xl bg-soft/60 p-3 text-xs text-primary-dark">
                    Perubahan ledger bersifat permanen. Pastikan data sudah benar.
                </p>

                <div className="flex justify-end border-t border-line pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan…' : isWaste ? 'Catat Waste' : 'Simpan Penyesuaian'}
                    </Button>
                </div>
            </form>
        </FormPage>
    );
}
