import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrencyBRL } from '../data/products';
import { ProductImage } from './ProductImage';

export const CartDrawer: React.FC = () => {
  const {
    items,
    totalItemsCount,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0B1120] border-l border-slate-800 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-cyan-400" aria-hidden="true" />
              <h2 id="cart-drawer-title" className="text-base font-semibold text-white">
                Seu Carrinho ({totalItemsCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
              aria-label="Fechar painel do carrinho"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-800/80">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-slate-500" aria-hidden="true" />
                </div>
                <p className="text-base font-medium text-slate-200 mb-1">
                  Seu carrinho está vazio
                </p>
                <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
                  Explore o catálogo demonstrativo da Nexora Tech e adicione produtos para simular seu pedido.
                </p>
                <Link
                  to="/catalogo"
                  onClick={closeDrawer}
                  className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors"
                >
                  Explorar Catálogo
                </Link>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const isAtMaxStock = quantity >= product.stock;
                return (
                  <div key={product.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <Link
                      to={`/produto/${product.id}`}
                      onClick={closeDrawer}
                      className="w-20 h-20 rounded-lg bg-[#070B14] border border-slate-800 overflow-hidden shrink-0"
                    >
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        category={product.category}
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/produto/${product.id}`}
                          onClick={closeDrawer}
                          className="text-sm font-semibold text-slate-100 hover:text-cyan-400 transition-colors truncate"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                          aria-label={`Remover ${product.name} do carrinho`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 font-mono-num mt-0.5">
                        {formatCurrencyBRL(product.price)} un.
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg bg-slate-900 border border-slate-800">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            aria-label={`Diminuir quantidade de ${product.name}`}
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <span className="px-2.5 text-xs font-mono-num font-semibold text-white">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            disabled={isAtMaxStock}
                            className={`p-1.5 transition-colors ${
                              isAtMaxStock
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-300 hover:text-white cursor-pointer'
                            }`}
                            aria-label={`Aumentar quantidade de ${product.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-white font-mono-num">
                          {formatCurrencyBRL(product.price * quantity)}
                        </span>
                      </div>

                      {isAtMaxStock && (
                        <p className="mt-1.5 text-[11px] text-amber-400">
                          Limite máximo do estoque ({product.stock} un.)
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 bg-[#070B14] border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Subtotal</span>
                <span className="text-lg font-bold text-white font-mono-num">
                  {formatCurrencyBRL(subtotal)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Frete demonstrativo calculado na etapa de revisão e checkout.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/carrinho"
                  onClick={closeDrawer}
                  className="py-2.5 px-4 rounded-lg text-xs font-semibold text-center bg-slate-900 border border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white transition-colors whitespace-nowrap"
                >
                  Ver Carrinho
                </Link>
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="py-2.5 px-4 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
