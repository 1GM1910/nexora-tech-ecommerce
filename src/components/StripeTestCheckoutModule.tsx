import React, { useState } from 'react';
import { CreditCard, Lock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { CartItem, DemoCheckoutData, DemoOrderReceipt } from '../types/product';
import { formatCurrencyBRL } from '../data/products';

interface StripeTestCheckoutModuleProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  onCompleteDemoOrder: (receipt: DemoOrderReceipt) => void;
}

/**
 * Componente isolado de Checkout Demonstrativo preparado para futura integração com
 * Stripe Checkout Session via endpoint de backend (sem expor chaves secretas no navegador).
 *
 * IMPORTANTE:
 * - NÃO processa cobranças reais.
 * - NÃO afirma que um pagamento bancário real foi concluído sem provedor.
 * - Valida os campos do formulário antes de gerar o protocolo de simulação.
 */
export const StripeTestCheckoutModule: React.FC<StripeTestCheckoutModuleProps> = ({
  items,
  subtotal,
  shipping,
  total,
  onCompleteDemoOrder,
}) => {
  const [formData, setFormData] = useState<DemoCheckoutData>({
    fullName: '',
    email: '',
    postalCode: '',
    address: '',
    city: '',
    state: '',
    paymentMethod: 'stripe_test_card',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DemoCheckoutData, string>>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [stripeApiError, setStripeApiError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof DemoCheckoutData, string>> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      nextErrors.fullName = 'Informe seu nome completo (mínimo 3 caracteres).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Informe um endereço de e-mail válido.';
    }

    const cepDigits = formData.postalCode.replace(/\D/g, '');
    if (cepDigits.length !== 8) {
      nextErrors.postalCode = 'Informe um CEP válido com 8 dígitos (ex: 01310-100).';
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      nextErrors.address = 'Informe o endereço de entrega para simulação.';
    }

    if (!formData.city.trim()) {
      nextErrors.city = 'Informe a cidade.';
    }

    if (!formData.state.trim() || formData.state.trim().length < 2) {
      nextErrors.state = 'Informe a UF (ex: SP).';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStripeApiError(null);
    if (errors[name as keyof DemoCheckoutData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Executa a simulação local demonstrativa (sem comunicar nem afirmar aprovação pelo Stripe).
   */
  const runLocalDemoSimulation = () => {
    if (!validateForm() || items.length === 0) return;

    setStripeApiError(null);
    setIsSimulating(true);

    setTimeout(() => {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const receipt: DemoOrderReceipt = {
        orderId: `NXR-DEMO-${randomSuffix}`,
        createdAt: new Date().toLocaleString('pt-BR'),
        customer: formData,
        items: [...items],
        subtotal,
        shipping,
        total,
        isTestMode: true,
      };
      setIsSimulating(false);
      onCompleteDemoOrder(receipt);
    }, 550);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || items.length === 0) return;

    setStripeApiError(null);

    // Se o usuário escolheu PIX Demonstrativo, executa o fluxo demonstrativo local
    if (formData.paymentMethod === 'pix_demo') {
      runLocalDemoSimulation();
      return;
    }

    // Modalidade Stripe Checkout (Sandbox): solicita criação da sessão exclusivamente no servidor
    setIsSimulating(true);
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          'O endpoint /api/create-checkout-session não respondeu em JSON neste ambiente (funções serverless ativas no deploy da Vercel).'
        );
      }

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(
          data.error || 'Não foi possível iniciar a sessão de testes no Stripe Checkout.'
        );
      }

      // Redireciona para o ambiente seguro hospedado pelo Stripe (Test Mode)
      window.location.assign(data.url);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Serviço Stripe Checkout indisponível no momento.';
      setStripeApiError(message);
      setIsSimulating(false);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 sm:p-8">
      {/* Test Mode Explicit Banner */}
      <div className="mb-6 p-4 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-amber-200/90 space-y-1 leading-relaxed">
          <p className="font-semibold text-amber-300">
            Ambiente de Demonstração (Modo de Teste / Sandbox)
          </p>
          <p>
            Este módulo integra o <strong>Stripe Checkout (Sandbox)</strong> via função serverless{' '}
            <code className="text-amber-200">/api/create-checkout-session</code> e também mantém a{' '}
            <strong>Simulação Local</strong> disponível. Nenhuma cobrança financeira real é efetuada.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            1. Dados para Simulação do Pedido
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="block text-xs font-medium text-slate-300 mb-1.5">
                Nome completo *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ex: Mariana Costa"
                className={`w-full bg-[#070B14] border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                  errors.fullName
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-700 focus:border-cyan-400'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-400">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1.5">
                E-mail para recibo demonstrativo *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="mariana@exemplo.com"
                className={`w-full bg-[#070B14] border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                  errors.email
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-700 focus:border-cyan-400'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-xs font-medium text-slate-300 mb-1.5">
                CEP *
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                maxLength={9}
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="01310-100"
                className={`w-full bg-[#070B14] border rounded-lg px-3.5 py-2.5 text-sm text-white font-mono-num focus:outline-none transition-colors ${
                  errors.postalCode
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-700 focus:border-cyan-400'
                }`}
              />
              {errors.postalCode && (
                <p className="mt-1 text-xs text-rose-400">{errors.postalCode}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-xs font-medium text-slate-300 mb-1.5">
                Endereço (Rua, número e complemento) *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Av. Paulista, 1313 — Sala 40"
                className={`w-full bg-[#070B14] border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                  errors.address
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-700 focus:border-cyan-400'
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-rose-400">{errors.address}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-xs font-medium text-slate-300 mb-1.5">
                Cidade *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="São Paulo"
                className={`w-full bg-[#070B14] border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                  errors.city
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-700 focus:border-cyan-400'
                }`}
              />
              {errors.city && <p className="mt-1 text-xs text-rose-400">{errors.city}</p>}
            </div>

            <div>
              <label htmlFor="state" className="block text-xs font-medium text-slate-300 mb-1.5">
                Estado (UF) *
              </label>
              <input
                id="state"
                name="state"
                type="text"
                maxLength={2}
                value={formData.state}
                onChange={handleChange}
                placeholder="SP"
                className={`w-full bg-[#070B14] border rounded-lg px-3.5 py-2.5 text-sm text-white uppercase focus:outline-none transition-colors ${
                  errors.state
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-700 focus:border-cyan-400'
                }`}
              />
              {errors.state && <p className="mt-1 text-xs text-rose-400">{errors.state}</p>}
            </div>
          </div>
        </div>

        {/* Simulated Payment Option */}
        <div className="pt-4 border-t border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-3">
            2. Modalidade de Checkout (Simulação)
          </h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Selecione como deseja registrar a simulação deste pedido acadêmico. Nenhuma chave privada é utilizada no navegador.
          </p>

          <div className="space-y-3">
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                formData.paymentMethod === 'stripe_test_card'
                  ? 'bg-slate-900/90 border-cyan-400'
                  : 'bg-[#070B14] border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="stripe_test_card"
                checked={formData.paymentMethod === 'stripe_test_card'}
                onChange={handleChange}
                className="mt-1 accent-cyan-400"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    Stripe Checkout Hosted (Sandbox / Modo de Teste)
                  </span>
                  <CreditCard className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Cria uma sessão de pagamento no servidor (<code className="text-slate-300">/api/create-checkout-session</code>) validando catálogo e estoque no backend, e redireciona ao ambiente de testes da Stripe em BRL.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                formData.paymentMethod === 'pix_demo'
                  ? 'bg-slate-900/90 border-cyan-400'
                  : 'bg-[#070B14] border-slate-800 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="pix_demo"
                checked={formData.paymentMethod === 'pix_demo'}
                onChange={handleChange}
                className="mt-1 accent-cyan-400"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    Simulação Local Instantânea / PIX Demonstrativo (Sem servidor externo)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Gera imediatamente um protocolo demonstrativo local para apresentação do fluxo de compra no curso do SENAI, sem depender de chave Stripe.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Explicit Error + Fallback Choice when Stripe API is unavailable */}
        {stripeApiError && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 space-y-3"
          >
            <div className="flex items-start gap-2.5 text-xs text-rose-200 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-rose-300">
                  Não foi possível iniciar o Stripe Checkout (Sandbox)
                </p>
                <p className="mt-1">{stripeApiError}</p>
              </div>
            </div>
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={runLocalDemoSimulation}
                disabled={isSimulating}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-600 text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Concluir via Simulação Local Demonstrativa (Sem Stripe)
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
            <span>Nenhuma cobrança real será processada.</span>
          </div>

          <button
            type="submit"
            disabled={isSimulating || items.length === 0}
            className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <span>
              {isSimulating
                ? formData.paymentMethod === 'stripe_test_card'
                  ? 'Conectando ao Stripe Sandbox...'
                  : 'Gerando simulação local...'
                : formData.paymentMethod === 'stripe_test_card'
                ? `Pagar no Stripe Sandbox (${formatCurrencyBRL(total)})`
                : `Registrar Simulação Local (${formatCurrencyBRL(total)})`}
            </span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
};
