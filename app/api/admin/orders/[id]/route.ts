
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof ALLOWED_STATUSES)[number];

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login.",
        },
        { status: 401 }
      );
    }

    // 2. Check admin permission
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // 3. Get order ID
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    // 4. Read request body
    const body = await request.json();

    const status = body.status as OrderStatus;

    const adminNote =
      typeof body.adminNote === "string"
        ? body.adminNote.trim()
        : undefined;

    const trackingNumber =
      typeof body.trackingNumber === "string"
        ? body.trackingNumber.trim()
        : undefined;

    // 5. Validate status
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    if (
      adminNote !== undefined &&
      adminNote.length > 2000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin note is too long.",
        },
        { status: 400 }
      );
    }

    if (
      trackingNumber !== undefined &&
      trackingNumber.length > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Tracking number is too long.",
        },
        { status: 400 }
      );
    }

    // 6. Update order inside a transaction
    const updatedOrder = await prisma.$transaction(
      async (tx) => {
        const existingOrder = await tx.order.findUnique({
          where: { id },
          include: {
            items: true,
          },
        });

        if (!existingOrder) {
          throw new Error("ORDER_NOT_FOUND");
        }

        // 7. Prevent changing a delivered order
        if (existingOrder.status === "DELIVERED") {
          throw new Error("DELIVERED_ORDER_LOCKED");
        }

        // 8. Prevent changing a closed order
        if (
          existingOrder.status === "REJECTED" ||
          existingOrder.status === "CANCELLED"
        ) {
          throw new Error("ORDER_ALREADY_CLOSED");
        }

        // 9. Prevent moving an order back to PENDING
        if (
          status === "PENDING" &&
          existingOrder.status !== "PENDING"
        ) {
          throw new Error("INVALID_STATUS_TRANSITION");
        }

        // 10. Validate order status transitions
        if (
          status === "SHIPPED" &&
          existingOrder.status !== "ACCEPTED"
        ) {
          throw new Error("ACCEPT_ORDER_FIRST");
        }

        if (
          status === "DELIVERED" &&
          existingOrder.status !== "SHIPPED"
        ) {
          throw new Error("SHIP_ORDER_FIRST");
        }

        if (
          status === "ACCEPTED" &&
          existingOrder.status !== "PENDING"
        ) {
          throw new Error("INVALID_ACCEPT_TRANSITION");
        }

        if (
          status === "REJECTED" &&
          existingOrder.status !== "PENDING"
        ) {
          throw new Error("INVALID_REJECT_TRANSITION");
        }

        if (
          status === "CANCELLED" &&
          existingOrder.status !== "ACCEPTED"
        ) {
          throw new Error("INVALID_CANCEL_TRANSITION");
        }

        // 11. Razorpay orders must be paid before acceptance
        if (
          status === "ACCEPTED" &&
          existingOrder.paymentMethod === "RAZORPAY" &&
          existingOrder.paymentStatus !== "PAID"
        ) {
          throw new Error("RAZORPAY_PAYMENT_PENDING");
        }

        // 12. Deduct stock when COD order is accepted
        const shouldDeductStock =
          status === "ACCEPTED" &&
          existingOrder.status === "PENDING" &&
          existingOrder.paymentMethod === "COD";

        if (shouldDeductStock) {
          for (const item of existingOrder.items) {
            const result = await tx.product.updateMany({
              where: {
                id: item.productId,
                stock: {
                  gte: item.quantity,
                },
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

            if (result.count !== 1) {
              throw new Error(
                `INSUFFICIENT_STOCK:${item.productName}`
              );
            }
          }
        }

        // 13. Restore stock if an accepted COD order is cancelled
        const shouldRestoreStock =
          status === "CANCELLED" &&
          existingOrder.status === "ACCEPTED" &&
          existingOrder.paymentMethod === "COD";

        if (shouldRestoreStock) {
          for (const item of existingOrder.items) {
            await tx.product.update({
              where: {
                id: item.productId,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        // 14. Save order changes
        return await tx.order.update({
          where: { id },
          data: {
            status,

            ...(adminNote !== undefined
              ? { adminNote }
              : {}),

            ...(trackingNumber !== undefined
              ? { trackingNumber }
              : {}),
          },
          include: {
            items: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
      }
    );

    // 15. Success response
    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: updatedOrder,
    });

  } catch (error) {
    // 16. Handle known errors
    if (error instanceof Error) {
      const errorMessages: Record<string, string> = {
        ORDER_NOT_FOUND:
          "Order not found.",

        DELIVERED_ORDER_LOCKED:
          "A delivered order cannot be changed.",

        ORDER_ALREADY_CLOSED:
          "This order is already rejected or cancelled.",

        INVALID_STATUS_TRANSITION:
          "An order cannot be moved back to pending.",

        INVALID_ACCEPT_TRANSITION:
          "Only pending orders can be accepted.",

        INVALID_REJECT_TRANSITION:
          "Only pending orders can be rejected.",

        INVALID_CANCEL_TRANSITION:
          "Only accepted orders can be cancelled.",

        ACCEPT_ORDER_FIRST:
          "Accept the order before shipping it.",

        SHIP_ORDER_FIRST:
          "Ship the order before marking it delivered.",

        RAZORPAY_PAYMENT_PENDING:
          "Razorpay payment must be completed before accepting this order.",
      };

      if (errorMessages[error.message]) {
        return NextResponse.json(
          {
            success: false,
            message: errorMessages[error.message],
          },
          { status: 400 }
        );
      }

      if (
        error.message.startsWith("INSUFFICIENT_STOCK:")
      ) {
        const productName = error.message.replace(
          "INSUFFICIENT_STOCK:",
          ""
        );

        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${productName}.`,
          },
          { status: 409 }
        );
      }
    }

    console.error("ADMIN ORDER UPDATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating the order.",
      },
      { status: 500 }
    );
  }
}
