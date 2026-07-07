import { Link, router, usePage } from '@inertiajs/react';
import {  useEffect, useState } from 'react';
import type {PropsWithChildren} from 'react';
import { cn } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import auditLogs from '@/routes/audit-logs';
import categories from '@/routes/categories';
import ingredients from '@/routes/ingredients';
import inventory from '@/routes/inventory';
import modifierGroups from '@/routes/modifier-groups';
import orders from '@/routes/orders';
import outlets from '@/routes/outlets';
import paymentMethods from '@/routes/payment-methods';
import productRoutes from '@/routes/products';
import purchases from '@/routes/purchases';
import recipes from '@/routes/recipes';
import reports from '@/routes/reports';
import shifts from '@/routes/shifts';
import stockAdjustments from '@/routes/stock-adjustments';
import stockMovements from '@/routes/stock-movements';
import storeProfile from '@/routes/store-profile';
import suppliers from '@/routes/suppliers';
import uom from '@/routes/uom';
import users from '@/routes/users';
import type { Role } from '@/types/auth';

type NavItem = {
    label: string;
    // A resolved href once the screen exists; undefined = not built yet.
    href?: string;
    roles?: Role[];
};

type NavGroup = {
    title: string;
    items: NavItem[];
};

const NAV: NavGroup[] = [
    { title: 'Umum', items: [{ label: 'Dashboard', href: dashboard().url }] },
    {
        title: 'Katalog',
        items: [
            { label: 'Produk', href: productRoutes.index().url },
            { label: 'Kategori', href: categories.index().url },
            { label: 'Grup Modifier', href: modifierGroups.index().url },
            { label: 'Metode Pembayaran', href: paymentMethods.index().url },
        ],
    },
    {
        title: 'Inventaris',
        items: [
            { label: 'Bahan', href: ingredients.index().url },
            { label: 'Satuan', href: uom.index().url },
            { label: 'Supplier', href: suppliers.index().url },
            { label: 'Resep', href: recipes.index().url },
            { label: 'Pembelian', href: purchases.index().url },
            { label: 'Penyesuaian Stok', href: stockAdjustments.index().url },
            { label: 'Kartu Stok', href: stockMovements.index().url },
            { label: 'Ringkasan & Low-stock', href: inventory.summary().url },
        ],
    },
    {
        title: 'Transaksi',
        items: [
            { label: 'Pesanan', href: orders.index().url },
            { label: 'Shift', href: shifts.index().url },
        ],
    },
    {
        title: 'Laporan',
        items: [{ label: 'Laporan', href: reports.index().url }],
    },
    {
        title: 'Administrasi',
        items: [
            { label: 'Profil Toko', href: storeProfile.edit().url },
            { label: 'Pengguna', href: users.index().url, roles: ['admin'] },
            { label: 'Outlet', href: outlets.index().url, roles: ['admin'] },
            { label: 'Log Audit', href: auditLogs.index().url, roles: ['admin'] },
        ],
    },
];

export default function AppLayout({ children, title }: PropsWithChildren<{ title?: string }>) {
    const { auth, flash } = usePage().props;
    const { url } = usePage();
    const user = auth.user;
    const role = user?.role;

    return (
        <div className="flex min-h-screen">
            <Sidebar role={role} />

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-canvas/80 px-6 py-4 backdrop-blur">
                    <Breadcrumbs title={title} role={role} />
                    <UserMenu name={user?.name ?? ''} role={role} />
                </header>

                <FlashToast
                    key={flash?.success ?? flash?.error ?? 'none'}
                    success={flash?.success}
                    error={flash?.error}
                />

                {/* Keyed by URL so every navigation replays the entry animation. */}
                <main key={url} className="animate-fade-up min-w-0 flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

type Crumb = { label: string; href?: string };

/**
 * Header breadcrumb trail derived from the current URL against the nav map:
 * e.g. /products/create → "Katalog · Produk · Buat".
 */
function Breadcrumbs({ title, role }: { title?: string; role?: Role }) {
    const { url } = usePage();
    const path = url.split('?')[0];

    // Longest-prefix match against a navigable resource.
    let match: { group: string; item: NavItem } | undefined;

    for (const group of NAV) {
        for (const item of group.items) {
            if (item.href && (path === item.href || path.startsWith(`${item.href}/`))) {
                if (!match || (item.href.length > (match.item.href?.length ?? 0))) {
                    match = { group: group.title, item };
                }
            }
        }
    }

    const crumbs: Crumb[] = [];

    if (match && (!match.item.roles || (role && match.item.roles.includes(role)))) {
        crumbs.push({ label: match.group });

        const onIndex = path === match.item.href;
        crumbs.push({ label: match.item.label, href: onIndex ? undefined : match.item.href });

        if (!onIndex) {
            if (path.endsWith('/create')) {
                crumbs.push({ label: 'Buat' });
            } else if (path.endsWith('/edit')) {
                crumbs.push({ label: 'Ubah' });
            } else {
                crumbs.push({ label: 'Detail' });
            }
        }
    } else {
        crumbs.push({ label: title ?? '' });
    }

    return (
        <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center gap-1.5 text-sm">
                {crumbs.map((c, i) => {
                    const isLast = i === crumbs.length - 1;

                    return (
                        <li key={i} className="flex items-center gap-1.5">
                            {i > 0 && <span className="text-muted/60">/</span>}
                            {c.href && !isLast ? (
                                <Link href={c.href} className="text-muted transition hover:text-primary-dark">
                                    {c.label}
                                </Link>
                            ) : (
                                <span
                                    className={
                                        isLast
                                            ? 'truncate font-display text-lg font-semibold text-ink'
                                            : 'text-muted'
                                    }
                                >
                                    {c.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

function Sidebar({ role }: { role?: Role }) {
    const { url } = usePage();

    return (
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-line bg-white px-4 py-6 lg:flex">
            <div className="px-2">
                <span className="font-display text-lg font-semibold text-primary-dark">CIAAAA POS</span>
                <p className="text-xs text-muted">Admin Dashboard</p>
            </div>

            <nav className="flex flex-col gap-5">
                {NAV.map((group) => {
                    const items = group.items.filter((i) => !i.roles || (role && i.roles.includes(role)));

                    if (items.length === 0) {
return null;
}

                    return (
                        <div key={group.title}>
                            <p className="px-2 pb-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                                {group.title}
                            </p>
                            <ul className="flex flex-col gap-0.5">
                                {items.map((item) => (
                                    <NavLink
                                        key={item.label}
                                        item={item}
                                        active={!!item.href && url.startsWith(item.href)}
                                    />
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
    if (!item.href) {
        return (
            <li
                className="flex cursor-default items-center justify-between rounded-xl px-3 py-2 text-sm text-muted"
                title="Segera hadir"
            >
                {item.label}
                <span className="text-[10px] text-muted/70">segera</span>
            </li>
        );
    }

    return (
        <li>
            <Link
                href={item.href}
                className={cn(
                    'block rounded-xl px-3 py-2 text-sm font-medium transition',
                    active ? 'bg-soft text-primary-dark' : 'text-ink hover:bg-soft/60',
                )}
            >
                {item.label}
            </Link>
        </li>
    );
}

function UserMenu({ name, role }: { name: string; role?: Role }) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-right">
                <p className="text-sm font-semibold text-ink">{name}</p>
                <p className="text-xs text-muted capitalize">{role}</p>
            </div>
            <button
                onClick={() => router.post(logout().url)}
                className="rounded-xl border border-line px-3 py-1.5 text-sm font-medium text-primary-dark transition hover:bg-soft"
            >
                Keluar
            </button>
        </div>
    );
}

function FlashToast({ success, error }: { success?: string | null; error?: string | null }) {
    const [visible, setVisible] = useState(true);
    const message = success ?? error;

    useEffect(() => {
        if (message) {
            const t = setTimeout(() => setVisible(false), 4000);

            return () => clearTimeout(t);
        }
    }, [message]);

    if (!message || !visible) {
return null;
}

    return (
        <div
            className={cn(
                'mx-6 mt-4 rounded-xl px-4 py-3 text-sm font-medium',
                success ? 'bg-mint/15 text-mint' : 'bg-primary/10 text-primary-dark',
            )}
        >
            {message}
        </div>
    );
}
