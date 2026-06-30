"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import type { Order, Appointment } from "../../types";

export default function OrderHistoryPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [hasLoadedOrders, setHasLoadedOrders] = useState(false);
  const [hasLoadedAppointments, setHasLoadedAppointments] = useState(false);

  const fetchHistory = useCallback(
    async (showLoader = false) => {
      if (!user) {
        setOrders([]);
        setAppointments([]);
        setHasLoadedOrders(true);
        setHasLoadedAppointments(true);
        setLoadingOrders(false);
        setLoadingAppointments(false);
        return;
      }

      if (showLoader) {
        setLoadingOrders(true);
        setLoadingAppointments(true);
      }

      try {
        const response = await fetch("/api/orders", {
          credentials: "include",
        });
        if (response.ok) {
          const data: Order[] = await response.json();
          setOrders(data);
        } else {
          console.error("Failed to fetch orders:", response.status);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        if (showLoader) {
          setLoadingOrders(false);
        }
        setHasLoadedOrders(true);
      }

      try {
        const response = await fetch("/api/appointments", {
          credentials: "include",
        });
        if (response.ok) {
          const data: { appointments?: Appointment[] } | Appointment[] =
            await response.json();
          if (Array.isArray(data)) {
            setAppointments(data);
          } else {
            setAppointments(data.appointments || []);
          }
        } else {
          console.error("Failed to fetch appointments:", response.status);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        if (showLoader) {
          setLoadingAppointments(false);
        }
        setHasLoadedAppointments(true);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchHistory(true);
  }, [fetchHistory]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAppointmentsRefresh = () => fetchHistory(false);
    const handleOrdersRefresh = () => fetchHistory(false);

    window.addEventListener(
      "appointments:refresh",
      handleAppointmentsRefresh
    );
    window.addEventListener("orders:refresh", handleOrdersRefresh);
    const intervalId = window.setInterval(() => fetchHistory(false), 5000);

    return () => {
      window.removeEventListener(
        "appointments:refresh",
        handleAppointmentsRefresh
      );
      window.removeEventListener("orders:refresh", handleOrdersRefresh);
      window.clearInterval(intervalId);
    };
  }, [fetchHistory]);

  if (loading || loadingOrders || loadingAppointments) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Please log in to view your history
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

  const noHistory =
    orders.length === 0 &&
    appointments.length === 0 &&
    hasLoadedOrders &&
    hasLoadedAppointments;

  if (noHistory) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Orders & Appointments
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-center py-8">
            You haven&apos;t placed any orders or appointments yet.
          </p>
          <div className="text-center mt-6 space-y-4">
            <Link
              href="/products"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              Start Shopping
            </Link>
            <div>
              <Link
                href="/services"
                className="inline-block border border-green-600 text-green-700 px-6 py-3 rounded-md hover:bg-green-50 transition-colors"
              >
                Book an Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Orders & Appointments
      </h1>

      {orders.length > 0 && (
        <section className="space-y-6 mb-10">
          <h2 className="text-xl font-semibold">Order History</h2>
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <Link href={`/history/${order.id}`} className="hover:underline">
                  <h3 className="text-lg font-semibold">Order # {order.id}</h3>
                </Link>
                <div className="text-sm text-gray-500 text-right">
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
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

              <div className="mb-4">
                <p className="text-gray-600">
                  Total:{" "}
                  <span className="font-semibold">
                    ${order.total.toFixed(2)}
                  </span>
                </p>
              </div>

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
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">
                        Price: ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Appointment History</h2>
          <Link
            href="/services"
            className="text-sm text-green-600 hover:underline font-medium"
          >
            Book another appointment
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center text-gray-600">
            No appointments yet.
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">
                      Appointment Date:
                    </span>{" "}
                    {new Date(appointment.date).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-lg font-semibold capitalize mt-1">
                    {appointment.service.replace(/_/g, " ")}
                  </p>
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : appointment.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-800">Groomer:</span>{" "}
                  {appointment.groomer}
                </p>
                {appointment.pet && (
                  <p>
                    <span className="font-semibold text-gray-800">Pet:</span>{" "}
                    {appointment.pet.name}
                    {appointment.pet.species
                      ? ` (${appointment.pet.species})`
                      : ""}
                  </p>
                )}
                {appointment.notes && (
                  <p>
                    <span className="font-semibold text-gray-800">Notes:</span>{" "}
                    {appointment.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
