-- Ensure every appointment references a user before adding NOT NULL constraint
UPDATE "Appointment" AS a
SET "userId" = p."ownerId"
FROM "Pet" AS p
WHERE a."petId" = p."id"
  AND a."userId" IS NULL;

-- Fallback: assign the earliest user to any remaining orphaned appointments
UPDATE "Appointment"
SET "userId" = (
  SELECT id FROM "User" ORDER BY id ASC LIMIT 1
)
WHERE "userId" IS NULL;

-- Make the relation required
ALTER TABLE "Appointment"
ALTER COLUMN "userId" SET NOT NULL;

-- Add an index for pet lookups to keep queries fast
CREATE INDEX IF NOT EXISTS "Appointment_petId_idx" ON "Appointment"("petId");

