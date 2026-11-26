
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: NextRequest) {
  try {
    // 1. Admin authentication
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

    // 2. Get uploaded file
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Please select a file." },
        { status: 400 }
      );
    }

    // 3. Validate file type
    const isImage = IMAGE_TYPES.includes(file.type);
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      return NextResponse.json(
        {
          message:
            "Only JPG, JPEG, PNG, WebP and PDF files are allowed.",
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { message: "Image size must be below 5 MB." },
        { status: 400 }
      );
    }

    if (isPdf && file.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { message: "PDF size must be below 10 MB." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { message: "File is empty." },
        { status: 400 }
      );
    }

    // 5. Convert file into buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Cloudinary folder
    const folder = isImage
      ? "alfamart/products/images"
      : "alfamart/products/documents";

    // 7. Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: isPdf ? "raw" : "image",
          timeout: 120000,
          ...(isPdf ? { format: "pdf" } : {}),
        },
        (error, uploadedResult) => {
          if (error) {
            reject(error);
            return;
          }

          if (!uploadedResult) {
            reject(
              new Error("Cloudinary returned an empty response.")
            );
            return;
          }

          resolve(uploadedResult);
        }
      );

      stream.on("error", reject);
      stream.end(buffer);
    });

    // 8. Successful response
    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully.",
        file: {
          url: result.secure_url,
          publicId: result.public_id,
          fileName: file.name,
          fileType: isPdf ? "PDF" : "IMAGE",
          resourceType: result.resource_type,
        },
      },
      { status: 201 }
    );

  } catch (error: any) {
    // 9. Detailed error logging
    console.error("Cloudinary upload error:", {
      message: error?.message,
      http_code: error?.http_code,
      name: error?.name,
      details: error?.error,
    });

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "File upload failed.",
        details: error?.error?.message || null,
      },
      {
        status:
          error?.http_code &&
          error.http_code >= 400 &&
          error.http_code < 600
            ? error.http_code
            : 500,
      }
    );
  }
}
