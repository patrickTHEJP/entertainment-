"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Product } from "@/types";

type CartItem = Product & { quantity: number };

type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  notifications: Array<{
    id: string;
    productName: string;
    isVisible: boolean;
  }>;
  addNotification: (productName: string) => void;
  removeNotification: (id: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      productName: string;
      isVisible: boolean;
    }>
  >([]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (product: Product) => {
    // Check if product already exists in cart
    const existing = cartItems.find((item) => item.id === product.id);

    if (existing) {
      // Product already exists in cart, don't add it again
      return;
    }

    // Add notification first
    const notificationId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [
      ...prev,
      { id: notificationId, productName: product.name, isVisible: true },
    ]);

    // Remove notification after 2 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }, 2000); // Hide after 2 seconds

    // Then update cart
    setCartItems((prev) => [...prev, { ...product, quantity: 1 }]);
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        notifications,
        addNotification: (productName: string) => {
          const notificationId =
            Date.now().toString() + Math.random().toString(36).substr(2, 9);
          setNotifications((prev) => [
            ...prev,
            { id: notificationId, productName, isVisible: true },
          ]);

          // Remove notification after 2 seconds
          setTimeout(() => {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== notificationId)
            );
          }, 2000);
        },
        removeNotification: (id: string) => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        },
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
