ALTER TYPE "ProductMediaKind" ADD VALUE IF NOT EXISTS 'DETAIL';
ALTER TYPE "ProductMediaKind" ADD VALUE IF NOT EXISTS 'APPLICATION';

CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "lead" TEXT,
    "quote" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Testimonial_isPublished_sortOrder_idx" ON "Testimonial"("isPublished", "sortOrder");
