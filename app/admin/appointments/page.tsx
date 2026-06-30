"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import AdminSidebar from "../../../components/AdminSidebar";

interface AuthUser {
  id: number;
  email: string;
  role: string;
}

interface Appointment {
  id: number;
  service: string;
  groomer: string;
  date: string;
  status: string;
  notes: string;
  petId: number | null;
  pet?: {
    id: number;
    name: string;
    species: string;
    breed: string;
    owner?: {
      id: number;
      name: string | null;
      email: string;
    };
  };
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
}

const AdminAppointmentsPage = () => {
  const { user: authUser, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Define the correct type for the auth user
  const typedAuthUser = authUser as AuthUser | null;

  const fetchData = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoadingData(true);
    }

    try {
      const appointmentsRes = await fetch("/api/appointments", {
        credentials: "include",
      });

      if (appointmentsRes.ok) {
        const appointmentsData: { appointments?: Appointment[] } | Appointment[] =
          await appointmentsRes.json();
        if (Array.isArray(appointmentsData)) {
          setAppointments(appointmentsData);
        } else {
          setAppointments(appointmentsData.appointments || []);
        }
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      if (showLoader) {
        setLoadingData(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!typedAuthUser) {
        router.push("/login");
      } else if (typedAuthUser.role !== "ADMIN") {
        router.push("/"); // Redirect non-admins to home
      } else {
        fetchData(true);
      }
    }
  }, [typedAuthUser, loading, router, fetchData]);

  useEffect(() => {
    if (!typedAuthUser || typedAuthUser.role !== "ADMIN") return;
    if (typeof window === "undefined") return;

    const handleRefresh = () => fetchData(false);
    window.addEventListener("appointments:refresh", handleRefresh);
    const intervalId = window.setInterval(() => fetchData(false), 5000);

    return () => {
      window.removeEventListener("appointments:refresh", handleRefresh);
      window.clearInterval(intervalId);
    };
  }, [typedAuthUser, fetchData]);

  const updateAppointmentStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      if (res.ok) {
        await fetchData(false);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("appointments:refresh"));
        }
      } else {
        alert("Failed to update appointment status");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Error updating appointment status");
    }
  };

  const deleteAppointment = async (id: number) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        const res = await fetch(`/api/appointments/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (res.ok) {
          await fetchData(false);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("appointments:refresh"));
          }
        } else {
          alert("Failed to delete appointment");
        }
      } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("Error deleting appointment");
      }
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen bg-[#f8fcf9]">
        <AdminSidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-2xl font-semibold text-[#0d1b12]">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fcf9]">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#0d1b12]">
              Appointment Management
            </h1>
            <p className="text-[#4c9a66]">Manage appointments and schedules</p>
          </header>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#0d1b12] mb-4">
                Appointments
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Groomer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Pet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {appointment.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {appointment.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {appointment.groomer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {appointment.user?.name ||
                            appointment.user?.email ||
                            appointment.pet?.owner?.name ||
                            "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {new Date(appointment.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          <select
                            value={appointment.status}
                            onChange={(e) =>
                              updateAppointmentStatus(
                                appointment.id,
                                e.target.value
                              )
                            }
                            className={`border rounded px-2 py-1 text-sm ${
                              appointment.status === "SCHEDULED"
                                ? "border-yellow-500"
                                : appointment.status === "COMPLETED"
                                ? "border-green-500"
                                : appointment.status === "CANCELLED"
                                ? "border-red-500"
                                : "border-gray-500"
                            }`}
                          >
                            <option value="SCHEDULED">SCHEDULED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="NO_SHOW">NO_SHOW</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {appointment.pet ? appointment.pet.name : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          <button
                            onClick={() => deleteAppointment(appointment.id)}
                            className="text-red-600 hover:text-red-900 font-medium mr-4"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointmentsPage;
