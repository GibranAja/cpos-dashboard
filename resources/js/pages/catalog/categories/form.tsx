import { useForm } from '@inertiajs/react';
import { NumberInput, TextInput, Toggle } from '@/components/form';
import { FormPage } from '@/components/form-page';
import { Button } from '@/components/ui';
import categories from '@/routes/categories';
import type { Category } from '@/types/pos';

export default function CategoryForm({ category }: { category: Category | null }) {
    const isEdit = !!category;
    const { data, setData, submit, processing, errors } = useForm({
        name: category?.name ?? '',
        sortOrder: category?.sortOrder ?? 0,
        isActive: category?.isActive ?? true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(isEdit ? categories.update(category!.id) : categories.store(), { preserveScroll: true });
    };

    return (
        <FormPage title={isEdit ? `Ubah Kategori · ${category!.name}` : 'Kategori Baru'} backHref={categories.index().url}>
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <TextInput
                    label="Nama"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    autoFocus
                    required
                />
                <NumberInput
                    label="Urutan"
                    min={0}
                    value={data.sortOrder}
                    onChange={(v) => setData('sortOrder', v)}
                    error={errors.sortOrder}
                />
                <Toggle label="Aktif" checked={data.isActive} onChange={(v) => setData('isActive', v)} />

                <div className="flex justify-end border-t border-line pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Kategori'}
                    </Button>
                </div>
            </form>
        </FormPage>
    );
}
