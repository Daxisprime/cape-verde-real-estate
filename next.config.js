/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Remove reactStrictMode from experimental as it's not valid there
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cf.bstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'thumbs.dreamstime.com',
      },
      {
        protocol: 'https',
        hostname: 'same-assets.com',
      }
    ],
  },
  // Skip trailing slash redirect
  skipTrailingSlashRedirect: true,
  experimental: {
    // Experimental features
  }
};

module.exports = nextConfig;
