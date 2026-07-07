import { Head, Link } from '@inertiajs/react';
import { Badge, Button, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { usePermissions } from '@/lib/permissions';
import paymentMethods from '@/routes/payment-methods';
import type { PaymentMethod } from '@/types/pos';

export default function PaymentMethods({ methods }: { methods: PaymentMethod[] }) {
    const { canManage } = usePermissions();

    return (
        <AppLayout title="Metode Pembayaran">
            <Head title="Metode Pembayaran" />

            <PageHeader
                title="Metode Pembayaran"
                action={
                    canManage && (
                        <Link href={paymentMethods.create().url}>
                            <Button>+ Metode</Button>
                        </Link>
                    )
                }
            />

            {methods.length === 0 ? (
                <EmptyState>Belum ada metode pembayaran.</EmptyState>
            ) : (
                <div className="card divide-y divide-line">
                    {methods.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-4 transition hover:bg-soft/30">
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-ink">{m.label}</span>
                                <code className="text-xs text-muted">{m.code}</code>
                                {m.isEnabled ? <Badge tone="active">Aktif</Badge> : <Badge tone="muted">Nonaktif</Badge>}
                            </div>
                            {canManage && (
                                <Link href={paymentMethods.edit(m.id).url}>
                                    <Button variant="ghost">Ubah</Button>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
