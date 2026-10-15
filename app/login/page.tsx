'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction, type AuthActionResult } from '@/app/actions/auth';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('redirect', redirectPath);

    try {
      const result: AuthActionResult = await loginAction(null, formData);
      if (result?.error) {
        setError(result.error);
        setIsPending(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error && !err.message.includes('NEXT_REDIRECT')) {
        setError(err.message || 'Chyba při přihlašování.');
        setIsPending(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl shadow-xs border border-slate-200">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Přihlášení do bazaru
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Zadejte své přihlašovací údaje k účtu
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="redirect" value={redirectPath} />

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            E-mailová adresa
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            placeholder="vas.email@univerzita.cz"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Heslo
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-4 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50"
        >
          {isPending ? 'Přihlašuji...' : 'Přihlásit se'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600">
          Ještě nemáte účet?{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Zaregistrujte se zdarma
          </Link>
        </p>
      </div>
    </div>
  );
}
