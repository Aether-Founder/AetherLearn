# Artisan Daemon

Local Node.js CLI application for processing AetherLearn Artisan uploads.

## Overview

The Artisan Daemon runs on the founder's local machine and:

1. **Listens** for new file uploads via Supabase Realtime
2. **Downloads** files from Supabase Storage to local workspace
3. **Purges** files from Supabase Storage (keeps cloud storage at 0 bytes)
4. **Delivers** processed decks back to users

## Setup

### Prerequisites

- Node.js 18+
- Supabase project with:
  - `artisan_queue` table
  - `artisan-inbox` storage bucket
  - Service role key

### Installation

```bash
cd artisan-daemon
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (keep secret!)

## Usage

### Start the Daemon (Listener Mode)

```bash
npm run start
```

This starts the Realtime listener and downloads new files automatically.

### Check Queue Status

```bash
npm run status
```

Displays a formatted table of all queue items grouped by status.

### Deliver a Processed Deck

After manually processing a downloaded file, create a JSON file with the deck data:

```json
{
  "deck_title": "Geschiedenis Hoofdstuk 3",
  "subject_id": "uuid-of-subject",
  "user_id": "uuid-of-user",
  "queue_item_id": "uuid-of-queue-item",
  "cards": [
    {
      "front": "Wat gebeurde er in 1945?",
      "back": "Einde van de Tweede Wereldoorlog"
    }
  ]
}
```

Then deliver it:

```bash
npm run deliver path/to/result.json
```

This will:
- Validate the JSON structure
- Create the study set in Supabase
- Insert all flashcards
- Update the queue status to 'completed'
- Move the original file to archive
- Send a notification

## Workspace Structure

```
workspace/
├── inbox/      # Downloaded files land here (organized by user_id)
├── outbox/     # Drop processed JSON files here (future automation)
└── archive/    # Completed files moved here
```

## Features

### Realtime Listener
- WebSocket connection via Supabase Realtime
- Automatic fallback to polling if WebSocket fails
- Configurable polling interval (default: 60 seconds)

### Download & Purge
- Downloads files to `workspace/inbox/{user_id}/`
- Immediately deletes from Supabase Storage
- Retry logic with exponential backoff (3 attempts)
- Background retry for failed deletions

### Rate Limiting
- Maximum 10 concurrent downloads (configurable)
- No polling when WebSocket is active
- Exponential backoff on all API calls

### Notifications
- OS-level notifications for new downloads
- Notifications for completed deliveries
- Configurable via `ENABLE_NOTIFICATIONS` env var

## Error Handling

- Failed downloads: Retried 3 times with exponential backoff
- Failed deletions: Logged as CRITICAL, retried in background
- Failed deliveries: Error logged, queue status updated
- Validation errors: Clear error messages with Zod schema details

## Development

```bash
# Run in development mode with auto-restart
npm run dev

# Build for production
npm run build

# Run built version
node dist/index.js start
```

## Security Notes

⚠️ **Never commit `.env` file!**

The service role key has full access to your Supabase project. Keep it secure:
- Add `.env` to `.gitignore`
- Use environment-specific configs
- Rotate keys periodically

## Troubleshooting

### Realtime not connecting
- Check that Realtime is enabled in your Supabase project
- Verify the `artisan_queue` table is published
- Check firewall/proxy settings

### Downloads failing
- Verify storage bucket `artisan-inbox` exists
- Check service role key has storage permissions
- Ensure workspace directories are writable

### Notifications not showing
- Install system notification daemon (Linux)
- Check `ENABLE_NOTIFICATIONS=true` in `.env`
- Verify `node-notifier` has system permissions
