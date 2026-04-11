import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

type Params = { params: Promise<{ path: string[] }> };

const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".zip": "application/zip",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

function isSafeSegment(segment: string) {
  return (
    segment.length > 0 &&
    segment !== "." &&
    segment !== ".." &&
    !segment.includes("/") &&
    !segment.includes("\\")
  );
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { path: rawSegments } = await params;
    const segments = (rawSegments || []).filter(isSafeSegment);

    if (!segments.length) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const baseDir = path.resolve(LOCAL_UPLOADS_DIR);
    const filePath = path.resolve(path.join(LOCAL_UPLOADS_DIR, ...segments));

    if (!filePath.startsWith(baseDir + path.sep) && filePath !== baseDir) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const bytes = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_BY_EXTENSION[ext] || "application/octet-stream";

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

