import Link from 'next/link';
import type { Listing } from '@/types';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const formattedPrice =
    Number(listing.price) === 0
      ? 'Zdarma'
      : `${new Intl.NumberFormat('cs-CZ').format(Number(listing.price))} Kč`;

  const formattedDate = new Date(listing.created_at).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  const categoryColorMap: Record<string, string> = {
    'Učebnice a skripta': 'bg-blue-50 text-blue-700 border-blue-200',
    'Elektronika': 'bg-purple-50 text-purple-700 border-purple-200',
    'Nábytek a kolej': 'bg-amber-50 text-amber-700 border-amber-200',
    'Oblečení a doplňky': 'bg-pink-50 text-pink-700 border-pink-200',
    'Ostatní': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const badgeClass =
    categoryColorMap[listing.category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="group flex flex-col bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition duration-200">
      <Link href={`/inzerat/${listing.id}`} className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden block">
        {listing.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 p-4">
            <svg className="w-12 h-12 mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">Bez obrázku</span>
          </div>
        )}

        {listing.status === 'sold' && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
            Prodáno
          </div>
        )}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${badgeClass}`}>
              {listing.category}
            </span>
            <span className="text-xs text-slate-600">{formattedDate}</span>
          </div>

          <Link href={`/inzerat/${listing.id}`}>
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1 text-base">
              {listing.title}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2">
            {listing.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">
            {formattedPrice}
          </span>

          <span className="text-xs text-slate-600 truncate max-w-[120px]">
            {listing.profiles?.full_name || 'Student'}
          </span>
        </div>
      </div>
    </div>
  );
}
