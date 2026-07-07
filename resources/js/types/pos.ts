import type { Role } from './auth';

/** Reports summary — GET /reports/summary. */
export type ReportSummary = {
    date: string;
    orderCount: number;
    grossSales: number;
    averageOrder: number;
    cogs: number;
    grossMargin: number;
    marginPct: number;
    byPaymentMethod: Record<string, { count: number; total: number }>;
};

/** GET /inventory/low-stock. */
export type LowStockItem = {
    id: string;
    name: string;
    uom: string;
    currentStock: string;
    reorderLevel: string;
};

export type LowStock = {
    data: LowStockItem[];
};

/** GET /reports/sales-timeseries. */
export type Timeseries = {
    range: string;
    series: { date: string; sales: number; orders: number }[];
};

/** GET /reports/top-products. */
export type TopProducts = {
    range: string;
    data: { productId: string; name: string; qty: number; sales: number }[];
};

/** GET /reports/cogs-margin. */
export type CogsMargin = {
    range: string;
    grossSales: number;
    cogs: number;
    grossMargin: number;
    marginPct: number;
};

/* --------------------------------------------------------------- Catalog */

export type Category = {
    id: string;
    name: string;
    sortOrder: number;
    isActive: boolean;
    deletedAt?: string | null;
};

export type Modifier = {
    id: string;
    name: string;
    priceDelta: number;
    isDefault: boolean;
    sortOrder: number;
    isActive: boolean;
};

export type ModifierGroup = {
    id: string;
    name: string;
    selection: 'single' | 'multi';
    isRequired: boolean;
    sortOrder: number;
    isActive: boolean;
    modifiers: Modifier[];
};

export type PaymentMethod = {
    id: string;
    code: string;
    label: string;
    isEnabled: boolean;
    sortOrder: number;
};

export type Product = {
    id: string;
    name: string;
    basePrice: number;
    categoryId: string | null;
    imageUrl: string | null;
    imagePublicId: string | null;
    sku: string | null;
    sellsBy: 'recipe' | 'finished_good';
    finishedStockQty: string | null;
    sortOrder: number;
    isActive: boolean;
    version: number;
    deletedAt?: string | null;
    modifierGroups?: { id: string; name: string }[];
};

/** POST /products/import?dryRun=true response. */
export type ImportReport = {
    summary: { total: number; toCreate: number; errors: number; dryRun: boolean };
    errors: { row: number; message: string; details?: Record<string, string[]> }[];
    preview: { name: string; basePrice: number }[];
};

export type PriceHistoryEntry = {
    oldPrice: number;
    newPrice: number;
    changedBy: string;
    createdAt: string;
};

/* ------------------------------------------------------------- Inventory */

export type Uom = { id: string; code: string; name: string };

export type Supplier = { id: string; name: string; contact: string | null; note: string | null };

export type Ingredient = {
    id: string;
    name: string;
    uomId: string;
    currentStock: string;
    reorderLevel: string;
    costPerUnit: number;
    supplierId: string | null;
    isActive: boolean;
    version: number;
    deletedAt?: string | null;
};

export type InventorySummary = {
    outletId: string;
    ingredientCount: number;
    lowStockCount: number;
    valuation: number;
    items: {
        id: string;
        name: string;
        uom: string;
        currentStock: string;
        reorderLevel: string;
        costPerUnit: number;
        lineValue: number;
        isLow: boolean;
    }[];
};

export type StockMovement = {
    id: string;
    ingredientId: string;
    type: 'purchase' | 'sale' | 'adjustment' | 'waste';
    qtyDelta: string;
    balanceAfter: string;
    ref: string | null;
    createdAt: string;
};

export type Purchase = {
    id: string;
    supplierId: string | null;
    note: string | null;
    total: number;
    createdAt: string;
    items?: { ingredientId: string; qty: string; unitCost: number }[];
};

export type StockAdjustment = {
    id: string;
    reason: string;
    createdAt: string;
    items?: { ingredientId: string; qtyDelta: string; note: string | null }[];
};

export type RecipeLine = { ingredientId: string; qtyPerUnit?: number; qtyDelta?: number; uomId: string };

/** Generic cursor-paginated envelope. */
export type Paginated<T> = { data: T[]; nextCursor: string | null };

/* ---------------------------------------------------------- Transactions */

export type OrderListItem = {
    id: string;
    orderNo: string;
    createdAt: string;
    paymentMethod: string;
    total: number;
    status: string;
};

export type OrderDetail = OrderListItem & {
    items: {
        name: string;
        qty: number;
        unitPrice: number;
        lineTotal: number;
        modifiersSnapshot?: { name: string; priceDelta: number }[];
    }[];
    subtotal: number;
    cashReceived: number | null;
    change: number | null;
    cashierName: string | null;
    shiftId: string | null;
};

export type Shift = {
    id: string;
    openedAt: string;
    openingCash: number;
    expectedCash?: number;
    countedCash?: number | null;
    variance?: number | null;
    cashierName?: string | null;
    status: string;
} | null;

/* ---------------------------------------------------------------- Admin */

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    deletedAt?: string | null;
};

export type Outlet = {
    id: string;
    name: string;
    address: string | null;
    timezone: string | null;
    isActive: boolean;
    deletedAt?: string | null;
};

export type StoreProfileData = {
    outletId: string;
    displayName: string;
    tagline: string | null;
    address: string | null;
    qrisNmid: string | null;
    qrisImageUrl: string | null;
    receiptFooter: string | null;
    currency: string;
};

export type AuditLog = {
    id: string;
    entity: string;
    entityId: string;
    action: string;
    actorName: string | null;
    diff: unknown;
    createdAt: string;
};

// Re-export Role for convenience in admin pages.
export type { Role };
