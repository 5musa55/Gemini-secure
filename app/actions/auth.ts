'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema } from '@/lib/validations/auth';

export type AuthActionResult = {
  success?: boolean;
  error?: string;
};

/**
 * Přihlášení uživatele přes Supabase Auth
 */
export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMsg = validation.error.issues[0]?.message || 'Neplatná data formuláře.';
    return { error: errorMsg };
  }

  const { email, password } = validation.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Bezpečná obecná chybová hláška pro prevenci enumerace uživatelů (OWASP A07)
    return { error: 'Neplatný e-mail nebo heslo.' };
  }

  const redirectTo = (formData.get('redirect') as string) || '/dashboard';
  // Prevence Open Redirect (OWASP): Povolit pouze relativní cesty začínající lomítkem
  const safeRedirect = redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/dashboard';
  redirect(safeRedirect);
}

/**
 * Registrace nového uživatele přes Supabase Auth
 */
export async function registerAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    fullName: formData.get('fullName'),
  };

  const validation = registerSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMsg = validation.error.issues[0]?.message || 'Neplatná data formuláře.';
    return { error: errorMsg };
  }

  const { email, password, fullName } = validation.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || '',
      },
    },
  });

  if (error) {
    return { error: error.message || 'Při registraci došlo k chybě.' };
  }

  // Pokud Supabase vyžaduje potvrzení e-mailem a nevrátí session
  if (data?.user && !data.session) {
    return {
      success: true,
      error: 'Registrace proběhla úspěšně. Pokud máte zapnuté ověření e-mailem, zkontrolujte prosím svou schránku.',
    };
  }

  redirect('/dashboard');
}

/**
 * Odhlášení uživatele
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
