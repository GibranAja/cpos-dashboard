import { useForm } from '@inertiajs/react';
import { TextInput } from '@/components/form';
import { FormPage } from '@/components/form-page';
import { Button } from '@/components/ui';
import uomRoutes from '@/routes/uom';

export default function UomForm() {
    const { data, setData, submit, processing, errors } = useForm({ code: '', name: '' });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(uomRoutes.store(), { preserveScroll: true });
    };

    return (
        <FormPage title="Satuan Baru" backHref={uomRoutes.index().url}>
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <TextInput
                    label="Kode"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value)}
                    error={errors.code}
                    hint="Contoh: ml, g, pcs."
                    autoFocus
                    required
                />
                <TextInput
                    label="Nama"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    hint="Contoh: Mililiter, Gram, Pieces."
                    required
                />
                <div className="flex justify-end border-t border-line pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan…' : 'Buat Satuan'}
                    </Button>
                </div>
            </form>
        </FormPage>
    );
}
