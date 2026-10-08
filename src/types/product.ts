export type ProductCategory = 'Áudio' | 'Smartphones' | 'Wearables' | 'Acessórios';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  shortDescription: string;
  description: string;
  image: string;
  featured?: boolean;
  highlights: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
export type AvailabilityFilter = 'all' | 'in-stock' | 'out-of-stock';

export interface DemoCheckoutData {
  fullName: string;
  email: string;
  postalCode: string;
  address: string;
  city: string;
  state: string;
  paymentMethod: 'stripe_test_card' | 'pix_demo' | 'boleto_demo';
  notes?: string;
}

export interface DemoOrderReceipt {
  orderId: string;
  createdAt: string;
  customer: DemoCheckoutData;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  isTestMode: true;
}
