import {
  supabase,
  type Subject,
  type Chapter,
  type LearningSet,
  type Quiz,
  type Summary,
  type PracticeTest,
} from './supabase.js';
import chalk from 'chalk';

export async function createSubject(subject: Subject): Promise<string> {
  console.log(chalk.blue('Creating subject...'));

  const { data, error } = await supabase
    .from('subjects')
    .insert({
      name: subject.name,
      description: subject.description,
      color: subject.color || '#3b82f6',
      icon: subject.icon || 'book',
      user_id: null, // Global content
      mastery: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create subject: ${error.message}`);
  }

  console.log(chalk.green(`✓ Subject created with ID: ${data.id}`));
  return data.id;
}

export async function updateSubject(id: string, subject: Partial<Subject>): Promise<void> {
  console.log(chalk.blue('Updating subject...'));

  const { error } = await supabase
    .from('subjects')
    .update({
      name: subject.name,
      description: subject.description,
      color: subject.color,
      icon: subject.icon,
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update subject: ${error.message}`);
  }

  console.log(chalk.green(`✓ Subject updated`));
}

export async function deleteSubject(id: string): Promise<void> {
  console.log(chalk.blue('Deleting subject...'));

  const { error } = await supabase.from('subjects').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete subject: ${error.message}`);
  }

  console.log(chalk.green(`✓ Subject deleted`));
}

export async function createChapter(chapter: Chapter): Promise<string> {
  console.log(chalk.blue('Creating chapter...'));

  const { data, error } = await supabase
    .from('chapters')
    .insert({
      subject_id: chapter.subject_id,
      title: chapter.title,
      description: chapter.description,
      order: chapter.order || 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create chapter: ${error.message}`);
  }

  console.log(chalk.green(`✓ Chapter created with ID: ${data.id}`));
  return data.id;
}

export async function updateChapter(id: string, chapter: Partial<Chapter>): Promise<void> {
  console.log(chalk.blue('Updating chapter...'));

  const { error } = await supabase
    .from('chapters')
    .update({
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update chapter: ${error.message}`);
  }

  console.log(chalk.green(`✓ Chapter updated`));
}

export async function deleteChapter(id: string): Promise<void> {
  console.log(chalk.blue('Deleting chapter...'));

  const { error } = await supabase.from('chapters').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete chapter: ${error.message}`);
  }

  console.log(chalk.green(`✓ Chapter deleted`));
}

export async function createLearningSet(learningSet: LearningSet): Promise<string> {
  console.log(chalk.blue('Creating learning set...'));

  const { data, error } = await supabase
    .from('decks')
    .insert({
      user_id: null, // Global content
      name: learningSet.title,
      description: learningSet.description,
      subject_id: learningSet.subject_id,
      chapter_id: learningSet.chapter_id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create learning set: ${error.message}`);
  }

  // Insert cards
  if (learningSet.cards && learningSet.cards.length > 0) {
    const cards = learningSet.cards.map((card) => ({
      deck_id: data.id,
      front: card.front,
      back: card.back,
      source_text: card.source_text || null,
    }));

    const { error: cardsError } = await supabase.from('cards').insert(cards);

    if (cardsError) {
      throw new Error(`Failed to create cards: ${cardsError.message}`);
    }

    console.log(chalk.green(`✓ Created ${cards.length} cards`));
  }

  console.log(chalk.green(`✓ Learning set created with ID: ${data.id}`));
  return data.id;
}

export async function updateLearningSet(
  id: string,
  learningSet: Partial<LearningSet>
): Promise<void> {
  console.log(chalk.blue('Updating learning set...'));

  const { error } = await supabase
    .from('decks')
    .update({
      name: learningSet.title,
      description: learningSet.description,
      subject_id: learningSet.subject_id,
      chapter_id: learningSet.chapter_id,
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update learning set: ${error.message}`);
  }

  // Update cards if provided
  if (learningSet.cards) {
    // Delete existing cards
    await supabase.from('cards').delete().eq('deck_id', id);

    // Insert new cards
    const cards = learningSet.cards.map((card) => ({
      deck_id: id,
      front: card.front,
      back: card.back,
      source_text: card.source_text || null,
    }));

    const { error: cardsError } = await supabase.from('cards').insert(cards);
    if (cardsError) {
      throw new Error(`Failed to update cards: ${cardsError.message}`);
    }
  }

  console.log(chalk.green(`✓ Learning set updated`));
}

export async function deleteLearningSet(id: string): Promise<void> {
  console.log(chalk.blue('Deleting learning set...'));

  // Delete cards first
  await supabase.from('cards').delete().eq('deck_id', id);

  const { error } = await supabase.from('decks').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete learning set: ${error.message}`);
  }

  console.log(chalk.green(`✓ Learning set deleted`));
}

export async function createQuiz(quiz: Quiz): Promise<string> {
  console.log(chalk.blue('Creating quiz...'));

  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      subject_id: quiz.subject_id,
      chapter_id: quiz.chapter_id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      user_id: null, // Global content
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create quiz: ${error.message}`);
  }

  console.log(chalk.green(`✓ Quiz created with ID: ${data.id}`));
  return data.id;
}

export async function updateQuiz(id: string, quiz: Partial<Quiz>): Promise<void> {
  console.log(chalk.blue('Updating quiz...'));

  const { error } = await supabase
    .from('quizzes')
    .update({
      subject_id: quiz.subject_id,
      chapter_id: quiz.chapter_id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update quiz: ${error.message}`);
  }

  console.log(chalk.green(`✓ Quiz updated`));
}

export async function deleteQuiz(id: string): Promise<void> {
  console.log(chalk.blue('Deleting quiz...'));

  const { error } = await supabase.from('quizzes').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete quiz: ${error.message}`);
  }

  console.log(chalk.green(`✓ Quiz deleted`));
}

export async function createSummary(summary: Summary): Promise<string> {
  console.log(chalk.blue('Creating summary...'));

  const { data, error } = await supabase
    .from('summaries')
    .insert({
      subject_id: summary.subject_id,
      chapter_id: summary.chapter_id,
      title: summary.title,
      content: summary.content,
      tags: summary.tags || [],
      difficulty: summary.difficulty || 'intermediate',
      user_id: null, // Global content
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create summary: ${error.message}`);
  }

  console.log(chalk.green(`✓ Summary created with ID: ${data.id}`));
  return data.id;
}

export async function updateSummary(id: string, summary: Partial<Summary>): Promise<void> {
  console.log(chalk.blue('Updating summary...'));

  const { error } = await supabase
    .from('summaries')
    .update({
      subject_id: summary.subject_id,
      chapter_id: summary.chapter_id,
      title: summary.title,
      content: summary.content,
      tags: summary.tags,
      difficulty: summary.difficulty,
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update summary: ${error.message}`);
  }

  console.log(chalk.green(`✓ Summary updated`));
}

export async function deleteSummary(id: string): Promise<void> {
  console.log(chalk.blue('Deleting summary...'));

  const { error } = await supabase.from('summaries').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete summary: ${error.message}`);
  }

  console.log(chalk.green(`✓ Summary deleted`));
}

export async function createPracticeTest(practiceTest: PracticeTest): Promise<string> {
  console.log(chalk.blue('Creating practice test...'));

  const { data, error } = await supabase
    .from('practice_tests')
    .insert({
      subject_id: practiceTest.subject_id,
      chapter_id: practiceTest.chapter_id,
      title: practiceTest.title,
      description: practiceTest.description,
      duration_minutes: practiceTest.duration_minutes,
      passing_score: practiceTest.passing_score,
      questions: practiceTest.questions,
      user_id: null, // Global content
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create practice test: ${error.message}`);
  }

  console.log(chalk.green(`✓ Practice test created with ID: ${data.id}`));
  return data.id;
}

export async function updatePracticeTest(
  id: string,
  practiceTest: Partial<PracticeTest>
): Promise<void> {
  console.log(chalk.blue('Updating practice test...'));

  const { error } = await supabase
    .from('practice_tests')
    .update({
      subject_id: practiceTest.subject_id,
      chapter_id: practiceTest.chapter_id,
      title: practiceTest.title,
      description: practiceTest.description,
      duration_minutes: practiceTest.duration_minutes,
      passing_score: practiceTest.passing_score,
      questions: practiceTest.questions,
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update practice test: ${error.message}`);
  }

  console.log(chalk.green(`✓ Practice test updated`));
}

export async function deletePracticeTest(id: string): Promise<void> {
  console.log(chalk.blue('Deleting practice test...'));

  const { error } = await supabase.from('practice_tests').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete practice test: ${error.message}`);
  }

  console.log(chalk.green(`✓ Practice test deleted`));
}
