import React, { useState, useEffect } from 'react';
import {
  getCookieConsent,
  setCookieConsent,
  getConfiguredGA4Id,
  setCustomGA4Id,
  isValidGA4Id,
  CookieConsentStatus,
} from '../utils/analytics';
import { SlidersHorizontal, X } from 'lucide-react';

interface CookieConsentBannerProps {
  forceOpenConfig?: boolean;
  onCloseConfig?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  forceOpenConfig = false,
  onCloseConfig,
}) => {
  const [status, setStatus] = useState<CookieConsentStatus>(() => getCookieConsent());
  const [showDetails, setShowDetails] = useState(false);
  const [gaInput, setGaInput] = useState(() => getConfiguredGA4Id());
  const [gaFeedback, setGaFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (forceOpenConfig) {
      setShowDetails(true);
    }
  }, [forceOpenConfig]);

  const isVisible = status === 'pending' || forceOpenConfig;
  if (!isVisible) return null;

  const handleAccept = () => {
    if (gaInput.trim() && isValidGA4Id(gaInput)) {
      setCustomGA4Id(gaInput);
    }
    setCookieConsent('accepted');
    setStatus('accepted');
    onCloseConfig?.();
  };

  const handleDecline = () => {
    setCookieConsent('declined');
    setStatus('declined');
    onCloseConfig?.();
  };

  const handleSaveCustomId = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = gaInput.trim().toUpperCase();
    if (!trimmed) {
      setCustomGA4Id('');
      setGaFeedback('ID GA4 removido. Eventos desativados.');
      return;
    }
    if (!isValidGA4Id(trimmed)) {
      setGaFeedback('Formato inválido. Use o padrão G-XXXXXXXXXX.');
      return;
    }
    setCustomGA4Id(trimmed);
    setGaFeedback(`ID ${trimmed} salvo com sucesso.`);
  };

  return (
    <aside
      aria-label="Preferências de cookies e métricas"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-[#0F172A] border border-slate-700/90 rounded-xl p-4 shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Privacidade, Cookies e Google Analytics 4
          </h2>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Este projeto acadêmico utiliza armazenamento local para persistir seu carrinho e, mediante seu consentimento e um ID GA4 válido configurado, envia métricas anônimas de navegação (<span className="font-mono-num">view_item</span>, <span className="font-mono-num">add_to_cart</span>, <span className="font-mono-num">begin_checkout</span>).
          </p>
        </div>
        {forceOpenConfig && onCloseConfig && (
          <button
            type="button"
            onClick={onCloseConfig}
            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
            aria-label="Fechar configurações de cookies"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDetails && (
        <form onSubmit={handleSaveCustomId} className="mt-3 pt-3 border-t border-slate-800 space-y-2">
          <label htmlFor="ga4-measurement-id" className="block text-xs font-medium text-slate-300">
            ID de Métrica GA4 Opcional (ex: G-1A2B3C4D5E)
          </label>
          <div className="flex gap-2">
            <input
              id="ga4-measurement-id"
              type="text"
              value={gaInput}
              onChange={(e) => {
                setGaInput(e.target.value);
                setGaFeedback(null);
              }}
              placeholder="G-XXXXXXXXXX"
              className="flex-1 bg-[#070B14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono-num focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Validar ID
            </button>
          </div>
          {gaFeedback && (
            <p className="text-[11px] text-cyan-400 font-mono-num">{gaFeedback}</p>
          )}
          <p className="text-[11px] text-slate-400">
            Nenhum dado pessoal (nome, e-mail ou endereço) é enviado ao Google Analytics.
          </p>
        </form>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 py-1.5 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{showDetails ? 'Ocultar opções GA4' : 'Configurar ID GA4'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            Apenas essenciais
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Aceitar métricas
          </button>
        </div>
      </div>
    </aside>
  );
};
