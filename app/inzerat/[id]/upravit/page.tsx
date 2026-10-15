import { notFound, redirect } from 'next/navigation';
import { createClient, getCurrentUserSession } from '@/lib/supabase/server';
import { ListingForm } from '@/components/ListingForm';
import type { Listing } from '@/types';

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const session = await getCurrentUserSession();

  if (!session) {
    redirect(`/login?redirect=/inzerat/${id}/upravit`);
  }

  const supabase = await createClient();
  const { data: listingData, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !listingData) {
    notFound();
  }

  const listing = listingData as Listing;
  const isOwner = session.id === listing.user_id;
  const isAdmin = session.isAdmin;

  // Striktní ověření autorizace na úrovni serveru (OWASP A01: Broken Access Control)
  if (!isOwner && !isAdmin) {
    redirect(`/?error=unauthorized`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
          <span>{isAdmin && !isOwner ? '👑 Moderátorská úprava' : 'Vaše úprava'}</span>
          <span>•</span>
          <span>ID: {listing.id}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Upravit inzerát: {listing.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Změňte parametry inzerátu, cenu nebo stav nabídky.
        </p>
      </div>

      <ListingForm initialData={listing} isEditing={true} />
    </div>
  );
}
