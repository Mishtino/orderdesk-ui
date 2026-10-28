import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://orderdesk-backend-9gu2.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;