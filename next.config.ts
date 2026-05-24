import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [{ source: "/ripple", destination: "/wave", permanent: true }];
  },
};

export default nextConfig;
