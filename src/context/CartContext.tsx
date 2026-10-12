import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';
import { INITIAL_STORE_SETTINGS } from '../data/initialData';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  freeShippingRemaining: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    quantity?: number,
    selectedColor?: string,
    selectedVariation?: string,
    customNote?: string
  ) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    selectedColor?: string,
    selectedVariation?: string
  ) => void;
  removeFromCart: (
    productId: string,
    selectedColor?: string,
    selectedVariation?: string
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'kjk_shopping_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedColor?: string,
    selectedVariation?: string,
    customNote?: string
  ) => {
    if (product.stock <= 0 || !product.isActive) return;

    const chosenColor = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
    const chosenVariation = selectedVariation || (product.variations && product.variations.length > 0 ? product.variations[0] : undefined);
    const effectivePrice = product.discountPrice ?? product.price;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === product.id &&
          i.selectedColor === chosenColor &&
          i.selectedVariation === chosenVariation
      );

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          price: effectivePrice, // revalidate price
          maxStock: product.stock,
          customNote: customNote || existing.customNote
        };
        return updated;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          price: effectivePrice,
          image: product.images[0] || '',
          selectedColor: chosenColor,
          selectedVariation: chosenVariation,
          customNote,
          quantity: Math.min(product.stock, quantity),
          maxStock: product.stock
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    selectedColor?: string,
    selectedVariation?: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor, selectedVariation);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (
          item.productId === productId &&
          item.selectedColor === selectedColor &&
          item.selectedVariation === selectedVariation
        ) {
          return {
            ...item,
            quantity: Math.min(item.maxStock, quantity)
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (
    productId: string,
    selectedColor?: string,
    selectedVariation?: string
  ) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.selectedColor === selectedColor &&
            item.selectedVariation === selectedVariation
          )
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const threshold = INITIAL_STORE_SETTINGS.freeShippingThreshold;
  const standardFee = INITIAL_STORE_SETTINGS.standardShippingFee;
  const shippingFee = (subtotal === 0 || subtotal >= threshold) ? 0 : standardFee;
  const totalAmount = subtotal + shippingFee;
  const freeShippingRemaining = Math.max(0, threshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shippingFee,
        totalAmount,
        freeShippingRemaining,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
