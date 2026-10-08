import React, { useState, useEffect } from 'react';
import { Info, CheckCircle2, RotateCcw } from 'lucide-react';

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState<ContactFormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});
  const [submittedPreview, setSubmittedPreview] = useState<ContactFormState | null>(null);

  useEffect(() => {
    document.title = 'Contato Demonstrativo — NEXORA TECH';
  }, []);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof ContactFormState, string>> = {};

    if (!form.name.trim() || form.name.trim().length < 3) {
      nextErrors.name = 'Informe seu nome (mínimo 3 caracteres).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      nextErrors.email = 'Informe um endereço de e-mail válido.';
    }
    if (!form.subject.trim()) {
      nextErrors.subject = 'Selecione ou informe o assunto.';
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      nextErrors.message = 'Escreva uma mensagem com pelo menos 10 caracteres.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmittedPreview({ ...form });
  };

  const handleReset = () => {
    setForm({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setSubmittedPreview(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="border-b border-slate-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
          <span>Atendimento Simulado</span>
          <span aria-hidden="true">·</span>
          <span>Validação Front-end</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Fale com a Nexora Tech</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Preencha os campos abaixo para testar a validação de formulário da loja demonstrativa.
        </p>
      </div>

      {/* Transparent No-Backend Notice */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Aviso importante de transparência:</strong> Como esta primeira versão do projeto
          opera de forma 100% estática no navegador (sem servidor de e-mail ou banco de dados
          conectado), o formulário abaixo valida os dados localmente para fins de demonstração e{' '}
          <strong>não envia mensagens externas</strong>.
        </p>
      </div>

      {submittedPreview ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold text-white">
                Validação concluída em modo de demonstração local
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Os campos foram validados pelo front-end. Conforme indicado, nenhuma mensagem foi transmitida a um servidor externo.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#070B14] border border-slate-800 space-y-2 text-xs">
            <p className="text-slate-400">
              <strong className="text-slate-200">Nome:</strong> {submittedPreview.name}
            </p>
            <p className="text-slate-400">
              <strong className="text-slate-200">E-mail:</strong> {submittedPreview.email}
            </p>
            <p className="text-slate-400">
              <strong className="text-slate-200">Assunto:</strong> {submittedPreview.subject}
            </p>
            <p className="text-slate-400 pt-2 border-t border-slate-800">
              <strong className="text-slate-200 block mb-1"> Conteúdo preenchido:</strong>
              {submittedPreview.message}
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Testar novo preenchimento</span>
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Seu nome *
              </label>
              <input
                id="contact-name"
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Ex: Lucas Almeida"
                className={`w-full bg-[#070B14] border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none ${
                  errors.name ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-400'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Seu e-mail *
              </label>
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="lucas@exemplo.com"
                className={`w-full bg-[#070B14] border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none ${
                  errors.email ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-400'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="contact-subject" className="block text-xs font-medium text-slate-300 mb-1.5">
              Assunto *
            </label>
            <select
              id="contact-subject"
              value={form.subject}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, subject: e.target.value }));
                if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
              }}
              className={`w-full bg-[#070B14] border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none ${
                errors.subject ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-400'
              }`}
            >
              <option value="">Selecione um assunto...</option>
              <option value="Dúvida sobre o Catálogo Demonstrativo">
                Dúvida sobre o Catálogo Demonstrativo
              </option>
              <option value="Avaliação do Projeto SENAI">Avaliação do Projeto SENAI</option>
              <option value="Sugestão de Melhoria Técnica">Sugestão de Melhoria Técnica</option>
            </select>
            {errors.subject && <p className="mt-1 text-xs text-rose-400">{errors.subject}</p>}
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-xs font-medium text-slate-300 mb-1.5">
              Mensagem *
            </label>
            <textarea
              id="contact-message"
              rows={4}
              value={form.message}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, message: e.target.value }));
                if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
              }}
              placeholder="Digite sua observação para testar a validação..."
              className={`w-full bg-[#070B14] border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none ${
                errors.message ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-400'
              }`}
            />
            {errors.message && <p className="mt-1 text-xs text-rose-400">{errors.message}</p>}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              * Simulação local sem disparo de e-mail externo.
            </span>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors cursor-pointer"
            >
              Validar Preenchimento Demonstrativo
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
