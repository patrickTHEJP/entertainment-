export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { getJwtSecret } from "@/lib/env";

type PetUpdateData = {
  name?: string;
  species?: string | null;
  breed?: string | null;
  sex?: string | null;
  dob?: Date | null;
};

// GET route to fetch a single pet
export async function GET(
  request: NextRequest,
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

    const petId = parseInt(params.id);
    if (isNaN(petId)) {
      return NextResponse.json({ message: "Invalid pet ID" }, { status: 400 });
    }

    // Fetch the pet with its owner
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    // Check if user is admin or the owner of the pet
    if (decoded.role !== "ADMIN" && pet.ownerId !== decoded.id) {
      return NextResponse.json(
        { message: "Unauthorized: Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ pet }, { status: 200 });
  } catch (err) {
    console.error("GET PET ERROR:", err);

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

// PUT route to update a pet
export async function PUT(
  request: NextRequest,
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

    const { name, species, breed, sex, dob } = await request.json();

    const petId = parseInt(params.id);
    if (isNaN(petId)) {
      return NextResponse.json({ message: "Invalid pet ID" }, { status: 400 });
    }

    // Fetch the existing pet to check ownership
    const existingPet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!existingPet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    // Check if user is admin or the owner of the pet
    if (decoded.role !== "ADMIN" && existingPet.ownerId !== decoded.id) {
      return NextResponse.json(
        { message: "Unauthorized: Access denied" },
        { status: 403 }
      );
    }

    // Build update data based on provided fields
    const updateData: PetUpdateData = {};
    if (name !== undefined) updateData.name = name;
    if (species !== undefined) updateData.species = species;
    if (breed !== undefined) updateData.breed = breed;
    if (sex !== undefined) updateData.sex = sex;
    if (dob !== undefined) updateData.dob = dob ? new Date(dob) : null;

    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: updateData,
    });

    return NextResponse.json({ pet: updatedPet }, { status: 200 });
  } catch (err) {
    console.error("UPDATE PET ERROR:", err);

    if (err instanceof TokenExpiredError) {
      return NextResponse.json({ message: "Token expired" }, { status: 401 });
    }
    if (err instanceof JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if ((err as Error).message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE route to delete a pet
export async function DELETE(
  request: NextRequest,
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

    const petId = parseInt(params.id);
    if (isNaN(petId)) {
      return NextResponse.json({ message: "Invalid pet ID" }, { status: 400 });
    }

    // Fetch the existing pet to check ownership
    const existingPet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!existingPet) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }

    // Check if user is admin or the owner of the pet
    if (decoded.role !== "ADMIN" && existingPet.ownerId !== decoded.id) {
      return NextResponse.json(
        { message: "Unauthorized: Access denied" },
        { status: 403 }
      );
    }

    await prisma.pet.delete({
      where: { id: petId },
    });

    return NextResponse.json(
      { message: "Pet deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE PET ERROR:", err);

    if (err instanceof TokenExpiredError) {
      return NextResponse.json({ message: "Token expired" }, { status: 401 });
    }
    if (err instanceof JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if ((err as Error).message.includes("RecordNotFound")) {
      return NextResponse.json({ message: "Pet not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
