/**
 * verify_supabase_env.js
 *
 * Verifies the Supabase env vars used by the app:
 *  1. Presence in .env.local / .env_for_vercel
 *  2. URL format
 *  3. JWT structure of the anon key (project ref, role, expiry)
 *  4. LIVE check: calls the Supabase Auth API with the anon key to prove
 *     the key is accepted by the real project (not revoked / wrong project)
 *
 * Usage: node scripts/verify_supabase_env.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function loadEnvFile(file) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const local = loadEnvFile('.env.local');
const forVercel = loadEnvFile('.env_for_vercel');
const merged = { ...forVercel, ...local }; // .env.local wins (what `next dev` uses)

let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
}

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

async function main() {
  console.log('=== Supabase env verification ===\n');

  // 1. Presence
  const url = merged.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = merged.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = merged.SUPABASE_SERVICE_ROLE_KEY;

  check('NEXT_PUBLIC_SUPABASE_URL present', Boolean(url), url || 'missing in .env.local and .env_for_vercel');
  check('NEXT_PUBLIC_SUPABASE_ANON_KEY present', Boolean(anonKey), anonKey ? `length ${anonKey.length}` : 'missing');
  check('SUPABASE_SERVICE_ROLE_KEY present', Boolean(serviceKey && !serviceKey.includes('your_')), serviceKey ? 'set' : 'missing/placeholder');

  if (!url || !anonKey) {
    console.log('\nCannot continue — keys missing locally.');
    process.exit(1);
  }

  // 2. URL format
  let parsed;
  try {
    parsed = new URL(url);
    check('URL is valid', parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co'), url);
  } catch {
    check('URL is valid', false, url);
    process.exit(1);
  }

  // 3. JWT claims
  const claims = decodeJwt(anonKey);
  check('Anon key is a JWT', Boolean(claims), claims ? 'decoded' : 'not decodable');
  if (claims) {
    check('JWT role is anon', claims.role === 'anon', `role=${claims.role}`);
    check('JWT project ref matches URL host', claims.ref === parsed.hostname.split('.')[0], `ref=${claims.ref} host=${parsed.hostname}`);
    const exp = claims.exp ? new Date(claims.exp * 1000) : null;
    check('JWT not expired', !exp || exp > new Date(), exp ? `exp=${exp.toISOString()}` : 'no exp claim');
  }

  // 4. LIVE check against Supabase Auth — proves the key is accepted
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    const body = await res.json().catch(() => null);
    check('Supabase Auth API accepts anon key', res.ok, `HTTP ${res.status} ${res.ok ? '(external providers: ' + Object.keys(body || {}).join(', ') + ')' : JSON.stringify(body)}`);
  } catch (err) {
    check('Supabase Auth API accepts anon key', false, `network error: ${err.message}`);
  }

  console.log(failures === 0
    ? '\nRESULT: local env values are VALID. If the deployed site still fails, the Vercel project env vars are the problem (wrong project, wrong environment scope, or typo) — check the [env-check] lines in the latest Vercel build log.'
    : `\nRESULT: ${failures} check(s) FAILED — the local values themselves are bad.`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
