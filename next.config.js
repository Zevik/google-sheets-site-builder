/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'docs.google.com', 'drive.google.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 