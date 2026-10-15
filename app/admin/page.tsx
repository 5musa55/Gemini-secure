import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, getCurrentUserSession } from '@/lib/supabase/server';
import { DeleteListingButton } from '@/components/DeleteListingButton';
import type { Listing } from '@/types';

interface AdminPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getCurrentUserSession();

  // Striktní ověření administrátora na úrovni serveru (OWASP A01)
  if (!session || !session.isAdmin) {
    redirect('/?error=unauthorized_admin');
  }

  const { q } = await searchParams;
  const supabase = await createClient();

  // Načtení všech inzerátů pro moderaci včetně detailů prodejce
  let listingsQuery = supabase
    .from('listings')
    .select('*, profiles(id, full_name, email, phone)')
    .order('created_at', { ascending: false });

  if (q && q.trim()) {
    const sanitizedSearch = q.trim().replace(/[%_]/g, '\\$&');
    listingsQuery = listingsQuery.or(
      `title.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`
    );
  }

  const { data: allListingsData } = await listingsQuery;
  const listings = (allListingsData as Listing[]) || [];

  // Statistiky
  const { count: totalListingsCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  const { count: totalUsersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const activeCount = listings.filter((l) => l.status === 'active').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;

  return (
    <div className="space-y-8">
      {/* Záhlaví administrace */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-slate-950 uppercase tracking-wider">
              Moderátorský portál
            </span>
            <span className="text-xs text-slate-400">OWASP RBAC Protected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
            Administrace a moderace inzerátů
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Jako administrátor máte plné oprávnění moderovat, upravovat a mazat jakýkoliv inzerát v systému.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <Link
            href="/inzerat/novy"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
          >
            + Vložit inzerát
          </Link>
        </div>
      </div>

      {/* Statistiky systému */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Celkem inzerátů
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {totalListingsCount ?? listings.length}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Aktivních nabídek
          </span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {activeCount}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Prodaných položek
          </span>
          <span className="text-2xl font-bold text-indigo-600 mt-1 block">
            {soldCount}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Registrovaných studentů
          </span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {totalUsersCount ?? 0}
          </span>
        </div>
      </div>

      {/* Vyhledávání pro moderaci */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Všechny inzeráty v systému ({listings.length})
            </h2>
            <p className="text-xs text-slate-500">
              Umožňuje přímou moderaci závadného obsahu, spamu nebo porušení pravidel.
            </p>
          </div>

          <form method="GET" className="flex items-center space-x-2">
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Filtrovat inzeráty..."
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition"
            >
              Hledat
            </button>
            {q && (
              <Link
                href="/admin"
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Zrušit
              </Link>
            )}
          </form>
        </div>

        {/* Tabulka inzerátů */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th scope="col" className="px-6 py-3">Inzerát</th>
                <th scope="col" className="px-6 py-3">Kategorie</th>
                <th scope="col" className="px-6 py-3">Cena</th>
                <th scope="col" className="px-6 py-3">Autor (prodejce)</th>
                <th scope="col" className="px-6 py-3">Stav</th>
                <th scope="col" className="px-6 py-3">Datum vytvoření</th>
                <th scope="col" className="px-6 py-3 text-right">Moderátorské akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Nebyly nalezeny žádné inzeráty odpovídající filtru.
                  </td>
                </tr>
              ) : (
                listings.map((item) => {
                  const formattedPrice =
                    Number(item.price) === 0
                      ? 'Zdarma'
                      : `${new Intl.NumberFormat('cs-CZ').format(Number(item.price))} Kč`;

                  const formattedDate = new Date(item.created_at).toLocaleDateString('cs-CZ', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  });

                  const statusBadge =
                    item.status === 'active' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Aktivní
                      </span>
                    ) : item.status === 'sold' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        Prodáno
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Archivováno
                      </span>
                    );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                            {item.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                                N/A
                              </div>
                            )}
                          </div>
                          <div className="max-w-[200px] truncate">
                            <Link
                              href={`/inzerat/${item.id}`}
                              className="font-medium text-slate-900 hover:text-indigo-600 truncate block"
                              title={item.title}
                            >
                              {item.title}
                            </Link>
                            <span className="text-xs text-slate-400">ID: {item.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                        {item.category}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                        {formattedPrice}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <div className="font-medium text-slate-800">
                          {item.profiles?.full_name || 'Neuvedeno'}
                        </div>
                        <div className="text-slate-400">
                          {item.profiles?.email || 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {statusBadge}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {formattedDate}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <Link
                          href={`/inzerat/${item.id}`}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md bg-white hover:bg-slate-50"
                        >
                          Zobrazit
                        </Link>
                        <Link
                          href={`/inzerat/${item.id}/upravit`}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-700 hover:text-indigo-900 border border-indigo-200 rounded-md bg-indigo-50 hover:bg-indigo-100"
                        >
                          Upravit
                        </Link>
                        <DeleteListingButton listingId={item.id} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

