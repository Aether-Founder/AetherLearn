import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  workspace: {
    inbox: process.env.WORKSPACE_INBOX || path.join(__dirname, '../workspace/inbox'),
    outbox: process.env.WORKSPACE_OUTBOX || path.join(__dirname, '../workspace/outbox'),
    archive: process.env.WORKSPACE_ARCHIVE || path.join(__dirname, '../workspace/archive'),
  },
  daemon: {
    maxConcurrentDownloads: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS || '10', 10),
    pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '60000', 10),
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  },
  storage: {
    bucketName: 'artisan-inbox',
  },
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  initialRetryDelay: parseInt(process.env.INITIAL_RETRY_DELAY || '1000', 10),
};

// Validate required config
if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

export default config;
