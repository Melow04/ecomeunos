import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable gzip/brotli compression
  compress: true,

  // Speed up compilation and remove consoles in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  experimental: {
    // Optimize imports from large libraries to reduce bundle size
    optimizePackageImports: ['lucide-react', 'date-fns', '@radix-ui/react-icons'],
  },

  images: {
    // Serve highly optimized modern formats
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images effectively
    minimumCacheTTL: 604800, // 1 week
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default nextConfig
