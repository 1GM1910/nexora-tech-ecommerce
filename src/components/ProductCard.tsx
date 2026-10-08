import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, AlertCircle } from 'lucide-react';
import { Product } from '../types/product';
import { formatCurrencyBRL } from '../data/products';
import { useCart } from '../context/CartContext';
import { trackSelectItem } from '../utils/analytics';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  listName?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  listName = 'Catálogo Nexora Tech',
}) => {
  const { addToCart, getItemQuantity, openDrawer } = useCart();
  const [feedback, setFeedback] = useState<'idle' | 'added' | 'limit'>('idle');

  const currentInCart = getItemQuantity(product.id);
  const isOutOfStock = product.stock === 0;
  const isMaxReached = !isOutOfStock && currentInCart >= product.stock;

  const handleProductClick = () => {
    trackSelectItem(product, listName);
  };

  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const result = addToCart(product, 1);
    if (result.success) {
      setFeedback('added');
      setTimeout(() => setFeedback('idle'), 1600);
    } else {
      setFeedback('limit');
      openDrawer();
      setTimeout(() => setFeedback('idle'), 2000);
    }
  };

  return (
    <article className="group bg-[#0F172A] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:border-slate-700/90">
      {/* Image Zone - 4:3 Aspect Ratio */}
      <Link
        to={`/produto/${product.id}`}
        onClick={handleProductClick}
        className="relative aspect-[4/3] w-full bg-[#090E1A] overflow-hidden block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <ProductImage
          src={product.image}
          alt={`${product.name} — ${product.category}`}
          category={product.category}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'opacity-50 grayscale-[40%]' : ''
          }`}
        />
      </Link>

      {/* Content Zone */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Clean unboxed metadata with typographic separators (Zero-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">{product.id}</span>
            <span aria-hidden="true">·</span>
            {isOutOfStock ? (
              <span className="text-amber-400 font-medium">Indisponível</span>
            ) : (
              <span className="text-slate-300">{product.stock} em estoque</span>
            )}
          </div>

          <Link
            to={`/produto/${product.id}`}
            onClick={handleProductClick}
            className="block focus-visible:outline-none focus-visible:underline"
          >
            <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1.5 text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Footer: Price & Action */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[11px] text-slate-400">Valor unitário</span>
            <span className="text-base font-semibold text-white font-mono-num">
              {formatCurrencyBRL(product.price)}
            </span>
          </div>

          {isOutOfStock ? (
            <Link
              to={`/produto/${product.id}`}
              onClick={handleProductClick}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              Sem estoque
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isMaxReached && feedback !== 'added'}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                feedback === 'added'
                  ? 'bg-emerald-500 text-slate-950'
                  : isMaxReached
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
              }`}
              aria-label={
                isMaxReached
                  ? `Limite de estoque no carrinho para ${product.name}`
                  : `Adicionar ${product.name} ao carrinho`
              }
            >
              {feedback === 'added' ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Adicionado</span>
                </>
              ) : isMaxReached ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Limite no carrinho</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Adicionar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
