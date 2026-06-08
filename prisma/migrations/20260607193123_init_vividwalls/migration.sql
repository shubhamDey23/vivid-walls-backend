/*
  Warnings:

  - You are about to drop the `wallpapers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "downloads" DROP CONSTRAINT "downloads_wallpaper_id_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_wallpaper_id_fkey";

-- DropForeignKey
ALTER TABLE "wallpapers" DROP CONSTRAINT "wallpapers_category_id_fkey";

-- AlterTable
ALTER TABLE "downloads" ADD COLUMN     "quality" TEXT NOT NULL DEFAULT '4K';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "daily_download_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_download_reset" TIMESTAMP(3),
ADD COLUMN     "premium_until" TIMESTAMP(3);

-- DropTable
DROP TABLE "wallpapers";

-- CreateTable
CREATE TABLE "Wallpaper" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "thumbnail_url" TEXT,
    "video_url" TEXT,
    "quality" TEXT NOT NULL DEFAULT '4K',
    "resolution" TEXT NOT NULL DEFAULT '2160x3840',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" UUID,

    CONSTRAINT "Wallpaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallpaper_likes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "wallpaper_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallpaper_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "purchase_token" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wallpaper_likes_user_id_idx" ON "wallpaper_likes"("user_id");

-- CreateIndex
CREATE INDEX "wallpaper_likes_wallpaper_id_idx" ON "wallpaper_likes"("wallpaper_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallpaper_likes_user_id_wallpaper_id_key" ON "wallpaper_likes"("user_id", "wallpaper_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- AddForeignKey
ALTER TABLE "Wallpaper" ADD CONSTRAINT "Wallpaper_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_wallpaper_id_fkey" FOREIGN KEY ("wallpaper_id") REFERENCES "Wallpaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_wallpaper_id_fkey" FOREIGN KEY ("wallpaper_id") REFERENCES "Wallpaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallpaper_likes" ADD CONSTRAINT "wallpaper_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallpaper_likes" ADD CONSTRAINT "wallpaper_likes_wallpaper_id_fkey" FOREIGN KEY ("wallpaper_id") REFERENCES "Wallpaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
