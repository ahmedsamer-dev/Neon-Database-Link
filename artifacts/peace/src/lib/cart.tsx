import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  variantId: string;
  quantity: number;
  productName: string;
  size: string;
  color: string;
  price: number;
  image: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("peace_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("peace_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((current) => {
      const existing = current.find((i) => i.variantId === newItem.variantId);
      if (existing) {
        const newQty = Math.min(existing.quantity + newItem.quantity, newItem.stock);
        return current.map((i) =>
          i.variantId === newItem.variantId
            ? { ...i, quantity: newQty, stock: newItem.stock }
            : i
        );
      }
      return [...current, { ...newItem, quantity: Math.min(newItem.quantity, newItem.stock) }];
    });
  };

  const removeItem = (variantId: string) => {
    setItems((current) => current.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((current) =>
      current.map((i) => {
        if (i.variantId !== variantId) return i;
        return { ...i, quantity: Math.min(quantity, i.stock) };
      })
    );
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
