/*
  Warnings:

  - You are about to drop the column `authProvider` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "authProvider",
ADD COLUMN     "auth_provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "daily_download_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_download_reset" TIMESTAMP(3),
ADD COLUMN     "premium_until" TIMESTAMP(3);
