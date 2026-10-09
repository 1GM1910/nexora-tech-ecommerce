# NEXORA TECH — Tecnologia que acompanha você

> **Projeto acadêmico demonstrativo — SENAI. Produtos, preços e pedidos fictícios.**

Loja virtual demonstrativa de eletrônicos e acessórios desenvolvida como projeto final do curso de E-commerce do **SENAI**. Construída com foco em arquitetura moderna, design responsivo mobile-first, acessibilidade, boas práticas de SEO, carrinho persistente com validação de estoque e preparação estrutural para **Stripe Checkout (Modo de Teste)** e **Google Analytics 4 (GA4)**.

---

## Sumário das Funcionalidades

- **Catálogo Tipado Local (`src/data/products.ts`)**: 8 produtos demonstrativos (`PRD-001` a `PRD-008`) distribuídos em 4 categorias (*Áudio*, *Smartphones*, *Wearables* e *Acessórios*).
- **Controle de Estoque Realista**: O carrinho valida automaticamente o saldo de estoque de cada item e bloqueia adições acima do limite ou para itens esgotados (`PRD-007 — Smart Tag Localizador` com estoque `0`).
- **Persistência no Navegador**: O carrinho é salvo automaticamente no `localStorage` e reidratado com segurança ao recarregar a página.
- **Busca, Filtros e Ordenação**: Busca textual por nome/código, filtro por categoria, filtro de disponibilidade (em estoque / sem estoque) e ordenação por preço ou ordem alfabética.
- **Checkout Demonstrativo Isolado (`src/components/StripeTestCheckoutModule.tsx`)**: Valida os dados de entrega e gera um protocolo de simulação deixando explícito que **nenhuma cobrança real** é efetuada e nenhuma chave privada é utilizada no front-end.
- **Google Analytics 4 Centralizado (`src/utils/analytics.ts`)**:
  - Só envia eventos caso exista um ID GA4 válido (`G-XXXXXXXXXX`) configurado **e** o usuário tenha aceitado o banner de consentimento de cookies.
  - Eventos preparados: `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `begin_checkout` e `page_view` (sem duplicidade).
  - Nenhum dado pessoal (nome, e-mail, endereço) é enviado ao GA4.

---

## Tecnologias Utilizadas

- **React 19** + **TypeScript**
- **Vite** (bundler e servidor de desenvolvimento)
- **Tailwind CSS** (estilização responsiva mobile-first)
- **React Router DOM** (navegação SPA entre as 8 páginas)
- **Lucide React** (ícones vetoriais acessíveis)

---

## Catálogo Demonstrativo Incluído

| Código | Produto | Categoria | Preço Demonstrativo | Estoque |
| :--- | :--- | :--- | :--- | :--- |
| `PRD-001` | Fone Bluetooth Sonic Air | Áudio | R$ 89,90 | 12 |
| `PRD-002` | Smartphone Nova X | Smartphones | R$ 1.299,90 | 5 |
| `PRD-003` | Smartwatch Fit Pro | Wearables | R$ 129,90 | 7 |
| `PRD-004` | Cabo USB-C Turbo 2m | Acessórios | R$ 29,90 | 25 |
| `PRD-005` | Carregador USB-C 20W | Acessórios | R$ 49,90 | 18 |
| `PRD-006` | Caixa de Som Bluetooth Mini | Áudio | R$ 74,90 | 4 |
| `PRD-007` | Smart Tag Localizador | Acessórios | R$ 59,90 | 0 *(Indisponível)* |
| `PRD-008` | Suporte Articulado para Celular | Acessórios | R$ 39,90 | 10 |

---

## Como Executar Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior recomendada)
- **npm** instalado

### Passo a passo

1. Clone o repositório ou extraia os arquivos do projeto:
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO_GITHUB>
   cd nexora-tech
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. *(Opcional)* Configure variáveis de ambiente copiando o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
   O projeto já vem configurado por padrão com o ID de medição **`G-BK849C4BTB`** (que também pode ser definido via variável `VITE_GA_MEASUREMENT_ID=G-BK849C4BTB` na Vercel ou inspecionado pelo botão **"Configurar Cookies / GA4"** no rodapé da loja).

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:3000`.

---

## Como Gerar o Build de Produção

Para validar a tipagem TypeScript e gerar os arquivos estáticos otimizados na pasta `dist/`:

```bash
npm run lint
npm run build
```

Para testar localmente o pacote gerado para produção:

```bash
npm run preview
```

---

## Como Publicar na Vercel (Frontend + Serverless Functions `/api`)

O projeto inclui o arquivo `vercel.json` configurado para preservar as funções serverless em `/api/*` e encaminhar as demais rotas para o React Router (`/`, `/catalogo`, `/produto/:id`, `/carrinho`, `/checkout`, `/sobre`, `/contato`).

1. Suba o projeto para um repositório no **GitHub**.
2. Acesse [vercel.com](https://vercel.com/) e clique em **Add New... → Project**.
3. Importe o repositório do GitHub.
4. Mantenha as configurações padrão detectadas automaticamente para **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Em **Environment Variables** no painel da Vercel, configure:
   - `VITE_GA_MEASUREMENT_ID`: `G-BK849C4BTB` (opcional, já definido como padrão).
   - `STRIPE_SECRET_KEY`: sua chave secreta de **Modo de Teste** da Stripe (deve obrigatoriamente iniciar com `sk_test_...`). **Nunca** adicione o prefixo `VITE_` a esta variável.
   - `STRIPE_WEBHOOK_SECRET`: segredo de assinatura do endpoint de webhook da Stripe (iniciado com `whsec_...`).
6. Clique em **Deploy**.

---

## Configuração do Stripe Checkout (Sandbox) e Webhook

### 1. Funções Serverless criadas em `/api`
- `POST /api/create-checkout-session`: Recebe apenas `{ items: [{ productId, quantity }] }`, valida existência e limite de estoque contra o catálogo oficial do servidor (`src/data/products.ts`), aplica a mesma regra de frete demonstrativo em centavos de BRL (`R$ 0,00` se subtotal $\ge \text{R\$ } 199,00$, ou `R$ 18,90` caso contrário) e cria a sessão no Stripe Test Mode.
- `GET /api/checkout-session`: Verifica diretamente na API da Stripe o status real da sessão (`cs_test_...`) no retorno para `/checkout?stripe_status=success&session_id=...`, evitando aprovações falsas baseadas apenas em query string e sem expor dados pessoais do comprador.
- `POST /api/stripe-webhook`: Lê o corpo bruto (`rawBody`), valida a assinatura criptográfica `stripe-signature` com `STRIPE_WEBHOOK_SECRET` e responde aos eventos de teste sem efeitos colaterais irreversíveis (uma vez que esta versão acadêmica não possui banco de dados persistente).

---

## Aviso Legal e Acadêmico

Este software foi desenvolvido exclusivamente como **projeto acadêmico demonstrativo do SENAI**. Todos os produtos, nomes comerciais, preços, quantidades em estoque e comprovantes de pedido são fictícios. Nenhuma venda ou transação financeira real é realizada.
