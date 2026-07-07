import { router } from '@inertiajs/react';
import { useState } from 'react';
import { FileInput } from '@/components/form';
import { Badge, Button, Modal } from '@/components/ui';
import { parseCsv } from '@/lib/csv';
import { rupiah } from '@/lib/format';
import products from '@/routes/products';
import type { ImportReport } from '@/types/pos';

type ImportRow = {
    name: string;
    basePrice: number;
    categoryName?: string;
    sku?: string;
    imageUrl?: string;
};

/**
 * Product bulk-import wizard. Always previews via the API's dry-run first; only
 * commits after the user reviews the validation report (§8 — never commit a CSV
 * import without showing the dry-run first).
 */
export function ImportModal({ onClose }: { onClose: () => void }) {
    const [rows, setRows] = useState<ImportRow[]>([]);
    const [report, setReport] = useState<ImportReport | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');

    const onFile = async (file: File) => {
        setError(null);
        setReport(null);
        setFileName(file.name);
        const parsed = parseCsv(await file.text());
        setRows(
            parsed.map((r) => ({
                name: r.name ?? '',
                basePrice: Number(r.basePrice ?? r.baseprice ?? 0),
                categoryName: r.categoryName || r.categoryname || undefined,
                sku: r.sku || undefined,
                imageUrl: r.imageUrl || r.imageurl || undefined,
            })),
        );
    };

    const post = async (commit: boolean) => {
        setBusy(true);
        setError(null);

        try {
            if (commit) {
                // Commit follows the redirect + flash and refreshes the list.
                router.post(products.import({ query: { commit: 1 } }).url, { rows }, { onFinish: () => setBusy(false), onSuccess: onClose });

                return;
            }

            const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const res = await fetch(products.import().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ rows }),
            });

            if (!res.ok) {
                throw new Error('Validasi impor gagal.');
            }

            setReport(await res.json());
        } catch {
            setError('Gagal memproses impor. Coba lagi.');
        } finally {
            if (!commit) {
setBusy(false);
}
        }
    };

    const canCommit = report && report.summary.errors === 0 && report.summary.toCreate > 0;

    return (
        <Modal open onClose={onClose} title="Impor Produk (CSV)">
            <div className="flex flex-col gap-4">
                <div className="rounded-xl bg-soft/60 p-3 text-xs text-primary-dark">
                    Kolom yang didukung: <code>name, basePrice, categoryName, sku, imageUrl</code>. Baris pertama = header.
                    Impor akan divalidasi (dry-run) sebelum disimpan.
                </div>

                <FileInput accept=".csv,text/csv" onSelect={onFile} buttonText="Pilih file CSV…" />

                {rows.length > 0 && (
                    <p className="text-sm text-ink">
                        {fileName} — <strong>{rows.length}</strong> baris terbaca.
                    </p>
                )}

                {error && <p className="text-sm text-primary-dark">{error}</p>}

                {report && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                            <Badge tone="muted">Total: {report.summary.total}</Badge>
                            <Badge tone="active">Akan dibuat: {report.summary.toCreate}</Badge>
                            {report.summary.errors > 0 && <Badge>Error: {report.summary.errors}</Badge>}
                        </div>

                        {report.errors.length > 0 && (
                            <div className="max-h-40 overflow-y-auto rounded-xl border border-line p-3 text-sm">
                                {report.errors.map((e) => (
                                    <p key={e.row} className="text-primary-dark">
                                        Baris {e.row}: {Object.values(e.details ?? {}).flat().join(', ') || e.message}
                                    </p>
                                ))}
                            </div>
                        )}

                        {report.preview.length > 0 && (
                            <div className="max-h-40 overflow-y-auto rounded-xl border border-line">
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-line">
                                        {report.preview.map((p, i) => (
                                            <tr key={i}>
                                                <td className="p-2 text-ink">{p.name}</td>
                                                <td className="p-2 text-right text-muted">{rupiah(p.basePrice)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-2 border-t border-line pt-3">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Tutup
                    </Button>
                    {!report ? (
                        <Button onClick={() => post(false)} disabled={busy || rows.length === 0}>
                            {busy ? 'Memvalidasi…' : 'Validasi (Dry-run)'}
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => post(false)} disabled={busy}>
                                Validasi Ulang
                            </Button>
                            <Button onClick={() => post(true)} disabled={busy || !canCommit}>
                                {busy ? 'Menyimpan…' : `Simpan ${report.summary.toCreate} Produk`}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}
