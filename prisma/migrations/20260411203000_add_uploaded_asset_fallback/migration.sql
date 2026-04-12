-- Durable fallback storage for uploads when Cloudinary is not configured
CREATE TABLE "UploadedAsset" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT,

    CONSTRAINT "UploadedAsset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UploadedAsset_uploadedById_idx" ON "UploadedAsset"("uploadedById");

ALTER TABLE "UploadedAsset"
ADD CONSTRAINT "UploadedAsset_uploadedById_fkey"
FOREIGN KEY ("uploadedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
