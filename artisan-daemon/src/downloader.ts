import { SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import config from './config';
import chalk from 'chalk';

interface QueueJob {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  file_size_bytes: number;
  status: string;
  retry_count: number;
}

export async function downloadAndPurge(supabase: SupabaseClient, job: QueueJob): Promise<void> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create user directory if it doesn't exist
      const userDir = path.join(config.workspace.inbox, job.user_id);
      await fs.mkdir(userDir, { recursive: true });

      const localPath = path.join(userDir, job.file_name);

      // Download file from Supabase Storage
      const { data, error } = await supabase.storage
        .from(config.storage.bucketName)
        .download(job.storage_path);

      if (error) throw error;
      if (!data) throw new Error('No data received from storage');

      // Write to local filesystem
      const buffer = Buffer.from(await data.arrayBuffer());
      await fs.writeFile(localPath, buffer);

      console.log(chalk.gray(`   ✓ Saved to: ${localPath}`));

      // Delete from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from(config.storage.bucketName)
        .remove([job.storage_path]);

      if (deleteError) {
        console.error(chalk.yellow(`   ⚠ CRITICAL: Failed to delete from storage: ${deleteError.message}`));
        console.error(chalk.yellow('   Will retry deletion in background...'));
        
        // Retry deletion in background
        setTimeout(async () => {
          try {
            await supabase.storage
              .from(config.storage.bucketName)
              .remove([job.storage_path]);
            console.log(chalk.green(`   ✓ Background deletion succeeded: ${job.storage_path}`));
          } catch (retryError: any) {
            console.error(chalk.red(`   ❌ Background deletion failed: ${retryError.message}`));
          }
        }, 5000);
      } else {
        console.log(chalk.gray(`   ✓ Deleted from storage: ${job.storage_path}`));
      }

      return; // Success

    } catch (error: any) {
      lastError = error;
      console.error(chalk.yellow(`   ⚠ Attempt ${attempt}/${maxRetries} failed: ${error.message}`));

      if (attempt < maxRetries) {
        const backoffDelay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(chalk.gray(`   Waiting ${backoffDelay / 1000}s before retry...`));
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }

  // All retries failed
  throw lastError || new Error('Download failed after all retries');
}
