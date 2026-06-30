import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


type ReviewWithUser = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: number;
    name: string | null;
    email: string;
  } | null;
};

type GroomerResponse = {
  id: number | null;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  totalReviews: number;
  averageRating: number;
  reviews: ReviewWithUser[];
};
export async function GET() {
  try {
    const dbGroomers = (await prisma.groomer.findMany({
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    })) as GroomerWithReviews[];

    type GroomerWithReviews = {
      id: number;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      reviews: ReviewWithUser[];
    };
    type GroomerReview = ReviewWithUser;

    const formattedFromDb: GroomerResponse[] = dbGroomers.map((g: GroomerWithReviews) => {
      const totalReviews: number = g.reviews.length;

      const averageRating: number =
        totalReviews > 0
          ? g.reviews.reduce(
              (sum: number, r: GroomerReview) => sum + r.rating,
              0
            ) / totalReviews
          : 0;

      return {
        id: g.id,
        name: g.name,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviews: g.reviews.map((r: GroomerReview): ReviewWithUser => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          user: r.user
            ? {
                id: r.user.id,
                name: r.user.name,
                email: r.user.email,
              }
            : null,
        })),
      };
    });

    if (formattedFromDb.length > 0) {
      return NextResponse.json(formattedFromDb, { status: 200 });
    }

    const appointments = await prisma.appointment.findMany({
      select: { groomer: true },
      where: { groomer: { not: "" } },
    });

    type AppointmentGroomer = { groomer: string | null };

    const uniqueNames: string[] = Array.from(
      new Set<string>(
        appointments
          .map((a: AppointmentGroomer) => a.groomer?.trim() || "")
          .filter((name: string) => name.length > 0)
      )
    ).sort();

    const fallback: GroomerResponse[] = uniqueNames.map(
      (name: string): GroomerResponse => ({
        id: null,
        name,
        createdAt: null,
        updatedAt: null,
        totalReviews: 0,
        averageRating: 0,
        reviews: [],
      })
    );

    return NextResponse.json(fallback, { status: 200 });
  } catch (err) {
    console.error("GET /api/groomers error:", err);
    return NextResponse.json(
      { error: "Failed to load groomers" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name: string = (body?.name || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Groomer name is required" },
        { status: 400 }
      );
    }


    const existing = await prisma.groomer.findFirst({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Groomer already exists" },
        { status: 400 }
      );
    }

    const newGroomer = await prisma.groomer.create({
      data: { name },
    });

    const response: GroomerResponse = {
      id: newGroomer.id,
      name: newGroomer.name,
      createdAt: newGroomer.createdAt,
      updatedAt: newGroomer.updatedAt,
      totalReviews: 0,
      averageRating: 0,
      reviews: [],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("POST /api/groomers error:", err);
    return NextResponse.json(
      { error: "Failed to create groomer" },
      { status: 500 }
    );
  }
}
