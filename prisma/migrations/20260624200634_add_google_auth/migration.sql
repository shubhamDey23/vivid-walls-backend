/*
  Warnings:

  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `daily_download_count` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_download_reset` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `premium_until` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[google_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "bio",
DROP COLUMN "daily_download_count",
DROP COLUMN "last_download_reset",
DROP COLUMN "premium_until",
ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "google_id" TEXT,
ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "users_google_id_idx" ON "users"("google_id");
