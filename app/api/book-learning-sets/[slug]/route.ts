import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const bookLearningSetsDir = path.join(process.cwd(), 'content', 'book-learning-sets');
    const filePath = path.join(bookLearningSetsDir, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Learning set not found' }, { status: 404 });
    }

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Support both flat `cards` and sectioned `sections[].cards` formats
    const flatCards: any[] = raw.cards ?? (raw.sections ?? []).flatMap((s: any) => s.cards ?? []);
    const toTerm = (card: any, index: number) => ({
      id: card.id || `${slug}-${index}`,
      term: card.front,
      definition: card.back,
      image: card.image,
    });

    const learningSet = {
      id: raw.id,
      pageName: slug,
      pageTitle: raw.title,
      title: raw.title,
      description: raw.description,
      terms: flatCards.map(toTerm),
      sections: (raw.sections ?? []).map((section: any) => ({
        id: section.id,
        title: section.title,
        cards: (section.cards ?? []).map(toTerm),
      })),
    };

    return NextResponse.json(learningSet);
  } catch (error) {
    console.error('Error loading book learning set:', error);
    return NextResponse.json({ error: 'Failed to load learning set' }, { status: 500 });
  }
}
