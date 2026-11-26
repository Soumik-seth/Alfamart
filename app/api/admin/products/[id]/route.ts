
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

const ALLOWED_WEIGHT_UNITS = ["g", "kg", "ml", "L"];

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function checkAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "ADMIN") {
    return {
      response: NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { user };
}

// PATCH: Update Product
export async function PATCH(
  request: NextRequest,
  context: Context
) {
  try {
    const auth = await checkAdmin();
    if (auth.response) return auth.response;

    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    // Product Name
    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json(
          { message: "Product name is required." },
          { status: 400 }
        );
      }

      const slug = createSlug(name);

      if (!slug) {
        return NextResponse.json(
          { message: "Enter a valid product name." },
          { status: 400 }
        );
      }

      const duplicate = await prisma.product.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { message: "This product name is already in use." },
          { status: 409 }
        );
      }

      data.name = name;
      data.slug = slug;
    }

    // Description
    if (body.description !== undefined) {
      const description = String(body.description).trim();

      if (!description) {
        return NextResponse.json(
          { message: "Description is required." },
          { status: 400 }
        );
      }

      data.description = description;
    }

    if (body.shortDescription !== undefined) {
      data.shortDescription =
        String(body.shortDescription).trim() || null;
    }

    // Price
    if (body.price !== undefined) {
      const price = Number(body.price);

      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { message: "Enter a valid price." },
          { status: 400 }
        );
      }

      data.price = price;
    }

    // Original Price
    if (body.originalPrice !== undefined) {
      const originalPrice =
        body.originalPrice === null ||
        body.originalPrice === ""
          ? null
          : Number(body.originalPrice);

      const finalPrice =
        body.price !== undefined
          ? Number(body.price)
          : Number(existing.price);

      if (
        originalPrice !== null &&
        (!Number.isFinite(originalPrice) ||
          originalPrice < finalPrice)
      ) {
        return NextResponse.json(
          {
            message:
              "Original price must be greater than or equal to selling price.",
          },
          { status: 400 }
        );
      }

      data.originalPrice = originalPrice;
    }

    // Stock
    if (body.stock !== undefined) {
      const stock = Number(body.stock);

      if (!Number.isInteger(stock) || stock < 0) {
        return NextResponse.json(
          { message: "Stock must be a non-negative integer." },
          { status: 400 }
        );
      }

      data.stock = stock;
    }

    // SKU
    if (body.sku !== undefined) {
      const sku = String(body.sku).trim() || null;

      if (sku) {
        const duplicate = await prisma.product.findFirst({
          where: {
            sku,
            NOT: { id },
          },
        });

        if (duplicate) {
          return NextResponse.json(
            { message: "This SKU is already in use." },
            { status: 409 }
          );
        }
      }

      data.sku = sku;
    }

    // Category
    if (body.categoryId !== undefined) {
      const categoryId = String(body.categoryId).trim();

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { message: "Selected category not found." },
          { status: 404 }
        );
      }

      data.categoryId = categoryId;
    }

    // Weight update
    if (
      body.weight !== undefined ||
      body.weightUnit !== undefined
    ) {
      const weight =
        body.weight === null || body.weight === ""
          ? null
          : body.weight !== undefined
            ? Number(body.weight)
            : existing.weight === null
              ? null
              : Number(existing.weight);

      const weightUnit =
        body.weightUnit !== undefined
          ? body.weightUnit
            ? String(body.weightUnit)
            : null
          : existing.weightUnit;

      if (
        (weight === null) !== (weightUnit === null)
      ) {
        return NextResponse.json(
          {
            message:
              "Weight and weight unit must be provided together.",
          },
          { status: 400 }
        );
      }

      if (
        weight !== null &&
        (!Number.isFinite(weight) || weight <= 0)
      ) {
        return NextResponse.json(
          { message: "Enter a valid product weight." },
          { status: 400 }
        );
      }

      if (
        weightUnit !== null &&
        !ALLOWED_WEIGHT_UNITS.includes(weightUnit)
      ) {
        return NextResponse.json(
          { message: "Invalid weight unit." },
          { status: 400 }
        );
      }

      data.weight = weight;
      data.weightUnit = weightUnit;
    }

    // Active status
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { message: "Invalid active status." },
          { status: 400 }
        );
      }

      data.isActive = body.isActive;
    }

    // Featured status
    if (body.isFeatured !== undefined) {
      if (typeof body.isFeatured !== "boolean") {
        return NextResponse.json(
          { message: "Invalid featured status." },
          { status: 400 }
        );
      }

      data.isFeatured = body.isFeatured;
    }

    // Replace images if provided
    if (body.images !== undefined) {
      if (!Array.isArray(body.images)) {
        return NextResponse.json(
          { message: "Invalid images data." },
          { status: 400 }
        );
      }

      data.images = {
        deleteMany: {},
        create: body.images.map(
          (
            image: { url: string; publicId: string },
            index: number
          ) => ({
            imageUrl: image.url,
            publicId: image.publicId,
            sortOrder: index,
          })
        ),
      };
    }

    // Replace documents if provided
    if (body.documents !== undefined) {
      if (!Array.isArray(body.documents)) {
        return NextResponse.json(
          { message: "Invalid documents data." },
          { status: 400 }
        );
      }

      data.documents = {
        deleteMany: {},
        create: body.documents.map(
          (document: {
            url: string;
            publicId: string;
            fileName: string;
            fileType: string;
          }) => ({
            fileUrl: document.url,
            publicId: document.publicId,
            fileName: document.fileName,
            fileType: document.fileType,
          })
        ),
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: data as any,
      include: {
        category: true,
        images: true,
        documents: true,
      },
    });

    return NextResponse.json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("PATCH product error:", error);

    return NextResponse.json(
      { message: "Failed to update product." },
      { status: 500 }
    );
  }
}

// DELETE: Delete Product
export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    const auth = await checkAdmin();
    if (auth.response) return auth.response;

    const { id } = await context.params;

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE product error:", error);

    return NextResponse.json(
      { message: "Failed to delete product." },
      { status: 500 }
    );
  }
}
