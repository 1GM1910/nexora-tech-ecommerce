import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Página não encontrada (404) — NEXORA TECH';
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
      <p className="text-xs font-mono-num text-cyan-400 font-semibold tracking-wider">
        ERRO 404 · ROTA INEXISTENTE
      </p>
      <h1 className="text-3xl sm:text-5xl font-bold text-white">
        Página não encontrada
      </h1>
      <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed">
        O endereço que você tentou acessar não existe ou foi movido dentro da loja
        demonstrativa NEXORA TECH.
      </p>
      <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Voltar para o Início</span>
        </Link>
        <Link
          to="/catalogo"
          className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white transition-colors"
        >
          Explorar Catálogo
        </Link>
      </div>
    </div>
  );
};
