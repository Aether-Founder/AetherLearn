import { createRouteClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getProvider, getDefaultProvider } from '@/lib/ai/providers';
import { checkRateLimit, logAIUsage } from '@/lib/ai/rate-limiter';
import { searchRelevant } from '@/lib/ai/embeddings';
import { SYSTEM_TUTOR, TUTOR_CHAT_WITH_CONTEXT, TUTOR_CHAT_NO_CONTEXT } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const supabase = createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Niet geauthenticeerd' }, { status: 401 });
    }

    const { message, deckId, subjectId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Bericht is verplicht' }, { status: 400 });
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id, 'tutor_chat', supabase);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.error }, { status: 429 });
    }

    // Get user's AI provider configuration
    const { data: userSettings } = await (supabase as any)
      .from('user_settings')
      .select('settings')
      .eq('user_id', user.id)
      .single();

    const settings = userSettings?.settings as any;
    const isBYOK = settings?.useBYOK === true;
    
    let provider;
    if (isBYOK && settings?.openrouterApiKey) {
      provider = getProvider({
        type: settings.preferredProvider || 'qwen',
        apiKey: settings.openrouterApiKey,
        isBYOK: true,
      });
    } else {
      provider = getDefaultProvider();
    }

    // Search for relevant context from user's study materials
    let context = '';
    let sources: any[] = [];
    
    try {
      const relevant = await searchRelevant(message, user.id, 5, 0.6, supabase);
      
      if (relevant && relevant.length > 0) {
        context = relevant
          .map((r, i) => `[Bron ${i + 1}: ${r.metadata?.deck_title || 'Studiemateriaal'}]\n${r.content}`)
          .join('\n\n');
        
        sources = relevant.map(r => ({
          id: r.sourceId,
          deckTitle: r.metadata?.deck_title,
          cardFront: r.metadata?.card_front,
          similarity: r.similarity,
        }));
      }
    } catch (error) {
      console.error('Error searching embeddings:', error);
    }

    // Build prompt
    const prompt = context
      ? TUTOR_CHAT_WITH_CONTEXT(context, message)
      : TUTOR_CHAT_NO_CONTEXT(message);

    // Generate response
    const response = await provider.generateText(prompt, {
      system: SYSTEM_TUTOR,
      temperature: 0.7,
      maxTokens: 1500,
    });

    // Log usage
    await logAIUsage(
      user.id,
      'tutor_chat',
      provider.getModelName(),
      prompt.length,
      response.length,
      provider.getProviderName(),
      supabase
    );

    return NextResponse.json({
      response,
      sources,
      model: provider.getModelName(),
      provider: provider.getProviderName(),
      usage: {
        remaining: rateLimit.remaining - 1,
        limit: rateLimit.limit,
        isBYOK,
      },
    });

  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
