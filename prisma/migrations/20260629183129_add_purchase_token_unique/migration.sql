/*
  Warnings:

  - A unique constraint covering the columns `[purchaseToken]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_purchaseToken_key" ON "subscriptions"("purchaseToken");
