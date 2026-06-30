"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Testimonial } from "@/types";
import TestimonialCard from "../components/TestimonialCard";
import { useAuth } from "@/hooks/useAuth";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

const testimonials: Testimonial[] = [
  {
    name: "Sophia Clark",
    time: "2 months ago",
    rating: 5,
    review:
      "My dog, Max, always comes back happy and looking great! The groomers are so caring and professional.",
    avatarUrl: "https://picsum.photos/id/1027/100/100",
  },
  {
    name: "Ethan Miller",
    time: "3 months ago",
    rating: 4,
    review:
      "The service was excellent, and my cat, Whiskers, was very relaxed throughout the grooming session.",
    avatarUrl: "https://picsum.photos/id/1005/100/100",
  },
  {
    name: "Olivia Davis",
    time: "4 months ago",
    rating: 5,
    review:
      "I've been bringing my pets here for years, and they always do an amazing job. Highly recommend!",
    avatarUrl: "https://picsum.photos/id/1011/100/100",
  },
  {
    name: "James Wilson",
    time: "1 month ago",
    rating: 5,
    review:
      "The staff is incredibly knowledgeable and patient with my anxious dog. The grooming results are always fantastic!",
    avatarUrl: "https://picsum.photos/id/1018/100/100",
  },
  {
    name: "Ava Thompson",
    time: "3 weeks ago",
    rating: 4,
    review:
      "Great experience overall. My puppy's nails were trimmed carefully and she was so gentle during the process.",
    avatarUrl: "https://picsum.photos/id/1012/100/100",
  },
  {
    name: "Noah Johnson",
    time: "5 weeks ago",
    rating: 5,
    review:
      "Professional service and my pet looks so healthy and clean after each visit. I trust them completely with my pets.",
    avatarUrl: "https://picsum.photos/id/1008/100/100",
  },
];

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold">
        Checking session...
      </div>
    );
  }

  return (
    <div className="flex justify-center py-5">
      <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1 px-4 sm:px-0 rounded-bl-2xl rounded-br-2xl">
        {/* 🔹 Main content */}
        <div className="relative flex items-center justify-center bg-black aspect-video rounded-lg overflow-hidden"></div>
        <h1 className="text-[#0d1b12] tracking-light text-2xl md:text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
          Your Pet&apos;s Grooming Partner
        </h1>

        <div className="flex flex-col sm:flex-row justify-center gap-4 my-4">
          <button
            onClick={() => {
              if (user) {
                // If logged in, redirect to services page
                window.location.href = "/services";
              } else {
                // If not logged in, open login modal
                setIsLoginModalOpen(true);
              }
            }}
            className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#13ec5b] text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
          >
            <span className="truncate">Book Appointment</span>
          </button>
          <Link
            href="/products"
            className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e7f3eb] text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#d8e9df] transition-colors"
          >
            <span className="truncate">Shop Products</span>
          </Link>
        </div>

        {/* 🔹 Testimonials section */}
        <div className="flex justify-between items-center px-4 pb-3 pt-5">
          <h2 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em]">
            Customer Testimonials
          </h2>
          <Link
            href="/reviews"
            className="text-[#4c9a66] text-sm font-medium leading-normal hover:underline flex items-center"
          >
            See more reviews →
          </Link>
        </div>
        <div className="flex flex-col gap-8 overflow-x-hidden p-4">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>

      {/* Login and Register Modals */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToRegister={() => {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(true);
          }}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSwitchToLogin={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
