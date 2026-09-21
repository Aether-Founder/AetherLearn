import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const REGISTRY_PATH = path.join(CONTENT_DIR, 'content-pages.json');
const SUBJECTS_DIR = path.join(CONTENT_DIR, 'subjects');

export type JsonContentPage = {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  jsonPath: string;
};

type ContentPageRegistry = { version: 1; pages: JsonContentPage[] };

export function normalizeSubjectId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function normalizePageId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '');
}

export function normalizeJsonPath(value: string) {
  const input = value.trim().replace(/\\/g, '/').replace(/^content\//i, '');
  if (!input || !input.endsWith('.json') || input.includes('..')) return null;

  const resolved = path.resolve(CONTENT_DIR, input);
  if (resolved === CONTENT_DIR || !resolved.startsWith(`${CONTENT_DIR}${path.sep}`)) return null;
  return input;
}

export function getJsonPath(page: JsonContentPage) {
  const normalized = normalizeJsonPath(page.jsonPath);
  return normalized ? path.resolve(CONTENT_DIR, normalized) : null;
}

export function loadContentPageRegistry(): ContentPageRegistry {
  try {
    const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return { version: 1, pages: Array.isArray(parsed.pages) ? parsed.pages : [] };
  } catch {
    return { version: 1, pages: [] };
  }
}

export function saveContentPageRegistry(registry: ContentPageRegistry) {
  fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf-8');
}

export function listContentPagesForSubject(subjectId: string) {
  const normalizedSubject = normalizeSubjectId(subjectId);
  return loadContentPageRegistry().pages.filter(
    (page) => normalizeSubjectId(page.subjectId) === normalizedSubject
  );
}

export function findContentPage(id: string) {
  const normalizedId = normalizePageId(id);
  return loadContentPageRegistry().pages.find((page) => page.id === normalizedId);
}

export function hasLocalContentForSubject(subjectName: string): boolean {
  try {
    const subjectsDir = path.join(process.cwd(), 'content', 'subjects');
    if (!fs.existsSync(subjectsDir)) {
      return false;
    }

    const folders = fs.readdirSync(subjectsDir, { withFileTypes: true });
    const normalizedSubjectName = subjectName.toLowerCase();

    return folders.some(folder => {
      if (!folder.isDirectory()) return false;
      return folder.name.toLowerCase() === normalizedSubjectName;
    });
  } catch {
    return false;
  }
}

export function getLocalContentForSubject(subjectName: string): Array<{ id: string; title: string; jsonPath: string }> {
  try {
    const subjectsDir = path.join(process.cwd(), 'content', 'subjects');
    if (!fs.existsSync(subjectsDir)) {
      return [];
    }

    const folders = fs.readdirSync(subjectsDir, { withFileTypes: true });
    const normalizedSubjectName = subjectName.toLowerCase();

    const matchingFolder = folders.find(folder => {
      if (!folder.isDirectory()) return false;
      return folder.name.toLowerCase() === normalizedSubjectName;
    });

    if (!matchingFolder) {
      return [];
    }

    const subjectPath = path.join(subjectsDir, matchingFolder.name);
    const files = fs.readdirSync(subjectPath);

    return files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join('subjects', matchingFolder.name, file);
        const id = file.replace('.json', '');
        return {
          id,
          title: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          jsonPath: filePath
        };
      });
  } catch {
    return [];
  }
}
