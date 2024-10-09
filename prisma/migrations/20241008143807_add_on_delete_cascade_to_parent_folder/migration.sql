-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_parentFolderId_fkey";

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
