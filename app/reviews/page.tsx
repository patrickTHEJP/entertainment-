"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TestimonialCard from "../../components/TestimonialCard";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch("/api/reviews", { cache: "no-store" });
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  return (
    <div className="flex justify-center py-8">
      <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1 px-4 sm:px-0">
        {/* Back Button */}
        <div className="px-4 pb-3 pt-6">
          <Link
            href="/"
            className="text-[#0d1b12] text-base font-medium hover:text-[#4c9a66] flex items-center gap-2 transition-colors duration-200"
          >
            <span className="text-lg">←</span>
            <span>Back to home page</span>
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-[#0d1b12] text-3xl font-bold leading-tight px-4 pb-3 pt-2 text-center">
          All Customer Reviews
        </h1>

        {/* Write Review Button */}
        <div className="px-4 pb-5">
          <Link href="/reviews/new">
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Write a Review
            </button>
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-2"></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          </div>
        )}

        {/* No reviews */}
        {!loading && reviews.length === 0 && (
          <div className="text-center p-8 bg-gray-50 rounded-xl mx-4">
            <p className="text-gray-600 text-lg">
              No reviews yet. Be the first to write one!
            </p>
            <Link href="/reviews/new">
              <button className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300">
                Write Your Review
              </button>
            </Link>
          </div>
        )}

        {/* Reviews grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4">
          {reviews.map((review) => {
            const displayName =
              review.user?.name || review.user?.email || "Anonymous";

            return (
              <TestimonialCard
                key={review.id}
                testimonial={{
                  name: displayName,
                  time: new Date(review.createdAt).toLocaleDateString(),
                  rating: review.rating,
                  review: review.comment ?? "",
                  avatarUrl:
                    review.user?.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
