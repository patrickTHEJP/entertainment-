import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { getJwtSecret } from "@/lib/env";

export async function GET() {
  try {
    // Check for authentication
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as {
        id: number;
        email?: string;
        role?: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Admins can see all appointments, regular users can only see their appointments
    let appointments;
    if (decoded.role === "ADMIN") {
      appointments = await prisma.appointment.findMany({
        orderBy: { date: "asc" },
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
    } else {
      appointments = await prisma.appointment.findMany({
        where: {
          OR: [
            {
              userId: decoded.id,
            },
            {
              pet: {
                ownerId: decoded.id,
              },
            },
          ],
        },
        orderBy: { date: "asc" },
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Check for authentication
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as {
        id: number;
        email?: string;
        role?: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { service, groomer, date, notes, petId } = await req.json();

    if (!service || !groomer || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If petId is provided, verify that the user owns the pet
    const parsedPetId =
      typeof petId === "number"
        ? petId
        : typeof petId === "string" && petId.trim().length > 0
        ? parseInt(petId, 10)
        : null;

    if (parsedPetId) {
      const pet = await prisma.pet.findUnique({
        where: { id: parsedPetId },
      });

      if (!pet) {
        return NextResponse.json({ error: "Pet not found" }, { status: 404 });
      }

      // Check if user is admin or the owner of the pet
      if (decoded.role !== "ADMIN" && pet.ownerId !== decoded.id) {
        return NextResponse.json(
          {
            error:
              "Unauthorized: You can only book appointments for your own pets",
          },
          { status: 403 }
        );
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        service,
        groomer,
        date: new Date(date),
        notes: notes ?? "",
        petId: parsedPetId,
        userId: decoded.id,
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
          },
        },
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
