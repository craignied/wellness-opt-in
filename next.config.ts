import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://maledoc.com'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://maledoc.com"
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://maledoc.com'
          }
        ],
      },
    ]
  }
};

export default nextConfig;