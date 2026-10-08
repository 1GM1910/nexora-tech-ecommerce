import { Product, ProductCategory } from '../types/product';

export const HERO_IMAGE_PATH = '/src/assets/images/hero_nexora_ecosystem_1791501072071.jpg';

export const CATEGORIES: {
  name: ProductCategory;
  slug: string;
  description: string;
}[] = [
  {
    name: 'Áudio',
    slug: 'Áudio',
    description: 'Fones Bluetooth e caixas acústicas portáteis para rotina intensa.',
  },
  {
    name: 'Smartphones',
    slug: 'Smartphones',
    description: 'Design minimalista e conectividade fluida para o dia a dia.',
  },
  {
    name: 'Wearables',
    slug: 'Wearables',
    description: 'Dispositivos vestíveis para acompanhamento de rotina e notificações.',
  },
  {
    name: 'Acessórios',
    slug: 'Acessórios',
    description: 'Cabos, carregadores, localizadores e suportes ergonômicos.',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'PRD-001',
    name: 'Fone Bluetooth Sonic Air',
    category: 'Áudio',
    price: 89.90,
    stock: 12,
    featured: true,
    shortDescription: 'Fone sem fio circumaural com acabamento fosco e almofadas ergonômicas.',
    description:
      'O Fone Bluetooth Sonic Air foi projetado para quem busca conforto prolongado e praticidade sem fios no estudo, trabalho ou deslocamento diário. Conta com estrutura leve ajustável, controles integrados na concha acústica e conexão Bluetooth para pareamento rápido com smartphones, tablets e notebooks.',
    image: '/src/assets/images/prod_sonic_air_headphones_1791501082930.jpg',
    highlights: [
      'Conexão sem fio via Bluetooth para uso diário',
      'Arco ajustável com almofadas macias de isolamento passivo',
      'Controles físicos integrados para volume e faixas',
    ],
  },
  {
    id: 'PRD-002',
    name: 'Smartphone Nova X',
    category: 'Smartphones',
    price: 1299.90,
    stock: 5,
    featured: true,
    shortDescription: 'Smartphone com tela ampla, acabamento em azul escuro fosco e design fino.',
    description:
      'O Smartphone Nova X combina estética minimalista com construção ergonômica em tom azul profundo. Desenvolvido para acompanhar sua rotina de comunicação, navegação, leitura e produtividade móvel com interface limpa e excelente aproveitamento frontal de tela.',
    image: '/src/assets/images/prod_nova_x_smartphone_1791501092786.jpg',
    highlights: [
      'Acabamento monolítico em tom azul escuro e preto',
      'Tela frontal ampla com bordas reduzidas',
      'Conector padrão USB-C para recarga e transferência de dados',
    ],
  },
  {
    id: 'PRD-003',
    name: 'Smartwatch Fit Pro',
    category: 'Wearables',
    price: 129.90,
    stock: 7,
    featured: true,
    shortDescription: 'Relógio inteligente com pulseira de silicone macio e visor digital nítido.',
    description:
      'O Smartwatch Fit Pro acompanha o seu ritmo diário diretamente no pulso. Com caixa retangular discreta e pulseira confortável para uso contínuo, exibe horário, contagem de passos, lembretes e alertas básicos sincronizados com o seu smartphone.',
    image: '/src/assets/images/prod_fit_pro_smartwatch_1791501101922.jpg',
    highlights: [
      'Visor colorido de alta legibilidade para ambientes internos e externos',
      'Pulseira ajustável e confortável para atividades cotidianas',
      'Visualização rápida de horário e indicadores de rotina',
    ],
  },
  {
    id: 'PRD-004',
    name: 'Cabo USB-C Turbo 2m',
    category: 'Acessórios',
    price: 29.90,
    stock: 25,
    featured: false,
    shortDescription: 'Cabo extensor de 2 metros com conectores USB-C e revestimento reforçado.',
    description:
      'Com 2 metros de comprimento, o Cabo USB-C Turbo oferece liberdade de movimento para carregar e sincronizar seus dispositivos na mesa de trabalho, no sofá ou na cabeceira. Seus conectores simétricos facilitam o encaixe diário com durabilidade aprimorada.',
    image: '/images/prod-cabo-usbc.svg',
    highlights: [
      'Comprimento estendido de 2 metros para maior alcance',
      'Conectores padrão USB-C em ambas as pontas',
      'Revestimento flexível pensado para evitar nós no transporte',
    ],
  },
  {
    id: 'PRD-005',
    name: 'Carregador USB-C 20W',
    category: 'Acessórios',
    price: 49.90,
    stock: 18,
    featured: false,
    shortDescription: 'Adaptador de tomada compacto de 20W com saída dedicada USB-C.',
    description:
      'O Carregador USB-C 20W entrega alimentação eficiente em um corpo compacto que cabe facilmente na mochila ou nécessaire. Ideal para recarregar smartphones, fones Bluetooth e wearables compatíveis com conexão USB-C no dia a dia.',
    image: '/images/prod-carregador-20w.svg',
    highlights: [
      'Saída USB-C de 20W para recarga diária',
      'Formato compacto e leve para transporte em viagens',
      'Pinos no padrão brasileiro de tomadas',
    ],
  },
  {
    id: 'PRD-006',
    name: 'Caixa de Som Bluetooth Mini',
    category: 'Áudio',
    price: 74.90,
    stock: 4,
    featured: true,
    shortDescription: 'Caixa acústica portátil cilíndrica com revestimento têxtil e som 360°.',
    description:
      'Compacta e versátil, a Caixa de Som Bluetooth Mini foi criada para preencher pequenos ambientes com áudio claro e equilibrado. Seu formato cilíndrico revestido em tecido acústico escuro combina com qualquer bancada ou mochila.',
    image: '/src/assets/images/prod_bluetooth_speaker_mini_1791501110348.jpg',
    highlights: [
      'Design cilíndrico portátil com botões superiores de fácil acesso',
      'Conexão Bluetooth sem fio para reprodução rápida',
      'Acabamento em tecido escuro resistente ao manuseio diário',
    ],
  },
  {
    id: 'PRD-007',
    name: 'Smart Tag Localizador',
    category: 'Acessórios',
    price: 59.90,
    stock: 0,
    featured: false,
    shortDescription: 'Localizador compacto para chaves, mochilas e objetos pessoais.',
    description:
      'O Smart Tag Localizador auxilia na organização e localização de itens essenciais como chaveiros, malas e mochilas. Seu formato circular discreto inclui alça integrada para fixação imediata e sinalizador sonoro para facilitar a busca por perto.',
    image: '/images/prod-smart-tag.svg',
    highlights: [
      'Formato circular ultracompacto com anel de fixação incluso',
      'Emissão de alerta sonoro para localização em ambientes próximos',
      'Ideal para mochilas, chaves e pastas de estudo ou trabalho',
    ],
  },
  {
    id: 'PRD-008',
    name: 'Suporte Articulado para Celular',
    category: 'Acessórios',
    price: 39.90,
    stock: 10,
    featured: false,
    shortDescription: 'Suporte de mesa dobrável com ajuste de inclinação para smartphones.',
    description:
      'Mantenha a postura ideal durante videochamadas, aulas online e leitura com o Suporte Articulado para Celular. Sua haste com dupla articulação permite regular o ângulo de visão na mesa de trabalho, mantendo a porta de carregamento livre.',
    image: '/images/prod-suporte-celular.svg',
    highlights: [
      'Dupla articulação para ajuste ergonômico de altura e inclinação',
      'Base estável com apoios antiderrapantes para escrivaninha',
      'Abertura inferior que permite carregar o aparelho durante o uso',
    ],
  },
];

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
