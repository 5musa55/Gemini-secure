import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getCurrentUserSession } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Studentský bazar - Bezpečný nákup a prodej pro studenty',
  description: 'Komunitní tržiště pro vysokoškoláky. Nákup a prodej skript, učebnic, elektroniky a studentského vybavení s důrazem na bezpečnost (OWASP).',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUserSession();

  return (
    <html lang="cs" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar session={session} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
