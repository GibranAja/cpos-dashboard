import { Head, Link, router } from '@inertiajs/react';
import { Badge, Button, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { usePermissions } from '@/lib/permissions';
import categories from '@/routes/categories';
import type { Category } from '@/types/pos';

export default function Categories({ categories: items }: { categories: Category[] }) {
    const { canManage } = usePermissions();

    return (
        <AppLayout title="Kategori">
            <Head title="Kategori" />

            <PageHeader
                title="Kategori"
                description="Kelola kategori produk."
                action={
                    canManage && (
                        <Link href={categories.create().url}>
                            <Button>+ Kategori</Button>
                        </Link>
                    )
                }
            />

            {items.length === 0 ? (
                <EmptyState>Belum ada kategori.</EmptyState>
            ) : (
                <div className="card divide-y divide-line">
                    {items.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-ink">{c.name}</span>
                                {c.isActive ? <Badge tone="active">Aktif</Badge> : <Badge tone="muted">Nonaktif</Badge>}
                                {c.deletedAt && <Badge>Terhapus</Badge>}
                            </div>
                            {canManage && (
                                <div className="flex items-center gap-2">
                                    {c.deletedAt ? (
                                        <Button variant="ghost" onClick={() => router.post(categories.restore(c.id).url)}>
                                            Pulihkan
                                        </Button>
                                    ) : (
                                        <>
                                            <Link href={categories.edit(c.id).url}>
                                                <Button variant="ghost">Ubah</Button>
                                            </Link>
                                            <Button
                                                variant="danger"
                                                onClick={() => {
                                                    if (confirm(`Hapus kategori "${c.name}"? Bisa dipulihkan nanti.`)) {
                                                        router.delete(categories.destroy(c.id).url);
                                                    }
                                                }}
                                            >
                                                Hapus
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
