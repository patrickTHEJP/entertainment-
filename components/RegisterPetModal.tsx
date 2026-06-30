"use client";

import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Dropdown from "./Dropdown";

interface RegisterPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPetRegistered?: () => void;
}

const RegisterPetModal: React.FC<RegisterPetModalProps> = ({
  isOpen,
  onClose,
  onPetRegistered,
}) => {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load form data from localStorage on component mount
  useEffect(() => {
    if (isOpen) {
      const savedFormData = localStorage.getItem("petRegistrationFormData");
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          setName(parsedData.name || "");
          setSpecies(parsedData.species || "");
          setBreed(parsedData.breed || "");
          setSex(parsedData.sex || "");
          setDob(parsedData.dob || "");
        } catch (e) {
          console.error("Error parsing saved form data:", e);
        }
      }
    } else {
      // Reset form when modal closes
      setName("");
      setSpecies("");
      setBreed("");
      setSex("");
      setDob("");
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  // Save form data to localStorage whenever any field changes
  useEffect(() => {
    const formData = {
      name,
      species,
      breed,
      sex,
      dob,
    };
    localStorage.setItem("petRegistrationFormData", JSON.stringify(formData));
  }, [name, species, breed, sex, dob]);

  const handlePetRegistration = async () => {
    // Reset previous messages
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (!name.trim()) {
      setError("Pet name is required.");
      return;
    }

    if (name.trim().length < 2) {
      setError("Pet name must be at least 2 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          species,
          breed,
          sex,
          dob: dob ? new Date(dob) : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await res.json();
      console.log("Pet registered:", data);

      setSuccess("Pet registered successfully!");

      // Clear saved form data after successful registration
      localStorage.removeItem("petRegistrationFormData");

      // Reset form
      setName("");
      setSpecies("");
      setBreed("");
      setSex("");
      setDob("");

      // Call the callback function to refresh pets list
      onPetRegistered?.();

      // Close modal after successful registration
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }

    setLoading(false);
  };

  const handleClearForm = () => {
    setName("");
    setSpecies("");
    setBreed("");
    setSex("");
    setDob("");
    localStorage.removeItem("petRegistrationFormData");
  };

  const handleClose = () => {
    // Clear form and errors when closing
    setName("");
    setSpecies("");
    setBreed("");
    setSex("");
    setDob("");
    setError(null);
    setSuccess(null);
    localStorage.removeItem("petRegistrationFormData");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Register Your Pet">
      <div className="max-w-md w-full space-y-4">
        {error && (
          <div className="w-full">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="w-full">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl text-center">
              {success}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Pet Name *"
              className="w-full rounded-xl text-[#0d1b12] focus:outline-0 focus:ring-2 focus:ring-[#13ec5b] border-[#cfe7d7] bg-[#f8fcf9] h-14 p-4 pr-4 text-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Dropdown
              options={[
                { value: "", label: "Select Species" },
                { value: "dog", label: "Dog" },
                { value: "cat", label: "Cat" },
                { value: "bird", label: "Bird" },
                { value: "rabbit", label: "Rabbit" },
                { value: "other", label: "Other" },
              ]}
              selectedValue={species}
              onChange={setSpecies}
              placeholder="Select Species"
              className="w-full"
            />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Breed"
              className="w-full rounded-xl text-[#0d1b12] focus:outline-0 focus:ring-2 focus:ring-[#13ec5b] border-[#cfe7d7] bg-[#f8fcf9] h-14 p-4 pr-4 text-base"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
            />
          </div>

          <div>
            <Dropdown
              options={[
                { value: "", label: "Select Sex" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "unknown", label: "Unknown" },
              ]}
              selectedValue={sex}
              onChange={setSex}
              placeholder="Select Sex"
              className="w-full"
            />
          </div>

          <div className="relative">
            <input
              type="date"
              className="w-full rounded-xl text-[#0d1b12] focus:outline-0 focus:ring-2 focus:ring-[#13ec5b] border-[#cfe7d7] bg-[#f8fcf9] h-14 p-4 pr-4 text-base"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <button
            onClick={handleClearForm}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-[#e7f3eb] text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity flex-1"
          >
            Clear Form
          </button>
          <button
            onClick={handlePetRegistration}
            disabled={loading}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-[#13ec5b] text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity disabled:opacity-50 flex-1"
          >
            {loading ? "Registering..." : "Register Pet"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RegisterPetModal;
