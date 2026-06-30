"use client";

import Image from "next/image";
import type { Product } from "@/types";
import { useCart } from "@/app/providers";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-xl transition hover:-translate-y-1 hover:bg-white/[0.14]">
      <div className="relative h-56 w-full bg-[#111827]">
        <Image
          src={product.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e"}
          alt={product.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
            {product.category}
          </span>

          <span className="text-lg font-black text-cyan-300">
            ₱{product.price}
          </span>
        </div>

        <h2 className="text-xl font-black text-white">{product.name}</h2>

        <p className="mt-2 line-clamp-3 text-sm text-gray-300">
          {product.description || "Available video game for rental."}
        </p>

        <button
          onClick={() => addToCart(product)}
          className="mt-5 w-full rounded-xl bg-cyan-400 px-4 py-3 font-black text-[#080b16] transition hover:bg-cyan-300"
        >
          Rent Game
        </button>
      </div>
    </div>
  );
}