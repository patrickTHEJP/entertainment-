"use client";

import React, { useEffect, useState } from "react";

/* -------- Types -------- */
interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: number; name?: string | null; email: string } | null;
}

interface GroomerDB {
  name: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

interface StaticGroomerProfile {
  name: string;
  appointments: number;
  experience: string;
}

/* -------- Stars Component -------- */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={
            i < Math.floor(rating)
              ? "text-[#13ec5b] text-lg"
              : "text-[#add7bb] text-lg"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

/* -------- Static Profiles -------- */
const STATIC_PROFILES: StaticGroomerProfile[] = [
  { name: "Jessica", appointments: 28, experience: "Patient & gentle groomer" },
  { name: "Mike", appointments: 35, experience: "Experienced pet groomer" },
  { name: "Sandra", appointments: 22, experience: "Professional with all pets" },
  { name: "Alex", appointments: 19, experience: "Great with nervous pets" },
  { name: "Taylor", appointments: 31, experience: "Expert pet stylist" },
];

export default function GroomersPage() {
  const [loading, setLoading] = useState(true);
  const [groomers, setGroomers] = useState<GroomerDB[]>([]);
  const [selected, setSelected] = useState<GroomerDB | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------- Load groomers from API -------- */
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/groomers");
        const data: GroomerDB[] = await res.json();
        if (mounted) setGroomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  /* -------- Modal handlers -------- */
  const openModal = (g: GroomerDB) => {
    setSelected(g);
    setRating(5);
    setComment("");
    setError(null);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  /* -------- Refresh reviews -------- */
  const refreshGroomer = async (name: string) => {
    const res = await fetch(`/api/groomers/${encodeURIComponent(name)}/reviews`);
    const data = await res.json();
    setGroomers((prev) =>
      prev.map((g) => (g.name === name ? { ...g, ...data } : g))
    );
  };

  /* -------- Submit review -------- */
  const submitReview = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);

    try {
      
      const session = await fetch("/api/auth/me").then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      });

      const userEmail = session?.user?.email;
      if (!userEmail) throw new Error("You must be logged in");

      const res = await fetch("/api/reviews/groomer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        body: JSON.stringify({
          groomerName: selected.name,
          rating,
          comment: comment || null,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Submit failed");

      await refreshGroomer(selected.name);
      closeModal();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Submission failed");
      } else {
        setError("Submission failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* -------- Merge static & DB data -------- */
  const fullGroomerProfiles = STATIC_PROFILES.map((profile) => {
    const db = groomers.find((g) => g.name === profile.name);
    return {
      ...profile,
      reviews: db?.reviews ?? [],
      averageRating: db?.averageRating ?? 0,
      totalReviews: db?.totalReviews ?? 0,
    };
  });

  /* -------- Render -------- */
  return (
    <div className="flex justify-center py-8">
      <div className="layout-content-container w-full max-w-6xl px-4 sm:px-0">
        <div className="text-center pb-6">
          <h1 className="text-3xl font-bold">Meet Our Professional Groomers</h1>
        </div>

        {loading ? (
          <div className="text-center py-16">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {fullGroomerProfiles.map((g) => (
              <div key={g.name} className="p-6 border rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xl">{g.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{g.name}</h3>
                    <Stars rating={g.averageRating} />
                    <span>{g.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="mt-2">
                  <strong>Experience:</strong> {g.experience}
                </p>
                <button
                  className="mt-3 bg-[#13ec5b] px-3 py-1 rounded"
                  onClick={() => openModal({ ...g } as GroomerDB)}
                >
                  View / Write Review
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={closeModal}
            ></div>
            <div className="relative bg-white rounded-xl p-6 max-w-xl w-full shadow-xl z-10">
              <h3 className="text-xl font-bold">{selected.name} — Reviews</h3>
              <div className="max-h-60 overflow-y-auto mt-2">
                {selected.reviews.length === 0 && <p>No reviews yet.</p>}
                {selected.reviews.map((r) => (
                  <div key={r.id} className="border-b pb-2 mb-2">
                    <Stars rating={r.rating} />
                    <p>{r.comment}</p>
                    <p className="text-xs">{r.user?.email}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label>Rating:</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your review"
                  className="w-full border mt-2 p-2"
                />
                {error && <p className="text-red-500">{error}</p>}
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={closeModal}>Cancel</button>
                  <button onClick={submitReview} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
