import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getStudySetsByUserId, createStudySet, searchStudySets, getPublicStudySets, addStudyCard } from '@/lib/studysets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const publicOnly = searchParams.get('public') === 'true';

    if (publicOnly) {
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
      const studySets = getPublicStudySets(limit, offset);
      return NextResponse.json({ studySets });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    let studySets;
    if (query) {
      studySets = searchStudySets(query, decoded.userId);
    } else {
      studySets = getStudySetsByUserId(decoded.userId);
    }

    return NextResponse.json({ studySets });
  } catch (error) {
    console.error('Get study sets error:', error);
    return NextResponse.json(
      { error: 'Failed to get study sets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, folderId, isPublic, cards = [] } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    let studySet = createStudySet(decoded.userId, title, description, folderId, isPublic);
    if (Array.isArray(cards)) {
      cards
        .filter((card: any) => (card.term || card.front) && (card.definition || card.back))
        .forEach((card: any) => {
          addStudyCard(
            studySet.id,
            card.term || card.front,
            card.definition || card.back,
            card.imageUrl || card.image,
            {
              front: card.front,
              back: card.back,
              cardType: card.cardType || card.type,
              audioUrl: card.audioUrl || card.audio,
              tags: card.tags || [],
              clozeText: card.clozeText,
              occlusions: card.occlusions || [],
            }
          );
        });
      studySet = getStudySetsByUserId(decoded.userId).find((set) => set.id === studySet.id) || studySet;
    }

    return NextResponse.json({ studySet });
  } catch (error) {
    console.error('Create study set error:', error);
    return NextResponse.json(
      { error: 'Failed to create study set' },
      { status: 500 }
    );
  }
}
