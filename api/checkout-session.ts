import type { IncomingMessage, ServerResponse } from 'http';
import Stripe from 'stripe';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
  url?: string;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => VercelResponse;
}

/**
 * Endpoint de verificação da sessão Stripe Checkout (GET /api/checkout-session?session_id=cs_test_...)
 *
 * Regras de segurança e privacidade:
 * - Valida estritamente o identificador da sessão (deve iniciar por cs_test_).
 * - Consulta diretamente a API da Stripe no servidor para evitar aprovação falsa apenas por query string.
 * - Retorna apenas informações necessárias ao comprovante acadêmico (status, itens, valores em BRL),
 *   sem expor dados pessoais ou detalhes sensíveis do cliente (sem nome, e-mail, endereço ou dados de cartão).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      error: 'Método não permitido. Utilize GET.',
    });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || typeof secretKey !== 'string' || !secretKey.trim().startsWith('sk_test_')) {
    return res.status(503).json({
      error: 'Chave de teste STRIPE_SECRET_KEY (sk_test_) não configurada no servidor.',
    });
  }

  let sessionId = '';
  const querySessionId = req.query?.session_id;
  if (typeof querySessionId === 'string') {
    sessionId = querySessionId.trim();
  } else if (Array.isArray(querySessionId) && typeof querySessionId[0] === 'string') {
    sessionId = querySessionId[0].trim();
  } else if (req.url) {
    const parsedUrl = new URL(req.url, 'http://localhost');
    sessionId = (parsedUrl.searchParams.get('session_id') || '').trim();
  }

  // Valida que o session_id pertence exclusivamente a uma sessão de teste do Stripe Checkout
  if (!/^cs_test_[a-zA-Z0-9_]+$/.test(sessionId)) {
    return res.status(400).json({
      error: 'Identificador de sessão inválido. É exigido um session_id de teste válido (cs_test_...).',
    });
  }

  try {
    const stripe = new Stripe(secretKey.trim());
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    if (session.livemode) {
      return res.status(403).json({
        error: 'Sessões em modo de produção não são permitidas neste projeto demonstrativo.',
      });
    }

    const lineItems = (session.line_items?.data || []).map((item) => ({
      description: item.description || 'Produto Nexora Tech',
      quantity: item.quantity || 1,
      amountSubtotalBRL: (item.amount_subtotal || 0) / 100,
      amountTotalBRL: (item.amount_total || 0) / 100,
    }));

    return res.status(200).json({
      sessionId: session.id,
      livemode: session.livemode,
      status: session.status,
      paymentStatus: session.payment_status,
      currency: (session.currency || 'brl').toUpperCase(),
      amountSubtotalBRL: (session.amount_subtotal || 0) / 100,
      amountShippingBRL: (session.total_details?.amount_shipping || 0) / 100,
      amountTotalBRL: (session.amount_total || 0) / 100,
      items: lineItems,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Não foi possível consultar a sessão informada.';
    return res.status(404).json({
      error: `Não foi possível verificar a sessão no Stripe: ${message}`,
    });
  }
}
