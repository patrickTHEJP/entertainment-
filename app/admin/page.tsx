"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import AdminSidebar from "../../components/AdminSidebar";

interface AuthUser {
  id: number;
  email: string;
  role: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  name?: string;
  createdAt: string;
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

const AdminDashboard = () => {
  const { user: authUser, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Define the correct type for the auth user
  const typedAuthUser = authUser as AuthUser | null;

  const fetchData = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoadingData(true);
    }

    try {
      const [usersRes, appointmentsRes] = await Promise.all([
        fetch("/api/users", { credentials: "include" }),
        fetch("/api/appointments", { credentials: "include" }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

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
      console.error("Error fetching data:", error);
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

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fcf9]">
        <div className="text-2xl font-semibold text-[#0d1b12]">Loading...</div>
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
              Admin Dashboard
            </h1>
            <p className="text-[#4c9a66]">Manage users and appointments</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Stats Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-[#0d1b12] mb-4">
                User Statistics
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#0d1b12]">Total Users:</span>
                  <span className="font-medium">{users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0d1b12]">Admin Users:</span>
                  <span className="font-medium">
                    {users.filter((u) => u.role === "ADMIN").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment Stats Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-[#0d1b12] mb-4">
                Appointment Statistics
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#0d1b12]">Total Appointments:</span>
                  <span className="font-medium">{appointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0d1b12]">Scheduled:</span>
                  <span className="font-medium">
                    {
                      appointments.filter((a) => a.status === "SCHEDULED")
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0d1b12]">Completed:</span>
                  <span className="font-medium">
                    {
                      appointments.filter((a) => a.status === "COMPLETED")
                        .length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#0d1b12] mb-4">
                Users
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {user.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "ADMIN"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
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
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0d1b12] uppercase tracking-wider">
                        Pet
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
                          {new Date(appointment.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {appointment.user?.name ||
                            appointment.user?.email ||
                            appointment.pet?.owner?.name ||
                            "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appointment.status === "SCHEDULED"
                                ? "bg-yellow-100 text-yellow-800"
                                : appointment.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : appointment.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0d1b12]">
                          {appointment.pet ? appointment.pet.name : "N/A"}
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

export default AdminDashboard;
