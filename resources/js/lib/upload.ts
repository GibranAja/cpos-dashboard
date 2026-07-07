import uploads from '@/routes/uploads';

/**
 * Upload an image to the dashboard-owned public disk and return its absolute
 * URL, ready to send to the API as `imageUrl` / `qrisImageUrl`.
 */
export async function uploadImage(file: File, folder: 'products' | 'qris'): Promise<string> {
    const body = new FormData();
    body.append('image', file);
    body.append('folder', folder);

    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

    const res = await fetch(uploads.image().url, {
        method: 'POST',
        body,
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': token, 'X-Requested-With': 'XMLHttpRequest' },
    });

    if (!res.ok) {
        throw new Error('Gagal mengunggah gambar.');
    }

    return (await res.json()).url as string;
}
