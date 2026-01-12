import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // html2pdf.js is a client-side library, no special webpack config needed
  // If issues persist, you can add:
  // experimental: {
  //   turbo: {
  //     resolveAlias: {
  //       canvas: false,
  //     },
  //   },
  // },
};

export default nextConfig;
