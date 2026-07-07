import { useForm } from '@inertiajs/react';
import { NumberInput, TextInput, Toggle } from '@/components/form';
import { FormPage } from '@/components/form-page';
import { Button } from '@/components/ui';
import paymentMethods from '@/routes/payment-methods';
import type { PaymentMethod } from '@/types/pos';

export default function PaymentMethodForm({ method }: { method: PaymentMethod | null }) {
    const isEdit = !!method;
    const { data, setData, submit, processing, errors } = useForm({
        code: method?.code ?? '',
        label: method?.label ?? '',
        isEnabled: method?.isEnabled ?? true,
        sortOrder: method?.sortOrder ?? 0,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(isEdit ? paymentMethods.update(method!.id) : paymentMethods.store(), { preserveScroll: true });
    };

    return (
        <FormPage title={isEdit ? `Ubah Metode · ${method!.label}` : 'Metode Pembayaran Baru'} backHref={paymentMethods.index().url}>
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <TextInput
                    label="Kode"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value)}
                    error={errors.code}
                    disabled={isEdit}
                    hint={isEdit ? 'Kode tidak bisa diubah.' : 'Contoh: cash, qris.'}
                    required
                />
                <TextInput
                    label="Label"
                    value={data.label}
                    onChange={(e) => setData('label', e.target.value)}
                    error={errors.label}
                    autoFocus={isEdit}
                    required
                />
                <NumberInput label="Urutan" min={0} value={data.sortOrder} onChange={(v) => setData('sortOrder', v)} error={errors.sortOrder} />
                <Toggle label="Aktifkan" description="Metode nonaktif tidak muncul di kasir." checked={data.isEnabled} onChange={(v) => setData('isEnabled', v)} />

                <div className="flex justify-end border-t border-line pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Metode'}
                    </Button>
                </div>
            </form>
        </FormPage>
    );
}
