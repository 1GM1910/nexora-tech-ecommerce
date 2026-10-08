import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem } from '../types/product';
import { PRODUCTS } from '../data/products';
import { trackAddToCart, trackRemoveFromCart } from '../utils/analytics';

interface CartContextValue {
  items: CartItem[];
  totalItemsCount: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  getItemQuantity: (productId: string) => number;
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  updateQuantity: (productId: string, newQuantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = 'nexora_tech_cart_v1';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as { productId: string; quantity: number }[];
      if (!Array.isArray(parsed)) return [];

      // Reidrata com os dados atuais do catálogo e respeita o limite de estoque
      const rehydrated: CartItem[] = [];
      for (const entry of parsed) {
        const catalogProduct = PRODUCTS.find((p) => p.id === entry.productId);
        if (catalogProduct && catalogProduct.stock > 0 && entry.quantity > 0) {
          const validQty = Math.min(entry.quantity, catalogProduct.stock);
          rehydrated.push({
            product: catalogProduct,
            quantity: validQty,
          });
        }
      }
      return rehydrated;
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const serializable = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Ignorar erro de localStorage se indisponível
    }
  }, [items]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const getItemQuantity = (productId: string): number => {
    const found = items.find((item) => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  const addToCart = (product: Product, quantity = 1): { success: boolean; message: string } => {
    if (product.stock <= 0) {
      return {
        success: false,
        message: 'Este produto está indisponível no estoque demonstrativo.',
      };
    }

    const currentQty = getItemQuantity(product.id);
    const desiredQty = currentQty + quantity;

    if (desiredQty > product.stock) {
      return {
        success: false,
        message: `Limite de estoque atingido (${product.stock} ${
          product.stock === 1 ? 'unidade disponível' : 'unidades disponíveis'
        }).`,
      };
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, quantity }];
    });

    trackAddToCart(product, quantity);

    return {
      success: true,
      message: `${product.name} adicionado ao carrinho.`,
    };
  };

  const updateQuantity = (
    productId: string,
    newQuantity: number
  ): { success: boolean; message?: string } => {
    const catalogProduct = PRODUCTS.find((p) => p.id === productId);
    if (!catalogProduct) {
      return { success: false, message: 'Produto não encontrado.' };
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    if (newQuantity > catalogProduct.stock) {
      return {
        success: false,
        message: `Estoque máximo disponível para ${catalogProduct.name}: ${catalogProduct.stock} un.`,
      };
    }

    setItems((prev) => {
      const current = prev.find((i) => i.product.id === productId);
      if (current) {
        const diff = newQuantity - current.quantity;
        if (diff > 0) {
          trackAddToCart(catalogProduct, diff);
        } else if (diff < 0) {
          trackRemoveFromCart(catalogProduct, Math.abs(diff));
        }
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });

    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (existing) {
        trackRemoveFromCart(existing.product, existing.quantity);
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  // Frete demonstrativo gratuito para pedidos a partir de R$ 199,00 ou R$ 0,00 se vazio
  const shippingCost = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal >= 199 ? 0 : 18.9;
  }, [items.length, subtotal]);

  const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemsCount,
        subtotal,
        shippingCost,
        total,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        getItemQuantity,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser utilizado dentro de um CartProvider');
  }
  return context;
}
