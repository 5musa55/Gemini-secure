import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, getCurrentUserSession } from '@/lib/supabase/server';
import { DeleteListingButton } from '@/components/DeleteListingButton';
import type { Listing } from '@/types';

export default async function DashboardPage() {
  const session = await getCurrentUserSession();

  if (!session) {
    redirect('/login?redirect=/dashboard');
  }

  const supabase = await createClient();

  // Načtení všech inzerátů aktuálního uživatele
  const { data: listingsData, error } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', session.id)
    .order('created_at', { ascending: false });

  const listings = (listingsData as Listing[]) || [];

  const totalCount = listings.length;
  const activeCount = listings.filter((l) => l.status === 'active').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;

  return (
    <div className="space-y-8">
      {/* Záhlaví členské sekce */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Moje inzeráty
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Správa vašich nabídek, přehled stavu a úprava aktivních inzerátů.
          </p>
        </div>

        <Link
          href="/inzerat/novy"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition self-start sm:self-auto"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Vložit nový inzerát
        </Link>
      </div>

      {/* Rychlé statistiky */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Celkem inzerátů
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {totalCount}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Aktivní v nabídce
          </span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {activeCount}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Úspěšně prodáno
          </span>
          <span className="text-2xl font-bold text-indigo-600 mt-1 block">
            {soldCount}
          </span>
        </div>
      </div>

      {/* Seznam inzerátů */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Seznam vašich položek
          </h2>
          <span className="text-xs text-slate-500">
            Aktualizováno v reálném čase
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm">
            Nepodařilo se načíst inzeráty z databáze.
          </div>
        )}

        {listings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Zatím jste nevložili žádný inzerát
            </h3>
            <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
              Máte nepotřebná skripta, učebnice nebo kalkulačku? Vložte inzerát a nabídněte je spolužákům.
            </p>
            <Link
              href="/inzerat/novy"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Vložit první inzerát
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {listings.map((item) => {
              const formattedPrice =
                Number(item.price) === 0
                  ? 'Zdarma'
                  : `${new Intl.NumberFormat('cs-CZ').format(Number(item.price))} Kč`;

              const statusColor =
                item.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : item.status === 'sold'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200';

              const statusLabel =
                item.status === 'active'
                  ? 'Aktivní'
                  : item.status === 'sold'
                  ? 'Prodáno'
                  : 'Archivováno';

              return (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                          {statusLabel}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.category}
                        </span>
                      </div>

                      <Link
                        href={`/inzerat/${item.id}`}
                        className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition truncate block"
                      >
                        {item.title}
                      </Link>

                      <span className="text-sm font-bold text-slate-700 block mt-0.5">
                        {formattedPrice}
                      </span>
                    </div>
                  </div>

                  {/* Ovládací akce */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <Link
                      href={`/inzerat/${item.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition"
                    >
                      Zobrazit
                    </Link>
                    <Link
                      href={`/inzerat/${item.id}/upravit`}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-900 border border-indigo-200 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition"
                    >
                      Upravit
                    </Link>
                    <DeleteListingButton listingId={item.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

