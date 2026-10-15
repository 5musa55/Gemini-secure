'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registerAction, type AuthActionResult } from '@/app/actions/auth';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setInfo(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result: AuthActionResult = await registerAction(null, formData);
      if (result?.error) {
        if (result.success) {
          setInfo(result.error);
        } else {
          setError(result.error);
        }
        setIsPending(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error && !err.message.includes('NEXT_REDIRECT')) {
        setError(err.message || 'Chyba při registraci.');
        setIsPending(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl shadow-xs border border-slate-200">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Vytvoření studentského účtu
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Zaregistrujte se a začněte prodávat i nakupovat
        </p>
      </div>

      {info && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
          <p className="text-sm font-medium text-blue-800">{info}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
            Jméno a příjmení
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Jan Novák"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            E-mailová adresa <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            placeholder="jan.novak@univerzita.cz"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Heslo <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimálně 8 znaků, velká/malá písmena a číslo"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            Bezpečnostní politika: min. 8 znaků, velká písmena, malá písmena a číslice (OWASP A07).
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            Potvrzení hesla <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            autoComplete="new-password"
            placeholder="Zadejte heslo znovu pro kontrolu"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-4 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50"
        >
          {isPending ? 'Vytvářím účet...' : 'Zaregistrovat se'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600">
          Již máte účet?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Přihlaste se zde
          </Link>
        </p>
      </div>
    </div>
  );
}
