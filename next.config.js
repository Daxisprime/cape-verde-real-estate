const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
  skipTrailingSlashRedirect: true,
  experimental: {},
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'same-runtime/dist/jsx-dev-runtime': path.resolve(__dirname, 'src/shims/jsx-dev-runtime.js'),
      'same-runtime/dist/jsx-runtime': path.resolve(__dirname, 'src/shims/jsx-runtime.js'),
      'same-runtime': path.resolve(__dirname, 'src/shims/same-runtime.js'),
    };
    return config;
  },
};

module.exports = nextConfig;
