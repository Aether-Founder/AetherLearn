import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { z } from 'zod';
import config from './config';

// Zod schema for validation
const DeckSchema = z.object({
  deck_title: z.string().min(1),
  subject_id: z.string().uuid(),
  user_id: z.string().uuid(),
  queue_item_id: z.string().uuid(),
  cards: z.array(
    z.object({
      front: z.string().min(1),
      back: z.string().min(1),
    })
  ).min(1),
});

type DeckData = z.infer<typeof DeckSchema>;

export async function deliverDeck(filePath: string): Promise<void> {
  const spinner = ora('Delivering deck...').start();

  try {
    // Read and parse JSON file
    const absolutePath = path.resolve(filePath);
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const rawData = JSON.parse(fileContent);

    // Validate with Zod
    const validation = DeckSchema.safeParse(rawData);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error.message}`);
    }

    const deckData: DeckData = validation.data;

    // Create Supabase client with service role
    const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Insert into study_sets
    spinner.text = 'Creating study set...';
    const { data: studySet, error: studySetError } = await supabase
      .from('study_sets')
      .insert({
        user_id: deckData.user_id,
        subject_id: deckData.subject_id,
        title: deckData.deck_title,
        description: `Gemaakt via Artisan Werkplaats`,
        is_public: false,
      })
      .select()
      .single();

    if (studySetError) throw studySetError;
    if (!studySet) throw new Error('Failed to create study set');

    spinner.text = 'Creating flashcards...';

    // Bulk insert flashcards
    const flashcards = deckData.cards.map((card, index) => ({
      study_set_id: studySet.id,
      front: card.front,
      back: card.back,
      position: index,
    }));

    const { error: flashcardsError } = await supabase
      .from('flashcards')
      .insert(flashcards);

    if (flashcardsError) throw flashcardsError;

    spinner.text = 'Updating queue status...';

    // Update artisan_queue
    const { error: queueError } = await supabase
      .from('artisan_queue')
      .update({
        status: 'completed',
        result_deck_id: studySet.id,
      })
      .eq('id', deckData.queue_item_id);

    if (queueError) throw queueError;

    // Move original file to archive
    const originalJob = await supabase
      .from('artisan_queue')
      .select('user_id, file_name')
      .eq('id', deckData.queue_item_id)
      .single();

    if (originalJob.data) {
      const originalPath = path.join(
        config.workspace.inbox,
        originalJob.data.user_id,
        originalJob.data.file_name
      );

      const archivePath = path.join(config.workspace.archive, originalJob.data.file_name);
      await fs.mkdir(path.dirname(archivePath), { recursive: true });
      await fs.rename(originalPath, archivePath);
    }

    spinner.succeed('Deck delivered successfully!');
    console.log();
    console.log(chalk.green(`✅ Deck '${deckData.deck_title}' geleverd aan gebruiker ${deckData.user_id}`));
    console.log(chalk.gray(`   Study set ID: ${studySet.id}`));
    console.log(chalk.gray(`   Flashcards created: ${deckData.cards.length}`));
    console.log();

    // Send notification
    if (config.daemon.enableNotifications) {
      const notifier = require('node-notifier');
      notifier.notify({
        title: 'Artisan Werkplaats',
        message: `Deck '${deckData.deck_title}' is klaar!`,
        sound: true,
      });
    }

  } catch (error: any) {
    spinner.fail('Failed to deliver deck');
    console.error(chalk.red('\n❌ Error:', error.message));
    
    if (error.stack) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }
    
    process.exit(1);
  }
}

export async function getStatus(): Promise<void> {
  const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(chalk.blue('\n📊 Artisan Queue Status\n'));

  // Fetch all queue items
  const { data: queueItems, error } = await supabase
    .from('artisan_queue')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(chalk.red('Failed to fetch queue:', error.message));
    process.exit(1);
  }

  if (!queueItems || queueItems.length === 0) {
    console.log(chalk.gray('Queue is empty'));
    return;
  }

  // Group by status
  const grouped = queueItems.reduce((acc, item) => {
    if (!acc[item.status]) acc[item.status] = [];
    acc[item.status].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // Use cli-table3 for beautiful output
  const Table = require('cli-table3');

  const table = new Table({
    head: ['Status', 'Count', 'Files'],
    colWidths: [15, 8, 60],
  });

  const statusLabels: Record<string, string> = {
    pending: chalk.yellow('Pending'),
    downloaded: chalk.blue('Downloaded'),
    processing: chalk.cyan('Processing'),
    completed: chalk.green('Completed'),
    failed: chalk.red('Failed'),
  };

  Object.entries(grouped).forEach(([status, items]) => {
    const fileNames = items.slice(0, 3).map(i => i.file_name).join(', ');
    const more = items.length > 3 ? ` +${items.length - 3} more` : '';
    
    table.push([
      statusLabels[status] || status,
      items.length.toString(),
      fileNames + more,
    ]);
  });

  console.log(table.toString());

  // Show failed items with error messages
  if (grouped.failed && grouped.failed.length > 0) {
    console.log(chalk.red('\n❌ Failed Items:\n'));
    grouped.failed.forEach((item: any) => {
      console.log(chalk.red(`   ${item.file_name}`));
      console.log(chalk.gray(`   Error: ${item.error_message || 'Unknown error'}`));
      console.log();
    });
  }

  // Show recent completed
  if (grouped.completed && grouped.completed.length > 0) {
    const today = new Date().toDateString();
    const completedToday = grouped.completed.filter(
      (item: any) => new Date(item.updated_at).toDateString() === today
    );

    if (completedToday.length > 0) {
      console.log(chalk.green(`\n✅ Completed today: ${completedToday.length}`));
    }
  }

  console.log();
}
