
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

const ALLOWED_WEIGHT_UNITS = ["g", "kg", "ml", "L"];

// GET: সব Product দেখাবে
export async function GET() {
  try {
    const auth = await checkAdmin();
    if (auth.response) return auth.response;

    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET products error:", error);

    return NextResponse.json(
      { message: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

// POST: নতুন Product তৈরি করবে
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdmin();
    if (auth.response) return auth.response;

    const body = await request.json();

    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();

    const shortDescription = body.shortDescription
      ? String(body.shortDescription).trim()
      : null;

    const categoryId = String(body.categoryId || "").trim();

    const price = Number(body.price);

    const originalPrice =
      body.originalPrice === "" ||
      body.originalPrice === null ||
      body.originalPrice === undefined
        ? null
        : Number(body.originalPrice);

    const stock = Number(body.stock ?? 0);

    const isActive = body.isActive !== false;
    const isFeatured = body.isFeatured === true;

    const sku = body.sku ? String(body.sku).trim() : null;

    // Product Weight
    const weight =
      body.weight === "" ||
      body.weight === null ||
      body.weight === undefined
        ? null
        : Number(body.weight);

    const weightUnit = body.weightUnit
      ? String(body.weightUnit)
      : null;

    // Required fields validation
    if (!name || !description || !categoryId) {
      return NextResponse.json(
        {
          message:
            "Name, description and category are required.",
        },
        { status: 400 }
      );
    }

    // Price validation
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { message: "Enter a valid product price." },
        { status: 400 }
      );
    }

    // Original price validation
    if (
      originalPrice !== null &&
      (!Number.isFinite(originalPrice) ||
        originalPrice < price)
    ) {
      return NextResponse.json(
        {
          message:
            "Original price must be greater than or equal to selling price.",
        },
        { status: 400 }
      );
    }

    // Stock validation
    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { message: "Stock must be a non-negative integer." },
        { status: 400 }
      );
    }

    // Weight validation
    if (
      weight === null ||
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return NextResponse.json(
        { message: "Enter a valid product weight." },
        { status: 400 }
      );
    }

    if (
      !weightUnit ||
      !ALLOWED_WEIGHT_UNITS.includes(weightUnit)
    ) {
      return NextResponse.json(
        { message: "Please select a valid weight unit." },
        { status: 400 }
      );
    }

    // Category validation
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Selected category not found." },
        { status: 404 }
      );
    }

    // Slug validation
    const slug = createSlug(name);

    if (!slug) {
      return NextResponse.json(
        { message: "Enter a valid product name." },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        {
          message:
            "A product with this name already exists. Please use a different name.",
        },
        { status: 409 }
      );
    }

    // SKU validation
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku },
      });

      if (existingSku) {
        return NextResponse.json(
          { message: "This SKU is already in use." },
          { status: 409 }
        );
      }
    }

    const images = Array.isArray(body.images)
      ? body.images
      : [];

    const documents = Array.isArray(body.documents)
      ? body.documents
      : [];

    // Save Product in Database
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        description,
        shortDescription,
        price,
        originalPrice,
        stock,

        // Weight saved in database
        weight,
        weightUnit,

        categoryId,
        isActive,
        isFeatured,

        images: {
          create: images.map(
            (
              image: { url: string; publicId: string },
              index: number
            ) => ({
              imageUrl: image.url,
              publicId: image.publicId,
              sortOrder: index,
            })
          ),
        },

        documents: {
          create: documents.map(
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
        },
      },

      include: {
        category: true,
        images: true,
        documents: true,
      },
    });

    return NextResponse.json(
      {
        message: "Product created successfully.",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST product error:", error);

    return NextResponse.json(
      { message: "Failed to create product." },
      { status: 500 }
    );
  }
}
