import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryConfig } from "@/lib/env";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".avif",
  ".heic",
  ".heif",
  ".bmp",
  ".svg",
  ".tif",
  ".tiff",
  ".ico",
  ".jfif",
  ".pjpeg",
  ".pjp",
]);

const ALLOWED_NON_IMAGE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/zip",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
];

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

function sanitizeFileName(fileName: string) {
  const extension = path.extname(fileName).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const baseName = path.basename(fileName, extension).replace(/[^a-z0-9-_]/gi, "-");
  return `${baseName || "file"}${extension}`;
}

function isImageLikeFile(file: File) {
  const mimeType = file.type.toLowerCase();
  const extension = path.extname(file.name || "").toLowerCase();

  if (mimeType.startsWith("image/")) {
    return true;
  }

  // Some devices/browsers send generic MIME types for valid image files.
  if ((mimeType === "" || mimeType === "application/octet-stream") && IMAGE_EXTENSIONS.has(extension)) {
    return true;
  }

  return false;
}

function isAllowedFileType(file: File) {
  const mimeType = file.type.toLowerCase();
  return isImageLikeFile(file) || ALLOWED_NON_IMAGE_TYPES.includes(mimeType);
}

async function uploadToLocal(file: File) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const safeName = sanitizeFileName(file.name || "upload");
  const fileName = `${Date.now()}-${randomUUID()}-${safeName}`;
  const outputPath = path.join(uploadsDir, fileName);

  const bytes = await file.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(bytes));

  return {
    secure_url: `/api/uploads/${encodeURIComponent(fileName)}`,
    public_id: `local/${fileName}`,
  };
}

async function uploadToCloudinary(
  file: File,
  config: { cloud_name: string; api_key: string; api_secret: string }
) {
  cloudinary.config(config);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const resourceType: "image" | "video" | "raw" = isImageLikeFile(file)
    ? "image"
    : file.type.startsWith("video/") || file.type.startsWith("audio/")
    ? "video"
    : "raw";

  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "campus-gigs",
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Upload failed"));
            return;
          }

          resolve(result as { secure_url: string; public_id: string });
        }
      )
      .end(buffer);
  });
}

// POST /api/upload - upload to Cloudinary when configured, else store locally
export async function POST(request: NextRequest) {
  try {
    const cloudinarySettings = getCloudinaryConfig();

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isAllowedFileType(file)) {
      return NextResponse.json(
        { error: "File type not allowed. Please upload an image, document, video, audio, or zip file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 400 });
    }

    const result = cloudinarySettings.configured
      ? await uploadToCloudinary(file, cloudinarySettings.config)
      : await uploadToLocal(file);

    return NextResponse.json(
      {
        url: result.secure_url,
        publicId: result.public_id,
        storage: cloudinarySettings.configured ? "cloudinary" : "local",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
