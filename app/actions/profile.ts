'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { profileSchema } from '@/lib/validations/auth';

export type ProfileActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateProfileAction(
  prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Musíte být přihlášeni pro úpravu profilu.' };
  }

  const rawData = {
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    bio: formData.get('bio'),
  };

  const validation = profileSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || 'Neplatně vyplněný profil.',
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Přísný whitelist povolených polí (ochrana před Mass Assignment - OWASP A08)
  const updateData = {
    full_name: validation.data.full_name || null,
    phone: validation.data.phone || null,
    bio: validation.data.bio || null,
  };

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (updateError) {
    console.error('Profile update error:', updateError);
    return { error: 'Nepodařilo se uložit profil.' };
  }

  revalidatePath('/profil');
  revalidatePath('/dashboard');
  return { success: true };
}
