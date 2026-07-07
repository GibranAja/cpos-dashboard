import { useForm } from '@inertiajs/react';
import { TextArea, TextInput } from '@/components/form';
import { FormPage } from '@/components/form-page';
import { Button } from '@/components/ui';
import suppliers from '@/routes/suppliers';
import type { Supplier } from '@/types/pos';

export default function SupplierForm({ supplier }: { supplier: Supplier | null }) {
    const isEdit = !!supplier;
    const { data, setData, submit, processing, errors } = useForm({
        name: supplier?.name ?? '',
        contact: supplier?.contact ?? '',
        note: supplier?.note ?? '',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(isEdit ? suppliers.update(supplier!.id) : suppliers.store(), { preserveScroll: true });
    };

    return (
        <FormPage title={isEdit ? `Ubah Supplier · ${supplier!.name}` : 'Supplier Baru'} backHref={suppliers.index().url}>
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <TextInput
                    label="Nama"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    autoFocus
                    required
                />
                <TextInput
                    label="Kontak"
                    value={data.contact ?? ''}
                    onChange={(e) => setData('contact', e.target.value)}
                    error={errors.contact}
                    hint="Nomor telepon / email."
                />
                <TextArea
                    label="Catatan"
                    value={data.note ?? ''}
                    onChange={(e) => setData('note', e.target.value)}
                    error={errors.note}
                />
                <div className="flex justify-end border-t border-line pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Supplier'}
                    </Button>
                </div>
            </form>
        </FormPage>
    );
}
