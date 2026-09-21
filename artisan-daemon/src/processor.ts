import fs from 'node:fs/promises';
import path from 'node:path';
import { supabase, type ArtisanQueueItem } from './supabase.js';
import {
  ensureWorkspace,
  downloadFile,
  deleteFromStorage,
  moveToArchive,
  writeLog,
} from './workspace.js';
import { retryWithBackoff, formatFileSize } from './utils.js';
import { config } from './config.js';

export async function processQueueItem(item: ArtisanQueueItem): Promise<void> {
  await writeLog(`Processing item: ${item.id} - ${item.file_name}`);

  // Update status to processing
  await supabase.from('artisan_queue').update({ status: 'processing' }).eq('id', item.id);

  const localFileName = `${item.id}_${item.file_name}`;
  const localPath = path.join(config.workspace.inbox, localFileName);

  try {
    // Download file with exponential backoff and validation
    await writeLog(
      `Downloading file: ${item.storage_path} (${formatFileSize(item.file_size_bytes)})`
    );
    await retryWithBackoff(
      async () => {
        await downloadFile(item.storage_path, localPath, item.file_size_bytes);
      },
      config.maxRetries,
      config.initialRetryDelay
    );

    await writeLog(`File downloaded successfully to: ${localPath}`);

    // IMMEDIATELY delete from Supabase Storage (critical constraint)
    await writeLog(`Deleting file from Supabase Storage: ${item.storage_path}`);
    await retryWithBackoff(
      async () => {
        await deleteFromStorage(item.storage_path);
      },
      config.maxRetries,
      config.initialRetryDelay
    );

    await writeLog(`File deleted from Supabase Storage successfully`);

    // Check if this is a YouTube URL (no actual file to process)
    if (item.storage_path.startsWith('http')) {
      await writeLog(`YouTube URL detected, skipping file processing`);
      await processYouTubeUrl(item, item.storage_path);
    } else {
      // Process the file locally (founder does this manually)
      await writeLog(`File ready for manual processing in inbox: ${localPath}`);
      await writeLog(`Waiting for founder to process and drop result in outbox...`);

      // For now, we'll mark it as completed after a delay
      // In production, this would wait for the outbox file
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Simulate completion (founder would actually process this)
      await markAsCompleted(item, 0);
    }

    // Move processed file to archive
    if (!item.storage_path.startsWith('http')) {
      await moveToArchive(localPath);
      await writeLog(`File moved to archive: ${localPath}`);
    }
  } catch (error) {
    await writeLog(`Error processing item ${item.id}: ${error}`);
    await markAsFailed(item, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

async function processYouTubeUrl(item: ArtisanQueueItem, url: string): Promise<void> {
  await writeLog(`Processing YouTube URL: ${url}`);
  // YouTube processing would happen here
  // For now, mark as completed with 0 cards
  await markAsCompleted(item, 0);
}

async function markAsCompleted(item: ArtisanQueueItem, cardCount: number): Promise<void> {
  await writeLog(`Marking item as completed: ${item.id}`);

  const { error } = await supabase
    .from('artisan_queue')
    .update({
      status: 'completed',
      card_count: cardCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', item.id);

  if (error) {
    throw new Error(`Failed to mark as completed: ${error.message}`);
  }

  await writeLog(`Item marked as completed successfully`);
}

async function markAsFailed(item: ArtisanQueueItem, errorMessage: string): Promise<void> {
  await writeLog(`Marking item as failed: ${item.id}`);

  const { error } = await supabase
    .from('artisan_queue')
    .update({
      status: 'failed',
      admin_notes: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', item.id);

  if (error) {
    throw new Error(`Failed to mark as failed: ${error.message}`);
  }

  await writeLog(`Item marked as failed successfully`);
}

export async function checkOutboxForResults(): Promise<void> {
  const outboxFiles = await fs.readdir(config.workspace.outbox);

  for (const file of outboxFiles) {
    if (file.endsWith('.json')) {
      const filePath = path.join(config.workspace.outbox, file);
      await writeLog(`Found result file in outbox: ${file}`);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const result = JSON.parse(content);

        // Extract queue ID from filename or content
        const queueId = result.queueId || file.split('_')[0];

        // Update database with result
        await supabase
          .from('artisan_queue')
          .update({
            status: 'completed',
            card_count: result.cardCount || 0,
            result_deck_id: result.deckId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', queueId);

        await writeLog(`Result delivered for queue item: ${queueId}`);

        // Delete the outbox file after delivery
        await fs.unlink(filePath);
        await writeLog(`Deleted outbox file: ${file}`);
      } catch (error) {
        await writeLog(`Error processing outbox file ${file}: ${error}`);
      }
    }
  }
}
