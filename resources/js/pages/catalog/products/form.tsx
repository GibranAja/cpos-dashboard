import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FileInput, MultiSelect, NumberInput, Select, TextInput, Toggle } from '@/components/form';
import { FormPage } from '@/components/form-page';
import { Button } from '@/components/ui';
import { initials, thumb } from '@/lib/image';
import products from '@/routes/products';
import type { Category, ModifierGroup, Product } from '@/types/pos';

type Props = {
    product: Product | null;
    categories: Category[];
    modifierGroups: ModifierGroup[];
};

export default function ProductForm({ product, categories, modifierGroups }: Props) {
    const isEdit = !!product;
    const { data, setData, submit, processing, errors } = useForm({
        name: product?.name ?? '',
        basePrice: product?.basePrice ?? 0,
        categoryId: product?.categoryId ?? '',
        sku: product?.sku ?? '',
        sellsBy: product?.sellsBy ?? 'recipe',
        isActive: product?.isActive ?? true,
        modifierGroupIds: product?.modifierGroups?.map((g) => g.id) ?? [],
        // Optimistic-lock version — sent back on every update.
        version: product?.version ?? 0,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(isEdit ? products.update(product!.id) : products.store(), { preserveScroll: true });
    };

    return (
        <FormPage title={isEdit ? `Ubah Produk · ${product!.name}` : 'Produk Baru'} backHref={products.index().url}>
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
                    label="Harga Dasar"
                    prefix="Rp"
                    min={0}
                    step={500}
                    value={data.basePrice}
                    onChange={(v) => setData('basePrice', v)}
                    error={errors.basePrice}
                    required
                />

                <Select
                    label="Kategori"
                    placeholder="Tanpa kategori"
                    value={data.categoryId ?? ''}
                    onChange={(v) => setData('categoryId', v)}
                    options={[
                        { value: '', label: 'Tanpa kategori' },
                        ...categories.map((c) => ({ value: c.id, label: c.name })),
                    ]}
                    error={errors.categoryId}
                    searchable
                />

                <TextInput
                    label="SKU (opsional)"
                    value={data.sku ?? ''}
                    onChange={(e) => setData('sku', e.target.value)}
                    error={errors.sku}
                />

                <Select
                    label="Dijual Sebagai"
                    value={data.sellsBy}
                    onChange={(v) => setData('sellsBy', v as 'recipe' | 'finished_good')}
                    options={[
                        { value: 'recipe', label: 'Dari resep (recipe)', description: 'Stok dihitung dari bahan resep.' },
                        { value: 'finished_good', label: 'Barang jadi (finished good)', description: 'Stok dihitung per unit produk.' },
                    ]}
                    error={errors.sellsBy}
                />

                <MultiSelect
                    label="Grup Modifier"
                    values={data.modifierGroupIds}
                    onChange={(v) => setData('modifierGroupIds', v)}
                    options={modifierGroups.map((g) => ({ value: g.id, label: g.name }))}
                    error={errors.modifierGroupIds}
                />

                {isEdit ? (
                    <ImageSection product={product!} />
                ) : (
                    <p className="rounded-xl bg-soft/60 p-3 text-xs text-primary-dark">
                        Simpan produk terlebih dahulu — unggah gambar tersedia di halaman ubah.
                    </p>
                )}

                <Toggle label="Aktif" description="Produk nonaktif tidak tampil di kasir." checked={data.isActive} onChange={(v) => setData('isActive', v)} />

                {errors.version && <p className="text-sm text-primary-dark">{errors.version}</p>}

                <div className="flex justify-end gap-2 border-t border-line pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Produk'}
                    </Button>
                </div>
            </form>
        </FormPage>
    );
}

/**
 * Upload/replace/delete the product image (multipart → API → Cloudinary).
 */
function ImageSection({ product }: { product: Product }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            setError('Ukuran gambar maksimal 5 MB.');

            return;
        }

        setBusy(true);
        setError(null);
        router.post(
            products.uploadImage(product.id).url,
            { image: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onError: () => setError('Gagal mengunggah gambar.'),
                onFinish: () => setBusy(false),
            },
        );
    };

    const remove = () => {
        if (!confirm('Hapus gambar produk ini?')) {
            return;
        }

        setBusy(true);
        router.delete(products.deleteImage(product.id).url, {
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    };

    return (
        <div>
            <span className="mb-1 block text-sm font-medium text-ink">Gambar Produk</span>
            <div className="flex items-center gap-4">
                {product.imageUrl ? (
                    <img
                        src={thumb(product.imageUrl, 160)}
                        alt={product.name}
                        className="h-20 w-20 shrink-0 rounded-xl border border-line object-cover"
                    />
                ) : (
                    <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-soft text-lg font-bold text-primary-dark">
                        {initials(product.name)}
                    </span>
                )}
                <div className="flex flex-col gap-2">
                    <FileInput accept="image/*" onSelect={upload} disabled={busy} buttonText="Unggah gambar…" hint="Maks 5 MB. Gambar lama otomatis diganti." />
                    {product.imageUrl && (
                        <button type="button" onClick={remove} disabled={busy} className="self-start text-sm text-primary-dark transition hover:underline">
                            Hapus gambar
                        </button>
                    )}
                </div>
            </div>
            {busy && <p className="mt-1 text-xs text-muted">Memproses…</p>}
            {error && <p className="mt-1 text-sm text-primary-dark">{error}</p>}
        </div>
    );
}
