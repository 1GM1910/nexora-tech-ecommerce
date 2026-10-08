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
    if (errors[name as keyof DemoCheckoutData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || items.length === 0) return;

    setIsSimulating(true);

    // Simula o tempo de criação de uma sessão de checkout demonstrativa
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

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 sm:p-8">
      {/* Test Mode Explicit Banner */}
      <div className="mb-6 p-4 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-amber-200/90 space-y-1 leading-relaxed">
          <p className="font-semibold text-amber-300">
            Ambiente de Demonstração (Modo de Teste)
          </p>
          <p>
            Este módulo simula a etapa de checkout e está isolado para futura conexão via backend com o{' '}
            <strong>Stripe Checkout (Test Mode)</strong>. Nenhuma cobrança financeira real será efetuada e
            nenhum dado de cartão bancário é solicitado nesta tela.
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
                    Stripe Checkout Hosted (Simulação Modo de Teste)
                  </span>
                  <CreditCard className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Arquitetura preparada para redirecionar a uma sessão segura Stripe Checkout em versões com backend. Nesta versão estática, gera um protocolo demonstrativo sem transação real.
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
                    PIX Demonstrativo (Sem valor financeiro)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Simula um pedido instantâneo para apresentação do fluxo de compra no curso do SENAI.
                </p>
              </div>
            </label>
          </div>
        </div>

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
                ? 'Gerando simulação...'
                : `Registrar Pedido Demonstrativo (${formatCurrencyBRL(total)})`}
            </span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
};
