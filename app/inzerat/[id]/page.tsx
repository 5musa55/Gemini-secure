import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient, getCurrentUserSession } from '@/lib/supabase/server';
import { DeleteListingButton } from '@/components/DeleteListingButton';
import type { Listing } from '@/types';

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const session = await getCurrentUserSession();

  // Načtení detailu inzerátu včetně kontaktních údajů prodejce z tabulky profiles
  const { data: listingData, error } = await supabase
    .from('listings')
    .select('*, profiles(id, full_name, phone, email, bio)')
    .eq('id', id)
    .single();

  if (error || !listingData) {
    notFound();
  }

  const listing = listingData as Listing;
  const isOwner = session?.id === listing.user_id;
  const isAdmin = Boolean(session?.isAdmin);
  const canModify = isOwner || isAdmin;

  const formattedPrice =
    Number(listing.price) === 0
      ? 'Zdarma'
      : `${new Intl.NumberFormat('cs-CZ').format(Number(listing.price))} Kč`;

  const formattedDate = new Date(listing.created_at).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumbs & Zpět */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center space-x-2">
          <Link href="/" className="hover:text-indigo-600 transition">
            Domů
          </Link>
          <span>/</span>
          <Link href={`/?category=${encodeURIComponent(listing.category)}`} className="hover:text-indigo-600 transition">
            {listing.category}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-xs">
            {listing.title}
          </span>
        </div>

        <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
          ← Zpět na seznam
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
          {/* Levý sloupec: Obrázek */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative aspect-4/3 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              {listing.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.image_url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 p-8">
                  <svg className="w-16 h-16 mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">Inzerát neobsahuje žádný obrázek</span>
                </div>
              )}

              {listing.status === 'sold' && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md">
                  Prodáno
                </div>
              )}
            </div>

            {/* Správa inzerátu (pokud je vlastník nebo admin) */}
            {canModify && (
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                    Správa inzerátu ({isOwner ? 'Váš inzerát' : 'Administrátorská moderace'})
                  </span>
                  <p className="text-xs text-slate-600">
                    Máte právo inzerát upravit nebo trvale odstranit.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/inzerat/${listing.id}/upravit`}
                    className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 transition"
                  >
                    Upravit
                  </Link>
                  <DeleteListingButton listingId={listing.id} redirectTo="/" />
                </div>
              </div>
            )}
          </div>

          {/* Pravý sloupec: Informace & Kontakt */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {listing.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    Vloženo {formattedDate}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                  {listing.title}
                </h1>

                <div className="mt-4 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {formattedPrice}
                  </span>
                </div>
              </div>

              {/* Popis */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Popis zboží
                </h3>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </div>
              </div>

              {/* Karta prodávajícího (kontaktní údaje) */}
              <div className="p-5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-4">
                <h3 className="text-sm font-bold text-indigo-950 flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Kontakt na prodávajícího
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-indigo-100/60 pb-2">
                    <span className="text-slate-500">Jméno:</span>
                    <span className="font-semibold text-slate-900">
                      {listing.profiles?.full_name || 'Registrovaný student'}
                    </span>
                  </div>

                  {listing.profiles?.phone && (
                    <div className="flex justify-between border-b border-indigo-100/60 pb-2">
                      <span className="text-slate-500">Telefon:</span>
                      <a
                        href={`tel:${listing.profiles.phone}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {listing.profiles.phone}
                      </a>
                    </div>
                  )}

                  {listing.profiles?.email && (
                    <div className="flex justify-between border-b border-indigo-100/60 pb-2">
                      <span className="text-slate-500">E-mail:</span>
                      <a
                        href={`mailto:${listing.profiles.email}`}
                        className="font-medium text-indigo-600 hover:underline truncate max-w-[200px]"
                      >
                        {listing.profiles.email}
                      </a>
                    </div>
                  )}

                  {listing.profiles?.bio && (
                    <div className="pt-1">
                      <span className="text-slate-500 block text-xs mb-1">O prodávajícím:</span>
                      <p className="text-xs text-slate-700 italic bg-white/70 p-2 rounded-md">
                        {listing.profiles.bio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bezpečnostní upozornění */}
                <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-100 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-indigo-900 flex items-center">
                    <svg className="w-4 h-4 text-emerald-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Bezpečné předání
                  </p>
                  <p>
                    Doporučujeme osobní setkání a kontrolu zboží na půdě univerzity. Nikdy neposílejte peníze předem na cizí bankovní účty.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
