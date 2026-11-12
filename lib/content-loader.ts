import fs from 'fs';
import path from 'path';

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  level: string;
  mastery: number;
  topics: number;
  topics_done: number;
  due_count: number;
  customButtons?: Array<{
    id: string;
    label: string;
    href: string;
  }>;
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  order: number;
  paragraphs?: string[];
  content?: string;
}

export interface Paragraph {
  id: string;
  title: string;
  content: string;
  order: number;
  summary?: string;
}

export interface LearningSet {
  id: string;
  chapterId: string;
  subjectId: string;
  title: string;
  description: string;
  cards: Array<{
    front: string;
    back: string;
    source_text?: string;
  }>;
}

export interface Quiz {
  id: string;
  chapterId: string;
  subjectId: string;
  title: string;
  description: string;
  questions: Array<{
    type: 'multiple_choice' | 'open';
    question: string;
    options?: string[];
    correct_answer?: number;
    model_answer?: string;
    explanation?: string;
  }>;
}

export interface Summary {
  id: string;
  chapterId: string;
  subjectId: string;
  title: string;
  content: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface PracticeTest {
  id: string;
  chapterId: string;
  subjectId: string;
  title: string;
  description: string;
  duration_minutes: number;
  passing_score: number;
  questions: Array<{
    type: string;
    question: string;
    options?: string[];
    correct_answer?: number;
    points: number;
  }>;
}

const CONTENT_DIR = path.join(process.cwd(), 'content');

/** Read a UTF-8 text file, stripping a leading BOM so JSON.parse never fails on it. */
function readTextFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
}

/**
 * Resolve the on-disk subject directory for a subjectId/slug.
 * Subject ids in URLs may differ in case from the folder names
 * (e.g. /vakken/Natuurkunde vs content/subjects/natuurkunde),
 * so match directory names case-insensitively.
 */
function resolveSubjectDir(subjectId: string): string {
  const subjectsDir = path.join(CONTENT_DIR, 'subjects');
  try {
    const match = fs
      .readdirSync(subjectsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .find((name) => name.toLowerCase() === subjectId.toLowerCase());
    if (match) return path.join(subjectsDir, match);
  } catch {
    // fall through to the literal path
  }
  return path.join(subjectsDir, subjectId);
}

export async function loadAllSubjects(): Promise<Subject[]> {
  try {
    const indexPath = path.join(CONTENT_DIR, 'subjects', 'index.json');
    const indexContent = readTextFile(indexPath);
    const indexData = JSON.parse(indexContent);
    
    return indexData.subjects || [];
  } catch (error) {
    console.error('Error loading subjects index:', error);
    return [];
  }
}

export async function loadSubject(subjectId: string): Promise<Subject | null> {
  try {
    // First, try to load from the subject-specific JSON file which has mastery data
    const subjectJsonPath = path.join(resolveSubjectDir(subjectId), 'subject.json');
    if (fs.existsSync(subjectJsonPath)) {
      const subjectContent = readTextFile(subjectJsonPath);
      return JSON.parse(subjectContent);
    }

    // Fallback: load from index.json
    const indexPath = path.join(CONTENT_DIR, 'subjects', 'index.json');
    const indexContent = readTextFile(indexPath);
    const indexData = JSON.parse(indexContent);

    const subject = indexData.subjects?.find(
      (s: Subject) =>
        s.id.toLowerCase() === subjectId.toLowerCase() ||
        s.slug.toLowerCase() === subjectId.toLowerCase()
    );
    return subject || null;
  } catch (error) {
    console.error(`Error loading subject ${subjectId}:`, error);
    return null;
  }
}

export async function loadChapters(subjectId: string): Promise<Chapter[]> {
  try {
    const chaptersDir = path.join(resolveSubjectDir(subjectId), 'chapters');
    const chapterDirs = fs.readdirSync(chaptersDir);

    const chapters: Chapter[] = [];
    for (const chapterDir of chapterDirs) {
      const chapterPath = path.join(chaptersDir, chapterDir, 'chapter.json');
      const content = readTextFile(chapterPath);
      chapters.push(JSON.parse(content));
    }

    return chapters.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error(`Error loading chapters for subject ${subjectId}:`, error);
    return [];
  }
}

export async function loadLearningSet(
  subjectId: string,
  chapterId: string,
  learningSetId: string
): Promise<LearningSet | null> {
  try {
    const filePath = path.join(
      resolveSubjectDir(subjectId),
      'chapters',
      chapterId,
      'learning-sets',
      `${learningSetId}.json`
    );
    const content = readTextFile(filePath);
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading learning set ${learningSetId}:`, error);
    return null;
  }
}

export async function loadQuiz(
  subjectId: string,
  chapterId: string,
  quizId: string
): Promise<Quiz | null> {
  try {
    const filePath = path.join(
      resolveSubjectDir(subjectId),
      'chapters',
      chapterId,
      'quizzes',
      `${quizId}.json`
    );
    const content = readTextFile(filePath);
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading quiz ${quizId}:`, error);
    return null;
  }
}

export async function loadSummary(
  subjectId: string,
  chapterId: string,
  summaryId: string
): Promise<Summary | null> {
  try {
    const filePath = path.join(
      resolveSubjectDir(subjectId),
      'chapters',
      chapterId,
      'summaries',
      `${summaryId}.json`
    );
    const content = readTextFile(filePath);
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading summary ${summaryId}:`, error);
    return null;
  }
}

export async function loadPracticeTest(
  subjectId: string,
  chapterId: string,
  testId: string
): Promise<PracticeTest | null> {
  try {
    const filePath = path.join(
      resolveSubjectDir(subjectId),
      'chapters',
      chapterId,
      'practice-tests',
      `${testId}.json`
    );
    const content = readTextFile(filePath);
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading practice test ${testId}:`, error);
    return null;
  }
}

export async function loadParagraphs(
  subjectId: string,
  chapterId: string
): Promise<Paragraph[]> {
  try {
    const paragraphsDir = path.join(
      resolveSubjectDir(subjectId),
      'chapters',
      chapterId,
      'paragraphs'
    );

    if (!fs.existsSync(paragraphsDir)) {
      return [];
    }

    const paragraphFiles = fs.readdirSync(paragraphsDir);
    const paragraphs: Paragraph[] = [];

    for (const file of paragraphFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(paragraphsDir, file);
        const content = readTextFile(filePath);
        paragraphs.push(JSON.parse(content));
      }
    }

    return paragraphs.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error(`Error loading paragraphs for chapter ${chapterId}:`, error);
    return [];
  }
}
