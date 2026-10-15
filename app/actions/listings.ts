'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { listingSchema } from '@/lib/validations/listing';

export type ListingActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Pomocná funkce pro bezpečné nahrání obrázku do Supabase Storage
 */
async function uploadImageFile(
  file: File,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Obrázek nesmí být větší než 5 MB.');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Povolené formáty obrázků jsou JPEG, PNG, WebP a GIF.');
  }

  // Bezpečné vygenerování náhodného názvu souboru (prevence Path Traversal)
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
  const filename = `${crypto.randomUUID()}.${safeExt}`;
  const filePath = `${userId}/${filename}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from('listing-images')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error('Nepodařilo se nahrát obrázek do úložiště.');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('listing-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Vytvoření inzerátu
 */
export async function createListingAction(
  prevState: ListingActionResult | null,
  formData: FormData
): Promise<ListingActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Pro vytvoření inzerátu musíte být přihlášeni.' };
  }

  let imageUrl = (formData.get('image_url') as string) || '';
  const imageFile = formData.get('image_file') as File | null;

  try {
    if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadImageFile(imageFile, user.id, supabase);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Chyba při nahrávání obrázku.';
    return { error: message };
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    category: formData.get('category'),
    image_url: imageUrl || null,
    status: 'active',
  };

  const validation = listingSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || 'Neplatně vyplněný formulář.',
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Vložení do databáze s explicitním user_id z JWT (prevence IDOR - OWASP A01)
  const { data: newListing, error: insertError } = await supabase
    .from('listings')
    .insert({
      user_id: user.id,
      title: validation.data.title,
      description: validation.data.description,
      price: validation.data.price,
      category: validation.data.category,
      image_url: validation.data.image_url,
      status: 'active',
    })
    .select('id')
    .single();

  if (insertError || !newListing) {
    console.error('Insert error:', insertError);
    return { error: 'Nepodařilo se uložit inzerát do databáze.' };
  }

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/admin');
  redirect(`/inzerat/${newListing.id}`);
}

/**
 * Úprava inzerátu (autor nebo administrátor)
 */
export async function updateListingAction(
  listingId: string,
  prevState: ListingActionResult | null,
  formData: FormData
): Promise<ListingActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Pro úpravu inzerátu musíte být přihlášeni.' };
  }

  // Ověření existence inzerátu
  const { data: existingListing, error: fetchError } = await supabase
    .from('listings')
    .select('id, user_id, image_url')
    .eq('id', listingId)
    .single();

  if (fetchError || !existingListing) {
    return { error: 'Inzerát nebyl nalezen.' };
  }

  // Ověření admin role
  const { data: adminRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  const isOwner = existingListing.user_id === user.id;
  const isAdmin = Boolean(adminRole);

  if (!isOwner && !isAdmin) {
    return { error: 'Nemáte oprávnění upravit tento inzerát.' };
  }

  let imageUrl = (formData.get('image_url') as string) || existingListing.image_url || '';
  const imageFile = formData.get('image_file') as File | null;

  try {
    if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadImageFile(imageFile, user.id, supabase);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Chyba při nahrávání obrázku.';
    return { error: message };
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    category: formData.get('category'),
    image_url: imageUrl || null,
    status: (formData.get('status') as string) || 'active',
  };

  const validation = listingSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || 'Neplatná data formuláře.',
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { error: updateError } = await supabase
    .from('listings')
    .update({
      title: validation.data.title,
      description: validation.data.description,
      price: validation.data.price,
      category: validation.data.category,
      image_url: validation.data.image_url,
      status: validation.data.status,
    })
    .eq('id', listingId);

  if (updateError) {
    console.error('Update error:', updateError);
    return { error: 'Inzerát se nepodařilo aktualizovat.' };
  }

  revalidatePath('/');
  revalidatePath(`/inzerat/${listingId}`);
  revalidatePath('/dashboard');
  revalidatePath('/admin');
  redirect(`/inzerat/${listingId}`);
}

/**
 * Smazání inzerátu (autor nebo administrátor)
 */
export async function deleteListingAction(listingId: string): Promise<ListingActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Musíte být přihlášeni pro smazání inzerátu.' };
  }

  // Zjištění oprávnění
  const { data: existingListing } = await supabase
    .from('listings')
    .select('id, user_id')
    .eq('id', listingId)
    .single();

  if (!existingListing) {
    return { error: 'Inzerát nebyl nalezen.' };
  }

  const { data: adminRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  const isOwner = existingListing.user_id === user.id;
  const isAdmin = Boolean(adminRole);

  if (!isOwner && !isAdmin) {
    return { error: 'Nemáte oprávnění smazat tento inzerát.' };
  }

  const { error: deleteError } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId);

  if (deleteError) {
    console.error('Delete error:', deleteError);
    return { error: 'Inzerát se nepodařilo smazat.' };
  }

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * Změna stavu inzerátu (např. označit jako prodané)
 */
export async function updateListingStatusAction(
  listingId: string,
  newStatus: 'active' | 'sold' | 'archived'
): Promise<ListingActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Nejste přihlášeni.' };
  }

  const { error } = await supabase
    .from('listings')
    .update({ status: newStatus })
    .eq('id', listingId);

  if (error) {
    return { error: 'Nepodařilo se změnit stav inzerátu.' };
  }

  revalidatePath('/');
  revalidatePath(`/inzerat/${listingId}`);
  revalidatePath('/dashboard');
  revalidatePath('/admin');
  return { success: true };
}
