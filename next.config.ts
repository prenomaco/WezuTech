import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { optimizePackageImports: ["cloudinary", "resend"] },
};

export default nextConfig;
