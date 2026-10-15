'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LISTING_CATEGORIES, type Listing } from '@/types';
import { createListingAction, updateListingAction, type ListingActionResult } from '@/app/actions/listings';

interface ListingFormProps {
  initialData?: Listing;
  isEditing?: boolean;
}

export function ListingForm({ initialData, isEditing = false }: ListingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null);
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Obrázek nesmí být větší než 5 MB.');
        return;
      }
      setError(null);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    try {
      let result: ListingActionResult;
      if (isEditing && initialData) {
        result = await updateListingAction(initialData.id, null, formData);
      } else {
        result = await createListingAction(null, formData);
      }

      if (result?.error) {
        setError(result.error);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      // Pokud dojde k redirect(), Next.js vyhodí interní NEXT_REDIRECT výjimku, což je v pořádku
      if (err instanceof Error && !err.message.includes('NEXT_REDIRECT')) {
        setError(err.message || 'Nastala neočekávaná chyba při ukládání.');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Název */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          Název inzerátu <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          defaultValue={initialData?.title || ''}
          placeholder="Např. Matematická analýza I - skripta MUNI"
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {fieldErrors.title && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.title[0]}</p>
        )}
      </div>

      {/* Kategorie a Cena */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">
            Kategorie <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={initialData?.category || LISTING_CATEGORIES[0]}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {LISTING_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {fieldErrors.category && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.category[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700">
            Cena (Kč) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-lg shadow-xs">
            <input
              type="number"
              id="price"
              name="price"
              required
              min={0}
              max={1000000}
              step={1}
              defaultValue={initialData?.price ?? 0}
              placeholder="0 pro Zdarma / daruji"
              className="block w-full pr-12 px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-slate-500 sm:text-sm">Kč</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-500">Zadejte 0, pokud chcete věc darovat zdarma.</p>
          {fieldErrors.price && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.price[0]}</p>
          )}
        </div>
      </div>

      {/* Stav inzerátu (pokud editujeme) */}
      {isEditing && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">
            Stav inzerátu
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initialData?.status || 'active'}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="active">Aktivní (zobrazuje se veřejně)</option>
            <option value="sold">Prodáno (označeno jako prodané)</option>
            <option value="archived">Archivováno (skryto z veřejného katalogu)</option>
          </select>
        </div>
      )}

      {/* Popis */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Podrobný popis <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          minLength={5}
          maxLength={5000}
          defaultValue={initialData?.description || ''}
          placeholder="Uveďte stav věci, vydání knihy, známky opotřebení, možnosti předání na kampusu..."
          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {fieldErrors.description && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.description[0]}</p>
        )}
      </div>

      {/* Obrázek */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">
            Obrázek k inzerátu (volitelné)
          </label>
          <div className="flex space-x-2 text-xs">
            <button
              type="button"
              onClick={() => setImageInputMode('file')}
              className={`px-2 py-0.5 rounded ${
                imageInputMode === 'file' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-500'
              }`}
            >
              Nahrát soubor
            </button>
            <button
              type="button"
              onClick={() => setImageInputMode('url')}
              className={`px-2 py-0.5 rounded ${
                imageInputMode === 'url' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-500'
              }`}
            >
              Zadat URL
            </button>
          </div>
        </div>

        {imageInputMode === 'file' ? (
          <div>
            <input
              type="file"
              id="image_file"
              name="image_file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <p className="mt-1 text-xs text-slate-500">
              Podporované formáty: JPG, PNG, WebP. Maximální velikost 5 MB.
            </p>
          </div>
        ) : (
          <div>
            <input
              type="url"
              id="image_url"
              name="image_url"
              defaultValue={initialData?.image_url || ''}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm shadow-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Zadejte platnou zabezpečenou URL adresu obrázku (začínající https://).
            </p>
          </div>
        )}

        {previewUrl && (
          <div className="mt-3">
            <p className="text-xs text-slate-600 mb-1">Náhled obrázku:</p>
            <div className="relative w-36 h-36 rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Náhled"
                className="w-full h-full object-cover"
                onError={() => setError('Obrázek zadané URL nelze načíst.')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tlačítka pro odeslání */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
        <Link
          href={isEditing && initialData ? `/inzerat/${initialData.id}` : '/dashboard'}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Zrušit
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-xs text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Ukládám inzerát...
            </>
          ) : isEditing ? (
            'Uložit změny'
          ) : (
            'Zveřejnit inzerát'
          )}
        </button>
      </div>
    </form>
  );
}
