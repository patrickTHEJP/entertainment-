import fallbackProducts from "@/data/products";
import type { Product as ProductResponse } from "@/types";
import { prisma } from "../../../lib/prisma";

const jsonResponse = (
  payload: ProductResponse[],
  status = 200
): Response => {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export async function GET() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL missing; serving fallback products.");
    return jsonResponse(fallbackProducts);
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: "asc",
      },
    });

    // Transform the products to match the frontend Product type
    const transformedProducts: ProductResponse[] = products.map(
      (product: (typeof products)[number]): ProductResponse => ({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image || "",
        category: product.category || "",
        description: product.description || "",
      })
    );

    return jsonResponse(transformedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return jsonResponse(fallbackProducts);
  }
}
