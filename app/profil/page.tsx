import { redirect } from 'next/navigation';
import { getCurrentUserSession } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/ProfileForm';

export default async function ProfilePage() {
  const session = await getCurrentUserSession();

  if (!session) {
    redirect('/login?redirect=/profil');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Můj profil a kontaktní údaje
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Nastavte si kontaktní údaje, které se zobrazí zájemcům o vaše inzeráty. Změny jsou okamžitě promítnuty.
        </p>
      </div>

      <ProfileForm
        profile={session.profile}
        email={session.email}
        isAdmin={session.isAdmin}
      />
    </div>
  );
}
