import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenCookieSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCookieSettings }) => {
  return (
    <footer className="bg-[#050811] border-t border-slate-800/80 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <Link
              to="/"
              className="font-display text-xl font-bold tracking-tight text-white inline-block"
            >
              NEXORA TECH
            </Link>
            <p className="text-sm text-cyan-400 font-medium">
              Tecnologia que acompanha você.
            </p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Loja virtual demonstrativa de eletrônicos e acessórios com foco em usabilidade,
              arquitetura front-end responsiva, boas práticas de SEO e preparação para meios
              de pagamento e mensuração analítica.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 tracking-wide mb-3">
              Navegação
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="hover:text-cyan-400 transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link to="/carrinho" className="hover:text-cyan-400 transition-colors">
                  Carrinho de Compras
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-cyan-400 transition-colors">
                  Checkout Demonstrativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Column */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 tracking-wide mb-3">
              Institucional e Projeto
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/sobre" className="hover:text-cyan-400 transition-colors">
                  Sobre a Nexora Tech
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-cyan-400 transition-colors">
                  Atendimento Demonstrativo
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCookieSettings}
                  className="hover:text-cyan-400 transition-colors text-left cursor-pointer"
                >
                  Configurar Cookies / GA4
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Academic Disclaimer Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-200 font-medium text-center sm:text-left bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-lg">
            Projeto acadêmico demonstrativo — SENAI. Produtos, preços e pedidos fictícios.
          </p>
          <p className="text-slate-500 text-center sm:text-right">
            © {new Date().getFullYear()} NEXORA TECH. Ambiente exclusivo para fins educacionais.
          </p>
        </div>
      </div>
    </footer>
  );
};
