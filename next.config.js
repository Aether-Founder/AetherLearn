/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
};

// PWA configuration for offline support and mobile responsiveness
let withPWA = (config) => config;
try {
  const pwaModule = require('@ducanh2912/next-pwa');
  const createPWAConfig = pwaModule.default || pwaModule;
  withPWA = createPWAConfig({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/middleware-manifest-json$/],
    workboxOptions: {
      disableDevLogs: true,
      runtimeCaching: [
        {
          // The Binas chunks are ~412 MiB in total. Caching them in the
          // service worker would blow the browser's Cache Storage quota, so
          // they are always served straight from the network.
          urlPattern: /\/binas\//,
          handler: 'NetworkOnly',
        },
        {
          urlPattern: /^(?!.*\/binas\/).*$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'offlineCache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /\.(?:js|css|ttf|woff2?|svg|png|jpg|jpeg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-assets',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
            },
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
            },
          },
        },
      ],
    },
  });
} catch (error) {
  console.warn(
    '[AetherLearn] PWA configuration skipped: ' + error.message
  );
}

module.exports = withPWA(nextConfig);
