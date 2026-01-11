import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark better-sqlite3 as external (native module)
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
