# PRD Bugfix — Admin Dashboard (kasir-dashboard)

> **Status:** Draft final — perbaikan bug, BUKAN fitur baru.
> **Repo:** `E:\laragon\www\kasir-dashboard` (Laravel + Inertia + React/TypeScript)
> **API sumber data:** CIAAAA POS API (`App\Services\Pos\PosApiClient`)
> **Tanggal:** 2026-07-09
> **Baca juga PRD saudara:** `kasircia-api/docs/BUGFIX_PRD.md`, `kasircia/docs/BUGFIX_PRD.md`

Dokumen ini WAJIB dibaca penuh sebelum menulis kode. Semua bentuk response API di sini
adalah kontrak nyata dari API. Jangan berasumsi di luar dokumen ini.

---

## ★ Prinsip Wajib
1. **Jangan ubah tampilan/UX.** Ini perbaikan bug data layer, bukan redesign.
2. **API adalah satu-satunya sumber data.** Dashboard tidak menyimpan domain data sendiri.
3. **Konsisten dengan pola envelope API** (lihat §2).

---

## BUG-DASH-1 — Halaman Detail Order blank putih (`Cannot read properties of undefined (reading 'map')`)

### Gejala
- Buka menu Transaksi → Pesanan → klik salah satu order → halaman **blank putih**.
- Console browser:
  ```
  Uncaught TypeError: Cannot read properties of undefined (reading 'map')
      at y (show-*.js) ...
  ```

### Akar masalah (SUDAH DIVERIFIKASI)
Kontrak response API **tidak seragam** antara list dan detail:

| Endpoint | Bentuk response |
|----------|-----------------|
| `GET /v1/orders` (list) | `{ "data": [...], "nextCursor": ... }` — order **langsung** di `data` |
| `GET /v1/orders/:id` (detail) | `{ "order": { ...id, orderNo, items[], subtotal, total... } }` — **dibungkus** key `order` |

Di controller:

```php
// app/Http/Controllers/Transactions/OrdersController.php  (show)
public function show(string $order): Response
{
    return Inertia::render('transactions/orders/show', [
        'order' => fn () => $this->api->get("/orders/{$order}"),   // ⛔ ini { order: {...} }
    ]);
}
```

`PosApiClient::get()` mengembalikan body JSON apa adanya, jadi prop `order` yang diterima
komponen React sebenarnya bernilai `{ order: {...} }`, **bukan** objek order itu sendiri.

Di komponen `resources/js/pages/transactions/orders/show.tsx:46`:

```tsx
{order.items.map((it, i) => (   // order.items === undefined → .map() meledak → blank
```

`order.items` `undefined` karena data asli ada di `order.order.items`.

### Perbaikan (WAJIB — di dashboard)
Unwrap envelope `order` di controller supaya prop cocok dengan tipe `OrderDetail`:

```php
public function show(string $order): Response
{
    return Inertia::render('transactions/orders/show', [
        'order' => fn () => $this->api->get("/orders/{$order}")['order'] ?? null,
    ]);
}
```

> Catatan: `?? null` menjaga agar tetap tidak meledak bila API mengubah bentuk. Bila `null`,
> render pesan "Pesanan tidak ditemukan" alih-alih blank (lihat hardening di bawah).

### Hardening (WAJIB, cegah blank di masa depan)
Di `show.tsx`, jangan pernah asumsikan array pasti ada. Guard sebelum `.map`:

```tsx
export default function OrderShow({ order }: { order: OrderDetail | null }) {
    if (!order) {
        return (
            <AppLayout title="Pesanan tidak ditemukan">
                <PageHeader title="Pesanan tidak ditemukan" />
                <p className="text-muted">Data pesanan tidak tersedia.</p>
            </AppLayout>
        );
    }
    const items = order.items ?? [];
    // ...
    {items.map((it, i) => ( ... ))}
```

### Acceptance criteria
- [ ] Buka detail order apa pun → item, ringkasan (subtotal/total/tunai/kembalian/metode/kasir) tampil benar.
- [ ] Order yang punya modifier menampilkan daftar modifier.
- [ ] Tidak ada error `map` di console.
- [ ] Order tidak ditemukan → tampil pesan, bukan blank.
- [ ] Tombol Void tetap berfungsi (order `id` tersedia dari prop yang sudah di-unwrap).

---

## Audit tambahan (WAJIB dilakukan, jangan lewat)
Karena akar masalah adalah **ketidakseragaman envelope**, sisir SEMUA controller yang memanggil
`$this->api->get(...)` lalu mengirim hasilnya langsung sebagai prop Inertia. Untuk setiap
endpoint, pastikan controller meng-unwrap key yang benar sesuai kontrak API. Perhatikan khususnya:

- Detail resource lain (produk, kategori, user, supplier, dll.) yang mungkin juga dibungkus
  key tunggal (`{ product }`, `{ user }`, …) sementara list-nya tidak.
- Cocokkan tiap prop dengan tipe TypeScript di `resources/js/types/` — kalau tipe mengharap
  `items[]`/field lain, pastikan controller mengirim objek yang benar-benar memilikinya.

Buat daftar temuan + perbaikannya di PR description.

> **Keputusan lintas-tim:** kalau memungkinkan, seragamkan di sisi API (lihat
> `kasircia-api/docs/BUGFIX_PRD.md` §standarisasi envelope). Sampai itu terjadi, dashboard
> WAJIB unwrap secara eksplisit per endpoint.

---

## BUG-DASH-2 — Modal salah posisi (center di area konten) & ikut ter-scroll  ✅ SELESAI

### Gejala
Modal (mis. "Riwayat Harga · <produk>", modal Void, Import CSV, dll.) tidak muncul di tengah
**viewport**, melainkan di tengah **area konten** (kanan sidebar), dan **ikut ter-scroll** bersama
halaman.

### Akar masalah (diverifikasi)
Komponen `Modal` (`resources/js/components/ui.tsx`) sudah benar memakai `fixed inset-0 ... items-center justify-center`.
Namun `<main>` di `resources/js/layouts/app-layout.tsx` memakai `animate-fade-up`
(`animation: fade-up ... both`) — animasi yang meng-animasikan `transform`. Elemen dengan animasi
`transform` (fill `both`) **membentuk containing block baru untuk elemen `position: fixed`
keturunannya**. Karena Modal dirender sebagai anak `{children}` di dalam `<main>`, `fixed inset-0`
jadi relatif ke `<main>` (area konten yang bisa scroll), bukan viewport.

### Perbaikan (SUDAH DITERAPKAN)
`Modal` dirender via **React portal ke `document.body`** (`createPortal`), sehingga lolos dari
containing block `<main>` dan benar-benar viewport-fixed. Ditambah **kunci scroll body**
(`document.body.style.overflow = 'hidden'`) selama modal terbuka, dan guard SSR
(`typeof document === 'undefined'`). Karena semua modal dashboard memakai komponen `Modal` yang
sama, perbaikan ini berlaku menyeluruh (Riwayat Harga, Void, Import CSV, konfirmasi hapus, dll.).

### Acceptance criteria
- [x] Semua modal muncul center di viewport, di atas overlay penuh (termasuk menutup sidebar).
- [x] Modal tidak ikut ter-scroll; latar terkunci saat modal terbuka.
- [x] Esc & klik overlay tetap menutup; typecheck bersih.

---

## FEAT-DASH-1 — Checkbox pilih-banyak + hapus massal di semua tabel

### Deskripsi (permintaan user)
Setiap tabel daftar diberi **kolom checkbox di paling kiri** (plus checkbox "pilih semua" di header).
Baris yang dicentang bisa **dihapus sekaligus** lewat satu aksi "Hapus terpilih (N)".

### Keputusan (DIKONFIRMASI user 2026-07-09)
1. **Implementasi:** Opsi **(B) endpoint bulk baru di API** — atomik, 1 request, scope outlet + RBAC.
   Lihat `kasircia-api/docs/BUGFIX_PRD.md` §FEAT-API-1.
2. **Cakupan:** **semua tabel yang punya aksi Hapus.**

### Cakupan konkret (resource yang PUNYA endpoint DELETE di API)
Produk, Kategori, Grup Modifier, Bahan (ingredients), Supplier, Pengguna (users), Outlet.

> **Metode Pembayaran DIKECUALIKAN**: API tidak punya `DELETE /payment-methods/:id` (kemungkinan
> pakai toggle `isEnabled`). Kalau bulk-delete di sini diinginkan, perlu endpoint delete baru dulu
> — di luar cakupan awal.
>
> Tabel **read-only** (Pesanan, Kartu Stok, Log Audit, Pembelian, Penyesuaian Stok) tidak dapat checkbox.

### Arah implementasi (frontend, apa pun opsinya)
- Komponen tabel reusable atau hook `useRowSelection(ids)` untuk state pilihan (Set of id),
  checkbox header (pilih semua/indeterminate), dan checkbox per baris di kolom kiri.
- Toolbar aksi muncul saat ada ≥1 terpilih: "Hapus terpilih (N)" → modal konfirmasi (pakai `Modal`
  yang sudah diperbaiki) → jalankan hapus → refresh (Inertia `router.reload`/redirect) → bersihkan pilihan.
- Pertahankan look & feel; checkbox senada tema. Hormati `usePermissions().canManage`
  (sembunyikan checkbox/aksi bila tak berwenang).
- Peta error tetap lewat pola `InteractsWithPosApi` untuk opsi (B).

### Acceptance criteria
- [ ] Kolom checkbox kiri + "pilih semua" (indeterminate benar) di semua tabel dalam cakupan.
- [ ] "Hapus terpilih (N)" menghapus semua baris terpilih, lalu tabel & pilihan ter-refresh.
- [ ] Kegagalan sebagian ditangani jelas (opsi A) / atomik (opsi B).
- [ ] Non-manajer tidak melihat checkbox/aksi hapus.
- [ ] Look & feel tabel tidak berubah selain penambahan kolom checkbox.

---

## Di luar scope dokumen ini
- Bug "katalog terhapus muncul lagi" dan "riwayat hilang" → **bukan** masalah dashboard;
  ada di API (cache multi-worker & timezone bucketing). Lihat `kasircia-api/docs/BUGFIX_PRD.md`.
- Bug shift tidak tersimpan → masalah mobile. Lihat `kasircia/docs/BUGFIX_PRD.md`.
