-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'package',
ADD COLUMN     "imagePublicId" TEXT,
ALTER COLUMN "image" DROP NOT NULL;

