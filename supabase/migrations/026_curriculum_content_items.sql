-- Links Supabase learning content to the existing digital subject/chapter/paragraph hierarchy.
create table if not exists public.curriculum_content_items (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  chapter_id uuid null,
  paragraph_id uuid null,
  item_type text not null check (item_type in ('study_set', 'json_lesson')),
  item_id text not null,
  title text not null,
  description text null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (item_type, item_id)
);

create index if not exists curriculum_content_items_location_idx
  on public.curriculum_content_items(subject_id, chapter_id, paragraph_id, sort_order);

alter table public.curriculum_content_items enable row level security;
create policy "Public can read curriculum content items"
  on public.curriculum_content_items for select using (true);
