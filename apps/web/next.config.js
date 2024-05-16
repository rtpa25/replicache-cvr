/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@repo/models", "@repo/lib"],
  experimental: {
    optimizePackageImports: ["@repo/models", "@repo/lib"],
  },
};
