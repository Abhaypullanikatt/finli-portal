import type { NextConfig } from "next";

const config: NextConfig = {
  output: process.env.SITES_EXPORT === "1" ? "export" : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["192.168.68.85"],
};

export default config;
