import { Product, CartItem } from '../types/product';

/**
 * Google Analytics 4 Centralized Helper (NEXORA TECH — Projeto SENAI)
 *
 * Regras atendidas:
 * - Só envia eventos quando existir um ID GA4 válido (formato G-XXXXXXXXXX) E consentimento ativo.
 * - Prepara eventos padrão de e-commerce: view_item_list, select_item, view_item, add_to_cart, remove_from_cart, begin_checkout.
 * - Não envia dados pessoais (PII) ou informações sensíveis.
 * - Não duplica page_view (controla a última rota enviada).
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_STORAGE_KEY = 'nexora_cookie_consent_v1';
const CUSTOM_GA_ID_STORAGE_KEY = 'nexora_custom_ga4_id';

export type CookieConsentStatus = 'accepted' | 'declined' | 'pending';

let scriptInjectedForId: string | null = null;
let lastTrackedPagePath: string | null = null;

/**
 * Valida se o ID segue o formato oficial do Google Analytics 4 (G- seguido de caracteres alfanuméricos).
 */
export function isValidGA4Id(id?: string | null): boolean {
  if (!id) return false;
  const trimmed = id.trim();
  return /^G-[A-Z0-9]{6,15}$/i.test(trimmed);
}

/**
 * Obtém o ID GA4 configurado via variável de ambiente VITE_GA_MEASUREMENT_ID
 * ou configurado em modo de demonstração acadêmica pelo avaliador.
 */
export function getConfiguredGA4Id(): string {
  const envId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  if (isValidGA4Id(envId)) {
    return envId!.trim().toUpperCase();
  }
  try {
    const savedId = localStorage.getItem(CUSTOM_GA_ID_STORAGE_KEY);
    if (isValidGA4Id(savedId)) {
      return savedId!.trim().toUpperCase();
    }
  } catch {
    // Ignorar falhas de acesso ao localStorage em modo restrito
  }
  return '';
}

export function setCustomGA4Id(id: string): void {
  try {
    const clean = id.trim().toUpperCase();
    if (!clean) {
      localStorage.removeItem(CUSTOM_GA_ID_STORAGE_KEY);
    } else if (isValidGA4Id(clean)) {
      localStorage.setItem(CUSTOM_GA_ID_STORAGE_KEY, clean);
      initializeGA4IfAllowed();
    }
  } catch {
    // Ignorar erro de storage
  }
}

export function getCookieConsent(): CookieConsentStatus {
  try {
    const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (saved === 'accepted' || saved === 'declined') {
      return saved;
    }
  } catch {
    // Ignorar erro de storage
  }
  return 'pending';
}

export function setCookieConsent(status: 'accepted' | 'declined'): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, status);
  } catch {
    // Ignorar erro de storage
  }
  if (status === 'accepted') {
    initializeGA4IfAllowed();
  }
}

/**
 * Inicializa o script gtag.js apenas se houver consentimento 'accepted' e um ID GA4 válido.
 * send_page_view é desativado na configuração inicial para evitar duplicidade em SPAs.
 */
export function initializeGA4IfAllowed(): boolean {
  if (typeof window === 'undefined') return false;

  const consent = getCookieConsent();
  const measurementId = getConfiguredGA4Id();

  if (consent !== 'accepted' || !isValidGA4Id(measurementId)) {
    return false;
  }

  if (scriptInjectedForId === measurementId && typeof window.gtag === 'function') {
    return true;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    anonymize_ip: true,
  });

  const existingScript = document.getElementById('nexora-ga4-script');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'nexora-ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  scriptInjectedForId = measurementId;
  return true;
}

function canDispatchAnalytics(): boolean {
  return initializeGA4IfAllowed() && typeof window.gtag === 'function';
}

/**
 * Registra visualização de página sem duplicar chamadas consecutivas para o mesmo caminho.
 */
export function trackPageView(path: string, title?: string): void {
  if (!canDispatchAnalytics()) return;
  if (lastTrackedPagePath === path) return;

  lastTrackedPagePath = path;
  window.gtag!('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}

function mapProductToGAItem(product: Product, quantity = 1, index?: number) {
  return {
    item_id: product.id,
    item_name: product.name,
    item_brand: 'Nexora Tech',
    item_category: product.category,
    price: Number(product.price.toFixed(2)),
    quantity,
    ...(typeof index === 'number' ? { index } : {}),
  };
}

/**
 * Evento GA4: view_item_list
 */
export function trackViewItemList(products: Product[], listName = 'Catálogo Nexora Tech'): void {
  if (!canDispatchAnalytics() || products.length === 0) return;

  window.gtag!('event', 'view_item_list', {
    item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
    item_list_name: listName,
    items: products.map((p, idx) => mapProductToGAItem(p, 1, idx)),
  });
}

/**
 * Evento GA4: select_item
 */
export function trackSelectItem(product: Product, listName = 'Catálogo Nexora Tech'): void {
  if (!canDispatchAnalytics()) return;

  window.gtag!('event', 'select_item', {
    item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
    item_list_name: listName,
    items: [mapProductToGAItem(product, 1)],
  });
}

/**
 * Evento GA4: view_item
 */
export function trackViewItem(product: Product): void {
  if (!canDispatchAnalytics()) return;

  window.gtag!('event', 'view_item', {
    currency: 'BRL',
    value: Number(product.price.toFixed(2)),
    items: [mapProductToGAItem(product, 1)],
  });
}

/**
 * Evento GA4: add_to_cart
 */
export function trackAddToCart(product: Product, quantity = 1): void {
  if (!canDispatchAnalytics()) return;

  window.gtag!('event', 'add_to_cart', {
    currency: 'BRL',
    value: Number((product.price * quantity).toFixed(2)),
    items: [mapProductToGAItem(product, quantity)],
  });
}

/**
 * Evento GA4: remove_from_cart
 */
export function trackRemoveFromCart(product: Product, quantity = 1): void {
  if (!canDispatchAnalytics()) return;

  window.gtag!('event', 'remove_from_cart', {
    currency: 'BRL',
    value: Number((product.price * quantity).toFixed(2)),
    items: [mapProductToGAItem(product, quantity)],
  });
}

/**
 * Evento GA4: begin_checkout
 * Nunca inclui nome, e-mail, endereço ou dados pessoais do usuário.
 */
export function trackBeginCheckout(cartItems: CartItem[], totalValue: number): void {
  if (!canDispatchAnalytics() || cartItems.length === 0) return;

  window.gtag!('event', 'begin_checkout', {
    currency: 'BRL',
    value: Number(totalValue.toFixed(2)),
    items: cartItems.map((item, idx) => mapProductToGAItem(item.product, item.quantity, idx)),
  });
}
