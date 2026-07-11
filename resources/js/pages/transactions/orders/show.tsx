import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { TextArea } from '@/components/form';
import { Badge, Button, Modal, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { rupiah } from '@/lib/format';
import { usePermissions } from '@/lib/permissions';
import orders from '@/routes/orders';
import type { OrderDetail } from '@/types/pos';

export default function OrderShow({ order }: { order: OrderDetail | null }) {
    const { canManage } = usePermissions();
    const [voiding, setVoiding] = useState(false);

    if (!order) {
        return (
            <AppLayout title="Pesanan tidak ditemukan">
                <Head title="Pesanan tidak ditemukan" />
                <PageHeader
                    title="Pesanan tidak ditemukan"
                    action={
                        <Link href={orders.index().url}>
                            <Button variant="ghost">Kembali</Button>
                        </Link>
                    }
                />
                <p className="text-muted">Data pesanan tidak tersedia.</p>
            </AppLayout>
        );
    }

    const items = order.items ?? [];
    const isVoid = order.status === 'void';

    return (
        <AppLayout title={`Pesanan ${order.orderNo}`}>
            <Head title={`Pesanan ${order.orderNo}`} />
            <PageHeader
                title={`Pesanan ${order.orderNo}`}
                description={new Date(order.createdAt).toLocaleString('id-ID')}
                action={
                    <div className="flex items-center gap-2">
                        <Link href={orders.index().url}>
                            <Button variant="ghost">Kembali</Button>
                        </Link>
                        {canManage && !isVoid && (
                            <Button variant="danger" onClick={() => setVoiding(true)}>
                                Void
                            </Button>
                        )}
                    </div>
                }
            />

            {isVoid && (
                <div className="mb-4">
                    <Badge>Pesanan ini telah dibatalkan (void)</Badge>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="card p-5">
                    <h3 className="mb-3 font-display text-lg font-semibold text-ink">Item</h3>
                    <ul className="divide-y divide-line">
                        {items.map((it, i) => (
                            <li key={i} className="py-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-ink">
                                        {it.qty}× {it.name}
                                    </span>
                                    <span className="text-ink">{rupiah(it.lineTotal)}</span>
                                </div>
                                {it.modifiersSnapshot && it.modifiersSnapshot.length > 0 && (
                                    <p className="mt-1 text-xs text-muted">
                                        {it.modifiersSnapshot.map((m) => m.name).join(', ')}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card h-fit p-5">
                    <h3 className="mb-3 font-display text-lg font-semibold text-ink">Ringkasan</h3>
                    <dl className="flex flex-col gap-2 text-sm">
                        <Row label="Subtotal" value={rupiah(order.subtotal)} />
                        <Row label="Total" value={rupiah(order.total)} strong />
                        {order.cashReceived != null && <Row label="Tunai" value={rupiah(order.cashReceived)} />}
                        {order.change != null && <Row label="Kembalian" value={rupiah(order.change)} />}
                        <Row label="Metode" value={order.paymentMethod} />
                        {order.cashierName && <Row label="Kasir" value={order.cashierName} />}
                    </dl>
                </div>
            </div>

            {voiding && <VoidModal orderId={order.id} onClose={() => setVoiding(false)} />}
        </AppLayout>
    );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className="flex justify-between">
            <dt className="text-muted">{label}</dt>
            <dd className={strong ? 'font-display font-semibold text-ink' : 'text-ink'}>{value}</dd>
        </div>
    );
}

function VoidModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
    const { data, setData, submit, processing, errors } = useForm({ reason: '' });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(orders.void(orderId), { onSuccess: onClose, preserveScroll: true });
    };

    return (
        <Modal open onClose={onClose} title="Batalkan Pesanan (Void)">
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <p className="text-sm text-muted">Tindakan ini diaudit dan tidak bisa dibatalkan.</p>
                <TextArea
                    label="Alasan (wajib)"
                    value={data.reason}
                    onChange={(e) => setData('reason', e.target.value)}
                    error={errors.reason}
                    rows={3}
                    autoFocus
                    required
                />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" variant="danger" disabled={processing}>
                        {processing ? 'Memproses…' : 'Void Pesanan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
