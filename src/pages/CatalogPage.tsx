import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, RotateCcw } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { ProductCategory, SortOption, AvailabilityFilter } from '../types/product';
import { ProductCard } from '../components/ProductCard';
import { trackViewItemList } from '../utils/analytics';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('categoria') as ProductCategory | null;
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Todas'>(
    initialCategory && CATEGORIES.some((c) => c.name === initialCategory)
      ? initialCategory
      : 'Todas'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('busca') || '');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');

  useEffect(() => {
    document.title = 'Catálogo de Produtos — NEXORA TECH';
  }, []);

  // Sincroniza quando o parâmetro de URL mudar externamente
  useEffect(() => {
    const paramCat = searchParams.get('categoria') as ProductCategory | null;
    if (paramCat && CATEGORIES.some((c) => c.name === paramCat)) {
      setSelectedCategory(paramCat);
    } else if (!paramCat) {
      setSelectedCategory('Todas');
    }
  }, [searchParams]);

  const handleCategoryChange = (category: ProductCategory | 'Todas') => {
    setSelectedCategory(category);
    const nextParams = new URLSearchParams(searchParams);
    if (category === 'Todas') {
      nextParams.delete('categoria');
    } else {
      nextParams.set('categoria', category);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const filteredAndSortedProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Filtro de categoria
      if (selectedCategory !== 'Todas' && product.category !== selectedCategory) {
        return false;
      }

      // Filtro de disponibilidade
      if (availability === 'in-stock' && product.stock <= 0) {
        return false;
      }
      if (availability === 'out-of-stock' && product.stock > 0) {
        return false;
      }

      // Busca textual (nome, código ou descrição curta)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(q);
        const matchId = product.id.toLowerCase().includes(q);
        const matchCategory = product.category.toLowerCase().includes(q);
        return matchName || matchId || matchCategory;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'pt-BR');
      // 'featured': destaca disponíveis e featured primeiro
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.id.localeCompare(b.id);
    });
  }, [selectedCategory, availability, searchQuery, sortBy]);

  useEffect(() => {
    trackViewItemList(
      filteredAndSortedProducts,
      selectedCategory === 'Todas' ? 'Catálogo Geral' : `Categoria: ${selectedCategory}`
    );
  }, [selectedCategory]);

  const handleResetFilters = () => {
    setSelectedCategory('Todas');
    setSearchQuery('');
    setSortBy('featured');
    setAvailability('all');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    selectedCategory !== 'Todas' ||
    searchQuery.trim() !== '' ||
    availability !== 'all' ||
    sortBy !== 'featured';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium mb-1">
            <span>Catálogo Demonstrativo</span>
            <span aria-hidden="true">·</span>
            <span>Preços e estoques fictícios</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Dispositivos e Acessórios
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 font-mono-num">
          Exibindo <strong className="text-white">{filteredAndSortedProducts.length}</strong> de{' '}
          {PRODUCTS.length} produtos
        </p>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <label htmlFor="catalog-search" className="sr-only">
              Buscar produto por nome ou código
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="catalog-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou código (ex: Nova X, PRD-001)..."
              className="w-full bg-[#070B14] border border-slate-700 rounded-lg pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Availability Filter */}
          <div className="md:col-span-3">
            <label htmlFor="availability-select" className="sr-only">
              Filtrar por disponibilidade
            </label>
            <select
              id="availability-select"
              value={availability}
              onChange={(e) => setAvailability(e.target.value as AvailabilityFilter)}
              className="w-full bg-[#070B14] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
            >
              <option value="all">Disponibilidade: Todos</option>
              <option value="in-stock">Apenas disponíveis em estoque</option>
              <option value="out-of-stock">Indisponíveis (Sem estoque)</option>
            </select>
          </div>

          {/* Sort By Select */}
          <div className="md:col-span-4">
            <label htmlFor="sort-select" className="sr-only">
              Ordenar produtos
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-[#070B14] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
            >
              <option value="featured">Ordenar: Relevância / Destaques</option>
              <option value="price-asc">Preço: Menor para Maior</option>
              <option value="price-desc">Preço: Maior para Menor</option>
              <option value="name-asc">Ordem Alfabética (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Interactive Category Tabs (Functional Segmented Buttons) */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filtrar por categoria"
            className="flex flex-wrap items-center gap-1.5 bg-[#070B14] p-1.5 rounded-lg border border-slate-800"
          >
            {(['Todas', ...CATEGORIES.map((c) => c.name)] as const).map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-400 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-medium text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1.5 py-1 px-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-12 text-center max-w-lg mx-auto my-8 space-y-4">
          <p className="text-lg font-semibold text-white">
            Nenhum produto encontrado com esses filtros
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Não encontramos itens correspondentes à sua busca "{searchQuery}" na seleção atual.
            Experimente redefinir os filtros para visualizar todo o catálogo demonstrativo.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors cursor-pointer"
          >
            Mostrar todos os produtos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              listName={`Catálogo - ${selectedCategory}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
