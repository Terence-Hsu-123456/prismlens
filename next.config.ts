import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 部署目标为 Vercel，构建产物由平台接管 */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // 只读 SQLite 快照（全市场公司池）需随 Serverless 函数一起打包
  outputFileTracingIncludes: {
    '/**': ['./db/**'],
  },
};

export default nextConfig;
