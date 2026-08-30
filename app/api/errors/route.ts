import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.slice(0, 2000) : 'Unknown client error';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (serviceKey && url) {
      const client = createClient(url, serviceKey, { auth: { persistSession: false } });
      await client.from('error_logs').insert({
        message,
        stack: typeof body.stack === 'string' ? body.stack.slice(0, 12000) : null,
        route: typeof body.route === 'string' ? body.route.slice(0, 512) : null,
        context: typeof body.context === 'object' && body.context ? body.context : {},
      });
    }
    return apiSuccess({}, 202);
  } catch (error) {
    console.error('Unable to record client error', error);
    return apiError('Foutmelding kon niet worden opgeslagen.');
  }
}
