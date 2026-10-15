import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/supabase/server';
import { ListingForm } from '@/components/ListingForm';

export default async function NewListingPage() {
  const session = await getCurrentUserSession();

  if (!session) {
    redirect('/login?redirect=/inzerat/novy');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Vytvořit nový inzerát
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Vyplňte informace o nabízeném předmětu. Všechna data jsou validována v souladu s bezpečnostními standardy.
        </p>
      </div>

      <ListingForm />
    </div>
  );
}

