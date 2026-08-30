#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { ArtisanListener } from './listener';
import { deliverDeck, getStatus } from './deliverer';

const program = new Command();

program
  .name('artisan-daemon')
  .description('AetherLearn Artisan Daemon - Process uploaded files locally')
  .version('1.0.0');

program
  .command('start')
  .description('Start the daemon listener (downloads and purges files)')
  .action(async () => {
    console.log(chalk.bold.blue('\n🎨 AetherLearn Artisan Daemon\n'));
    
    const listener = new ArtisanListener();
    await listener.start();
  });

program
  .command('status')
  .description('Display current queue status')
  .action(async () => {
    await getStatus();
  });

program
  .command('deliver <file>')
  .description('Deliver a processed deck JSON file')
  .action(async (file: string) => {
    console.log(chalk.bold.blue('\n🎨 AetherLearn Artisan Daemon - Deliver Deck\n'));
    await deliverDeck(file);
  });

program.parse();
