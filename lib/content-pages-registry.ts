/**
 * Server-only content-page registry backed by Supabase admin_settings.
 *
 * The committed content/content-pages.json remains the seed/fallback so local
 * development keeps working without SUPABASE_SERVICE_ROLE_KEY. On Vercel the
 * filesystem is read-only, so writes must go through admin_settings.
 */
import {
  getAdminSetting,
  putAdminSetting,
  AdminSettingsUnavailable,
} from './admin-settings';
import {
  loadContentPageRegistry,
  saveContentPageRegistry,
  normalizePageId,
  normalizeSubjectId,
  type JsonContentPage,
} from './json-content-pages';

export type ContentPagesRegistryData = { version: 1; pages: JsonContentPage[] };

const KEY = 'content-page-registry';

export async function loadContentPagesRegistry(): Promise<ContentPagesRegistryData> {
  try {
    const cloud = await getAdminSetting<ContentPagesRegistryData>(KEY);
    if (cloud && Array.isArray(cloud.pages)) return cloud;
  } catch {
    // Service key missing or table not migrated yet — fall back to the file.
  }
  return loadContentPageRegistry();
}

export async function saveContentPagesRegistry(
  registry: ContentPagesRegistryData
): Promise<void> {
  try {
    await putAdminSetting(KEY, registry);
  } catch (error) {
    if (error instanceof AdminSettingsUnavailable) {
      // Local dev without service key — keep the file-based behaviour.
      saveContentPageRegistry(registry);
      return;
    }
    throw error;
  }
}

export async function findContentPageAsync(id: string) {
  const normalizedId = normalizePageId(id);
  const registry = await loadContentPagesRegistry();
  return registry.pages.find((page) => page.id === normalizedId);
}

export async function listContentPagesForSubjectAsync(subjectId: string) {
  const normalizedSubject = normalizeSubjectId(subjectId);
  const registry = await loadContentPagesRegistry();
  return registry.pages.filter(
    (page) => normalizeSubjectId(page.subjectId) === normalizedSubject
  );
}
