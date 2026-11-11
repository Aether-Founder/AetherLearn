/** @type {import('next').NextConfig} */

// Build-time env diagnostics. NEXT_PUBLIC_* vars are inlined into the client
// bundle during `next build`, so this output appears in the Vercel build logs
// and proves whether Supabase config was present when the bundle was compiled.
console.log(
  '[env-check] NEXT_PUBLIC_SUPABASE_URL:',
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING'
);
console.log(
  '[env-check] NEXT_PUBLIC_SUPABASE_ANON_KEY:',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? `set (length ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length})`
    : 'MISSING'
);
console.log(
  '[env-check] SUPABASE_SERVICE_ROLE_KEY:',
  process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'MISSING'
);

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
