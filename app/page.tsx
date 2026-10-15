import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ListingCard } from '@/components/ListingCard';
import { ListingFilter } from '@/components/ListingFilter';
import type { Listing } from '@/types';

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    error?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const category = resolvedParams.category || '';
  const sort = resolvedParams.sort || 'newest';
  const error = resolvedParams.error || '';

  const supabase = await createClient();

  // Sestavení bezpečného dotazu na aktivní inzeráty
  let query = supabase
    .from('listings')
    .select('*, profiles(full_name, phone, email)')
    .eq('status', 'active');

  // Filtrování podle kategorie
  if (category) {
    query = query.eq('category', category);
  }

  // Textové vyhledávání v názvu a popisu (OWASP: ošetření vstupů, sanitizace)
  if (q && q.trim()) {
    const sanitizedSearch = q.trim().replace(/[%_]/g, '\\$&');
    query = query.or(`title.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`);
  }

  // Řazení výsledků
  if (sort === 'cheapest') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'expensive') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: listings, error: fetchError } = await query;

  return (
    <div className="space-y-8">
      {/* Upozornění na neoprávněný přístup (pokud uživatel zkusil jít na /admin bez oprávnění) */}
      {error === 'unauthorized_admin' && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-amber-800">
              Přístup zamítnut: Nemáte administrátorská oprávnění pro přístup do sekce administrace.
            </p>
          </div>
        </div>
      )}

      {/* Hero sekce */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white p-8 sm:p-12 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block py-1 px-3 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs uppercase tracking-wider mb-3">
            Studentská komunita
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Najděte skripta, elektroniku i výbavu na kolej
          </h1>
          <p className="mt-3 text-indigo-100 text-base sm:text-lg">
            Bezpečný univerzitní bazar bez poplatků. Prodejte nepotřebné učebnice dalším ročníkům a ušetřete na studijních materiálech.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/inzerat/novy"
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-indigo-600 bg-white hover:bg-indigo-50 shadow-xs transition"
            >
              + Vložit inzerát zdarma
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-500/50 hover:bg-indigo-500/70 border border-white/20 transition"
            >
              Moje inzeráty
            </Link>
          </div>
        </div>

        {/* Dekorační bubliny na pozadí */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Filtry a vyhledávání */}
      <ListingFilter />

      {/* Výpis inzerátů */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {q ? `Výsledky hledání pro „${q}“` : category ? `Kategorie: ${category}` : 'Aktuální nabídka'}
          </h2>
          <span className="text-sm text-slate-500">
            Nalezeno {listings?.length ?? 0} inzerátů
          </span>
        </div>

        {fetchError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Chyba při načítání inzerátů. Zkontrolujte prosím připojení k databázi Supabase.
          </div>
        )}

        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing as Listing} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Nebyly nalezeny žádné inzeráty
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {q || category
                ? 'Zkuste upravit vyhledávací dotaz nebo zrušit filtry.'
                : 'Zatím v systému nejsou žádné inzeráty. Buďte první a přidejte svůj inzerát!'}
            </p>
            <div className="flex justify-center gap-3">
              {(q || category) && (
                <Link
                  href="/"
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Zobrazit všechny
                </Link>
              )}
              <Link
                href="/inzerat/novy"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Vložit inzerát
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
