import { useForm } from '@inertiajs/react';
import { Select, TextInput, Toggle } from '@/components/form';
import { FormPage } from '@/components/form-page';
import { Button } from '@/components/ui';
import users from '@/routes/users';
import type { AdminUser, Role } from '@/types/pos';

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin', description: 'Akses penuh, termasuk pengguna & audit.' },
    { value: 'manager', label: 'Manager', description: 'Kelola katalog, inventaris, laporan.' },
    { value: 'kasir', label: 'Kasir', description: 'Hanya aplikasi mobile kasir.' },
];

export default function UserForm({ user }: { user: AdminUser | null }) {
    const isEdit = !!user;
    const { data, setData, submit, processing, errors } = useForm<{
        name: string;
        email: string;
        password: string;
        role: Role;
        isActive: boolean;
    }>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        role: user?.role ?? 'kasir',
        isActive: user?.isActive ?? true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(isEdit ? users.update(user!.id) : users.store(), { preserveScroll: true });
    };

    return (
        <FormPage title={isEdit ? `Ubah Pengguna · ${user!.name}` : 'Pengguna Baru'} backHref={users.index().url}>
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <TextInput
                    label="Nama"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    autoFocus
                    required
                />

                {!isEdit && (
                    <>
                        <TextInput
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                        />
                        <TextInput
                            label="Kata Sandi"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            hint="Minimal 8 karakter."
                            required
                        />
                    </>
                )}

                <Select
                    label="Peran"
                    value={data.role}
                    onChange={(v) => setData('role', v as Role)}
                    options={ROLE_OPTIONS}
                    error={errors.role}
                />

                {isEdit && <Toggle label="Aktif" description="Pengguna nonaktif tidak bisa login." checked={data.isActive} onChange={(v) => setData('isActive', v)} />}

                <div className="flex justify-end border-t border-line pt-4">
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Pengguna'}
                    </Button>
                </div>
            </form>

            {isEdit && <ResetPasswordSection user={user!} />}
        </FormPage>
    );
}

function ResetPasswordSection({ user }: { user: AdminUser }) {
    const { data, setData, submit, processing, errors, reset } = useForm({ password: '' });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm(`Reset kata sandi untuk "${user.name}"?`)) {
            return;
        }

        submit(users.resetPassword(user.id), { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <div className="mt-6 border-t border-line pt-5">
            <h3 className="mb-3 font-display text-lg font-semibold text-ink">Reset Kata Sandi</h3>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <TextInput
                    label="Kata Sandi Baru"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    hint="Minimal 8 karakter."
                    required
                />
                <div className="flex justify-end">
                    <Button type="submit" variant="danger" disabled={processing}>
                        {processing ? 'Memproses…' : 'Reset Sandi'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
