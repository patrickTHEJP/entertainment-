"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Calendar from "./Calendar";
import LoginModal from "./LoginModal";
import RegisterPetModal from "./RegisterPetModal";

type PetSummary = {
  id: number;
  name: string;
  species?: string | null;
};

const BookingForm: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [service, setService] = useState("");
  const [groomer, setGroomer] = useState("");

  // Get initial service, groomer, date, and petId from URL parameters if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceParam = urlParams.get("service");
      const groomerParam = urlParams.get("groomer");
      const dateParam = urlParams.get("date");
      const petIdParam = urlParams.get("petId");

      if (serviceParam) setService(serviceParam);
      if (groomerParam) setGroomer(groomerParam);
      if (dateParam) {
        const date = new Date(dateParam);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        }
      }
      if (petIdParam) setPetId(petIdParam);
    }
  }, []);
  const [petId, setPetId] = useState<string>("");
  const [pets, setPets] = useState<PetSummary[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegisterPetModalOpen, setIsRegisterPetModalOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Fetch user's pets when user is authenticated
  useEffect(() => {
    const fetchPets = async () => {
      if (user) {
        try {
          const response = await fetch("/api/pets");
          if (response.ok) {
            const petsData: PetSummary[] = await response.json();
            setPets(petsData);
          }
        } catch (error) {
          console.error("Error fetching pets:", error);
        }
      } else {
        setPets([]);
        setPetId("");
      }
    };

    fetchPets();
  }, [user]);

  const refreshPets = async () => {
    if (user) {
      try {
        const response = await fetch("/api/pets");
        if (response.ok) {
          const petsData: PetSummary[] = await response.json();
          setPets(petsData);
        }
      } catch (error) {
        console.error("Error refreshing pets:", error);
      }
    }
  };

  const handleBooking = async () => {
    if (!service || !groomer || !selectedDate) {
      alert("Please complete all fields.");
      return;
    }

    // Check authentication status at the moment of click
    // Since we're using a hook, we need to re-fetch the auth status
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const authData = await res.json();

      if (!res.ok || !authData.user) {
        // User is not authenticated, show login modal
        setShowLoginModal(true);
        return;
      }

      // User is authenticated, proceed with booking
      setLoading(true);

      const bookingRes = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service,
          groomer,
          date: selectedDate,
          notes,
          petId: petId ? parseInt(petId) : null,
        }),
        credentials: "include",
      });

      if (!bookingRes.ok) {
        throw new Error("Booking failed");
      }

      const data = await bookingRes.json();
      console.log("Appointment created:", data);

      alert("Appointment booked successfully!");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("appointments:refresh"));
      }

      // Reset form
      setService("");
      setGroomer("");
      setPetId("");
      setNotes("");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  if (authLoading) {
    return <div className="flex justify-center py-5">Loading...</div>;
  }

  return (
    <div className="flex justify-center py-5">
      <div className="layout-content-container flex flex-col items-center max-w-[960px] flex-1 px-4">
        <h2 className="text-[#0d1b12] tracking-light text-[28px] font-bold leading-tight text-center pb-3 pt-5">
          Book an Appointment
        </h2>
        {user && (
          <div className="py-3">
            <button
              onClick={() => setIsRegisterPetModalOpen(true)}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-[#13ec5b] text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
            >
              Register Pet
            </button>
          </div>
        )}

        <div className="w-full max-w-md space-y-4 py-3">
          {/* Pet Selection */}
          {user && (
            <div className="relative">
              <select
                className="appearance-none w-full cursor-pointer rounded-xl text-[#0d1b12] focus:outline-0 focus:ring-2 focus:ring-[#13ec5b] border border-[#cfe7d7] bg-[#f8fcf9] h-14 p-4 pr-10 text-base"
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                disabled={pets.length === 0}
              >
                <option value="">
                  {pets.length > 0 ? "Select a Pet" : "No pets registered"}
                </option>
                {pets.map((pet) => (
                  <option key={pet.id} value={String(pet.id)}>
                    {pet.name} ({pet.species || "Pet"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Service Selection */}
          <div className="relative">
            <select
              className="appearance-none w-full cursor-pointer rounded-xl text-[#0d1b12] focus:outline-0 focus:ring-2 focus:ring-[#13ec5b] border border-[#cfe7d7] bg-[#f8fcf9] h-14 p-4 pr-10 text-base"
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              <option value="">Select a Service</option>
              <option value="grooming">Full Grooming</option>
              <option value="bath">Bath & Brush</option>
              <option value="nails">Nail Trim</option>
            </select>
          </div>

          {/* Groomer Selection */}
          <div className="relative">
            <select
              className="appearance-none w-full cursor-pointer rounded-xl text-[#0d1b12] focus:outline-0 focus:ring-2 focus:ring-[#13ec5b] border border-[#cfe7d7] bg-[#f8fcf9] h-14 p-4 pr-10 text-base"
              value={groomer}
              onChange={(e) => setGroomer(e.target.value)}
            >
              <option value="">Select a Groomer</option>
              <option value="any">Any Available</option>
              <option value="jessica">Jessica</option>
              <option value="mike">Mike</option>
              <option value="sandra">Sandra</option>
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
            {loading ? "Booking..." : "Book Now"}
          </button>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            // We can handle the register switch here if needed
          }}
        />
      )}

      {isRegisterPetModalOpen && (
        <RegisterPetModal
          isOpen={isRegisterPetModalOpen}
          onClose={() => setIsRegisterPetModalOpen(false)}
          onPetRegistered={refreshPets}
        />
      )}
    </div>
  );
};

export default BookingForm;
