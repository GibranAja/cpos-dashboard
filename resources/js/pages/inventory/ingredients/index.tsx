import { Head, Link, router } from '@inertiajs/react';
import { Badge, Button, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { rupiah } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import ingredients from '@/routes/ingredients';
import type { Ingredient, Uom } from '@/types/pos';

type Props = { ingredients: Ingredient[]; uom: Uom[] };

export default function Ingredients({ ingredients: items, uom }: Props) {
    const { canManage } = usePermissions();

    const uomCode = (id: string) => uom.find((u) => u.id === id)?.code ?? '';

    return (
        <AppLayout title="Bahan">
            <Head title="Bahan" />
            <PageHeader
                title="Bahan (Ingredients)"
                description="Stok selalu ditampilkan dengan satuannya."
                action={
                    canManage && (
                        <Link href={ingredients.create().url}>
                            <Button>+ Bahan</Button>
                        </Link>
                    )
                }
            />

            {items.length === 0 ? (
                <EmptyState>Belum ada bahan.</EmptyState>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-line text-left text-muted">
                            <tr>
                                <th className="p-4 font-medium">Nama</th>
                                <th className="p-4 font-medium">Stok</th>
                                <th className="p-4 font-medium">Reorder</th>
                                <th className="p-4 font-medium">Biaya/Unit</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {items.map((i) => {
                                const low = Number(i.currentStock) <= Number(i.reorderLevel);

                                return (
                                    <tr key={i.id} className="transition hover:bg-soft/30">
                                        <td className="p-4 font-medium text-ink">{i.name}</td>
                                        <td className="p-4">
                                            <span className={low ? 'text-primary-dark' : 'text-ink'}>
                                                {i.currentStock} {uomCode(i.uomId)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted">
                                            {i.reorderLevel} {uomCode(i.uomId)}
                                        </td>
                                        <td className="p-4 text-ink">{rupiah(i.costPerUnit)}</td>
                                        <td className="p-4">
                                            {i.deletedAt ? (
                                                <Badge>Terhapus</Badge>
                                            ) : low ? (
                                                <Badge>Stok menipis</Badge>
                                            ) : (
                                                <Badge tone="active">Aman</Badge>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {canManage && (
                                                <div className="flex justify-end gap-2">
                                                    {i.deletedAt ? (
                                                        <Button variant="ghost" onClick={() => router.post(ingredients.restore(i.id).url)}>
                                                            Pulihkan
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Link href={ingredients.edit(i.id).url}>
                                                                <Button variant="ghost">Ubah</Button>
                                                            </Link>
                                                            <Button
                                                                variant="danger"
                                                                onClick={() => {
                                                                    if (confirm(`Hapus bahan "${i.name}"?`)) {
                                                                        router.delete(ingredients.destroy(i.id).url);
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
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </AppLayout>
    );
}
