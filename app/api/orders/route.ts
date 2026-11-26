
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const PAYMENT_METHODS = ["COD", "RAZORPAY"] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number];

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("CUSTOMER ORDERS GET:", error);
    return NextResponse.json(
      { success: false, message: "Unable to fetch orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please login before ordering." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const customerName = str(body.customerName) || user.name;
    const customerPhone = str(body.customerPhone);
    const address = str(body.address);
    const city = str(body.city);
    const state = str(body.state);
    const pincode = str(body.pincode);
    const paymentMethod = body.paymentMethod as PaymentMethod;

    if (
      !customerName ||
      !customerPhone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return NextResponse.json(
        { success: false, message: "Please complete all delivery details." },
        { status: 400 }
      );
    }

    if (!/^[0-9]{10,15}$/.test(customerPhone)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid phone number." },
        { status: 400 }
      );
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid 6-digit pincode." },
        { status: 400 }
      );
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment method." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      body.items.length > 50
    ) {
      return NextResponse.json(
        { success: false, message: "Your cart is empty or invalid." },
        { status: 400 }
      );
    }

    const quantities = new Map<string, number>();

    for (const item of body.items) {
      const productId = str(item?.productId);
      const quantity = Number(item?.quantity);

      if (
        !productId ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid product or quantity." },
          { status: 400 }
        );
      }

      const combined = (quantities.get(productId) || 0) + quantity;

      if (combined > 100) {
        return NextResponse.json(
          { success: false, message: "Maximum quantity per product is 100." },
          { status: 400 }
        );
      }

      quantities.set(productId, combined);
    }

    const productIds = [...quantities.keys()];

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more products are unavailable." },
        { status: 400 }
      );
    }

    let subtotalPaise = 0;

    const orderItems = products.map((product) => {
      const quantity = quantities.get(product.id)!;

      if (product.stock < quantity) {
        throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
      }

      const pricePaise = Math.round(Number(product.price) * 100);

      if (!Number.isSafeInteger(pricePaise) || pricePaise < 0) {
        throw new Error("INVALID_PRICE");
      }

      subtotalPaise += pricePaise * quantity;

      return {
        productId: product.id,
        productName: product.name,
        productImage: product.images[0]?.imageUrl ?? null,
        price: (pricePaise / 100).toFixed(2),
        quantity,
        weight: product.weight,
        weightUnit: product.weightUnit,
      };
    });

    if (!Number.isSafeInteger(subtotalPaise)) {
      return NextResponse.json(
        { success: false, message: "Order amount is too large." },
        { status: 400 }
      );
    }

    // Shipping and coupon calculations will be added in later steps.
    const shippingPaise = 0;
    const discountPaise = 0;
    const totalPaise = subtotalPaise + shippingPaise - discountPaise;

    const orderNumber = `ALFA-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "PENDING",
        paymentMethod,
        paymentStatus: "PENDING",
        subtotal: (subtotalPaise / 100).toFixed(2),
        shippingCharge: (shippingPaise / 100).toFixed(2),
        discount: (discountPaise / 100).toFixed(2),
        totalAmount: (totalPaise / 100).toFixed(2),
        customerName,
        customerEmail: user.email,
        customerPhone,
        address,
        city,
        state,
        pincode,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          paymentMethod === "COD"
            ? "COD order placed successfully."
            : "Order created. Complete payment to confirm it.",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("INSUFFICIENT_STOCK:")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient stock for ${error.message.split(":")[1]}.`,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "INVALID_PRICE") {
      return NextResponse.json(
        { success: false, message: "A product has an invalid price." },
        { status: 400 }
      );
    }

    console.error("CREATE ORDER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create your order." },
      { status: 500 }
    );
  }
}
