import fs from 'node:fs/promises';
import path from 'node:path';
import { supabase } from './supabase.js';
import { config } from './config.js';

export async function ensureWorkspace(): Promise<void> {
  const directories = [
    config.workspacePath,
    config.inboxPath,
    config.outboxPath,
    config.archivePath,
    config.logsPath,
  ];

  for (const dir of directories) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
}

export async function downloadFile(
  storagePath: string,
  localPath: string,
  expectedSize?: number
): Promise<void> {
  const { data, error } = await supabase.storage.from('artisan-inbox').download(storagePath);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validate file is not empty
  if (buffer.length === 0) {
    throw new Error(`Downloaded file is empty: ${storagePath}`);
  }

  // Validate file size if expected size provided (allow 5% tolerance for metadata)
  if (expectedSize && buffer.length < expectedSize * 0.95) {
    throw new Error(
      `Downloaded file size (${buffer.length} bytes) is significantly smaller than expected (${expectedSize} bytes): ${storagePath}`
    );
  }

  await fs.writeFile(localPath, buffer);
}

export async function deleteFromStorage(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from('artisan-inbox').remove([storagePath]);

  if (error) {
    throw new Error(`Failed to delete from storage: ${error.message}`);
  }
}

export async function moveToArchive(localPath: string): Promise<void> {
  const fileName = path.basename(localPath);
  const archivePath = path.join(config.archivePath, fileName);
  await fs.rename(localPath, archivePath);
}

export async function writeLog(message: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const logFile = path.join(
    config.logsPath,
    `artisan-${new Date().toISOString().split('T')[0]}.log`
  );
  const logMessage = `[${timestamp}] ${message}\n`;
  await fs.appendFile(logFile, logMessage);
}
