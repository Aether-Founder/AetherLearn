import { createRouteClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niet geauthenticeerd' }, { status: 401 });
    }

    const { deckId, rating } = await request.json();

    if (!deckId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Ongeldige rating' }, { status: 400 });
    }

    // Insert or update rating
    const { error } = await supabase
      .from('deck_ratings')
      .upsert({
        deck_id: deckId,
        user_id: user.id,
        rating,
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Rating error:', error);
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
