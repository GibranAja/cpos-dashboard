import { Head, Link, router } from '@inertiajs/react';
import { Badge, Button, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { AdminUser } from '@/types/pos';

export default function Users({ users: items }: { users: AdminUser[] }) {
    return (
        <AppLayout title="Pengguna">
            <Head title="Pengguna" />
            <PageHeader
                title="Pengguna"
                description="Kelola akun outlet ini."
                action={
                    <Link href={users.create().url}>
                        <Button>+ Pengguna</Button>
                    </Link>
                }
            />

            {items.length === 0 ? (
                <EmptyState>Belum ada pengguna.</EmptyState>
            ) : (
                <div className="card divide-y divide-line">
                    {items.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <div>
                                <p className="flex items-center gap-2 font-medium text-ink">
                                    {u.name} {u.deletedAt && <Badge>Nonaktif</Badge>}
                                </p>
                                <p className="text-sm text-muted">{u.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge tone={u.role === 'admin' ? 'active' : 'neutral'}>{u.role}</Badge>
                                {u.deletedAt ? (
                                    <Button variant="ghost" onClick={() => router.post(users.restore(u.id).url)}>
                                        Pulihkan
                                    </Button>
                                ) : (
                                    <>
                                        <Link href={users.edit(u.id).url}>
                                            <Button variant="ghost">Ubah</Button>
                                        </Link>
                                        <Button
                                            variant="danger"
                                            onClick={() => {
                                                if (confirm(`Nonaktifkan "${u.name}"?`)) {
                                                    router.delete(users.destroy(u.id).url);
                                                }
                                            }}
                                        >
                                            Nonaktifkan
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
