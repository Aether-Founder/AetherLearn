/**
 * Server-side helpers for the admin_settings table (migration 037).
 * Replaces the old public/admin-*.json file stores — Vercel has a read-only FS.
 * Requires SUPABASE_SERVICE_ROLE_KEY (RLS denies all non-service access).
 */
import { getSupabaseAdmin } from './supabase/admin';

export class AdminSettingsUnavailable extends Error {
  constructor() {
    super('Admin settings storage unavailable: SUPABASE_SERVICE_ROLE_KEY is not configured.');
  }
}

// admin_settings is added in migration 037 and may not be in the generated
// Database types yet — access it through an untyped client.
function adminTable() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new AdminSettingsUnavailable();
  return (supabase as any).from('admin_settings');
}

export async function getAdminSetting<T = any>(key: string): Promise<T | null> {
  const { data, error } = await adminTable()
    .select('data')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;
  return (data?.data as T) ?? null;
}

export async function putAdminSetting(key: string, value: unknown): Promise<void> {
  const { error } = await adminTable().upsert(
    { key, data: value, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  );

  if (error) throw error;
}
