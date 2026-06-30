
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        product: true,
        groomer: true, 
      },
    });

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error("GET /reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in to create a review" },
        { status: 401 }
      );
    }

    let decoded: (JwtPayload & { id: number }) | null = null;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { id: number };
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    
    const { rating, comment, productId, groomerId } = await req.json();

    if (!rating) {
      return NextResponse.json(
        { error: "Rating is required" },
        { status: 400 }
      );
    }

   
    const review = await prisma.review.create({
      data: {
        userId,
        rating,
        comment: comment || null,
        productId: productId || null,   
        groomerId: groomerId || null,   
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /reviews error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
