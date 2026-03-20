/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/.v0/**', // Ignore the .v0 folder
        '**/node_modules/**', // default ignored
        '**/.next/**', // default ignored
      ],
    };
    return config;
  },
}

export default nextConfig
