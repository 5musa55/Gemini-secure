'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CurrentUserSession } from '@/types';
import { signOutAction } from '@/app/actions/auth';

interface NavbarProps {
  session: CurrentUserSession | null;
}

export function Navbar({ session }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Studentský<span className="text-indigo-600">Bazar</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Všechny inzeráty
            </Link>

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/dashboard') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Moje inzeráty
                </Link>

                <Link
                  href="/profil"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/profil') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Můj profil
                </Link>

                {session.isAdmin && (
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1 ${
                      isActive('/admin') ? 'text-amber-700 bg-amber-50' : 'text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Administrace</span>
                  </Link>
                )}

                <Link
                  href="/inzerat/novy"
                  className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Přidat inzerát
                </Link>

                <form action={signOutAction} className="inline ml-2">
                  <button
                    type="submit"
                    className="px-3 py-2 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="Odhlásit se"
                  >
                    Odhlásit
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition"
                >
                  Přihlášení
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
                >
                  Registrace
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {session && (
              <Link
                href="/inzerat/novy"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-indigo-600"
              >
                + Přidat
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none"
              aria-label="Otevřít nabídku"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Všechny inzeráty
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Moje inzeráty
              </Link>
              <Link
                href="/profil"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Můj profil
              </Link>
              {session.isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-amber-700 bg-amber-50"
                >
                  Administrace
                </Link>
              )}
              <Link
                href="/inzerat/novy"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 bg-indigo-50"
              >
                + Přidat nový inzerát
              </Link>
              <form action={signOutAction} className="pt-2">
                <button
                  type="submit"
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Odhlásit se ({session.email})
                </button>
              </form>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-center text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Přihlášení
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-center text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Registrace
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
