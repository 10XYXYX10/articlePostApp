/*
  Warnings:

  - Added the required column `userId` to the `Thumbnail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Thumbnail" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Thumbnail" ADD CONSTRAINT "Thumbnail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
