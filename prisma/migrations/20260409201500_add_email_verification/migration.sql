ALTER TABLE "User"
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

CREATE TABLE "AuthCode" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT,

  CONSTRAINT "AuthCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuthCode_email_purpose_idx" ON "AuthCode"("email", "purpose");
CREATE INDEX "AuthCode_userId_purpose_idx" ON "AuthCode"("userId", "purpose");
CREATE INDEX "AuthCode_expiresAt_idx" ON "AuthCode"("expiresAt");

ALTER TABLE "AuthCode"
ADD CONSTRAINT "AuthCode_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
