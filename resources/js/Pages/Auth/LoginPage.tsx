import type { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import TextField from '@/Shared/ui/forms/TextField';
import PasswordField from '@/Shared/ui/forms/PasswordField';

export const LoginPage = () => {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const canSubmit = data.email.trim() !== '' && data.password.trim() !== '';

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();
        post(route('login.store'));
    };

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-navy-950 px-4">
            <Head title="Acceso" />

            <div className="w-full max-w-sm rounded-2xl border border-navy-800 bg-navy-900 p-6 shadow-xl">
                <h2 className="mb-6 text-center text-xl font-bold text-white">Kubix — Acceso</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <TextField
                        label="Email"
                        name="email"
                        mask="email"
                        value={data.email}
                        onChange={(v) => {
                            setData('email', v);
                            clearErrors('email');
                        }}
                        error={errors.email}
                        placeholder="correo@ejemplo.com"
                        required
                    />

                    <PasswordField
                        label="Contraseña"
                        name="password"
                        autoComplete="current-password"
                        placeholder="Tu contraseña"
                        value={data.password}
                        onChange={(v) => {
                            setData('password', v);
                            clearErrors('password');
                        }}
                        error={errors.password}
                        required
                    />

                    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="accent-teal-500"
                        />
                        Recordarme
                    </label>

                    <button
                        type="submit"
                        disabled={processing || !canSubmit}
                        className="w-full cursor-pointer rounded-lg bg-teal-500 py-2.5 text-sm font-bold text-navy-950 transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {processing ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
