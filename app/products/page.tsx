"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

const GAME_CATEGORIES = ["Nintendo Switch", "PlayStation 5", "Xbox", "PC"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || [];
        const gamesOnly = list.filter((product: Product) =>
          GAME_CATEGORIES.includes(product.category)
        );
        setProducts(gamesOnly);
      })
      .catch(() => setProducts([]));
  }, []);

  const categories = useMemo(() => {
    return [
      "All Categories",
      ...Array.from(new Set(products.map((product) => product.category))),
    ];
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All Categories" || product.category === category;

    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-[#080b16] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
            PixelRent
          </p>

          <h1 className="text-4xl font-black text-white md:text-5xl">
            Browse Games
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Discover video games available for rent across PlayStation, Xbox,
            Nintendo Switch, and PC.
          </p>
        </div>

        <div className="mb-10 rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_280px]">
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-cyan-400"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none focus:border-cyan-400"
            >
              {categories.map((item) => (
                <option key={item} value={item} className="bg-[#111827]">
                  {item}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111827] px-4 py-3">
              <span className="text-sm font-bold text-gray-300">₱</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full bg-transparent text-white outline-none"
              />
              <span className="text-gray-400">to</span>
              <span className="text-sm font-bold text-gray-300">₱</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full bg-transparent text-white outline-none"
              />
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-xl font-bold text-white">No games found</h2>
            <p className="mt-2 text-gray-300">
              Try adjusting your search, platform, or rental price range.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}