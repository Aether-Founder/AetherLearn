/**
 * Client-side version of filesystem content loader
 * This version uses the browser Supabase client for client-side filesystem population
 */

import { supabase as browserClient } from '@/lib/supabase/client';
import { createNode } from '@/lib/filesystem/filesystemService';

/**
 * Populates the unified filesystem with existing content from the database
 * This should be called when the filesystem is initialized to ensure all
 * existing subjects, chapters, and topics are represented in the filesystem
 */
export async function populateFilesystemFromDatabaseClient() {
  try {
    // Fetch all subjects
    const { data: subjects, error: subjectsError } = await browserClient
      .from('subjects')
      .select('id, name, slug, color, icon, description');

    if (subjectsError) throw subjectsError;

    if (!subjects || subjects.length === 0) {
      console.log('No subjects found in database');
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
      const { data: chapters, error: chaptersError } = await browserClient
        .from('subject_chapters')
        .select('id, name, number, description')
        .eq('subject_id', subject.id)
        .order('number');

      if (chaptersError) {
        console.error(`Error fetching chapters for subject ${subject.id}:`, chaptersError);
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
        const { data: topics, error: topicsError } = await browserClient
          .from('subject_topics')
          .select('id, name, description, learning_goals')
          .eq('chapter_id', chapter.id)
          .order('name');

        if (topicsError) {
          console.error(`Error fetching topics for chapter ${chapter.id}:`, topicsError);
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

    console.log('Filesystem populated successfully from database');
  } catch (error) {
    console.error('Error populating filesystem from database:', error);
    throw error;
  }
}