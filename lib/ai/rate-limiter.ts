import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export type AIAction = 'generate_cards' | 'tutor_chat' | 'summarize' | 'embedding';

export interface RateLimitConfig {
  freeActionsPerDay: number;
  freeChatPerDay: number;
}

export const RATE_LIMITS: RateLimitConfig = {
  freeActionsPerDay: 5, // Total AI actions (excluding chat)
  freeChatPerDay: 20, // Chat messages
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  error?: string;
}

// Check if user has BYOK configured
export async function hasBYOK(userId: string, supabase: SupabaseClient<Database>): Promise<boolean> {
  const { data, error } = await (supabase as any)
    .from('user_settings')
    .select('settings')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  const settings = data.settings as any;
  return settings?.useBYOK === true && !!settings?.openrouterApiKey;
}

// Get daily usage count for a specific action
export async function getDailyUsage(userId: string, action: AIAction, supabase: SupabaseClient<Database>): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await (supabase as any)
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', today.toISOString());

  if (error) {
    console.error('Error fetching usage:', error);
    return 0;
  }

  return count || 0;
}

// Check rate limit before making API call
export async function checkRateLimit(
  userId: string,
  action: AIAction,
  supabase: SupabaseClient<Database>
): Promise<RateLimitResult> {
  // BYOK users have unlimited usage
  const isBYOK = await hasBYOK(userId, supabase);
  if (isBYOK) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      used: 0,
    };
  }

  // Free users have limits
  const limit = action === 'tutor_chat' 
    ? RATE_LIMITS.freeChatPerDay 
    : RATE_LIMITS.freeActionsPerDay;

  const used = await getDailyUsage(userId, action, supabase);
  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      used,
      error: `Je dagelijkse AI-limiet is bereikt. Kom morgen terug of voeg je eigen API-key toe.`,
    };
  }

  return {
    allowed: true,
    remaining,
    limit,
    used,
  };
}

// Log AI usage after successful API call
export async function logAIUsage(
  userId: string,
  action: AIAction,
  model: string,
  tokensIn: number,
  tokensOut: number,
  provider: string,
  supabase: SupabaseClient<Database>
): Promise<void> {
  const { error } = await (supabase as any)
    .from('ai_usage')
    .insert({
      user_id: userId,
      action,
      model_used: model,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      provider,
    });

  if (error) {
    console.error('Error logging AI usage:', error);
  }
}

// Get usage summary for a user
export async function getUsageSummary(userId: string, supabase: SupabaseClient<Database>): Promise<{
  actions: { used: number; limit: number; remaining: number };
  chat: { used: number; limit: number; remaining: number };
  isBYOK: boolean;
}> {
  const isBYOK = await hasBYOK(userId, supabase);
  
  const actionsUsed = await getDailyUsage(userId, 'generate_cards', supabase) 
    + await getDailyUsage(userId, 'summarize', supabase)
    + await getDailyUsage(userId, 'embedding', supabase);
  
  const chatUsed = await getDailyUsage(userId, 'tutor_chat', supabase);

  return {
    actions: {
      used: actionsUsed,
      limit: RATE_LIMITS.freeActionsPerDay,
      remaining: Math.max(0, RATE_LIMITS.freeActionsPerDay - actionsUsed),
    },
    chat: {
      used: chatUsed,
      limit: RATE_LIMITS.freeChatPerDay,
      remaining: Math.max(0, RATE_LIMITS.freeChatPerDay - chatUsed),
    },
    isBYOK,
  };
}
