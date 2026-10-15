import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Studentský bazar
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Komunitní tržiště pro studenty. Prodejte a kupte učebnice, skripta, elektroniku či vybavení na kolej bezpečně a jednoduše.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Tipy pro bezpečné obchodování (OWASP & Bezpečnost)
            </h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">✓</span>
                Předávejte zboží osobně na půdě fakulty nebo kampusu.
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">✓</span>
                Nikdy neposílejte platby předem neznámým osobám.
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">✓</span>
                Všechny inzeráty jsou chráněny ověřením pravosti a RLS politikami.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Rychlé odkazy
            </h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition">
                  Katalog inzerátů
                </Link>
              </li>
              <li>
                <Link href="/inzerat/novy" className="hover:text-indigo-600 transition">
                  Vložit inzerát
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 transition">
                  Moje inzeráty
                </Link>
              </li>
              <li>
                <Link href="/profil" className="hover:text-indigo-600 transition">
                  Nastavení profilu
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Studentský bazar. Bezpečně postaveno na Next.js App Router & Supabase.</p>
          <p className="mt-2 sm:mt-0">Dodržuje OWASP Top 10 bezpečnostní standardy.</p>
        </div>
      </div>
    </footer>
  );
}

