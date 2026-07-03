import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // ponytail: repo-page subpath. Drop both lines if deploying to a user/org page or custom domain.
  basePath: process.env.NODE_ENV === "production" ? "/prize-wheel" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/prize-wheel/" : "",
};

export default nextConfig;
