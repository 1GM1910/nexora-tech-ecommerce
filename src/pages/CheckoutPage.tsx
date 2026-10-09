import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  AlertTriangle,
  Loader2,
  XCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrencyBRL } from '../data/products';
import { DemoOrderReceipt } from '../types/product';
import { StripeTestCheckoutModule } from '../components/StripeTestCheckoutModule';
import { trackBeginCheckout } from '../utils/analytics';

interface VerifiedStripeSessionData {
  sessionId: string;
  livemode: boolean;
  status: string | null;
  paymentStatus: string;
  currency: string;
  amountSubtotalBRL: number;
  amountShippingBRL: number;
  amountTotalBRL: number;
  items: {
    description: string;
    quantity: number;
    amountSubtotalBRL: number;
    amountTotalBRL: number;
  }[];
}

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, shippingCost, total, clearCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [completedReceipt, setCompletedReceipt] = useState<DemoOrderReceipt | null>(null);
  const [verifiedStripeSession, setVerifiedStripeSession] =
    useState<VerifiedStripeSessionData | null>(null);
  const [verifyingSession, setVerifyingSession] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const stripeStatus = searchParams.get('stripe_status');
  const sessionIdParam = searchParams.get('session_id');

  useEffect(() => {
    document.title = 'Checkout Demonstrativo — NEXORA TECH';
    if (items.length > 0 && !completedReceipt && !stripeStatus) {
      trackBeginCheckout(items, total);
    }
  }, []);

  // Verifica no servidor a sessão do Stripe quando o usuário retorna com stripe_status=success&session_id=...
  // Nunca considera o pagamento aprovado apenas pelo redirecionamento de URL.
  useEffect(() => {
    if (stripeStatus !== 'success' || !sessionIdParam) {
      return;
    }

    let isMounted = true;
    setVerifyingSession(true);
    setVerificationError(null);

    fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionIdParam)}`)
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error(
            'Não foi possível validar a sessão junto ao servidor (/api/checkout-session).'
          );
        }
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Falha ao consultar a sessão no Stripe.');
        }
        return data as VerifiedStripeSessionData;
      })
      .then((sessionData) => {
        if (!isMounted) return;
        setVerifiedStripeSession(sessionData);
        if (sessionData.paymentStatus === 'paid') {
          clearCart();
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg =
          err instanceof Error
            ? err.message
            : 'Erro ao verificar o status real da sessão no servidor.';
        setVerificationError(msg);
      })
      .finally(() => {
        if (isMounted) {
          setVerifyingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [stripeStatus, sessionIdParam]);

  const handleOrderSimulated = (receipt: DemoOrderReceipt) => {
    setCompletedReceipt(receipt);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDismissStripeStatus = () => {
    setSearchParams({}, { replace: true });
    setVerificationError(null);
    setVerifiedStripeSession(null);
  };

  // 1. Estado de Carregamento da Verificação Server-Side do Stripe
  if (stripeStatus === 'success' && verifyingSession) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <Loader2
          className="w-8 h-8 text-cyan-400 animate-spin mx-auto"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-bold text-white">
          Verificando sessão de testes junto ao servidor Stripe...
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Aguarde enquanto confirmamos o status real da sessão{' '}
          <span className="font-mono-num text-slate-300">{sessionIdParam}</span> diretamente na API
          da Stripe.
        </p>
      </div>
    );
  }

  // 2. Estado de Sessão Verificada no Servidor (Stripe Sandbox)
  if (stripeStatus === 'success' && (verifiedStripeSession || verificationError)) {
    const isPaidInSandbox = verifiedStripeSession?.paymentStatus === 'paid';

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8">
          {verificationError ? (
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6 text-rose-400" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-mono-num text-rose-400 font-semibold">
                  VERIFICAÇÃO DE SESSÃO NÃO CONCLUÍDA
                </span>
                <h1 className="text-2xl font-bold text-white mt-1">
                  Não foi possível confirmar o pagamento no servidor
                </h1>
                <p className="text-sm text-slate-300 mt-1">{verificationError}</p>
                <p className="text-xs text-slate-400 mt-2">
                  Por segurança, a NEXORA TECH não aprova pedidos apenas pelo redirecionamento de
                  URL sem validação da API Stripe no servidor.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center shrink-0">
                  {isPaidInSandbox ? (
                    <CheckCircle2 className="w-6 h-6 text-cyan-400" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-400" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-mono-num text-amber-400 font-semibold">
                    STRIPE CHECKOUT SANDBOX (MODO DE TESTE) · SEM COBRANÇA REAL
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {isPaidInSandbox
                      ? 'Pagamento de Teste Confirmado pelo Stripe'
                      : `Sessão Registrada (Status: ${verifiedStripeSession?.paymentStatus})`}
                  </h1>
                  <p className="text-sm text-slate-300 mt-1">
                    Status verificado no servidor via API da Stripe. Este registro pertence ao
                    ambiente de testes (sandbox) do projeto acadêmico SENAI.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 text-xs space-y-1.5">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-slate-400">ID da Sessão Stripe (Test):</span>
                  <span className="font-mono-num text-slate-200 break-all">
                    {verifiedStripeSession?.sessionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status do Pagamento (Servidor):</span>
                  <span className="font-mono-num font-semibold text-cyan-400 uppercase">
                    {verifiedStripeSession?.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ambiente:</span>
                  <span className="font-mono-num text-amber-400">
                    Sandbox / Test Mode (livemode: false)
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-white">
                  Itens validados na sessão Stripe
                </h2>
                <div className="divide-y divide-slate-800 border-y border-slate-800">
                  {verifiedStripeSession?.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3 flex items-center justify-between text-sm gap-4"
                    >
                      <div>
                        <span className="font-medium text-white">{item.description}</span>
                        <span className="text-xs text-slate-400 font-mono-num ml-2">
                          (Qtd: {item.quantity})
                        </span>
                      </div>
                      <span className="font-mono-num font-semibold text-white shrink-0">
                        {formatCurrencyBRL(item.amountTotalBRL)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono-num">
                    {formatCurrencyBRL(verifiedStripeSession?.amountSubtotalBRL || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Frete demonstrativo</span>
                  <span className="font-mono-num">
                    {(verifiedStripeSession?.amountShippingBRL || 0) === 0
                      ? 'Grátis'
                      : formatCurrencyBRL(verifiedStripeSession?.amountShippingBRL || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Processado no Sandbox</span>
                  <span className="text-cyan-400 font-mono-num">
                    {formatCurrencyBRL(verifiedStripeSession?.amountTotalBRL || 0)}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
            <Link
              to="/catalogo"
              className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors"
            >
              Voltar ao Catálogo
            </Link>
            <button
              type="button"
              onClick={handleDismissStripeStatus}
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Voltar ao Checkout →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Estado de Recibo da Simulação Local Demonstrativa
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
                SIMULAÇÃO LOCAL REGISTRADA · SEM TRANSAÇÃO STRIPE OU COBRANÇA REAL
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Resumo da Demonstração #{completedReceipt.orderId}
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                Este comprovante foi gerado pela simulação local acadêmica (SENAI), sem processamento no Stripe e sem envio físico.
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

      {/* Aviso quando o usuário retorna do Stripe Checkout após clicar em Voltar/Cancelar */}
      {stripeStatus === 'canceled' && (
        <div
          role="status"
          className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start justify-between gap-4"
        >
          <div className="flex items-start gap-3 text-xs text-amber-200 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-amber-300">
                Sessão do Stripe Checkout cancelada
              </p>
              <p className="mt-0.5">
                O pagamento em modo de teste foi cancelado antes da conclusão. Seus itens permanecem
                salvos no carrinho caso deseje tentar novamente ou usar a Simulação Local.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismissStripeStatus}
            className="text-xs font-semibold text-amber-300 hover:text-white whitespace-nowrap cursor-pointer"
          >
            Fechar aviso
          </button>
        </div>
      )}

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
