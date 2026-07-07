import { usePage } from '@inertiajs/react';
import type { Role } from '@/types/auth';

/**
 * Mirrors the API's RBAC so the UI never surfaces actions the role can't
 * perform. The API remains the source of truth (server-side enforced).
 */
export function usePermissions() {
    const role = usePage().props.auth.user?.role;

    const isAdmin = role === 'admin';
    // "manage" = admin + manager: catalog, inventory, store profile, void.
    const canManage = role === 'admin' || role === 'manager';

    return {
        role: role as Role | undefined,
        isAdmin,
        canManage,
        canViewReports: canManage,
    };
}
