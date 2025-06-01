/*
  Warnings:

  - You are about to drop the column `historicId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `historicIdForeign` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Historic" DROP CONSTRAINT "Historic_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_id_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "historicId",
ADD COLUMN     "historicIdForeign" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_historicIdForeign_fkey" FOREIGN KEY ("historicIdForeign") REFERENCES "Historic"("historicId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historic" ADD CONSTRAINT "Historic_historicId_fkey" FOREIGN KEY ("historicId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
