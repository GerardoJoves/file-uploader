-- DropIndex
DROP INDEX "Block_ownerId_type_name_idx";

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Block_ownerId_type_favorite_name_idx" ON "Block"("ownerId", "type", "favorite", "name");
