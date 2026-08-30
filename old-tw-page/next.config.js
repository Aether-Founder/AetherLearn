/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aether-dub5.vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/locales/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/csv',
          },
        ],
      },
    ];
  },
  // Exclude UI-REFERENCE folder from build
  webpack: (config) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /UI-REFERENCE/,
    });
    return config;
  },
}

module.exports = nextConfig
