/** @type {import('next').NextConfig} */
const nextConfig = {
  // Forzar webpack â€” Turbopack en Next 16 tiene bugs con TSX complejo
  experimental: {
    turbo: undefined,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
