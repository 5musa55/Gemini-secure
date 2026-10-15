-- ==============================================================================
-- STUDENTSKÝ BAZAR - SUPABASE DATABASE SCHEMA & SECURITY POLICIES (OWASP TOP 10)
-- ==============================================================================
-- Tento skript spusťte v Supabase Dashboard -> SQL Editor
-- Obsahuje definice tabulek, indexy, integritní omezení, triggery a přísné RLS politiky.

-- 1. ROZŠÍŘENÍ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPY (s ošetřením duplicity)
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_status_type AS ENUM ('active', 'sold', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TABULKA PROFILŮ UŽIVATELŮ (public.profiles)
-- Zajišťuje uložení kontaktních údajů prodávajícího (jméno, telefon, bio)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABULKA ROLÍ (public.user_roles)
-- Architektonické oddělení rolí od profilu (OWASP A01: Broken Access Control / Prevence Privilege Escalation)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- 5. TABULKA INZERÁTŮ (public.listings)
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3 AND char_length(title) <= 120),
  description TEXT NOT NULL CHECK (char_length(trim(description)) >= 5 AND char_length(description) <= 5000),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0 AND price <= 1000000),
  category TEXT NOT NULL CHECK (category IN ('Učebnice a skripta', 'Elektronika', 'Nábytek a kolej', 'Oblečení a doplňky', 'Ostatní')),
  image_url TEXT CHECK (image_url IS NULL OR image_url ~* '^https?://[^\s]+$'),
  status listing_status_type NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT fk_listings_profiles FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 6. INDEXY PRO VYSOKÝ VÝKON A FULLTEXTOVÉ VYHLEDÁVÁNÍ
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_search ON public.listings USING gin(to_tsvector('simple', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- 7. BEZPEČNOSTNÍ FUNKCE (SECURITY DEFINER s fixním search_path pro prevenci SQL Injection a Path Manipulation)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$;

-- Trigger pro automatické založení profilu a základní role po registraci přes Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Registrace triggerů
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_listings_updated_at ON public.listings;
CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. ROW LEVEL SECURITY (RLS) - OCHRANA NA ÚROVNI ŘÁDKŮ (OWASP A01: Broken Access Control)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- --- POLICIES: PROFILES ---
DROP POLICY IF EXISTS "Profily jsou veřejně čitelné" ON public.profiles;
CREATE POLICY "Profily jsou veřejně čitelné"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Uživatelé mohou upravovat pouze svůj profil" ON public.profiles;
CREATE POLICY "Uživatelé mohou upravovat pouze svůj profil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Uživatelé mohou vložit svůj profil" ON public.profiles;
CREATE POLICY "Uživatelé mohou vložit svůj profil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- --- POLICIES: USER_ROLES ---
DROP POLICY IF EXISTS "Uživatel vidí své role a admin vidí všechny" ON public.user_roles;
CREATE POLICY "Uživatel vidí své role a admin vidí všechny"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Pouze admini mohou manipulovat s rolemi" ON public.user_roles;
CREATE POLICY "Pouze admini mohou manipulovat s rolemi"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- POLICIES: LISTINGS ---
DROP POLICY IF EXISTS "Veřejné čtení aktivních inzerátů" ON public.listings;
CREATE POLICY "Veřejné čtení aktivních inzerátů"
  ON public.listings FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Přihlášení uživatelé mohou vytvářet inzeráty" ON public.listings;
CREATE POLICY "Přihlášení uživatelé mohou vytvářet inzeráty"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vlastník nebo admin může upravit inzerát" ON public.listings;
CREATE POLICY "Vlastník nebo admin může upravit inzerát"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Vlastník nebo admin může smazat inzerát" ON public.listings;
CREATE POLICY "Vlastník nebo admin může smazat inzerát"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 9. SUPABASE STORAGE BUCKET (listing-images)
-- Vytvoření veřejného úložiště pro nahrávání obrázků s limitem velikosti 5MB (ochrana před DoS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS politiky
DROP POLICY IF EXISTS "Veřejné prohlížení obrázků inzerátů" ON storage.objects;
CREATE POLICY "Veřejné prohlížení obrázků inzerátů"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "Autentizovaní uživatelé mohou nahrávat obrázky" ON storage.objects;
CREATE POLICY "Autentizovaní uživatelé mohou nahrávat obrázky"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'listing-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Vlastník nebo admin může smazat obrázek" ON storage.objects;
CREATE POLICY "Vlastník nebo admin může smazat obrázek"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'listing-images' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );

-- 10. INSTRUKCE PRO JMENOVÁNÍ PRVNÍHO ADMINISTRÁTORA:
-- Po registraci administrátora v aplikaci spusťte v SQL Editoru:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<ID_UZIVATELE_Z_AUTH_USERS>', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

