import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireAdmin } from "@/lib/auth";

export async function POST() {
  try {
    await requireAdmin();
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
    }
    cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET });
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "wezu/products";
    return NextResponse.json({
      timestamp,
      folder,
      signature: cloudinary.utils.api_sign_request({ timestamp, folder }, env.CLOUDINARY_API_SECRET),
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
