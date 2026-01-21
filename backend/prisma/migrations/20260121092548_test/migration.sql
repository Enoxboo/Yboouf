/*
  Warnings:

  - The `status` column on the `PendingRecipe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `PendingRecipe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Recipe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RecipeType" AS ENUM ('STARTER', 'MAIN', 'DESSERT', 'SNACK', 'DRINK');

-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MODERATOR';

-- DropIndex
DROP INDEX "Recipe_country_idx";

-- DropIndex
DROP INDEX "Recipe_type_idx";

-- AlterTable
ALTER TABLE "PendingRecipe" DROP COLUMN "type",
ADD COLUMN     "type" "RecipeType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "RecipeStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderatedById" TEXT,
ADD COLUMN     "moderationNote" TEXT,
ADD COLUMN     "status" "RecipeStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "type",
ADD COLUMN     "type" "RecipeType" NOT NULL,
ALTER COLUMN "isPublished" SET DEFAULT false;

-- DropEnum
DROP TYPE "DishType";

-- DropEnum
DROP TYPE "PendingStatus";

-- CreateIndex
CREATE INDEX "Recipe_status_idx" ON "Recipe"("status");

-- CreateIndex
CREATE INDEX "Recipe_isPublished_idx" ON "Recipe"("isPublished");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
