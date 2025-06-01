/*
  Warnings:

  - You are about to drop the column `historicIdForeign` on the `Message` table. All the data in the column will be lost.
  - Added the required column `historicId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_historicIdForeign_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "historicIdForeign",
ADD COLUMN     "historicId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_historicId_fkey" FOREIGN KEY ("historicId") REFERENCES "Historic"("historicId") ON DELETE RESTRICT ON UPDATE CASCADE;
