import { createServerClient } from '@/lib/supabase/server';
import { createNode } from '@/lib/filesystem/filesystemService';

/**
 * Populates the unified filesystem with existing content from the database
 * This should be called when the filesystem is initialized to ensure all
 * existing subjects, chapters, and topics are represented in the filesystem
 */
export async function populateFilesystemFromDatabase() {
  try {
    const supabase = createServerClient();
    // Fetch all subjects
    const { data: subjects, error: subjectsError } = await (supabase as any)
      .from('subjects')
      .select('id, name, slug, color, icon, description');

    if (subjectsError) throw subjectsError;

    if (!subjects || subjects.length === 0) {
      return;
    }

    // For each subject, create a filesystem node and fetch its chapters
    for (const subject of subjects) {
      // Create subject node in filesystem
      await createNode('subject', subject.name, 'root', {
        subject: {
          id: subject.id,
          name: subject.name,
          slug: subject.slug,
          color: subject.color,
          icon: subject.icon,
          description: subject.description,
        },
      });

      // Fetch chapters for this subject
      const { data: chapters, error: chaptersError } = await (supabase as any)
        .from('subject_chapters')
        .select('id, name, number, description')
        .eq('subject_id', subject.id)
        .order('number');

      if (chaptersError) {
        continue;
      }

      if (!chapters) continue;

      // For each chapter, create a filesystem node and fetch its topics
      for (const chapter of chapters) {
        // Create chapter node in filesystem
        await createNode('chapter', chapter.name, subject.id, {
          chapter: {
            id: chapter.id,
            name: chapter.name,
            number: chapter.number,
            description: chapter.description,
            subjectId: subject.id,
          },
        });

        // Fetch topics for this chapter
        const { data: topics, error: topicsError } = await (supabase as any)
          .from('subject_topics')
          .select('id, name, description, learning_goals')
          .eq('chapter_id', chapter.id)
          .order('name');

        if (topicsError) {
          continue;
        }

        if (!topics) continue;

        // For each topic, create a filesystem node
        for (const topic of topics) {
          await createNode('topic', topic.name, chapter.id, {
            topic: {
              id: topic.id,
              name: topic.name,
              description: topic.description,
              learningGoals: topic.learning_goals,
              chapterId: chapter.id,
              subjectId: subject.id,
            },
          });
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Syncs a newly created subject to the filesystem
 * Call this after creating a new subject in the database
 */
export async function syncSubjectToFilesystem(subject: any) {
  try {
    await createNode('subject', subject.name, 'root', {
      subject: {
        id: subject.id,
        name: subject.name,
        slug: subject.slug,
        color: subject.color,
        icon: subject.icon,
        description: subject.description,
      },
    });
  } catch (error) {
    console.error('Error syncing subject to filesystem:', error);
    throw error;
  }
}

/**
 * Syncs a newly created chapter to the filesystem
 * Call this after creating a new chapter in the database
 */
export async function syncChapterToFilesystem(chapter: any, subjectId: string) {
  try {
    await createNode('chapter', chapter.name, subjectId, {
      chapter: {
        id: chapter.id,
        name: chapter.name,
        number: chapter.number,
        description: chapter.description,
        subjectId: subjectId,
      },
    });
  } catch (error) {
    console.error('Error syncing chapter to filesystem:', error);
    throw error;
  }
}

/**
 * Syncs a newly created topic to the filesystem
 * Call this after creating a new topic in the database
 */
export async function syncTopicToFilesystem(topic: any, chapterId: string, subjectId: string) {
  try {
    await createNode('topic', topic.name, chapterId, {
      topic: {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        learningGoals: topic.learning_goals,
        chapterId: chapterId,
        subjectId: subjectId,
      },
    });
  } catch (error) {
    console.error('Error syncing topic to filesystem:', error);
    throw error;
  }
}