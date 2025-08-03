-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "brazilTime" TEXT,
ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "editedBy" TEXT,
ADD COLUMN     "isRescheduled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "time" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "bannedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserBan" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_editedBy_fkey" FOREIGN KEY ("editedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
