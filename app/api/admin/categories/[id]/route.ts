import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: Context
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Category not found." },
        { status: 404 }
      );
    }

    const data: {
      name?: string;
      slug?: string;
      description?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json(
          { message: "Category name is required." },
          { status: 400 }
        );
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (!slug) {
        return NextResponse.json(
          { message: "Please enter a valid category name." },
          { status: 400 }
        );
      }

      const duplicate = await prisma.category.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { message: "This category name already exists." },
          { status: 409 }
        );
      }

      data.name = name;
      data.slug = slug;
    }

    if (body.description !== undefined) {
      data.description = String(body.description).trim() || null;
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { message: "Invalid active status." },
          { status: 400 }
        );
      }

      data.isActive = body.isActive;
    }

    if (body.sortOrder !== undefined) {
      const sortOrder = Number(body.sortOrder);

      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        return NextResponse.json(
          { message: "Invalid sort order." },
          { status: 400 }
        );
      }

      data.sortOrder = sortOrder;
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    console.error("PATCH category error:", error);

    return NextResponse.json(
      { message: "Failed to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Category not found." },
        { status: 404 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE category error:", error);

    return NextResponse.json(
      { message: "Failed to delete category." },
      { status: 500 }
    );
  }
}