
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const userEmail = req.headers.get("x-user-email"); 
    if (!userEmail) {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { groomerName, rating, comment } = await req.json();

    const groomer = await prisma.groomer.findUnique({
      where: { name: groomerName },
    });

    if (!groomer) {
      return NextResponse.json({ error: "Groomer not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: user.id,
        groomerId: groomer.id,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (err) {
    console.error("POST /reviews/groomer error:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
