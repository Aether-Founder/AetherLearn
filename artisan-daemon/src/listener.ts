import { createClient, SupabaseClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import ora from 'ora';
import config from './config';
import { downloadAndPurge } from './downloader';

export class ArtisanListener {
  private supabase: SupabaseClient;
  private channel: any;
  private isActive: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private activeDownloads: number = 0;

  constructor() {
    this.supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async start(): Promise<void> {
    console.log(chalk.blue('🎧 Starting Artisan Daemon Listener...'));
    console.log(chalk.gray(`   Supabase URL: ${config.supabase.url}`));
    console.log(chalk.gray(`   Max concurrent downloads: ${config.daemon.maxConcurrentDownloads}`));
    console.log(chalk.gray(`   Polling fallback: ${config.daemon.pollingIntervalMs}ms`));
    console.log();

    this.isActive = true;

    // Try WebSocket via Realtime first
    await this.startRealtimeListener();

    // Fallback to polling
    this.startPollingFallback();

    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  private async startRealtimeListener(): Promise<void> {
    const spinner = ora('Connecting to Supabase Realtime...').start();

    try {
      this.channel = this.supabase
        .channel('artisan_daemon_listener')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'artisan_queue',
            filter: 'status=eq.pending',
          },
          async (payload: any) => {
            console.log(chalk.green('\n✅ New job detected!'));
            await this.handleNewJob(payload.new);
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            spinner.succeed('Realtime connection established');
            console.log(chalk.green('✓ Listening for new uploads...\n'));
          } else if (status === 'CHANNEL_ERROR') {
            spinner.fail('Realtime connection failed');
            console.log(chalk.yellow('⚠ Falling back to polling mode...'));
          } else if (status === 'TIMED_OUT') {
            spinner.fail('Realtime connection timed out');
            console.log(chalk.yellow('⚠ Falling back to polling mode...'));
          }
        });
    } catch (error) {
      spinner.fail('Failed to start Realtime listener');
      console.error(chalk.red('Error:', error));
      console.log(chalk.yellow('⚠ Using polling mode only...'));
    }
  }

  private startPollingFallback(): void {
    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollPendingJobs();
      } catch (error) {
        console.error(chalk.red('Polling error:', error));
      }
    }, config.daemon.pollingIntervalMs);
  }

  private async pollPendingJobs(): Promise<void> {
    if (this.activeDownloads >= config.daemon.maxConcurrentDownloads) {
      return;
    }

    const { data: pendingJobs, error } = await this.supabase
      .from('artisan_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(config.daemon.maxConcurrentDownloads - this.activeDownloads);

    if (error) {
      console.error(chalk.red('Polling query error:', error.message));
      return;
    }

    if (pendingJobs && pendingJobs.length > 0) {
      console.log(chalk.blue(`\n📥 Found ${pendingJobs.length} pending job(s) via polling`));
      for (const job of pendingJobs) {
        await this.handleNewJob(job);
      }
    }
  }

  private async handleNewJob(job: any): Promise<void> {
    if (this.activeDownloads >= config.daemon.maxConcurrentDownloads) {
      console.log(chalk.yellow(`⏸ Max concurrent downloads reached. Queuing job ${job.id}...`));
      return;
    }

    this.activeDownloads++;

    try {
      console.log(chalk.cyan(`\n📥 Processing job: ${job.file_name}`));
      console.log(chalk.gray(`   User: ${job.user_id}`));
      console.log(chalk.gray(`   Size: ${(job.file_size_bytes / 1024 / 1024).toFixed(2)} MB`));

      const spinner = ora('Downloading file...').start();

      // Download and purge
      await downloadAndPurge(this.supabase, job);

      spinner.succeed(`Downloaded and purged: ${job.file_name}`);

      // Update status to 'downloaded'
      const { error: updateError } = await this.supabase
        .from('artisan_queue')
        .update({ status: 'downloaded' })
        .eq('id', job.id);

      if (updateError) {
        console.error(chalk.red('Failed to update status:', updateError.message));
      } else {
        console.log(chalk.green(`✓ Status updated to 'downloaded'`));
      }

      // Send OS notification
      if (config.daemon.enableNotifications) {
        const notifier = require('node-notifier');
        notifier.notify({
          title: 'Artisan Werkplaats',
          message: `Nieuwe Artisan job gedownload: ${job.file_name}`,
          sound: true,
        });
      }
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Job failed: ${job.file_name}`));
      console.error(chalk.red('   Error:', error.message));

      // Update status to 'failed' with error message
      await this.supabase
        .from('artisan_queue')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', job.id);
    } finally {
      this.activeDownloads--;
    }
  }

  private shutdown(): void {
    console.log(chalk.yellow('\n🛑 Shutting down daemon...'));
    this.isActive = false;

    if (this.channel) {
      this.supabase.removeChannel(this.channel);
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    console.log(chalk.green('✓ Daemon stopped'));
    process.exit(0);
  }
}
