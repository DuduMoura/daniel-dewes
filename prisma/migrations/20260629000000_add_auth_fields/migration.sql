-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '',
ADD COLUMN "alertsLastSeenAt" TIMESTAMP(3);
