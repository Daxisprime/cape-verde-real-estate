/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
  transpilePackages: ['leaflet.markercluster'],
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  productionBrowserSourceMaps: false,
  output: 'standalone',
  webpack: (config, { isServer }) => {
    config.optimization.minimize = true;
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 200000,
    };
    return config;
  },
};

module.exports = nextConfig;
