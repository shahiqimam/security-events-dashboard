'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { API_URL } from '../../lib/api';

type LoginForm = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState, setError } = useForm<LoginForm>({
    defaultValues: { email: 'analyst@sentinelview.local', password: 'Password123!' }
  });

  async function onSubmit(values: LoginForm) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });
    if (!response.ok) {
      setError('root', { message: 'Login failed' });
      return;
    }
    const data = await response.json();
    window.localStorage.setItem('sentinelview_token', data.accessToken);
    router.push('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1220] px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm rounded border border-line bg-panel p-6">
        <h1 className="mb-1 text-2xl font-bold">SentinelView</h1>
        <p className="mb-6 text-sm text-slate-400">Security Event Monitoring Dashboard</p>
        <label className="mb-3 block text-sm">
          Email
          <input className="mt-1 w-full rounded border border-line bg-[#0b1220] px-3 py-2" {...register('email', { required: true })} />
        </label>
        <label className="mb-4 block text-sm">
          Password
          <input type="password" className="mt-1 w-full rounded border border-line bg-[#0b1220] px-3 py-2" {...register('password', { required: true })} />
        </label>
        {formState.errors.root && <p className="mb-3 text-sm text-red-300">{formState.errors.root.message}</p>}
        <button className="w-full rounded bg-sky-600 px-3 py-2 font-semibold hover:bg-sky-500" disabled={formState.isSubmitting}>
          Sign in
        </button>
      </form>
    </main>
  );
}
