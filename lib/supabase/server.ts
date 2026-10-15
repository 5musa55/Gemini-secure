import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Profile, CurrentUserSession } from '@/types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorováno při volání ze Server Componentu, kde nelze nastavovat cookies
          }
        },
      },
    }
  );
}

/**
 * Bezpečně získá aktuálního uživatele ověřením JWT na Supabase Auth serveru (OWASP A07 / A01)
 * Nikdy nepoužíváme getSession(), protože getSession neověřuje podpis tokenu proti serveru.
 */
export async function getCurrentUserSession(): Promise<CurrentUserSession | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Získání profilu uživatele
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Ověření admin role z tabulky user_roles (nebo pomocí funkce is_admin)
  const { data: adminRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  const isAdmin = Boolean(adminRole);

  return {
    id: user.id,
    email: user.email ?? '',
    profile: (profile as Profile) || null,
    isAdmin,
  };
}

