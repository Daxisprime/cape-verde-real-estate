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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'same-runtime/dist/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
      'same-runtime/dist/jsx-runtime': require.resolve('react/jsx-runtime'),
      'same-runtime': require.resolve('react'),
    };
    return config;
  },
};

module.exports = nextConfig;
