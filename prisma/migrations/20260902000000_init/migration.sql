-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ProductMediaKind" AS ENUM ('CARD', 'HERO', 'GALLERY', 'DATASHEET');
CREATE TYPE "ProductSectionType" AS ENUM ('METRICS', 'BENEFITS', 'FEATURES', 'ENVIRONMENTS', 'CONFIGURATION', 'SPECIFICATIONS', 'ECOSYSTEM', 'CTA', 'RICH_TEXT');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED', 'SPAM');
CREATE TYPE "LeadEmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL, "name" TEXT, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN', "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Product" (
    "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "name" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT', "tagline" TEXT, "cardDescription" TEXT,
    "introduction" TEXT, "seoTitle" TEXT, "seoDescription" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProductMedia" (
    "id" TEXT NOT NULL, "productId" TEXT NOT NULL, "kind" "ProductMediaKind" NOT NULL DEFAULT 'GALLERY',
    "url" TEXT NOT NULL, "cloudinaryPublicId" TEXT, "alt" TEXT NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProductSection" (
    "id" TEXT NOT NULL, "productId" TEXT NOT NULL, "type" "ProductSectionType" NOT NULL, "title" TEXT,
    "data" JSONB NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ProductSection_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "phone" TEXT, "company" TEXT,
    "subject" TEXT, "message" TEXT NOT NULL, "sourceProductId" TEXT, "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT, "notificationStatus" "LeadEmailStatus" NOT NULL DEFAULT 'PENDING',
    "notificationMessage" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_status_sortOrder_idx" ON "Product"("status", "sortOrder");
CREATE INDEX "ProductMedia_productId_kind_sortOrder_idx" ON "ProductMedia"("productId", "kind", "sortOrder");
CREATE INDEX "ProductSection_productId_sortOrder_idx" ON "ProductSection"("productId", "sortOrder");
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
CREATE INDEX "Lead_sourceProductId_idx" ON "Lead"("sourceProductId");

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductSection" ADD CONSTRAINT "ProductSection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
