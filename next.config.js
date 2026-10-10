/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents duplicate chimes in dev mode
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
