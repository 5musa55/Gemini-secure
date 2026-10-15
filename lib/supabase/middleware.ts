import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Bezpečné ověření uživatele přes getUser() (nikoliv getSession())
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Chráněné cesty pro přihlášené uživatele (dashboard, profil, tvorba inzerátu)
  const isAuthRequired =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profil') ||
    pathname === '/inzerat/novy' ||
    (pathname.startsWith('/inzerat/') && pathname.endsWith('/upravit'));

  if (isAuthRequired && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Chráněná cesta pro administrátory (/admin)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Dotaz na roli v user_roles
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      // Uživatel není administrátor -> přesměrování s chybovou hláškou na domovskou stránku
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(homeUrl);
    }
  }

  // 3. Pokud je uživatel již přihlášen a jde na /login nebo /register, přesměrovat na dashboard
  if ((pathname === '/login' || pathname === '/register') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}
