'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteListingAction } from '@/app/actions/listings';

interface DeleteListingButtonProps {
  listingId: string;
  redirectTo?: string;
  className?: string;
}

export function DeleteListingButton({
  listingId,
  redirectTo,
  className = '',
}: DeleteListingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await deleteListingAction(listingId);
    if (result.error) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    setIsOpen(false);
    setIsDeleting(false);

    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          'inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition'
        }
      >
        <svg className="w-4 h-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Smazat
      </button>

      {/* Potvrzovací dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-900">
                  Opravdu chcete smazat tento inzerát?
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Tato akce je nevratná. Inzerát a veškerá související data budou trvale odstraněna ze systému.
                </p>

                {error && (
                  <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition shadow-xs disabled:opacity-50"
              >
                {isDeleting ? 'Mažu inzerát...' : 'Ano, smazat inzerát'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

