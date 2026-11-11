import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { buildStudySetFromSections } from '@/lib/learning-platform/study-set';

export async function GET() {
  try {
    const contentDir = path.join(process.cwd(), 'content');
    const files = fs.readdirSync(contentDir).filter((file) => file.endsWith('.json'));
    const sets: any[] = [];

    for (const file of files) {
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf-8'));
        const pageName = file.replace('.json', '');
        const pageTitle = raw.siteMetadata?.title || pageName;
        const studySet = buildStudySetFromSections(raw.sections || [], pageName);

        if (!studySet || studySet.terms.length === 0) continue;

        const grouped = new Map<string, any>();
        studySet.terms.forEach((term: any) => {
          const id = term.learningSetId || studySet.id;
          const existing: any = grouped.get(id) || {
            id: `${pageName}-${id}`,
            pageName,
            pageTitle,
            title: term.learningSetTitle || studySet.title,
            description: raw.siteMetadata?.description || studySet.description || '',
            terms: [],
          };
          existing.terms.push({
            id: term.id,
            term: term.term,
            definition: term.definition,
            image: term.image,
          });
          grouped.set(id, existing);
        });

        sets.push(...Array.from(grouped.values()).filter((set) => set.terms.length > 0));
      } catch (error) {
        console.error(`Could not read learning sets from ${file}`, error);
      }
    }

    return NextResponse.json(sets.sort((a, b) => a.pageTitle.localeCompare(b.pageTitle, 'nl', { sensitivity: 'base' })));
  } catch (error) {
    console.error('Error loading content pages:', error);
    return NextResponse.json({ error: 'Failed to load content pages' }, { status: 500 });
  }
}
