export interface LearningCard {
  id: string;
  question: string;
  answer: string;
}

export interface LearningSet {
  id: string;
  title: string;
  description?: string;
  cards: LearningCard[];
  createdAt?: string;
  updatedAt?: string;
  source?: 'local' | 'remote';
}

const STORAGE_KEY = 'aether_learning_sets';

function randomPart(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createLearningSetId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `set_${Date.now()}_${randomPart()}`;
}

export function createLearningCardId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `card_${Date.now()}_${randomPart()}`;
}

function normalizeCard(raw: unknown): LearningCard | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;

  const question =
    typeof record.question === 'string'
      ? record.question.trim()
      : typeof record.term === 'string'
        ? record.term.trim()
        : typeof record.front === 'string'
          ? record.front.trim()
          : '';

  const answer =
    typeof record.answer === 'string'
      ? record.answer.trim()
      : typeof record.definition === 'string'
        ? record.definition.trim()
        : typeof record.back === 'string'
          ? record.back.trim()
          : '';

  if (!question && !answer) return null;

  return {
    id: typeof record.id === 'string' && record.id ? record.id : createLearningCardId(),
    question,
    answer,
  };
}

function normalizeSet(raw: unknown): LearningSet | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;

  const title =
    typeof record.title === 'string'
      ? record.title.trim()
      : typeof record.name === 'string'
        ? record.name.trim()
        : '';

  if (!title) return null;

  const rawCards = Array.isArray(record.cards) ? record.cards : [];

  return {
    id: typeof record.id === 'string' && record.id ? record.id : createLearningSetId(),
    title,
    description:
      typeof record.description === 'string' && record.description.trim()
        ? record.description.trim()
        : undefined,
    cards: rawCards
      .map(normalizeCard)
      .filter((card): card is LearningCard => card !== null),
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
    source: record.source === 'remote' ? 'remote' : 'local',
  };
}

export function loadLocalLearningSets(): LearningSet[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeSet)
      .filter((set): set is LearningSet => set !== null);
  } catch {
    return [];
  }
}

export function saveLocalLearningSets(sets: LearningSet[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch {
    // If storage is unavailable, keep sets in memory only.
  }
}

export function upsertLocalLearningSet(set: LearningSet) {
  const sets = loadLocalLearningSets();
  const index = sets.findIndex((current) => current.id === set.id);

  if (index >= 0) {
    sets[index] = set;
  } else {
    sets.unshift(set);
  }

  saveLocalLearningSets(sets);
}

async function getSupabaseClient(): Promise<any | null> {
  try {
    const clientModule = (await import('@/lib/supabase/client')) as any;

    return (
      clientModule.supabase ??
      (typeof clientModule.createClient === 'function'
        ? clientModule.createClient()
        : null)
    );
  } catch {
    return null;
  }
}

export async function fetchSupabaseLearningSets(): Promise<LearningSet[]> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return [];
  }

  try {
    const { data: decks, error: decksError } = await supabase
      .from('decks')
      .select('id,name,description,created_at')
      .order('created_at', { ascending: false });

    if (decksError || !Array.isArray(decks)) {
      return [];
    }

    let cardRows: unknown[] = [];

    try {
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('id,deck_id,question,answer');

      if (!cardsError && Array.isArray(cards)) {
        cardRows = cards;
      }
    } catch {
      cardRows = [];
    }

    const cardsByDeck = new Map<string, LearningCard[]>();

    for (const rawCard of cardRows) {
      if (!rawCard || typeof rawCard !== 'object') continue;

      const record = rawCard as Record<string, unknown>;
      const deckId = typeof record.deck_id === 'string' ? record.deck_id : '';
      const card = normalizeCard(record);

      if (!deckId || !card) continue;

      const existing = cardsByDeck.get(deckId) ?? [];
      existing.push(card);
      cardsByDeck.set(deckId, existing);
    }

    return decks.map((deck) => {
      const record = deck as Record<string, unknown>;

      return {
        id: typeof record.id === 'string' ? record.id : '',
        title: typeof record.name === 'string' ? record.name : 'Leerset',
        description:
          typeof record.description === 'string' && record.description
            ? record.description
            : undefined,
        createdAt:
          typeof record.created_at === 'string' ? record.created_at : undefined,
        cards: cardsByDeck.get(String(record.id)) ?? [],
        source: 'remote',
      };
    });
  } catch {
    return [];
  }
}

export async function createSupabaseLearningSet(
  set: LearningSet
): Promise<string | null> {
  const supabase = await getSupabaseClient();

  if (!supabase) {
    return null;
  }

  let userId: string | null = null;

  try {
    const { data } = await supabase.auth.getUser();
    userId = data?.user?.id ?? null;
  } catch {
    userId = null;
  }

  const payload: Record<string, unknown> = {
    name: set.title,
    description: set.description ?? null,
  };

  if (userId) {
    payload.user_id = userId;
  }

  const { data, error } = await supabase
    .from('decks')
    .insert(payload)
    .select('id')
    .single();

  if (error || !data) {
    return null;
  }

  const deckId = (data as { id: string }).id;

  if (set.cards.length > 0) {
    const rows = set.cards.map((card) => ({
      deck_id: deckId,
      question: card.question,
      answer: card.answer,
    }));

    await supabase.from('cards').insert(rows);
  }

  return deckId;
}

export async function loadAllLearningSets(): Promise<LearningSet[]> {
  const localSets = loadLocalLearningSets();
  let remoteSets: LearningSet[] = [];

  try {
    remoteSets = await fetchSupabaseLearningSets();
  } catch {
    remoteSets = [];
  }

  const map = new Map<string, LearningSet>();

  for (const set of [...localSets, ...remoteSets]) {
    if (!set.id) continue;
    map.set(set.id, set);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.title.localeCompare(b.title, 'nl', { sensitivity: 'base' })
  );
}

export async function getLearningSetById(id: string): Promise<LearningSet | null> {
  const sets = await loadAllLearningSets();
  return sets.find((set) => set.id === id) ?? null;
}

export async function createLearningSetEverywhere(input: {
  title: string;
  description?: string;
  cards: Array<{ question: string; answer: string }>;
}): Promise<LearningSet> {
  const now = new Date().toISOString();

  const set: LearningSet = {
    id: createLearningSetId(),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    cards: input.cards
      .map((card) => ({
        id: createLearningCardId(),
        question: card.question.trim(),
        answer: card.answer.trim(),
      }))
      .filter((card) => card.question && card.answer),
    createdAt: now,
    updatedAt: now,
    source: 'local',
  };

  upsertLocalLearningSet(set);

  try {
    const remoteId = await createSupabaseLearningSet(set);

    if (remoteId && remoteId !== set.id) {
      const sets = loadLocalLearningSets().filter((current) => current.id !== set.id);
      set.id = remoteId;
      saveLocalLearningSets([set, ...sets]);
    }
  } catch {
    // Local saving already succeeded. Remote sync is optional.
  }

  return set;
}
