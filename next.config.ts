import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://maledoc.com'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://maledoc.com"
          }
        ],
      },
    ]
  }
};

export default nextConfig;
