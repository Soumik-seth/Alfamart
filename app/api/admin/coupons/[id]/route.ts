
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    if (body.code !== undefined) {
      const code = String(body.code).trim().toUpperCase();

      if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
        return NextResponse.json(
          { success: false, message: "Invalid coupon code" },
          { status: 400 }
        );
      }

      data.code = code;
    }

    if (body.description !== undefined) {
      data.description = body.description?.trim() || null;
    }

    const discountType =
      body.discountType ?? existingCoupon.discountType;

    const discountValue =
      body.discountValue !== undefined
        ? Number(body.discountValue)
        : Number(existingCoupon.discountValue);

    if (!["PERCENTAGE", "FIXED"].includes(discountType)) {
      return NextResponse.json(
        { success: false, message: "Invalid discount type" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid discount value" },
        { status: 400 }
      );
    }

    if (discountType === "PERCENTAGE" && discountValue > 100) {
      return NextResponse.json(
        { success: false, message: "Percentage cannot exceed 100%" },
        { status: 400 }
      );
    }

    if (
      body.discountType !== undefined ||
      body.discountValue !== undefined
    ) {
      data.discountType = discountType;
      data.discountValue = discountValue;
    }

    if (body.minOrderAmount !== undefined) {
      const value = Number(body.minOrderAmount);

      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json(
          { success: false, message: "Invalid minimum order amount" },
          { status: 400 }
        );
      }

      data.minOrderAmount = value;
    }

    if (body.maxDiscount !== undefined) {
      const value =
        body.maxDiscount === "" || body.maxDiscount === null
          ? null
          : Number(body.maxDiscount);

      if (value !== null && (!Number.isFinite(value) || value <= 0)) {
        return NextResponse.json(
          { success: false, message: "Invalid maximum discount" },
          { status: 400 }
        );
      }

      data.maxDiscount = value;
    }

    if (
      discountType === "FIXED" &&
      (body.maxDiscount !== undefined
        ? body.maxDiscount !== "" && body.maxDiscount !== null
        : existingCoupon.maxDiscount !== null)
    ) {
      return NextResponse.json(
        { success: false, message: "Maximum discount is only for percentage coupons" },
        { status: 400 }
      );
    }

    if (body.usageLimit !== undefined) {
      const value =
        body.usageLimit === "" || body.usageLimit === null
          ? null
          : Number(body.usageLimit);

      if (value !== null && (!Number.isInteger(value) || value < existingCoupon.usageCount)) {
        return NextResponse.json(
          { success: false, message: "Usage limit cannot be below the current usage count" },
          { status: 400 }
        );
      }

      data.usageLimit = value;
    }

    if (body.startsAt !== undefined) {
      const date = body.startsAt ? new Date(body.startsAt) : null;

      if (date && Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid start date" },
          { status: 400 }
        );
      }

      data.startsAt = date;
    }

    if (body.expiresAt !== undefined) {
      const date = body.expiresAt ? new Date(body.expiresAt) : null;

      if (date && Number.isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid expiry date" },
          { status: 400 }
        );
      }

      data.expiresAt = date;
    }

    const finalStart =
      data.startsAt !== undefined
        ? data.startsAt as Date | null
        : existingCoupon.startsAt;

    const finalExpiry =
      data.expiresAt !== undefined
        ? data.expiresAt as Date | null
        : existingCoupon.expiresAt;

    if (finalStart && finalExpiry && finalExpiry <= finalStart) {
      return NextResponse.json(
        { success: false, message: "Expiry date must be after start date" },
        { status: 400 }
      );
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { success: false, message: "Invalid active status" },
          { status: 400 }
        );
      }

      data.isActive = body.isActive;
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, message: "Coupon code already exists" },
        { status: 409 }
      );
    }

    console.error("UPDATE COUPON ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("DELETE COUPON ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
