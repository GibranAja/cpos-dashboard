import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { TextInput } from '@/components/form';
import { Badge, Button, Checkbox, EmptyState, Modal, PageHeader, SelectionBar } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { rupiah } from '@/lib/format';
import { initials, thumb } from '@/lib/image';
import { usePermissions } from '@/lib/permissions';
import { useRowSelection } from '@/lib/use-row-selection';
import products from '@/routes/products';
import type { Category, PriceHistoryEntry, Product } from '@/types/pos';
import { ImportModal } from './import-modal';

type Props = {
    products: Product[];
    categories: Category[];
};

export default function Products({ products: items, categories }: Props) {
    const { canManage } = usePermissions();
    const [search, setSearch] = useState('');
    const [historyFor, setHistoryFor] = useState<Product | null>(null);
    const [importing, setImporting] = useState(false);

    const filtered = useMemo(
        () => items.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
        [items, search],
    );

    const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? '—';

    const selectableIds = useMemo(() => filtered.filter((p) => !p.deletedAt).map((p) => p.id), [filtered]);
    const sel = useRowSelection(selectableIds);

    const bulkDelete = () =>
        router.post(
            '/products/bulk-delete',
            { ids: sel.selectedIds },
            { preserveScroll: true, onSuccess: () => sel.clear() },
        );

    return (
        <AppLayout title="Produk">
            <Head title="Produk" />

            <PageHeader
                title="Produk"
                description={`${items.length} produk`}
                action={
                    canManage && (
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setImporting(true)}>
                                Impor CSV
                            </Button>
                            <Link href={products.create().url}>
                                <Button>+ Produk</Button>
                            </Link>
                        </div>
                    )
                }
            />

            <div className="mb-4 max-w-sm">
                <TextInput placeholder="Cari produk…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {filtered.length === 0 ? (
                <EmptyState>Tidak ada produk yang cocok.</EmptyState>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-line text-left text-muted">
                            <tr>
                                {canManage && (
                                    <th className="w-10 p-4">
                                        <Checkbox
                                            checked={sel.allSelected}
                                            indeterminate={sel.someSelected}
                                            onChange={sel.toggleAll}
                                            ariaLabel="Pilih semua produk"
                                        />
                                    </th>
                                )}
                                <th className="p-4 font-medium">Nama</th>
                                <th className="p-4 font-medium">Kategori</th>
                                <th className="p-4 font-medium">Harga</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {filtered.map((p) => (
                                <tr key={p.id} className="transition hover:bg-soft/30">
                                    {canManage && (
                                        <td className="w-10 p-4">
                                            {!p.deletedAt && (
                                                <Checkbox
                                                    checked={sel.isSelected(p.id)}
                                                    onChange={() => sel.toggle(p.id)}
                                                    ariaLabel={`Pilih ${p.name}`}
                                                />
                                            )}
                                        </td>
                                    )}
                                    <td className="p-4 font-medium text-ink">
                                        <span className="flex items-center gap-2">
                                            <ProductThumb product={p} />
                                            {p.name}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted">{categoryName(p.categoryId)}</td>
                                    <td className="p-4 text-ink">{rupiah(p.basePrice)}</td>
                                    <td className="p-4">
                                        {p.deletedAt ? (
                                            <Badge>Terhapus</Badge>
                                        ) : p.isActive ? (
                                            <Badge tone="active">Aktif</Badge>
                                        ) : (
                                            <Badge tone="muted">Nonaktif</Badge>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {canManage && (
                                            <div className="flex justify-end gap-2">
                                                {p.deletedAt ? (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => router.post(products.restore(p.id).url)}
                                                    >
                                                        Pulihkan
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" onClick={() => setHistoryFor(p)}>
                                                            Riwayat
                                                        </Button>
                                                        <Link href={products.edit(p.id).url}>
                                                            <Button variant="ghost">Ubah</Button>
                                                        </Link>
                                                        <Button
                                                            variant="danger"
                                                            onClick={() => {
                                                                if (confirm(`Hapus "${p.name}"? Bisa dipulihkan.`)) {
                                                                    router.delete(products.destroy(p.id).url);
                                                                }
                                                            }}
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {canManage && (
                <SelectionBar count={sel.count} itemLabel="produk" onClear={sel.clear} onDelete={bulkDelete} />
            )}

            {historyFor && <PriceHistoryModal product={historyFor} onClose={() => setHistoryFor(null)} />}
            {importing && <ImportModal onClose={() => setImporting(false)} />}
        </AppLayout>
    );
}

/** Product image thumbnail with an initials placeholder when there is none. */
function ProductThumb({ product }: { product: Product }) {
    if (product.imageUrl) {
        return (
            <img
                src={thumb(product.imageUrl, 96)}
                alt={product.name}
                className="h-8 w-8 shrink-0 rounded-lg border border-line object-cover"
            />
        );
    }

    return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-soft text-xs font-bold text-primary-dark">
            {initials(product.name)}
        </span>
    );
}

function PriceHistoryModal({ product, onClose }: { product: Product; onClose: () => void }) {
    const [entries, setEntries] = useState<PriceHistoryEntry[] | null>(null);
    const [error, setError] = useState(false);

    // Fetch on first render.
    useEffect(() => {
        fetch(products.priceHistory(product.id).url, { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((json) => setEntries(json.data ?? []))
            .catch(() => setError(true));
    }, [product.id]);

    return (
        <Modal open onClose={onClose} title={`Riwayat Harga · ${product.name}`}>
            {error ? (
                <p className="text-sm text-primary-dark">Riwayat tidak dapat dimuat.</p>
            ) : entries === null ? (
                <div className="flex animate-pulse flex-col gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-6 rounded bg-line" />
                    ))}
                </div>
            ) : entries.length === 0 ? (
                <p className="text-sm text-muted">Belum ada perubahan harga.</p>
            ) : (
                <ul className="flex flex-col gap-2 text-sm">
                    {entries.map((e, i) => (
                        <li key={i} className="flex items-center justify-between">
                            <span className="text-muted">{new Date(e.createdAt).toLocaleString('id-ID')}</span>
                            <span className="text-ink">
                                {rupiah(e.oldPrice)} → <span className="font-semibold">{rupiah(e.newPrice)}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </Modal>
    );
}
