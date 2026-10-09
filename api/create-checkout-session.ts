import type { IncomingMessage, ServerResponse } from 'http';
import Stripe from 'stripe';
import { PRODUCTS } from '../src/data/products';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  headers: IncomingMessage['headers'];
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => VercelResponse;
}

interface CheckoutItemInput {
  productId: unknown;
  quantity: unknown;
}

const FREE_SHIPPING_THRESHOLD_CENTS = 19900; // R$ 199,00
const STANDARD_SHIPPING_CENTS = 1890; // R$ 18,90

function resolveOrigin(req: VercelRequest): string {
  const originHeader = req.headers.origin;
  if (typeof originHeader === 'string' && /^https?:\/\//i.test(originHeader)) {
    return originHeader.replace(/\/$/, '');
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  if (typeof host === 'string' && host.trim().length > 0) {
    const cleanProto = Array.isArray(proto) ? proto[0] : proto;
    return `${cleanProto}://${host.trim()}`;
  }

  if (process.env.APP_URL && /^https?:\/\//i.test(process.env.APP_URL)) {
    return process.env.APP_URL.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Método não permitido. Utilize POST.',
    });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || typeof secretKey !== 'string' || secretKey.trim() === '') {
    return res.status(503).json({
      error:
        'A variável de ambiente STRIPE_SECRET_KEY não está configurada no servidor. Utilize a opção de Simulação Local ou configure uma chave de teste (sk_test_...) na Vercel.',
      code: 'STRIPE_NOT_CONFIGURED',
    });
  }

  const trimmedKey = secretKey.trim();

  // Condição obrigatória: aceitar exclusivamente chaves de teste (sk_test_)
  if (!trimmedKey.startsWith('sk_test_')) {
    return res.status(403).json({
      error:
        'Ambiente acadêmico bloqueado para chaves de produção. Configure exclusivamente uma chave de teste do Stripe iniciada por sk_test_.',
      code: 'STRIPE_LIVE_KEY_FORBIDDEN',
    });
  }

  try {
    const rawBody =
      typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as Record<string, unknown> | undefined);

    const rawItems = rawBody?.items;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({
        error: 'O carrinho enviado está vazio ou em formato inválido.',
      });
    }

    if (rawItems.length > 20) {
      return res.status(400).json({
        error: 'Quantidade de itens distintos excede o limite permitido.',
      });
    }

    // Consolida quantidades caso o mesmo productId seja enviado mais de uma vez
    const consolidatedQuantities = new Map<string, number>();

    for (const entry of rawItems as CheckoutItemInput[]) {
      if (
        !entry ||
        typeof entry.productId !== 'string' ||
        typeof entry.quantity !== 'number' ||
        !Number.isInteger(entry.quantity) ||
        entry.quantity <= 0
      ) {
        return res.status(400).json({
          error: 'Formato de item inválido. Informe apenas productId (string) e quantity (inteiro positivo).',
        });
      }

      const prev = consolidatedQuantities.get(entry.productId) || 0;
      consolidatedQuantities.set(entry.productId, prev + entry.quantity);
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotalCents = 0;

    for (const [productId, quantity] of consolidatedQuantities.entries()) {
      const catalogProduct = PRODUCTS.find((p) => p.id === productId);

      if (!catalogProduct) {
        return res.status(400).json({
          error: `Produto "${productId}" não existe no catálogo oficial da NEXORA TECH.`,
        });
      }

      if (catalogProduct.stock <= 0) {
        return res.status(400).json({
          error: `O produto "${catalogProduct.name}" (${catalogProduct.id}) está indisponível no estoque demonstrativo.`,
        });
      }

      if (quantity > catalogProduct.stock) {
        return res.status(400).json({
          error: `Quantidade solicitada (${quantity}) para "${catalogProduct.name}" excede o estoque disponível (${catalogProduct.stock} un.).`,
        });
      }

      const unitAmountCents = Math.round(catalogProduct.price * 100);
      subtotalCents += unitAmountCents * quantity;

      lineItems.push({
        quantity,
        price_data: {
          currency: 'brl',
          unit_amount: unitAmountCents,
          product_data: {
            name: `${catalogProduct.name} (Projeto Demonstrativo SENAI)`,
            description: `Código: ${catalogProduct.id} · Categoria: ${catalogProduct.category} · Item fictício sem envio físico.`,
            metadata: {
              product_id: catalogProduct.id,
              category: catalogProduct.category,
            },
          },
        },
      });
    }

    // Mesma regra de frete do CartContext.tsx:
    // Frete grátis para subtotal >= R$ 199,00 (19900 centavos), caso contrário R$ 18,90 (1890 centavos)
    const shippingAmountCents =
      subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;

    const shippingDisplayName =
      shippingAmountCents === 0
        ? 'Frete Demonstrativo Grátis (Pedidos a partir de R$ 199,00)'
        : 'Frete Demonstrativo Padrão (Simulação SENAI)';

    const stripe = new Stripe(trimmedKey);
    const origin = resolveOrigin(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'pt-BR',
      line_items: lineItems,
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: shippingAmountCents,
              currency: 'brl',
            },
            display_name: shippingDisplayName,
          },
        },
      ],
      metadata: {
        project: 'NEXORA_TECH_SENAI_DEMO',
        environment: 'sandbox_test_only',
        items_summary: Array.from(consolidatedQuantities.entries())
          .map(([id, qty]) => `${id}:${qty}`)
          .join(','),
      },
      success_url: `${origin}/checkout?stripe_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?stripe_status=canceled`,
    });

    if (!session.url) {
      return res.status(500).json({
        error: 'Não foi possível obter a URL de redirecionamento da sessão Stripe Checkout.',
      });
    }

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erro inesperado ao criar a sessão de testes no Stripe Checkout.';
    return res.status(500).json({
      error: `Falha ao comunicar com a API do Stripe (Modo de Teste): ${message}`,
    });
  }
}
