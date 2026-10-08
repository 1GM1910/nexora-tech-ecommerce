import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  AlertCircle,
} from 'lucide-react';
import { PRODUCTS, formatCurrencyBRL } from '../data/products';
import { useCart } from '../context/CartContext';
import { ProductImage } from '../components/ProductImage';
import { ProductCard } from '../components/ProductCard';
import { trackViewItem } from '../utils/analytics';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCTS.find((p) => p.id === id);

  const { addToCart, getItemQuantity, openDrawer } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const currentInCart = product ? getItemQuantity(product.id) : 0;
  const remainingAddable = product ? Math.max(0, product.stock - currentInCart) : 0;

  useEffect(() => {
    setSelectedQty(1);
    setStatusMessage(null);

    if (product) {
      document.title = `${product.name} — NEXORA TECH`;
      trackViewItem(product);
    } else {
      document.title = 'Produto não encontrado — NEXORA TECH';
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-5">
        <p className="text-xs font-mono-num text-cyan-400">ERRO 404 · ITEM NÃO LOCALIZADO</p>
        <h1 className="text-3xl font-bold text-white">Produto não encontrado</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          O código de produto informado não consta no catálogo demonstrativo da Nexora Tech.
        </p>
        <div className="pt-2">
          <Link
            to="/catalogo"
            className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Voltar para o Catálogo</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  const handleDecrease = () => {
    setSelectedQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    if (selectedQty < remainingAddable) {
      setSelectedQty((prev) => prev + 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const result = addToCart(product, selectedQty);
    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setSelectedQty(1);
      openDrawer();
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Navegação estrutural" className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/catalogo" className="hover:text-cyan-400 inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Catálogo</span>
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to={`/catalogo?categoria=${encodeURIComponent(product.category)}`}
          className="hover:text-cyan-400 transition-colors"
        >
          {product.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-200 font-mono-num">{product.id}</span>
      </nav>

      {/* Main Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left: Product Gallery */}
        <div className="lg:col-span-7">
          <div className="aspect-[4/3] w-full rounded-2xl bg-[#090E1A] border border-slate-800 overflow-hidden">
            <ProductImage
              src={product.image}
              alt={`${product.name} — ${product.category}`}
              category={product.category}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            {/* Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">Código {product.id}</span>
              <span aria-hidden="true">·</span>
              {isOutOfStock ? (
                <span className="text-amber-400 font-semibold">Produto indisponível</span>
              ) : (
                <span className="text-emerald-400 font-medium">
                  {product.stock} {product.stock === 1 ? 'unidade em estoque' : 'unidades em estoque'}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {product.name}
            </h1>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Preço demonstrativo</span>
                <span className="text-3xl font-bold text-white font-mono-num">
                  {formatCurrencyBRL(product.price)}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono-num">
                Estoque: {product.stock} un.
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Product Highlights */}
          <div className="space-y-2 pt-2">
            <h2 className="text-xs font-semibold text-slate-200">
              Características principais:
            </h2>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              {product.highlights.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Availability & Purchase Controls */}
          <div className="pt-5 border-t border-slate-800 space-y-4">
            {isOutOfStock ? (
              <div
                role="alert"
                className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs text-amber-200 leading-relaxed">
                  <p className="font-semibold text-amber-300">
                    Produto indisponível no momento (Estoque: 0)
                  </p>
                  <p className="mt-1">
                    Este item encontra-se com saldo zero no catálogo demonstrativo e não pode ser adicionado ao carrinho.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <label htmlFor="qty-stepper" className="block text-xs font-medium text-slate-300">
                      Quantidade
                    </label>
                    {currentInCart > 0 && (
                      <p className="text-[11px] text-cyan-400 font-mono-num">
                        Você já possui {currentInCart} un. no carrinho
                      </p>
                    )}
                  </div>

                  <div
                    id="qty-stepper"
                    className="inline-flex items-center rounded-lg bg-[#070B14] border border-slate-700"
                  >
                    <button
                      type="button"
                      onClick={handleDecrease}
                      disabled={selectedQty <= 1 || remainingAddable === 0}
                      className="p-2.5 text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <span className="px-4 text-sm font-mono-num font-semibold text-white">
                      {remainingAddable === 0 ? 0 : selectedQty}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrease}
                      disabled={selectedQty >= remainingAddable}
                      className="p-2.5 text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={remainingAddable === 0}
                  className={`w-full py-3.5 px-6 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                    remainingAddable === 0
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {remainingAddable === 0
                      ? `Limite de estoque atingido no carrinho (${product.stock} un.)`
                      : `Adicionar ao Carrinho · ${formatCurrencyBRL(
                          product.price * selectedQty
                        )}`}
                  </span>
                </button>
              </>
            )}

            {statusMessage && (
              <div
                role="status"
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
            Nota acadêmica: Produto e valores meramente ilustrativos para demonstração de fluxo de e-commerce no curso do SENAI.
          </p>
        </div>
      </div>

      {/* Related Products in same Category */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Mais itens em {product.category}
            </h2>
            <Link
              to={`/catalogo?categoria=${encodeURIComponent(product.category)}`}
              className="text-xs font-semibold text-cyan-400 hover:underline"
            >
              Ver categoria completa →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                listName={`Relacionados - ${product.category}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
