-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('FILE', 'FOLDER', 'ROOT');

-- CreateTable
CREATE TABLE "Block" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BlockType" NOT NULL,
    "parentFolderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contentType" TEXT,
    "fileUrl" TEXT,
    "sizeInBytes" INTEGER,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Block_ownerId_type_name_idx" ON "Block"("ownerId", "type", "name");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;
