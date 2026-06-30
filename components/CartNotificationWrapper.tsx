"use client";

import React from "react";
import CartNotification from "./CartNotification";
import { useCart } from "../app/providers";

const CartNotificationWrapper: React.FC = () => {
  const { notifications, removeNotification } = useCart();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <CartNotification
          key={notification.id}
          id={notification.id}
          productName={notification.productName}
          isVisible={notification.isVisible}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default CartNotificationWrapper;
