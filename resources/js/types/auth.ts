export type Role = 'admin' | 'manager' | 'kasir';

/** The authenticated POS user, hydrated from the API and shared via Inertia. */
export type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    outletId: string;
    isActive: boolean;
};

export type Auth = {
    user: User | null;
};
