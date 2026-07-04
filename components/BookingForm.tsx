"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Calendar from "./Calendar";
import LoginModal from "./LoginModal";
import type { Product } from "@/types";

const GAME_CATEGORIES = ["Nintendo Switch", "PlayStation 5", "Xbox", "PC"];

const BookingForm: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [game, setGame] = useState("");
  const [games, setGames] = useState<Product[]>([]);

  // Get initial game and date from URL parameters if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const gameParam = urlParams.get("game");
      const dateParam = urlParams.get("date");

      if (gameParam) setGame(gameParam);
      if (dateParam) {
        const date = new Date(dateParam);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        }
      }
    }
  }, []);

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Fetch available games for the dropdown
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products || [];
        const gamesOnly = list.filter((product: Product) =>
          GAME_CATEGORIES.includes(product.category)
        );
        setGames(gamesOnly);
      })
      .catch(() => setGames([]));
  }, []);

  const handleBooking = async () => {
    if (!game || !selectedDate) {
      alert("Please select a game and a date.");
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const authData = await res.json();

      if (!res.ok || !authData.user) {
        setShowLoginModal(true);
        return;
      }

      setLoading(true);

      const bookingRes = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service: "Game Rental",
          groomer: game,
          date: selectedDate,
          notes,
          petId: null,
        }),
        credentials: "include",
      });

      if (!bookingRes.ok) {
        throw new Error("Booking failed");
      }

      const data = await bookingRes.json();
      console.log("Reservation created:", data);

      alert("Game reserved successfully!");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("appointments:refresh"));
      }

      setGame("");
      setNotes("");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  if (authLoading) {
    return <div className="flex justify-center py-5 text-white">Loading...</div>;
  }

  return (
    <div className="flex justify-center py-5">
      <div className="layout-content-container flex flex-col items-center max-w-[960px] flex-1 px-4">
        <h2 className="text-white tracking-light text-[28px] font-bold leading-tight text-center pb-3 pt-5">
          Reserve a Game
        </h2>

        <div className="w-full max-w-md space-y-4 py-3">
          {/* Game Selection */}
          <div className="relative">
            <select
              className="appearance-none w-full cursor-pointer rounded-xl text-[#0d1b12] focus:outline-0 focus:ring-2 focus:ring-[#13ec5b] border border-[#cfe7d7] bg-[#f8fcf9] h-14 p-4 pr-10 text-base"
              value={game}
              onChange={(e) => setGame(e.target.value)}
            >
              <option value="">
                {games.length > 0 ? "Select a Game" : "Loading games..."}
              </option>
              {games.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name} ({g.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

        <div className="w-full max-w-md py-3">
          <textarea
            placeholder="Special instructions"
            className="form-input flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-xl text-[#0d1b12] focus:outline-0 focus:ring-2 focus:ring-[#13ec5b] border border-[#cfe7d7] bg-[#f8fcf9] min-h-36 placeholder:text-[#4c9a66] p-4 text-base font-normal leading-normal"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        <div className="py-3">
          <button
            onClick={handleBooking}
            disabled={loading}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-[#13ec5b] text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Reserving..." : "Reserve Now"}
          </button>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
          }}
        />
      )}
    </div>
  );
};

export default BookingForm;
