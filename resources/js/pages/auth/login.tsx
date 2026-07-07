import { Form, Head } from '@inertiajs/react';
import LoginController from '@/actions/App/Http/Controllers/Auth/LoginController';
import { TextInput } from '@/components/form';

export default function Login() {
    return (
        <>
            <Head title="Masuk" />

            <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
                <div className="card animate-fade-up w-full max-w-md p-8">
                    <div className="mb-6 text-center">
                        <span className="font-display text-2xl font-semibold text-primary-dark">CIAAAA POS</span>
                        <p className="mt-1 text-sm text-muted">Masuk ke Admin Dashboard</p>
                    </div>

                    <Form
                        action={LoginController.store().url}
                        method="post"
                        disableWhileProcessing
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <TextInput
                                    label="Email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    autoFocus
                                    required
                                    error={errors.email}
                                />
                                <TextInput
                                    label="Kata Sandi"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    error={errors.password}
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-2 w-full rounded-xl bg-primary px-4 py-2.5 font-semibold text-white shadow-soft transition hover:bg-primary-dark disabled:opacity-60"
                                >
                                    {processing ? 'Memproses…' : 'Masuk'}
                                </button>
                            </>
                        )}
                    </Form>

                    <p className="mt-6 text-center text-xs text-muted">
                        Hanya untuk admin & manager. Kasir menggunakan aplikasi mobile.
                    </p>
                </div>
            </div>
        </>
    );
}
