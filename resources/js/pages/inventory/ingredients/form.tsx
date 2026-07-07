import { useForm } from '@inertiajs/react';
import { NumberInput, Select, TextInput, Toggle } from '@/components/form';
import { FormPage } from '@/components/form-page';
import { Button } from '@/components/ui';
import ingredients from '@/routes/ingredients';
import type { Ingredient, Supplier, Uom } from '@/types/pos';

type Props = { ingredient: Ingredient | null; uom: Uom[]; suppliers: Supplier[] };

export default function IngredientForm({ ingredient, uom, suppliers }: Props) {
    const isEdit = !!ingredient;
    const { data, setData, submit, processing, errors } = useForm({
        name: ingredient?.name ?? '',
        uomId: ingredient?.uomId ?? (uom[0]?.id ?? ''),
        currentStock: Number(ingredient?.currentStock ?? 0),
        reorderLevel: Number(ingredient?.reorderLevel ?? 0),
        costPerUnit: ingredient?.costPerUnit ?? 0,
        supplierId: ingredient?.supplierId ?? '',
        isActive: ingredient?.isActive ?? true,
        version: ingredient?.version ?? 0,
    });

    const uomCode = uom.find((u) => u.id === data.uomId)?.code ?? '';

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(isEdit ? ingredients.update(ingredient!.id) : ingredients.store(), { preserveScroll: true });
    };

    return (
        <FormPage title={isEdit ? `Ubah Bahan · ${ingredient!.name}` : 'Bahan Baru'} backHref={ingredients.index().url}>
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
                    label="Satuan (UoM)"
                    value={data.uomId}
                    onChange={(v) => setData('uomId', v)}
                    options={uom.map((u) => ({ value: u.id, label: `${u.name} (${u.code})` }))}
                    error={errors.uomId}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <NumberInput
                        label={`Stok Saat Ini${uomCode ? ` (${uomCode})` : ''}`}
                        min={0}
                        value={data.currentStock}
                        onChange={(v) => setData('currentStock', v)}
                        error={errors.currentStock}
                    />
                    <NumberInput
                        label={`Level Reorder${uomCode ? ` (${uomCode})` : ''}`}
                        min={0}
                        value={data.reorderLevel}
                        onChange={(v) => setData('reorderLevel', v)}
                        error={errors.reorderLevel}
                        hint="Peringatan stok menipis di bawah angka ini."
                    />
                </div>

                <NumberInput
                    label="Biaya per Unit"
                    prefix="Rp"
                    min={0}
                    step={100}
                    value={data.costPerUnit}
                    onChange={(v) => setData('costPerUnit', v)}
                    error={errors.costPerUnit}
                />

                <Select
                    label="Supplier"
                    placeholder="Tanpa supplier"
                    value={data.supplierId ?? ''}
                    onChange={(v) => setData('supplierId', v)}
                    options={[
                        { value: '', label: 'Tanpa supplier' },
                        ...suppliers.map((s) => ({ value: s.id, label: s.name })),
                    ]}
                    error={errors.supplierId}
                    searchable
                />

                <Toggle label="Aktif" checked={data.isActive} onChange={(v) => setData('isActive', v)} />

                {errors.version && <p className="text-sm text-primary-dark">{errors.version}</p>}

                <div className="flex justify-end border-t border-line pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Bahan'}
                    </Button>
                </div>
            </form>
        </FormPage>
    );
}
