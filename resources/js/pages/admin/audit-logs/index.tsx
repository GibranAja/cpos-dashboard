import { Head } from '@inertiajs/react';
import { Pager } from '@/components/pager';
import { Badge, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import auditLogs from '@/routes/audit-logs';
import type { AuditLog, Paginated } from '@/types/pos';

export default function AuditLogs({ logs }: { logs: Paginated<AuditLog> }) {
    return (
        <AppLayout title="Log Audit">
            <Head title="Log Audit" />
            <PageHeader title="Log Audit" description="Siapa mengubah apa, kapan." />

            {logs.data.length === 0 ? (
                <EmptyState>Belum ada log audit.</EmptyState>
            ) : (
                <div className="card divide-y divide-line">
                    {logs.data.map((log) => (
                        <div key={log.id} className="flex items-start justify-between gap-4 p-4">
                            <div className="min-w-0">
                                <p className="font-medium text-ink">
                                    <span className="text-primary-dark">{log.action}</span> · {log.entity}
                                </p>
                                <p className="truncate text-xs text-muted">{log.entityId}</p>
                                {log.actorName && <p className="text-sm text-muted">oleh {log.actorName}</p>}
                            </div>
                            <Badge tone="muted">{new Date(log.createdAt).toLocaleString('id-ID')}</Badge>
                        </div>
                    ))}
                </div>
            )}
            <Pager nextCursor={logs.nextCursor} baseUrl={auditLogs.index().url} />
        </AppLayout>
    );
}
