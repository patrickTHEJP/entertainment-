"use client";

import { useState } from "react";
import { useCart } from "../providers";
import { useAuth } from "../../hooks/useAuth";
import Dropdown from "../../components/Dropdown";
import Modal from "../../components/Modal";

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { cartItems, cartCount, clearCart, updateQuantity } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success" as "success" | "error", // success or error
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Philippines",
    paymentMethod: "card",
  });

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const validateForm = () => {
    const errors = [];

    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email))
      errors.push("Valid email is required");
    if (!formData.phone.trim()) errors.push("Phone number is required");
    if (!formData.address.trim()) errors.push("Address is required");
    if (!formData.city.trim()) errors.push("City is required");
    if (!formData.state.trim()) errors.push("State is required");
    if (!formData.zipCode.trim()) errors.push("ZIP code is required");

    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setShowModal({
        isOpen: true,
        title: "Validation Errors",
        message: validationErrors.join("\n- "),
        type: "error",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // In a real application, this would be an API call to process the order
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          items: cartItems,
          total: total,
          tax: total * 0.1,
          finalTotal: total * 1.1,
        }),
      });

      if (response.ok) {
        // Create order in database
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...formData,
            items: cartItems.map((item) => ({
              id: item.id, // database product ID
              quantity: item.quantity,
              price: item.price,
              name: item.name, // for reference only
            })),
            total: total,
            tax: total * 0.1,
            finalTotal: total * 1.1,
          }),
        });

        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("orders:refresh"));
          }
          setShowModal({
            isOpen: true,
            title: "Payment Successful!",
            message:
              "Thank you for your order! 🐾 Your payment has been processed successfully.",
            type: "success",
          });
          clearCart();
          // Reset form after successful checkout
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            country: "Philippines",
            paymentMethod: "card",
          });

          // Close modal and redirect to order confirmation or history page after a short delay
          setTimeout(() => {
            setShowModal({
              isOpen: false,
              title: "",
              message: "",
              type: "success",
            });
            window.location.href = `/history/${orderData.id}`;
          }, 2000); // Wait 2 seconds to show success message before redirecting
        } else {
          const errorData = await orderResponse.json();
          console.error("Failed to save order:", errorData);
          throw new Error(errorData.error || "Failed to save order");
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to process payment:", errorData);
        throw new Error(errorData.error || "Failed to process payment");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setShowModal({
        isOpen: true,
        title: "Checkout Error",
        message: "There was an error processing your order. Please try again.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <p className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Your cart is empty
          </p>
          <a
            href="/products"
            className="text-2xl text-green-600 hover:underline transition-colors duration-300"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Modal for showing alerts */}
      <Modal
        isOpen={showModal.isOpen}
        onClose={() =>
          setShowModal({
            isOpen: false,
            title: "",
            message: "",
            type: "success",
          })
        }
        title={showModal.title}
      >
        <div className="p-4">
          <p
            className={
              showModal.type === "error" ? "text-red-600" : "text-green-600"
            }
          >
            {showModal.message}
          </p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() =>
                setShowModal({
                  isOpen: false,
                  title: "",
                  message: "",
                  type: "success",
                })
              }
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Checkout
        {!loading && (
          <span className="ml-2 font-bold">
            ({user ? user.name || user.email.split("@")[0] : "Guest"})
          </span>
        )}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Checkout Form */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 sm:mb-6">
            Delivery Information
          </h2>

          <form onSubmit={handleCheckout}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country
              </label>
              <Dropdown
                options={[
                  { value: "Philippines", label: "Philippines" },
                  { value: "USA", label: "United States" },
                  { value: "Canada", label: "Canada" },
                  { value: "UK", label: "United Kingdom" },
                ]}
                selectedValue={formData.country}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, country: value }))
                }
                placeholder="Select a Country"
                className="w-full"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === "card"}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 accent-green-600"
                  />
                  <span className="ml-2">Credit/Debit Card</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === "paypal"}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 accent-green-600"
                  />
                  <span className="ml-2">PayPal</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 accent-green-600"
                  />
                  <span className="ml-2">Cash on Delivery</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                isProcessing
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } transition-colors duration-300`}
            >
              {isProcessing
                ? "Processing..."
                : `Pay $${(total * 1.1).toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 sm:mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Image</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500 mr-2">Qty:</span>
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold w-8 h-8 flex items-center justify-center"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            updateQuantity(item.id, newQuantity);
                          }}
                          className="w-10 text-center py-1 border-y border-gray-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold w-8 h-8 flex items-center justify-center"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${(total * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>${(total * 1.1).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
