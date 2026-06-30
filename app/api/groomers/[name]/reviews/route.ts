import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { name: string };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const name = decodeURIComponent(params.name);

    const groomer = await prisma.groomer.findUnique({
      where: { name },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!groomer) return NextResponse.json({ error: "Groomer not found" }, { status: 404 });

    const totalReviews = groomer.reviews.length;
    const averageRating =
      totalReviews === 0
        ? 0
        : groomer.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
          totalReviews;

    return NextResponse.json({
      id: groomer.id,
      name: groomer.name,
      reviews: groomer.reviews,
      totalReviews,
      averageRating,
    });
  } catch (err) {
    console.error("GET /groomers/[name]/reviews error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
