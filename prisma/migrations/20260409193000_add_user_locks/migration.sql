ALTER TABLE "User"
ADD COLUMN "lockedUntil" TIMESTAMP(3);

CREATE INDEX "User_lockedUntil_idx" ON "User"("lockedUntil");
