import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["cloudinary", "resend"],
    /*
     * How long the client router may reuse a page it already has.
     *
     * The admin routes are `force-dynamic`, and the default stale time for a
     * dynamic route is 0 — so moving between the four pages in the rail
     * re-fetched every one of them from the server every time, and each fetch
     * waits on Prisma queries against a Neon instance in another region. At 30
     * seconds, going back to a page you were just on is instant, while
     * anything older than half a minute is still fetched fresh. Mutations do
     * not have to wait for it to expire: every admin action calls
     * `revalidatePath`, which drops the affected entries from this cache too.
     */
    staleTimes: { dynamic: 30, static: 180 },
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
