"use client";

import React from "react";

interface CartNotificationProps {
  id: string;
  productName: string;
  isVisible: boolean;
  onRemove: (id: string) => void;
}

const CartNotification: React.FC<CartNotificationProps> = ({
  id,
  productName,
  isVisible,
  onRemove,
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeDown min-w-[200px] transition-all duration-300 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">{productName}</span>
        <span>added to cart!</span>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onRemove(id)}
        className="text-white/80 hover:text-white"
      >
        &times;
      </button>
    </div>
  );
};

export default CartNotification;
