"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080b16] text-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
        <div className="mb-6 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
          Video Game Rental System
        </div>

        <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
          Rent Games. Play More. Spend Less.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-300">
          Browse popular titles, reserve your favorite games, checkout rentals,
          and track your rental history in one place.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/products"
            className="rounded-full bg-cyan-400 px-8 py-3 font-bold text-[#080b16] transition hover:bg-cyan-300"
          >
            Browse Games
          </Link>

          <Link
            href="/booking"
            className="rounded-full border border-white/20 px-8 py-3 font-bold text-white transition hover:bg-white/10"
          >
            Reserve a Game
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-20 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-cyan-300">Latest Games</h2>
          <p className="mt-3 text-gray-300">
            Rent games from PlayStation, Xbox, Nintendo Switch, and PC.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-cyan-300">Easy Checkout</h2>
          <p className="mt-3 text-gray-300">
            Add games to your rental cart and confirm your rental order.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-cyan-300">Rental History</h2>
          <p className="mt-3 text-gray-300">
            View your previous rentals, order status, and game details.
          </p>
        </div>
      </section>
    </div>
  );
}