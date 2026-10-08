import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrencyBRL } from '../data/products';
import { ProductImage } from '../components/ProductImage';

export const CartPage: React.FC = () => {
  const {
    items,
    totalItemsCount,
    subtotal,
    shippingCost,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  useEffect(() => {
    document.title = 'Carrinho de Compras — NEXORA TECH';
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7 text-slate-400" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Seu carrinho está vazio
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Você ainda não adicionou nenhum item do catálogo demonstrativo da Nexora Tech.
          </p>
        </div>
        <div>
          <Link
            to="/catalogo"
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors inline-flex items-center gap-2"
          >
            <span>Explorar Produtos</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Carrinho de Compras</h1>
          <p className="text-sm text-slate-400 mt-1">
            Revise as quantidades respeitando o estoque demonstrativo de cada item.
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors self-start sm:self-auto cursor-pointer"
        >
          Esvaziar carrinho
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items Table / List */}
        <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800 rounded-xl divide-y divide-slate-800">
          {items.map(({ product, quantity }) => {
            const isMaxStock = quantity >= product.stock;
            return (
              <div
                key={product.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
              >
                <Link
                  to={`/produto/${product.id}`}
                  className="w-24 h-20 rounded-lg bg-[#070B14] border border-slate-800 overflow-hidden shrink-0"
                >
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    category={product.category}
                  />
                </Link>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{product.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num">{product.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>Estoque máx: {product.stock} un.</span>
                  </div>
                  <Link
                    to={`/produto/${product.id}`}
                    className="text-base font-semibold text-white hover:text-cyan-400 transition-colors block truncate"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-slate-400 font-mono-num">
                    Unitário: {formatCurrencyBRL(product.price)}
                  </p>
                </div>

                {/* Stepper & Item Total */}
                <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-lg bg-[#070B14] border border-slate-700">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        aria-label={`Diminuir quantidade de ${product.name}`}
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <span className="px-3 text-xs font-mono-num font-semibold text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={isMaxStock}
                        className="p-2 text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label={`Aumentar quantidade de ${product.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      aria-label={`Remover ${product.name}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-white font-mono-num">
                      {formatCurrencyBRL(product.price * quantity)}
                    </span>
                    {isMaxStock && (
                      <span className="block text-[11px] text-amber-400">
                        Limite do estoque ({product.stock} un.)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Resumo do Pedido</h2>

          <div className="space-y-3 text-sm border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between text-slate-300">
              <span>Itens ({totalItemsCount})</span>
              <span className="font-mono-num">{formatCurrencyBRL(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Frete estimado (Simulação)</span>
              <span className="font-mono-num">
                {shippingCost === 0 ? (
                  <span className="text-emerald-400 font-medium">Grátis</span>
                ) : (
                  formatCurrencyBRL(shippingCost)
                )}
              </span>
            </div>
            {shippingCost > 0 && (
              <p className="text-[11px] text-slate-400">
                Frete demonstrativo gratuito em compras acima de R$ 199,00.
              </p>
            )}
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold text-white">Total</span>
            <span className="text-2xl font-bold text-cyan-400 font-mono-num">
              {formatCurrencyBRL(total)}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/checkout"
              className="w-full py-3.5 px-5 rounded-lg text-sm font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Avançar para o Checkout</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            <Link
              to="/catalogo"
              className="w-full py-2.5 px-5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Continuar Comprando</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
