import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Sobre a Loja — NEXORA TECH';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
          <span>Institucional Fictício</span>
          <span aria-hidden="true">·</span>
          <span>Projeto Final de E-commerce — SENAI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          NEXORA TECH — Tecnologia que acompanha você
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          A NEXORA TECH é uma marca conceitual de eletrônicos e acessórios tecnológicos criada
          especialmente como projeto demonstrativo para o curso de E-commerce do SENAI.
        </p>
      </div>

      {/* Academic Notice Highlight */}
      <div className="bg-[#0F172A] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shrink-0">
          <GraduationCap className="w-6 h-6 text-cyan-400" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-white">
            Aviso de Projeto Acadêmico Demonstrativo
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Todos os produtos, códigos (<span className="font-mono-num">PRD-001</span> a{' '}
            <span className="font-mono-num">PRD-008</span>), preços, saldos de estoque e
            protocolos de pedido exibidos nesta aplicação são estritamente fictícios e
            destinados à avaliação acadêmica. Nenhuma transação comercial ou cobrança
            financeira é realizada neste ambiente.
          </p>
        </div>
      </div>

      {/* Story & Technical Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">Conceito da Marca</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Inspirada em marcas de tecnologia minimalistas, a identidade visual da Nexora Tech
            combina tons profundos de azul escuro e preto com pontos focais em ciano, priorizando
            contraste elevado, tipografia legível e navegação direta em celulares, tablets e
            computadores.
          </p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">Requisitos Técnicos Aplicados</h2>
          <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
            <li>Catálogo tipado em TypeScript com controle de estoque local</li>
            <li>Persistência do carrinho via <code className="text-cyan-400">localStorage</code></li>
            <li>Busca por texto, filtro por categoria/estoque e ordenação por preço</li>
            <li>Módulo isolado de checkout demonstrativo (preparado para Stripe Test Mode)</li>
            <li>Integração centralizada de eventos Google Analytics 4 com consentimento</li>
          </ul>
        </div>
      </div>

      <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
        <Link
          to="/catalogo"
          className="px-5 py-3 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors inline-flex items-center gap-2"
        >
          <span>Explorar o Catálogo</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <Link
          to="/contato"
          className="text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
        >
          Acessar formulário demonstrativo de contato →
        </Link>
      </div>
    </div>
  );
};
