/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

// Fallback Supabase config from the committed .env_for_vercel file.
// Real env vars (e.g. Vercel project settings) always take precedence;
// these fallbacks only apply when the vars are missing at build time.
// NEXT_PUBLIC_* values are inlined into the client bundle during
// `next build`, so a missing var cannot be fixed at runtime.
function loadEnvFileFallback(file) {
  try {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const vars = {};
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
    return vars;
  } catch {
    return {};
  }
}
const envFileFallback = loadEnvFileFallback('.env_for_vercel');

const resolvedSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || envFileFallback.NEXT_PUBLIC_SUPABASE_URL || '';
const resolvedSupabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  envFileFallback.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// Build-time env diagnostics — visible in the Vercel build log.
console.log('[env-check] NEXT_PUBLIC_SUPABASE_URL:', resolvedSupabaseUrl || 'MISSING');
console.log(
  '[env-check] NEXT_PUBLIC_SUPABASE_ANON_KEY:',
  resolvedSupabaseAnonKey
    ? `set (length ${resolvedSupabaseAnonKey.length}, source: ${
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'env' : 'env-file-fallback'
      })`
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
  experimental: {
    // Rewrites named imports from large packages to direct module imports,
    // significantly shrinking the client bundle (lucide-react ships ~1500 icons).
    optimizePackageImports: ['lucide-react'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: resolvedSupabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: resolvedSupabaseAnonKey,
  },
  // Routes were renamed from Dutch to English. Permanent redirects keep
  // old bookmarks, emails, and stored links working.
  async redirects() {
    const pairs = [
      ['bibliotheek', 'library'],
      ['cijfers', 'grades'],
      ['foutenlogboek', 'error-log'],
      ['groepen', 'groups'],
      ['huiswerk', 'homework'],
      ['instellingen', 'settings'],
      ['leer', 'learn'],
      ['leersets', 'study-sets'],
      ['lessen-notities', 'lesson-notes'],
      ['lessen', 'lessons'],
      ['notities', 'notes'],
      ['statistieken', 'statistics'],
      ['studie-modi', 'study-modes'],
      ['toets-planning', 'test-planning'],
      ['toetsweekvoorbereiding', 'test-prep'],
      ['toetsweek', 'test-week'],
      ['toegankelijkheid', 'accessibility'],
      ['vakken', 'subjects'],
      ['vandaag', 'today'],
      ['zoeken', 'search'],
    ];
    const redirects = pairs.flatMap(([from, to]) => [
      { source: `/${from}`, destination: `/${to}`, permanent: true },
      { source: `/${from}/:path*`, destination: `/${to}/:path*`, permanent: true },
    ]);
    redirects.push(
      { source: '/create/leerlijst/:path*', destination: '/create/learning-list/:path*', permanent: true },
      { source: '/edit/leerlijst/:path*', destination: '/edit/learning-list/:path*', permanent: true },
      { source: '/subjects/:subjectId/begripskaarten/:path*', destination: '/subjects/:subjectId/concept-cards/:path*', permanent: true },
      { source: '/subjects/:subjectId/formulekaarten/:path*', destination: '/subjects/:subjectId/formula-cards/:path*', permanent: true },
      { source: '/subjects/:subjectId/bronnen', destination: '/subjects/:subjectId/sources', permanent: true },
      { source: '/admin/bronnen', destination: '/admin/sources', permanent: true }
    );
    return redirects;
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
    // public/binas holds ~413 MB of PDF chunks. Precached files are fully
    // downloaded on first visit, which saturated the network and left
    // first-time visitors staring at a blank background. They stay
    // NetworkOnly via the runtimeCaching rule below.
    publicExcludes: ['!noprecache/**/*', '!binas/**'],
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
