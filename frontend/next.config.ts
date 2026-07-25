import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables `node server.js` standalone Docker builds (no node_modules needed at runtime)
  output: "standalone",
};

export default nextConfig;

