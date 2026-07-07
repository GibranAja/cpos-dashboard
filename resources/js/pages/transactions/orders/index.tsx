import { Head, Link, router } from '@inertiajs/react';
import { DateInput } from '@/components/form';
import { Pager } from '@/components/pager';
import { Badge, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { rupiah } from '@/lib/format';
import orders from '@/routes/orders';
import type { OrderListItem, Paginated } from '@/types/pos';

type Props = { orders: Paginated<OrderListItem>; date: string | null };

export default function Orders({ orders: page, date }: Props) {
    return (
        <AppLayout title="Pesanan">
            <Head title="Pesanan" />
            <PageHeader
                title="Pesanan"
                description="Pantau & batalkan pesanan (pembuatan pesanan lewat aplikasi mobile)."
                action={
                    <div className="w-56">
                        <DateInput
                            value={date ?? ''}
                            clearable
                            placeholder="Semua tanggal"
                            onChange={(v) =>
                                router.get(orders.index().url, v ? { date: v } : {}, {
                                    preserveState: true,
                                })
                            }
                        />
                    </div>
                }
            />

            {page.data.length === 0 ? (
                <EmptyState>Tidak ada pesanan.</EmptyState>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-line text-left text-muted">
                            <tr>
                                <th className="p-4 font-medium">No.</th>
                                <th className="p-4 font-medium">Waktu</th>
                                <th className="p-4 font-medium">Metode</th>
                                <th className="p-4 font-medium">Total</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {page.data.map((o) => (
                                <tr key={o.id}>
                                    <td className="p-4 font-medium text-ink">{o.orderNo}</td>
                                    <td className="p-4 text-muted">{new Date(o.createdAt).toLocaleTimeString('id-ID')}</td>
                                    <td className="p-4 text-ink capitalize">{o.paymentMethod}</td>
                                    <td className="p-4 text-ink">{rupiah(o.total)}</td>
                                    <td className="p-4">
                                        {o.status === 'void' ? (
                                            <Badge>Void</Badge>
                                        ) : (
                                            <Badge tone="active">{o.status}</Badge>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link href={orders.show(o.id).url} className="text-sm font-medium text-primary-dark hover:underline">
                                            Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pager nextCursor={page.nextCursor} baseUrl={orders.index().url} />
        </AppLayout>
    );
}
