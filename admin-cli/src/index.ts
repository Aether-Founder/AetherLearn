#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import {
  createSubject,
  updateSubject,
  deleteSubject,
  createChapter,
  updateChapter,
  deleteChapter,
  createLearningSet,
  updateLearningSet,
  deleteLearningSet,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createSummary,
  updateSummary,
  deleteSummary,
  createPracticeTest,
  updatePracticeTest,
  deletePracticeTest,
} from './content.js';
import type { Subject, Chapter, LearningSet, Quiz, Summary, PracticeTest } from './supabase.js';

const COMMANDS = {
  'create-subject': 'Create a new subject',
  'update-subject': 'Update an existing subject',
  'delete-subject': 'Delete a subject',
  'create-chapter': 'Create a new chapter',
  'update-chapter': 'Update an existing chapter',
  'delete-chapter': 'Delete a chapter',
  'create-learningset': 'Create a new learning set (deck with cards)',
  'update-learningset': 'Update an existing learning set',
  'delete-learningset': 'Delete a learning set',
  'create-quiz': 'Create a new quiz',
  'update-quiz': 'Update an existing quiz',
  'delete-quiz': 'Delete a quiz',
  'create-summary': 'Create a new summary',
  'update-summary': 'Update an existing summary',
  'delete-summary': 'Delete a summary',
  'create-practicetest': 'Create a new practice test',
  'update-practicetest': 'Update an existing practice test',
  'delete-practicetest': 'Delete a practice test',
  help: 'Show this help message',
};

function showHelp() {
  console.log(chalk.bold.cyan('\nAether Admin CLI\n'));
  console.log(chalk.yellow('Usage:'));
  console.log('  node dist/index.js <command> [id] <json-file>\n');
  console.log(chalk.yellow('Commands:'));
  Object.entries(COMMANDS).forEach(([cmd, desc]) => {
    console.log(`  ${chalk.green(cmd.padEnd(25))} ${desc}`);
  });
  console.log(chalk.yellow('\nExamples:'));
  console.log('  node dist/index.js create-subject subject.json');
  console.log('  node dist/index.js update-subject uuid subject.json');
  console.log('  node dist/index.js delete-subject uuid');
  console.log('  node dist/index.js create-learningset learningset.json\n');
}

async function loadJsonFile(filePath: string): Promise<any> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red(`Error reading JSON file: ${error}`));
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help') {
    showHelp();
    process.exit(0);
  }

  const command = args[0];
  const id = args[1];
  const jsonPath = args[2];

  if (!COMMANDS[command as keyof typeof COMMANDS]) {
    console.error(chalk.red(`Error: Unknown command '${command}'`));
    showHelp();
    process.exit(1);
  }

  // Check if command requires ID
  const requiresId = command.startsWith('update-') || command.startsWith('delete-');
  if (requiresId && !id) {
    console.error(chalk.red('Error: ID is required for update/delete commands'));
    showHelp();
    process.exit(1);
  }

  // Check if command requires JSON file
  const requiresJson = command.startsWith('create-') || command.startsWith('update-');
  if (requiresJson && !jsonPath) {
    console.error(chalk.red('Error: JSON file path is required for create/update commands'));
    showHelp();
    process.exit(1);
  }

  const jsonData = requiresJson ? await loadJsonFile(jsonPath) : null;

  try {
    switch (command) {
      case 'create-subject':
        const subjectId = await createSubject(jsonData as Subject);
        console.log(chalk.bold.green(`\n✓ Success! Created subject with ID: ${subjectId}\n`));
        break;
      case 'update-subject':
        await updateSubject(id, jsonData as Partial<Subject>);
        console.log(chalk.bold.green(`\n✓ Success! Subject updated\n`));
        break;
      case 'delete-subject':
        await deleteSubject(id);
        console.log(chalk.bold.green(`\n✓ Success! Subject deleted\n`));
        break;
      case 'create-chapter':
        const chapterId = await createChapter(jsonData as Chapter);
        console.log(chalk.bold.green(`\n✓ Success! Created chapter with ID: ${chapterId}\n`));
        break;
      case 'update-chapter':
        await updateChapter(id, jsonData as Partial<Chapter>);
        console.log(chalk.bold.green(`\n✓ Success! Chapter updated\n`));
        break;
      case 'delete-chapter':
        await deleteChapter(id);
        console.log(chalk.bold.green(`\n✓ Success! Chapter deleted\n`));
        break;
      case 'create-learningset':
        const learningSetId = await createLearningSet(jsonData as LearningSet);
        console.log(
          chalk.bold.green(`\n✓ Success! Created learning set with ID: ${learningSetId}\n`)
        );
        break;
      case 'update-learningset':
        await updateLearningSet(id, jsonData as Partial<LearningSet>);
        console.log(chalk.bold.green(`\n✓ Success! Learning set updated\n`));
        break;
      case 'delete-learningset':
        await deleteLearningSet(id);
        console.log(chalk.bold.green(`\n✓ Success! Learning set deleted\n`));
        break;
      case 'create-quiz':
        const quizId = await createQuiz(jsonData as Quiz);
        console.log(chalk.bold.green(`\n✓ Success! Created quiz with ID: ${quizId}\n`));
        break;
      case 'update-quiz':
        await updateQuiz(id, jsonData as Partial<Quiz>);
        console.log(chalk.bold.green(`\n✓ Success! Quiz updated\n`));
        break;
      case 'delete-quiz':
        await deleteQuiz(id);
        console.log(chalk.bold.green(`\n✓ Success! Quiz deleted\n`));
        break;
      case 'create-summary':
        const summaryId = await createSummary(jsonData as Summary);
        console.log(chalk.bold.green(`\n✓ Success! Created summary with ID: ${summaryId}\n`));
        break;
      case 'update-summary':
        await updateSummary(id, jsonData as Partial<Summary>);
        console.log(chalk.bold.green(`\n✓ Success! Summary updated\n`));
        break;
      case 'delete-summary':
        await deleteSummary(id);
        console.log(chalk.bold.green(`\n✓ Success! Summary deleted\n`));
        break;
      case 'create-practicetest':
        const practiceTestId = await createPracticeTest(jsonData as PracticeTest);
        console.log(
          chalk.bold.green(`\n✓ Success! Created practice test with ID: ${practiceTestId}\n`)
        );
        break;
      case 'update-practicetest':
        await updatePracticeTest(id, jsonData as Partial<PracticeTest>);
        console.log(chalk.bold.green(`\n✓ Success! Practice test updated\n`));
        break;
      case 'delete-practicetest':
        await deletePracticeTest(id);
        console.log(chalk.bold.green(`\n✓ Success! Practice test deleted\n`));
        break;
      default:
        console.error(chalk.red('Error: Command not implemented'));
        process.exit(1);
    }
  } catch (error) {
    console.error(
      chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
    );
    process.exit(1);
  }
}

main();
