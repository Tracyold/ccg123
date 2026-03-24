/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  // Ensure API routes can handle raw body for Stripe webhook
  experimental: {},
};

module.exports = nextConfig;

