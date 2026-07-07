import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FileInput, TextArea, TextInput } from '@/components/form';
import { Button, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { usePermissions } from '@/lib/permissions';
import { uploadImage } from '@/lib/upload';
import storeProfile from '@/routes/store-profile';
import type { StoreProfileData } from '@/types/pos';

export default function StoreProfile({ profile }: { profile: StoreProfileData | null }) {
    const { canManage } = usePermissions();
    const [uploading, setUploading] = useState(false);
    const { data, setData, submit, processing, errors } = useForm({
        displayName: profile?.displayName ?? '',
        tagline: profile?.tagline ?? '',
        address: profile?.address ?? '',
        qrisNmid: profile?.qrisNmid ?? '',
        qrisImageUrl: profile?.qrisImageUrl ?? '',
        receiptFooter: profile?.receiptFooter ?? '',
        currency: profile?.currency ?? 'IDR',
    });

    const onUpload = async (file: File) => {
        setUploading(true);

        try {
            setData('qrisImageUrl', await uploadImage(file, 'qris'));
        } catch {
            alert('Gagal mengunggah gambar QRIS.');
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(storeProfile.update(), { preserveScroll: true });
    };

    if (!profile) {
        return (
            <AppLayout title="Profil Toko">
                <Head title="Profil Toko" />
                <div className="card border-primary/30 bg-primary/5 p-5 text-sm text-primary-dark">
                    Profil toko tidak dapat dimuat.
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Profil Toko">
            <Head title="Profil Toko" />
            <PageHeader title="Profil Toko" description="Menggerakkan splash/struk/QRIS pada aplikasi mobile." />

            <form onSubmit={onSubmit} className="card grid max-w-2xl gap-5 p-6">
                <TextInput
                    label="Nama Tampilan"
                    value={data.displayName}
                    onChange={(e) => setData('displayName', e.target.value)}
                    error={errors.displayName}
                    disabled={!canManage}
                    required
                />
                <TextInput
                    label="Tagline"
                    value={data.tagline ?? ''}
                    onChange={(e) => setData('tagline', e.target.value)}
                    error={errors.tagline}
                    disabled={!canManage}
                />
                <TextInput
                    label="Alamat"
                    value={data.address ?? ''}
                    onChange={(e) => setData('address', e.target.value)}
                    error={errors.address}
                    disabled={!canManage}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                        label="QRIS NMID"
                        value={data.qrisNmid ?? ''}
                        onChange={(e) => setData('qrisNmid', e.target.value)}
                        error={errors.qrisNmid}
                        disabled={!canManage}
                    />
                    <TextInput
                        label="Mata Uang"
                        value={data.currency}
                        onChange={(e) => setData('currency', e.target.value)}
                        error={errors.currency}
                        disabled={!canManage}
                        required
                    />
                </div>

                <div>
                    <span className="mb-1 block text-sm font-medium text-ink">Gambar QRIS</span>
                    <div className="flex items-center gap-4">
                        {data.qrisImageUrl && (
                            <img src={data.qrisImageUrl} alt="QRIS" className="h-24 w-24 rounded-xl border border-line object-cover" />
                        )}
                        {canManage && (
                            <FileInput accept="image/*" onSelect={onUpload} disabled={uploading} buttonText="Unggah QRIS…" />
                        )}
                    </div>
                    {uploading && <p className="mt-1 text-xs text-muted">Mengunggah…</p>}
                    {errors.qrisImageUrl && <p className="mt-1 text-sm text-primary-dark">{errors.qrisImageUrl}</p>}
                </div>

                <TextArea
                    label="Footer Struk"
                    value={data.receiptFooter ?? ''}
                    onChange={(e) => setData('receiptFooter', e.target.value)}
                    error={errors.receiptFooter}
                    rows={2}
                    disabled={!canManage}
                />

                {canManage && (
                    <div className="flex justify-end border-t border-line pt-4">
                        <Button type="submit" disabled={processing || uploading}>
                            {processing ? 'Menyimpan…' : 'Simpan Profil'}
                        </Button>
                    </div>
                )}
            </form>
        </AppLayout>
    );
}
