import { Head } from '@inertiajs/react';
import { EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { rupiah } from '@/lib/format';
import type { Shift } from '@/types/pos';

export default function Shifts({ shift }: { shift: Shift }) {
    return (
        <AppLayout title="Shift">
            <Head title="Shift" />
            <PageHeader
                title="Shift Berjalan"
                description="Hanya baca — buka/tutup shift dilakukan lewat aplikasi kasir."
            />

            {!shift ? (
                <EmptyState>Tidak ada shift yang sedang berjalan.</EmptyState>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Kpi label="Dibuka" value={new Date(shift.openedAt).toLocaleString('id-ID')} />
                    <Kpi label="Kas Awal" value={rupiah(shift.openingCash)} />
                    {shift.expectedCash != null && <Kpi label="Kas Diharapkan" value={rupiah(shift.expectedCash)} />}
                    {shift.variance != null && (
                        <Kpi label="Selisih Kas" value={rupiah(shift.variance)} tone={shift.variance < 0 ? 'bad' : 'good'} />
                    )}
                    {shift.cashierName && <Kpi label="Kasir" value={shift.cashierName} />}
                </div>
            )}
        </AppLayout>
    );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
    return (
        <div className="card p-5">
            <p className="text-sm text-muted">{label}</p>
            <p
                className={
                    'mt-1 font-display text-xl font-semibold ' +
                    (tone === 'bad' ? 'text-primary-dark' : tone === 'good' ? 'text-mint' : 'text-ink')
                }
            >
                {value}
            </p>
        </div>
    );
}
