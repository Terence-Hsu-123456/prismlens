import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 部署目标为 Vercel，构建产物由平台接管 */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
