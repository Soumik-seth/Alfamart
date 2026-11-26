
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 }
      );
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("GET COUPONS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      startsAt,
      expiresAt,
      isActive,
    } = body;

    // Required fields
    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { success: false, message: "Code, discount type and value are required" },
        { status: 400 }
      );
    }

    const couponCode = String(code).trim().toUpperCase();

    if (!/^[A-Z0-9_-]{3,30}$/.test(couponCode)) {
      return NextResponse.json(
        { success: false, message: "Coupon code must be 3-30 characters and contain only letters, numbers, _ or -" },
        { status: 400 }
      );
    }

    if (!["PERCENTAGE", "FIXED"].includes(discountType)) {
      return NextResponse.json(
        { success: false, message: "Invalid discount type" },
        { status: 400 }
      );
    }

    const value = Number(discountValue);
    const minimum = Number(minOrderAmount ?? 0);
    const maximum = maxDiscount === "" || maxDiscount == null
      ? null
      : Number(maxDiscount);

    const limit = usageLimit === "" || usageLimit == null
      ? null
      : Number(usageLimit);

    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json(
        { success: false, message: "Discount value must be greater than zero" },
        { status: 400 }
      );
    }

    if (discountType === "PERCENTAGE" && value > 100) {
      return NextResponse.json(
        { success: false, message: "Percentage discount cannot exceed 100%" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(minimum) || minimum < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid minimum order amount" },
        { status: 400 }
      );
    }

    if (maximum !== null && (!Number.isFinite(maximum) || maximum <= 0)) {
      return NextResponse.json(
        { success: false, message: "Maximum discount must be greater than zero" },
        { status: 400 }
      );
    }

    if (limit !== null && (!Number.isInteger(limit) || limit <= 0)) {
      return NextResponse.json(
        { success: false, message: "Usage limit must be a positive whole number" },
        { status: 400 }
      );
    }

    if (discountType === "FIXED" && maximum !== null) {
      return NextResponse.json(
        { success: false, message: "Maximum discount is only applicable to percentage coupons" },
        { status: 400 }
      );
    }

    const startDate = startsAt ? new Date(startsAt) : null;
    const expiryDate = expiresAt ? new Date(expiresAt) : null;

    if (startDate && Number.isNaN(startDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid start date" },
        { status: 400 }
      );
    }

    if (expiryDate && Number.isNaN(expiryDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid expiry date" },
        { status: 400 }
      );
    }

    if (startDate && expiryDate && expiryDate <= startDate) {
      return NextResponse.json(
        { success: false, message: "Expiry date must be after start date" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        description: description?.trim() || null,
        discountType,
        discountValue: value,
        minOrderAmount: minimum,
        maxDiscount: maximum,
        usageLimit: limit,
        startsAt: startDate,
        expiresAt: expiryDate,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        coupon,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, message: "This coupon code already exists" },
        { status: 409 }
      );
    }

    console.error("CREATE COUPON ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
