'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, ChevronRight, FilePlus2, FileText, Folder, LayoutDashboard, Lock, Plus, Trash2, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { supabase as browserClient } from '@/lib/supabase/client';

const supabase = browserClient as any;
type Subject = { id: string; name: string; slug?: string };
type StudySet = { id: string; title: string; description?: string | null; subject_id?: string | null };
type LessonPage = { id: string; title: string; subjectId: string };
type FolderNode = { name: string; path: string; kind?: 'folder' | 'file'; children?: FolderNode[] };
const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function parseCards(value: string, separator: string) {
  const delimiter = separator === '\\t' ? '\t' : separator;
  const cards = value.split(/\r?\n/).flatMap((line) => {
    const position = line.indexOf(delimiter);
    if (!line.trim() || position < 0) return [];
    const front = line.slice(0, position).trim();
    const back = line.slice(position + delimiter.length).trim();
    return front && back ? [{ front, back }] : [];
  });
  return cards;
}

function ExplorerNode({ node, selected, onSelect, sets, pages, depth = 0 }: { node: FolderNode; selected: string; onSelect: (path: string) => void; sets: StudySet[]; pages: LessonPage[]; depth?: number }) {
  const subjectId = node.path.split('/')[0];
  return <div style={{ paddingLeft: depth * 12 }}>
    <button type="button" onClick={() => onSelect(node.path)} className={'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ' + (selected === node.path ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')}>
      {node.kind === 'file' ? <FileText className="h-4 w-4 shrink-0" /> : <Folder className="h-4 w-4 shrink-0" />}{node.name}
    </button>
    {node.children?.map((child) => <ExplorerNode key={child.path} node={child} selected={selected} onSelect={onSelect} sets={sets} pages={pages} depth={depth + 1} />)}
    {depth === 0 && <div className="ml-6 border-l border-border pl-2 text-xs text-muted-foreground">
      {sets.filter((set) => set.subject_id === subjectId).map((set) => <p key={set.id} className="py-1">▤ {set.title}</p>)}
      {pages.filter((page) => page.subjectId === subjectId).map((page) => <p key={page.id} className="py-1">▤ {page.title}</p>)}
    </div>}
  </div>;
}

export default function AdminPortal() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sets, setSets] = useState<StudySet[]>([]);
  const [pages, setPages] = useState<LessonPage[]>([]);
  const [tree, setTree] = useState<FolderNode[]>([]);
  const [saving, setSaving] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [setOpen, setSetOpen] = useState(false);
  const [pageOpen, setPageOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '' });
  const [setForm, setSetForm] = useState({ title: '', description: '', separator: '=', entries: '', location: '' });
  const [pageForm, setPageForm] = useState({ title: '', id: '', description: '', subjectId: '', subjectDatabaseId: '', chapterId: '', paragraphId: '', jsonPath: '' });
  const [pageStep, setPageStep] = useState(1);
  const subjectNames = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject.name])), [subjects]);
  const [selectedSubject, selectedChapter, selectedParagraph] = setForm.location.split('/');

  const loadData = async () => {
    const [subjectData, setData, pageResponse, treeResponse] = await Promise.all([
      supabase.from('subjects').select('id,name,slug').order('name'),
      supabase.from('study_sets').select('id,title,description,subject_id').order('created_at', { ascending: false }),
      fetch('/api/admin/content-pages'), fetch('/api/admin/curriculum'),
    ]);
    const curriculumData = treeResponse.ok ? await treeResponse.json() : { subjects: [], chapters: [], paragraphs: [] };
    const known = new Map<string, Subject>();
    (curriculumData.subjects || subjectData.data || []).forEach((subject: Subject) => known.set(subject.id, subject));
    const pageData = pageResponse.ok ? await pageResponse.json() : { pages: [] };
    setSubjects(Array.from(known.values()).sort((a, b) => a.name.localeCompare(b.name, 'nl')));
    setSets(setData.data || []); setPages(pageData.pages || []);
    const paragraphsByChapter = new Map<string, any[]>();
    (curriculumData.paragraphs || []).forEach((paragraph: any) => paragraphsByChapter.set(paragraph.chapter_id, [...(paragraphsByChapter.get(paragraph.chapter_id) || []), paragraph]));
    const chaptersBySubject = new Map<string, any[]>();
    (curriculumData.chapters || []).forEach((chapter: any) => chaptersBySubject.set(chapter.subject_id, [...(chaptersBySubject.get(chapter.subject_id) || []), chapter]));
    setTree((curriculumData.subjects || []).map((subject: Subject) => ({ name: subject.name, path: subject.id, kind: 'folder', children: (chaptersBySubject.get(subject.id) || []).map((chapter) => ({ name: chapter.title, path: subject.id + '/' + chapter.id, kind: 'folder', children: (paragraphsByChapter.get(chapter.id) || []).map((paragraph) => ({ name: paragraph.title, path: subject.id + '/' + chapter.id + '/' + paragraph.id, kind: 'folder' })) })) })));
  };
  useEffect(() => { if (authenticated) void loadData().catch(() => toast.error('Gegevens konden niet worden geladen.')); }, [authenticated]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    try { const response = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setAuthenticated(true); setPassword(''); } catch (error) { toast.error(error instanceof Error ? error.message : 'Inloggen mislukt.'); } finally { setSaving(false); }
  };
  const addSubject = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    try { const { error } = await supabase.from('subjects').insert({ name: subjectForm.name.trim(), slug: slugify(subjectForm.name), description: subjectForm.description.trim() || null, icon: 'BookOpen', color: '#3b82f6', user_id: null, mastery: 0 }); if (error) throw error; setSubjectOpen(false); setSubjectForm({ name: '', description: '' }); await loadData(); toast.success('Vak toegevoegd.'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Vak toevoegen mislukt.'); } finally { setSaving(false); }
  };
  const addSet = async (event: React.FormEvent) => {
    event.preventDefault(); const cards = parseCards(setForm.entries, setForm.separator);
    if (!setForm.title.trim() || !selectedSubject || !cards.length) { toast.error('Kies een locatie, vul een titel in en voeg minstens één kaart toe.'); return; }
    setSaving(true);
    try { const response = await fetch('/api/admin/study-sets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: setForm.title, description: setForm.description, subjectId: selectedSubject, chapterId: selectedChapter, paragraphId: selectedParagraph, locationPath: setForm.location, cards }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setSetOpen(false); setSetForm({ title: '', description: '', separator: '=', entries: '', location: '' }); await loadData(); toast.success('Leerset toegevoegd.'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Leerset toevoegen mislukt.'); } finally { setSaving(false); }
  };
  const addPage = async () => {
    setSaving(true);
    try { const selected = subjects.find((subject) => subject.id === pageForm.subjectDatabaseId || subject.id === pageForm.subjectId); const response = await fetch('/api/admin/content-pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...pageForm, subjectDatabaseId: selected?.id, subjectId: selected?.slug || slugify(selected?.name || ''), id: pageForm.id || slugify(pageForm.title) }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setPageOpen(false); await loadData(); toast.success('Lespagina toegevoegd.'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Lespagina toevoegen mislukt.'); } finally { setSaving(false); }
  };
  const deleteSet = async (id: string) => { if (!confirm('Leerset verwijderen?')) return; const response = await fetch('/api/admin/study-sets?id=' + encodeURIComponent(id), { method: 'DELETE' }); if (!response.ok) return toast.error('Verwijderen mislukt.'); setSets((current) => current.filter((set) => set.id !== id)); };
  const deletePage = async (id: string) => { if (!confirm('Lespagina verwijderen uit het overzicht?')) return; const response = await fetch('/api/admin/content-pages?id=' + encodeURIComponent(id), { method: 'DELETE' }); if (!response.ok) return toast.error('Verwijderen mislukt.'); setPages((current) => current.filter((page) => page.id !== id)); };

  if (!authenticated) return <main className="grid min-h-screen place-items-center bg-background p-4"><Card className="w-full max-w-md p-8"><div className="mb-6 flex gap-3"><Lock className="h-6 w-6 text-white" /><h1 className="text-2xl font-bold">Admin Portal</h1></div><form className="space-y-4" onSubmit={login}><div><Label htmlFor="email">Admin e-mail</Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div><div><Label htmlFor="password">Wachtwoord</Label><Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div><Button className="w-full" disabled={saving}>Inloggen</Button></form></Card></main>;

  return <AppShell><PageHeader title="Content beheren" description="Maak vakken, leersets en interactieve lespagina's." /><div className="mt-10 space-y-8">
    <div className="grid gap-4 md:grid-cols-3">{[{ href: '/admin/analytics', label: 'Analytics', Icon: LayoutDashboard }, { href: '/admin/lessons', label: 'Lessen', Icon: FileText }, { href: '/admin/artisan', label: 'Artisan wachtrij', Icon: Wrench }].map(({ href, label, Icon }) => <Link key={href} href={href}><Card className="flex items-center gap-3 p-5 hover:bg-secondary/30"><Icon className="h-5 w-5 text-white" />{label}<ChevronRight className="ml-auto h-4 w-4" /></Card></Link>)}</div>
    <div className="grid gap-4 md:grid-cols-3"><Card className="p-6"><BookOpen className="h-5 w-5 text-white" /><h2 className="mt-3 font-semibold">Vak</h2><p className="mt-1 text-sm text-muted-foreground">Naam en beschrijving.</p><Button className="mt-4" onClick={() => setSubjectOpen(true)}><Plus className="mr-2 h-4 w-4" />Vak toevoegen</Button></Card><Card className="p-6"><FileText className="h-5 w-5 text-white" /><h2 className="mt-3 font-semibold">Leerset</h2><p className="mt-1 text-sm text-muted-foreground">Termen en definities in één keer.</p><Button className="mt-4" onClick={() => setSetOpen(true)}><Plus className="mr-2 h-4 w-4" />Leerset toevoegen</Button></Card><Card className="p-6"><FilePlus2 className="h-5 w-5 text-white" /><h2 className="mt-3 font-semibold">JSON-lespagina</h2><p className="mt-1 text-sm text-muted-foreground">Koppel een JSON-bestand aan een vak.</p><Button className="mt-4" onClick={() => { setPageStep(1); setPageOpen(true); }}><Plus className="mr-2 h-4 w-4" />Lespagina toevoegen</Button></Card></div>
    <div className="grid gap-6 lg:grid-cols-2"><Card className="p-6"><h2 className="font-semibold">Bestaande leersets</h2>{sets.map((set) => <div key={set.id} className="mt-3 flex items-center gap-3 border-t border-border pt-3"><div className="min-w-0 flex-1"><p className="truncate">{set.title}</p><p className="text-xs text-muted-foreground">{subjectNames.get(set.subject_id || '') || 'Geen vak'}</p></div><Button size="icon" variant="ghost" onClick={() => void deleteSet(set.id)}><Trash2 className="h-4 w-4" /></Button></div>)}</Card><Card className="p-6"><h2 className="font-semibold">Bestaande lespagina's</h2>{pages.map((page) => <div key={page.id} className="mt-3 flex items-center gap-3 border-t border-border pt-3"><div className="min-w-0 flex-1"><p className="truncate">{page.title}</p><p className="text-xs text-muted-foreground">/{page.id}</p></div><Button size="icon" variant="ghost" onClick={() => void deletePage(page.id)}><Trash2 className="h-4 w-4" /></Button></div>)}</Card></div>
  </div>

  <Dialog open={subjectOpen} onOpenChange={setSubjectOpen}><DialogContent><DialogHeader><DialogTitle>Vak toevoegen</DialogTitle></DialogHeader><form onSubmit={addSubject} className="space-y-4"><div><Label htmlFor="subject-name">Vaknaam *</Label><Input id="subject-name" value={subjectForm.name} onChange={(event) => setSubjectForm({ ...subjectForm, name: event.target.value })} required /></div><div><Label htmlFor="subject-description">Beschrijving</Label><Textarea id="subject-description" value={subjectForm.description} onChange={(event) => setSubjectForm({ ...subjectForm, description: event.target.value })} /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setSubjectOpen(false)}>Annuleren</Button><Button disabled={saving}>Vak toevoegen</Button></DialogFooter></form></DialogContent></Dialog>

  <Dialog open={setOpen} onOpenChange={setSetOpen}><DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto"><DialogHeader><DialogTitle>Leerset toevoegen</DialogTitle></DialogHeader><form onSubmit={addSet} className="grid gap-6 py-2 lg:grid-cols-[1fr_360px]"><div className="space-y-4"><div><Label htmlFor="set-title">Naam *</Label><Input id="set-title" value={setForm.title} onChange={(event) => setSetForm({ ...setForm, title: event.target.value })} required /></div><div><Label htmlFor="set-description">Beschrijving</Label><Input id="set-description" value={setForm.description} onChange={(event) => setSetForm({ ...setForm, description: event.target.value })} /></div><div><Label htmlFor="separator">Scheidingsteken</Label><div className="flex gap-2"><Input id="separator" value={setForm.separator === '\t' ? '\\t' : setForm.separator} onChange={(event) => setSetForm({ ...setForm, separator: event.target.value })} /><Button type="button" variant="outline" onClick={() => setSetForm({ ...setForm, separator: '=' })}>=</Button><Button type="button" variant="outline" onClick={() => setSetForm({ ...setForm, separator: ';' })}>;</Button><Button type="button" variant="outline" onClick={() => setSetForm({ ...setForm, separator: '\t' })}>Tab</Button></div></div><div><Label htmlFor="entries">Termen en definities *</Label><Textarea id="entries" rows={12} className="font-mono" value={setForm.entries} onChange={(event) => setSetForm({ ...setForm, entries: event.target.value })} placeholder={'Term = Definitie\nNog een term = Nog een definitie'} /></div></div><aside className="rounded-lg border border-border bg-secondary/30 p-4"><div className="mb-4"><p className="font-semibold">Contentverkenner</p><p className="text-xs text-muted-foreground">Kies de exacte map. Mappen, hoofdstukken, paragrafen en bestaande sets worden weergegeven.</p></div><div className="max-h-[430px] overflow-y-auto">{tree.map((node) => <ExplorerNode key={node.path} node={node} selected={setForm.location} onSelect={(location) => setSetForm({ ...setForm, location })} sets={sets} pages={pages} />)}</div><p className="mt-4 rounded bg-background p-2 text-xs text-muted-foreground">Gekozen: content/subjects/{setForm.location || '—'}</p></aside><DialogFooter className="lg:col-span-2"><Button type="button" variant="outline" onClick={() => setSetOpen(false)}>Annuleren</Button><Button disabled={saving || !selectedSubject}>{saving ? 'Opslaan...' : 'Leerset toevoegen'}</Button></DialogFooter></form></DialogContent></Dialog>

  <Dialog open={pageOpen} onOpenChange={setPageOpen}><DialogContent><DialogHeader><DialogTitle>JSON-lespagina — stap {pageStep} van 3</DialogTitle></DialogHeader>{pageStep === 1 && <div className="space-y-4"><div><Label>Titel *</Label><Input value={pageForm.title} onChange={(event) => setPageForm({ ...pageForm, title: event.target.value })} /></div><div><Label>Pagina-id voor URL</Label><Input value={pageForm.id} onChange={(event) => setPageForm({ ...pageForm, id: event.target.value })} placeholder={slugify(pageForm.title)} /></div><div><Label>Beschrijving</Label><Input value={pageForm.description} onChange={(event) => setPageForm({ ...pageForm, description: event.target.value })} /></div></div>}{pageStep === 2 && <div><Label>Vak *</Label><select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3" value={pageForm.subjectDatabaseId} onChange={(event) => setPageForm({ ...pageForm, subjectDatabaseId: event.target.value })}>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select><p className="mt-3 text-xs text-muted-foreground">Koppel eventueel aan een precieze digitale locatie:</p><select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3" value={pageForm.chapterId} onChange={(event) => setPageForm({ ...pageForm, chapterId: event.target.value, paragraphId: '' })}><option value="">Op vakniveau</option>{tree.find((node) => node.path === pageForm.subjectDatabaseId)?.children?.map((chapter) => <option key={chapter.path} value={chapter.path.split('/')[1]}>{chapter.name}</option>)}</select><select className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3" value={pageForm.paragraphId} onChange={(event) => setPageForm({ ...pageForm, paragraphId: event.target.value })} disabled={!pageForm.chapterId}><option value="">Geen paragraaf</option>{tree.find((node) => node.path === pageForm.subjectDatabaseId)?.children?.find((chapter) => chapter.path.endsWith('/' + pageForm.chapterId))?.children?.map((paragraph) => <option key={paragraph.path} value={paragraph.path.split('/')[2]}>{paragraph.name}</option>)}</select></div>}{pageStep === 3 && <div><Label>JSON-bestand binnen content/ *</Label><Input value={pageForm.jsonPath} onChange={(event) => setPageForm({ ...pageForm, jsonPath: event.target.value })} placeholder="aardrijkskunde/h5.json" /></div>}<DialogFooter className="mt-5"><Button variant="outline" onClick={() => pageStep === 1 ? setPageOpen(false) : setPageStep(pageStep - 1)}>Vorige</Button>{pageStep < 3 ? <Button onClick={() => setPageStep(pageStep + 1)} disabled={(pageStep === 1 && !pageForm.title) || (pageStep === 2 && !pageForm.subjectDatabaseId)}>Volgende</Button> : <Button onClick={() => void addPage()} disabled={saving || !pageForm.jsonPath}>Opslaan</Button>}</DialogFooter></DialogContent></Dialog>
  </AppShell>;
}
