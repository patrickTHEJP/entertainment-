import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";
import { getJwtSecret } from "@/lib/env";

type CheckoutItem = {
  id: number;
  quantity: number;
  price: number;
};

type CheckoutPayload = {
  items: CheckoutItem[];
  total: number;
  tax: number;
  finalTotal: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: string;
};

export async function GET() {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return new Response("Server configuration error", { status: 500 });
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      email?: string;
      role?: string;
    };

    const orders = await prisma.order.findMany({
      where: {
        userId: decoded.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      return new Response("Server configuration error", { status: 500 });
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      email?: string;
      role?: string;
    };

    const {
      items,
      total,
      tax,
      finalTotal,
      firstName,
      lastName,
      email: customerEmail,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      paymentMethod,
    } = (await request.json()) as CheckoutPayload;

    const shippingDetails = {
      firstName,
      lastName,
      email: customerEmail,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      paymentMethod,
    };

    if (Math.abs(total + tax - finalTotal) > 0.01) {
      return new Response("Invalid totals supplied", { status: 400 });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: decoded.id,
        total: finalTotal,
        status: "PAID", // Since payment is processed in checkout
        items: {
          create: items.map((item) => ({
            productId: item.id, // This should be the database product ID
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    return new Response(JSON.stringify({ order, shippingDetails }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
