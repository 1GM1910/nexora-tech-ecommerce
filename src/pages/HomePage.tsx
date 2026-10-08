import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS, CATEGORIES, HERO_IMAGE_PATH } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { trackViewItemList } from '../utils/analytics';

export const HomePage: React.FC = () => {
  const featuredProducts = PRODUCTS.filter((p) => p.featured);

  useEffect(() => {
    document.title = 'NEXORA TECH — Tecnologia que acompanha você';
    trackViewItemList(featuredProducts, 'Destaques da Home');
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Section 1: Storefront Hero */}
      <section className="relative bg-[#050811] border-b border-slate-800/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
                <span>NEXORA TECH</span>
                <span aria-hidden="true">·</span>
                <span>Coleção Demonstrativa SENAI</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12]">
                Tecnologia que acompanha você em cada momento.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Dispositivos de áudio, smartphones, wearables e acessórios essenciais com design
                minimalista e acabamento escuro. Explore nossa vitrine interativa desenvolvida
                para o curso de E-commerce do SENAI.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/catalogo"
                  className="px-6 py-3.5 rounded-lg text-sm font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <Link
                  to="/sobre"
                  className="px-6 py-3.5 rounded-lg text-sm font-semibold bg-slate-900 border border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white transition-colors whitespace-nowrap"
                >
                  Conhecer o Projeto
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <span className="block text-xl font-bold text-white font-mono-num">8</span>
                  <span className="text-xs text-slate-400">Itens no catálogo</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-white font-mono-num">4</span>
                  <span className="text-xs text-slate-400">Categorias</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-cyan-400 font-mono-num">100%</span>
                  <span className="text-xs text-slate-400">Fluxo interativo</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800 bg-[#0B1120] shadow-2xl">
                <ProductImage
                  src={HERO_IMAGE_PATH}
                  alt="Ecossistema de dispositivos Nexora Tech: smartphone, fone sem fio e smartwatch em superfície de pedra escura"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070B14]/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200 bg-[#070B14]/85 backdrop-blur-md border border-slate-800/90 rounded-lg px-4 py-2.5">
                  <span>Ecossistema Nexora — Áudio, Smartphones e Wearables</span>
                  <Link
                    to="/produto/PRD-002"
                    className="text-cyan-400 font-semibold hover:underline whitespace-nowrap ml-3"
                  >
                    Ver Smartphone Nova X →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Categories & Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Category Navigation Strip */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Navegue por Categoria
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Filtre rapidamente os produtos demonstrativos de acordo com a sua necessidade.
              </p>
            </div>
            <Link
              to="/catalogo"
              className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Ver todos os 8 produtos</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const count = PRODUCTS.filter((p) => p.category === cat.name).length;
              return (
                <Link
                  key={cat.name}
                  to={`/catalogo?categoria=${encodeURIComponent(cat.name)}`}
                  className="group p-5 rounded-xl bg-[#0F172A] border border-slate-800/90 hover:border-cyan-400/60 transition-colors flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-xs font-mono-num text-slate-400">
                        {count} {count === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    <span>Filtrar categoria</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Featured Products Grid */}
        <div className="pt-8 border-t border-slate-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Produtos em Destaque
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Seleção principal do catálogo demonstrativo com controle de estoque em tempo real.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                listName="Destaques da Home"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Store Benefits & Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 sm:p-12 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Arquitetura pensada para uma experiência transparente
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Cada etapa da NEXORA TECH foi estruturada para demonstrar boas práticas de um
              e-commerce moderno: clareza de informações, respeito ao limite de estoque e
              checkout preparado para integração segura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <span className="text-xs font-mono-num text-cyan-400 font-semibold">
                01. Estoque Demonstrativo Realista
              </span>
              <h3 className="text-base font-semibold text-white">
                Validação automática de disponibilidade
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                O carrinho respeita a quantidade exata disponível de cada produto e sinaliza
                claramente itens esgotados (como o Smart Tag Localizador com estoque zero).
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono-num text-cyan-400 font-semibold">
                02. Persistência e Desempenho
              </span>
              <h3 className="text-base font-semibold text-white">
                Carrinho salvo no navegador
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seus itens permanecem salvos no <code className="text-slate-300">localStorage</code>{' '}
                mesmo ao recarregar a página, com atualização instantânea de subtotais.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono-num text-cyan-400 font-semibold">
                03. Checkout & GA4 Preparados
              </span>
              <h3 className="text-base font-semibold text-white">
                Segurança e privacidade desde o código
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Módulo de checkout separado para futura integração com Stripe Checkout e eventos
                GA4 que só disparam com ID válido e sem envio de dados pessoais.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-300">
              Pronto para testar todos os filtros, ordenação por preço e simulação de pedido?
            </p>
            <Link
              to="/catalogo"
              className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span>Acessar Catálogo Completo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
