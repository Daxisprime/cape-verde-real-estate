'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Cookie, ChevronDown, ChevronUp } from 'lucide-react';

const CONSENT_KEY = 'procv_cookie_consent';
const CONSENT_EXPIRY_DAYS = 365;

export type ConsentCategories = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

type ConsentState = {
  categories: ConsentCategories;
  timestamp: number;
};

function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed: ConsentState = JSON.parse(raw);
    const daysSince = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSince > CONSENT_EXPIRY_DAYS) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(categories: ConsentCategories) {
  const state: ConsentState = { categories, timestamp: Date.now() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('cookie-consent-update', { detail: categories }));
}

export function getConsent(): ConsentCategories | null {
  const stored = getStoredConsent();
  return stored?.categories ?? null;
}

export function hasConsent(category: keyof ConsentCategories): boolean {
  const consent = getConsent();
  if (!consent) return false;
  return consent[category];
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [categories, setCategories] = useState<ConsentCategories>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for external "open cookie settings" events
  useEffect(() => {
    const handler = () => {
      const stored = getStoredConsent();
      if (stored) {
        setCategories(stored.categories);
      }
      setShowPreferences(true);
      setVisible(true);
    };
    window.addEventListener('open-cookie-settings', handler);
    return () => window.removeEventListener('open-cookie-settings', handler);
  }, []);

  const handleAcceptAll = useCallback(() => {
    const all: ConsentCategories = { necessary: true, analytics: true, marketing: true, preferences: true };
    saveConsent(all);
    setVisible(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    const minimal: ConsentCategories = { necessary: true, analytics: false, marketing: false, preferences: false };
    saveConsent(minimal);
    setVisible(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    saveConsent(categories);
    setVisible(false);
  }, [categories]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] p-4 sm:p-6 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <Cookie className="h-4 w-4 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900">Utilizamos Cookies</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento do site e cookies opcionais para melhorar a sua experiencia.
                Consulte a nossa{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Politica de Privacidade</Link>{' '}
                e a{' '}
                <Link href="/cookies" className="text-blue-600 hover:underline font-medium">Politica de Cookies</Link>.
              </p>
            </div>
            <button
              onClick={handleRejectAll}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Preferences Panel */}
          {showPreferences && (
            <div className="px-5 pb-3 border-t border-gray-100 pt-3">
              <div className="space-y-2.5">
                <label className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-800">Essenciais</span>
                    <span className="text-[10px] text-gray-500 ml-2">Sempre ativos</span>
                  </div>
                  <div className="w-9 h-5 bg-blue-600 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 group-hover:text-gray-900">Analiticos</span>
                    <p className="text-[10px] text-gray-500 leading-tight">Ajudam-nos a perceber como usa o site</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategories(c => ({ ...c, analytics: !c.analytics }))}
                    className={`w-9 h-5 rounded-full relative transition-colors ${categories.analytics ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${categories.analytics ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 group-hover:text-gray-900">Marketing</span>
                    <p className="text-[10px] text-gray-500 leading-tight">Anuncios personalizados e redes sociais</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategories(c => ({ ...c, marketing: !c.marketing }))}
                    className={`w-9 h-5 rounded-full relative transition-colors ${categories.marketing ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${categories.marketing ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 group-hover:text-gray-900">Preferencias</span>
                    <p className="text-[10px] text-gray-500 leading-tight">Lembrar idioma e configuracoes</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategories(c => ({ ...c, preferences: !c.preferences }))}
                    className={`w-9 h-5 rounded-full relative transition-colors ${categories.preferences ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${categories.preferences ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-5 pb-5 pt-2 flex flex-wrap items-center gap-2">
            {!showPreferences ? (
              <>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Aceitar Todos
                </button>
                <button
                  onClick={handleRejectAll}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Rejeitar
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="flex items-center gap-1 px-3 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Preferencias
                  <ChevronDown className="h-3 w-3" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Guardar Preferencias
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Aceitar Todos
                </button>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="flex items-center gap-1 px-3 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
