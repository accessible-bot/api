-- DropForeignKey
ALTER TABLE "Historic" DROP CONSTRAINT "Historic_historicId_fkey";

-- AddForeignKey
ALTER TABLE "Historic" ADD CONSTRAINT "Historic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
