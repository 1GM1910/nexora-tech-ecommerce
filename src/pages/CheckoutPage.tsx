import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrencyBRL } from '../data/products';
import { DemoOrderReceipt } from '../types/product';
import { StripeTestCheckoutModule } from '../components/StripeTestCheckoutModule';
import { trackBeginCheckout } from '../utils/analytics';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, shippingCost, total, clearCart } = useCart();
  const [completedReceipt, setCompletedReceipt] = useState<DemoOrderReceipt | null>(null);

  useEffect(() => {
    document.title = 'Checkout Demonstrativo — NEXORA TECH';
    if (items.length > 0 && !completedReceipt) {
      trackBeginCheckout(items, total);
    }
  }, []);

  const handleOrderSimulated = (receipt: DemoOrderReceipt) => {
    setCompletedReceipt(receipt);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (completedReceipt) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-cyan-400" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-mono-num text-amber-400 font-semibold">
                SIMULAÇÃO DE PEDIDO REGISTRADA · SEM COBRANÇA REAL
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Resumo da Demonstração #{completedReceipt.orderId}
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Este comprovante é exclusivamente acadêmico (SENAI). Nenhum pagamento real foi processado e nenhum produto físico será enviado.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#070B14] border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Cliente (Fictício / Teste):</span>
              <strong className="text-white text-sm">{completedReceipt.customer.fullName}</strong>
              <span className="block text-slate-400 mt-0.5">{completedReceipt.customer.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Endereço informado:</span>
              <strong className="text-white">
                {completedReceipt.customer.address}
              </strong>
              <span className="block text-slate-400 mt-0.5">
                {completedReceipt.customer.city} - {completedReceipt.customer.state.toUpperCase()} · CEP{' '}
                {completedReceipt.customer.postalCode}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">
              Itens incluídos na simulação
            </h2>
            <div className="divide-y divide-slate-800 border-y border-slate-800">
              {completedReceipt.items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium text-white">{product.name}</span>
                    <span className="text-xs text-slate-400 font-mono-num ml-2">
                      ({quantity}x {formatCurrencyBRL(product.price)})
                    </span>
                  </div>
                  <span className="font-mono-num font-semibold text-white">
                    {formatCurrencyBRL(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono-num">{formatCurrencyBRL(completedReceipt.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Frete demonstrativo</span>
              <span className="font-mono-num">
                {completedReceipt.shipping === 0
                  ? 'Grátis'
                  : formatCurrencyBRL(completedReceipt.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
              <span>Total Simulado</span>
              <span className="text-cyan-400 font-mono-num">
                {formatCurrencyBRL(completedReceipt.total)}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
            <Link
              to="/catalogo"
              className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors"
            >
              Voltar ao Catálogo
            </Link>
            <Link
              to="/"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Ir para a Página Inicial →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6 text-slate-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          Adicione produtos antes de acessar o checkout
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Seu carrinho está vazio no momento. Escolha itens no catálogo para testar o fluxo de checkout demonstrativo.
        </p>
        <div>
          <Link
            to="/catalogo"
            className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors inline-flex items-center gap-2"
          >
            <span>Ver Catálogo</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div>
        <Link
          to="/carrinho"
          className="text-xs font-medium text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1.5 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Voltar para o carrinho</span>
        </Link>
        <h1 className="text-3xl font-bold text-white">Checkout Demonstrativo</h1>
        <p className="text-sm text-slate-400 mt-1">
          Etapa final de simulação de pedido do projeto NEXORA TECH — SENAI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <StripeTestCheckoutModule
            items={items}
            subtotal={subtotal}
            shipping={shippingCost}
            total={total}
            onCompleteDemoOrder={handleOrderSimulated}
          />
        </div>

        {/* Order Summary Column */}
        <aside className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">
            Resumo dos Itens ({items.reduce((acc, i) => acc + i.quantity, 0)})
          </h2>

          <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{product.name}</p>
                  <p className="text-xs text-slate-400 font-mono-num">
                    {quantity}x {formatCurrencyBRL(product.price)} · {product.id}
                  </p>
                </div>
                <span className="text-sm font-semibold text-white font-mono-num shrink-0">
                  {formatCurrencyBRL(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span className="font-mono-num">{formatCurrencyBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Frete demonstrativo</span>
              <span className="font-mono-num">
                {shippingCost === 0 ? (
                  <span className="text-emerald-400">Grátis</span>
                ) : (
                  formatCurrencyBRL(shippingCost)
                )}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-slate-800">
              <span>Total do Pedido</span>
              <span className="text-cyan-400 font-mono-num">{formatCurrencyBRL(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
