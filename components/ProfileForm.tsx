'use client';

import { useState } from 'react';
import type { Profile } from '@/types';
import { updateProfileAction, type ProfileActionResult } from '@/app/actions/profile';

interface ProfileFormProps {
  profile: Profile | null;
  email: string;
  isAdmin: boolean;
}

export function ProfileForm({ profile, email, isAdmin }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result: ProfileActionResult = await updateProfileAction(null, formData);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    } else if (result.success) {
      setSuccess('Kontaktní údaje byly úspěšně uloženy.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 space-y-6">
      {success && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-emerald-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Stav účtu / Role info */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Typ účtu
          </span>
          <span className="text-sm font-medium text-slate-900">
            {isAdmin ? 'Administrátor & Moderátor' : 'Ověřený student'}
          </span>
        </div>
        <span
          className={`px-3 py-1 text-xs rounded-full font-semibold ${
            isAdmin
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}
        >
          {isAdmin ? '👑 ADMIN' : 'STUDENT'}
        </span>
      </div>

      {/* E-mail (read-only) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Přihlašovací e-mail (pouze ke čtení)
        </label>
        <input
          type="email"
          id="email"
          value={email}
          disabled
          className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-slate-500">
          E-mail je spravován autorizační službou a nelze jej libovolně přepsat (prevence Account Takeover).
        </p>
      </div>

      {/* Celé jméno */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">
          Jméno a příjmení (zobrazuje se u vašich inzerátů)
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          maxLength={80}
          defaultValue={profile?.full_name || ''}
          placeholder="Např. Jan Novák"
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {fieldErrors.full_name && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.full_name[0]}</p>
        )}
      </div>

      {/* Telefon */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
          Telefonní číslo (pro zájemce o vaše inzeráty)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          maxLength={25}
          defaultValue={profile?.phone || ''}
          placeholder="+420 777 123 456"
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-slate-500">
          Telefonní číslo se zobrazí zájemcům na detailu vašeho inzerátu pro rychlou domluvu.
        </p>
        {fieldErrors.phone && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.phone[0]}</p>
        )}
      </div>

      {/* O mně / Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
          O mně / Fakulta / Kolej
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={500}
          defaultValue={profile?.bio || ''}
          placeholder="Např. Student 3. ročníku informatiky. Možné osobní předání na kolejích nebo fakultě."
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {fieldErrors.bio && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.bio[0]}</p>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Ukládám profil...
            </>
          ) : (
            'Uložit kontaktní údaje'
          )}
        </button>
      </div>
    </form>
  );
}

