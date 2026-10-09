import type { IncomingMessage, ServerResponse } from 'http';
import Stripe from 'stripe';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
  headers: IncomingMessage['headers'];
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => VercelResponse;
}

/**
 * Desativa o bodyParser padrão da Vercel para permitir a leitura do corpo bruto (raw Buffer),
 * requisito obrigatório para validação criptográfica da assinatura `stripe-signature`.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8');
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Webhook do Stripe (POST /api/stripe-webhook)
 *
 * Arquitetura e Limitações Documentadas:
 * - Valida a assinatura criptográfica do cabeçalho `stripe-signature` usando o corpo bruto (raw body)
 *   e a variável de ambiente `STRIPE_WEBHOOK_SECRET`.
 * - Como esta versão acadêmica demonstrativa não utiliza banco de dados persistente, o webhook
 *   foi projetado para ser 100% seguro e livre de efeitos colaterais irreversíveis (não reduz estoque
 *   permanentemente, não emite cobranças extras e não grava dados pessoais).
 * - Nota sobre Idempotência: Em uma arquitetura de produção com banco de dados, o `event.id` (`evt_...`)
 *   deve ser gravado em uma tabela com restrição UNIQUE antes de processar efeitos de negócio, pois
 *   estruturas em memória (como `Set`) não persistem entre invocações ou múltiplas instâncias serverless.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Método não permitido. Utilize POST.',
    });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !secretKey.trim().startsWith('sk_test_')) {
    return res.status(503).json({
      error: 'STRIPE_SECRET_KEY de teste (sk_test_) não configurada.',
    });
  }

  if (!webhookSecret || !webhookSecret.trim().startsWith('whsec_')) {
    return res.status(503).json({
      error: 'STRIPE_WEBHOOK_SECRET (whsec_) não configurado no servidor.',
    });
  }

  const signatureHeader = req.headers['stripe-signature'];
  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return res.status(400).json({
      error: 'Cabeçalho stripe-signature ausente na requisição.',
    });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await readRawBody(req);
    const stripe = new Stripe(secretKey.trim());
    event = stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret.trim());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Assinatura de webhook inválida.';
    return res.status(400).json({
      error: `Falha na verificação de assinatura do Webhook: ${message}`,
    });
  }

  // Rejeita eventos de produção caso enviados acidentalmente
  if (event.livemode) {
    return res.status(403).json({
      error: 'Eventos em modo de produção (livemode) não são aceitos neste projeto acadêmico.',
    });
  }

  // Tratamento seguro e sem efeitos colaterais irreversíveis (stateless sandbox handler)
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session;
      return res.status(200).json({
        received: true,
        eventId: event.id,
        eventType: event.type,
        sessionId: session.id,
        paymentStatus: session.payment_status,
        livemode: false,
        note: 'Evento de teste validado com sucesso. Nenhum efeito irreversível executado (ambiente demonstrativo sem banco de dados).',
      });
    }

    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      return res.status(200).json({
        received: true,
        eventId: event.id,
        eventType: event.type,
        sessionId: session.id,
        paymentStatus: session.payment_status,
        livemode: false,
        note: 'Sessão de teste expirada ou pagamento assíncrono falhou.',
      });
    }

    default:
      return res.status(200).json({
        received: true,
        eventId: event.id,
        eventType: event.type,
        note: 'Evento recebido e ignorado pela loja demonstrativa.',
      });
  }
}
