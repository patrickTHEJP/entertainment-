export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { getJwtSecret } from "@/lib/env";

type AppointmentUpdateData = {
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  service?: string;
  groomer?: string;
  date?: Date;
  notes?: string | null;
};

// GET route to fetch a single appointment
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "No token found" }, { status: 401 });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      email?: string;
      role?: string;
    };

    const appointmentId = parseInt(params.id);
    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { message: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    // Admins can see all appointments, regular users can only see their own appointments through pets
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    // If user is not admin, ensure they own the appointment directly or via pet ownership
    if (
      decoded.role !== "ADMIN" &&
      appointment.userId !== decoded.id &&
      (!appointment.pet || appointment.pet.owner?.id !== decoded.id)
    ) {
      return NextResponse.json(
        { message: "Unauthorized: Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ appointment }, { status: 200 });
  } catch (err) {
    console.error("GET APPOINTMENT ERROR:", err);

    if (err instanceof TokenExpiredError) {
      return NextResponse.json({ message: "Token expired" }, { status: 401 });
    }
    if (err instanceof JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT route to update appointment status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "No token found" }, { status: 401 });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      email?: string;
      role?: string;
    };

    // Check if user is admin
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { status, service, groomer, date, notes } = await request.json();

    // Validate status if it's provided
    if (
      status &&
      !["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"].includes(status)
    ) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const appointmentId = parseInt(params.id);
    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { message: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    // Build update data based on provided fields
    const updateData: AppointmentUpdateData = {};
    if (status !== undefined) updateData.status = status;
    if (service !== undefined) updateData.service = service;
    if (groomer !== undefined) updateData.groomer = groomer;
    if (date !== undefined) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      { appointment: updatedAppointment },
      { status: 200 }
    );
  } catch (err) {
    console.error("UPDATE APPOINTMENT ERROR:", err);

    if (err instanceof TokenExpiredError) {
      return NextResponse.json({ message: "Token expired" }, { status: 401 });
    }
    if (err instanceof JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if ((err as Error).message.includes("RecordNotFound")) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE route to delete an appointment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "No token found" }, { status: 401 });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      email?: string;
      role?: string;
    };

    // Check if user is admin
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const appointmentId = parseInt(params.id);
    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { message: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    return NextResponse.json(
      { message: "Appointment deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE APPOINTMENT ERROR:", err);

    if (err instanceof TokenExpiredError) {
      return NextResponse.json({ message: "Token expired" }, { status: 401 });
    }
    if (err instanceof JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if ((err as Error).message.includes("RecordNotFound")) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
