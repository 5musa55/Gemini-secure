'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { LISTING_CATEGORIES } from '@/types';

export function ListingFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get('q') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get('q') as string) || '';
    updateFilters('q', q.trim());
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-6 mb-8">
      {/* Vyhledávací pole */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            name="q"
            defaultValue={currentQuery}
            placeholder="Hledat skripta, notebook, učebnici matematiky..."
            maxLength={100}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
          <svg
            className="w-5 h-5 text-slate-400 absolute left-3 top-3 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-xs transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isPending ? 'Hledám...' : 'Hledat'}
        </button>

        {currentQuery && (
          <button
            type="button"
            onClick={() => updateFilters('q', '')}
            className="px-3 py-2.5 text-slate-500 hover:text-slate-800 border border-slate-300 rounded-lg text-sm bg-white hover:bg-slate-50 transition"
            title="Zrušit vyhledávání"
          >
            ✕
          </button>
        )}
      </form>

      {/* Kategorie a Řazení */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
        {/* Kategorie tlačítka */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mr-1">
            Kategorie:
          </span>
          <button
            type="button"
            onClick={() => updateFilters('category', '')}
            className={`px-3 py-1 text-xs rounded-full font-medium transition ${
              !currentCategory
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Všechny
          </button>

          {LISTING_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => updateFilters('category', currentCategory === cat ? '' : cat)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                currentCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Řazení */}
        <div className="flex items-center space-x-2 self-end lg:self-auto">
          <label htmlFor="sortSelect" className="text-xs text-slate-600 font-medium">
            Seřadit:
          </label>
          <select
            id="sortSelect"
            value={currentSort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md text-xs py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Nejnovější</option>
            <option value="cheapest">Nejlevnější</option>
            <option value="expensive">Nejdražší</option>
          </select>
        </div>
      </div>
    </div>
  );
}
