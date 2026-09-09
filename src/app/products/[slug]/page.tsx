import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductAtmosphere } from "@/components/atmosphere/product-atmosphere";
import { ProductDetailPage } from "@/components/product/product-detail-page";
import { getProductDetail } from "@/lib/product-detail";
import { jsonLd, productSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };
  const title = product.seoTitle ?? product.name;
  return { title: { absolute: title }, description: product.seoDescription ?? product.introduction, alternates: { canonical: `/products/${product.slug}` }, openGraph: { type: "website", url: `/products/${product.slug}`, title, description: product.seoDescription ?? product.introduction, images: product.media.hero ? [product.media.hero] : [] } };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) notFound();
  return <main className="relative isolate overflow-clip bg-ink"><ProductAtmosphere /><script dangerouslySetInnerHTML={jsonLd(productSchema(product))} type="application/ld+json" /><div className="relative z-10"><ProductDetailPage product={product} /></div></main>;
}
