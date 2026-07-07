import { useForm } from '@inertiajs/react';
import { TextInput, Toggle } from '@/components/form';
import { FormPage } from '@/components/form-page';
import { Button } from '@/components/ui';
import outlets from '@/routes/outlets';
import type { Outlet } from '@/types/pos';

export default function OutletForm({ outlet }: { outlet: Outlet | null }) {
    const isEdit = !!outlet;
    const { data, setData, submit, processing, errors } = useForm({
        name: outlet?.name ?? '',
        address: outlet?.address ?? '',
        timezone: outlet?.timezone ?? 'Asia/Jakarta',
        isActive: outlet?.isActive ?? true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(isEdit ? outlets.update(outlet!.id) : outlets.store(), { preserveScroll: true });
    };

    return (
        <FormPage title={isEdit ? `Ubah Outlet · ${outlet!.name}` : 'Outlet Baru'} backHref={outlets.index().url}>
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
                    label="Alamat"
                    value={data.address ?? ''}
                    onChange={(e) => setData('address', e.target.value)}
                    error={errors.address}
                />
                <TextInput
                    label="Zona Waktu"
                    value={data.timezone ?? ''}
                    onChange={(e) => setData('timezone', e.target.value)}
                    error={errors.timezone}
                    hint="Contoh: Asia/Jakarta."
                />
                <Toggle label="Aktif" checked={data.isActive} onChange={(v) => setData('isActive', v)} />

                <div className="flex justify-end border-t border-line pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Outlet'}
                    </Button>
                </div>
            </form>
        </FormPage>
    );
}
