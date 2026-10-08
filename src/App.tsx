/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { initializeGA4IfAllowed, trackPageView } from './utils/analytics';

const RouteAnalyticsAndScroll: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const fullPath = location.pathname + location.search;
    // Pequeno atraso para garantir que document.title da página já foi atualizado
    const timer = setTimeout(() => {
      trackPageView(fullPath, document.title);
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
};

export default function App() {
  const [forceCookieModal, setForceCookieModal] = useState(false);

  useEffect(() => {
    initializeGA4IfAllowed();
  }, []);

  return (
    <BrowserRouter>
      <CartProvider>
        <RouteAnalyticsAndScroll />
        <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100">
          <Navbar />
          <CartDrawer />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/produto/:id" element={<ProductDetailPage />} />
              <Route path="/carrinho" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/contato" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer onOpenCookieSettings={() => setForceCookieModal(true)} />
          <CookieConsentBanner
            forceOpenConfig={forceCookieModal}
            onCloseConfig={() => setForceCookieModal(false)}
          />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

