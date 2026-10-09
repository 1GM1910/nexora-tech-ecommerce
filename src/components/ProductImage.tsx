import React, { useState, useEffect } from 'react';
import { Headphones, Smartphone, Watch, Cable, Package } from 'lucide-react';
import { ProductCategory } from '../types/product';

interface ProductImageProps {
  src: string;
  alt: string;
  category?: ProductCategory;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category,
  className = 'w-full h-full object-contain bg-[#090E1A]',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const renderFallbackIcon = () => {
    switch (category) {
      case 'Áudio':
        return <Headphones className="w-10 h-10 text-cyan-400/70" aria-hidden="true" />;
      case 'Smartphones':
        return <Smartphone className="w-10 h-10 text-cyan-400/70" aria-hidden="true" />;
      case 'Wearables':
        return <Watch className="w-10 h-10 text-cyan-400/70" aria-hidden="true" />;
      case 'Acessórios':
        return <Cable className="w-10 h-10 text-cyan-400/70" aria-hidden="true" />;
      default:
        return <Package className="w-10 h-10 text-cyan-400/70" aria-hidden="true" />;
    }
  };

  if (hasError || !src) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-[#0F172A] via-[#0B1222] to-[#070B14] flex flex-col items-center justify-center p-6 text-center select-none"
        role="img"
        aria-label={alt}
      >
        <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-3">
          {renderFallbackIcon()}
        </div>
        <span className="text-xs font-medium text-slate-400 max-w-[20ch] line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
