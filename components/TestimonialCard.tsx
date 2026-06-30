"use client";

import React from "react";
import type { Testimonial } from "@/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  return (
    <div className="flex flex-col gap-4 p-6 border border-gray-100 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-green-100 relative overflow-hidden">
      <div className="flex items-center gap-3">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border-2 border-green-100"
          style={{ backgroundImage: `url(${testimonial.avatarUrl})` }}
        ></div>
        <div className="flex-1">
          <p className="text-[#0d1b12] text-base font-medium leading-normal">
            {testimonial.name}
          </p>
          <p className="text-[#4c9a66] text-sm font-normal leading-normal">
            {testimonial.time}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={
              i < testimonial.rating
                ? "text-[#13ec5b] text-lg"
                : "text-[#add7bb] text-lg"
            }
          >
            ★
          </span>
        ))}
      </div>
      <p className="text-[#0d1b12] text-base font-normal leading-normal">
        &ldquo;{testimonial.review}&rdquo;
      </p>
    </div>
  );
};

export default TestimonialCard;
