"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { Order } from "../../../types";

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { user, loading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (user && params.id) {
        try {
          const response = await fetch(`/api/orders/${params.id}`, {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setOrder(data);
          } else {
            console.error("Failed to fetch order:", response.status);
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoadingOrder(false);
        }
      } else {
        setLoadingOrder(false);
      }
    };

    fetchOrder();
  }, [user, params.id]);

  if (loading || loadingOrder) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Please log in to view your order details
          </p>
          <Link
            href="/login"
            className="text-2xl text-green-600 hover:underline transition-colors duration-300"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-center py-8">Order not found.</p>
          <div className="text-center mt-6">
            <Link
              href="/history"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              Back to Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          <h2 className="text-xl font-semibold">Order # {order.id}</h2>
          <div className="text-sm text-gray-500 mt-2 md:mt-0">
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                order.status === "PAID"
                  ? "bg-green-100 text-green-800"
                  : order.status === "SHIPPED"
                  ? "bg-blue-100 text-blue-800"
                  : order.status === "COMPLETED"
                  ? "bg-purple-100 text-purple-800"
                  : order.status === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Order Summary</h3>
            <p className="text-gray-600">
              Total:{" "}
              <span className="font-semibold">${order.total.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Items</h3>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="w-16 h-16 bg-gray-20 rounded-md mr-4 flex items-center justify-center">
                <span className="text-gray-500 text-xs">Image</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-sm text-gray-50">
                  Price: ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                <p className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 mt-6 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${(order.total * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>${(order.total * 1.1).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
