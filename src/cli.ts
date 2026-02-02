#!/usr/bin/env node

import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runCreate } from './commands/create.js';
import { addUrl, addFile } from './commands/add-source.js';
import { runBuild } from './commands/build.js';
import { runSync } from './commands/sync.js';
import { runWatch } from './commands/watch.js';
import { runDoctor } from './commands/doctor.js';
import { runLint } from './commands/lint.js';

const program = new Command();

program
  .name('skillbuilder')
  .description('CLI tool to create and maintain project-level AI instructions')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize SkillBuilder in a repository')
  .option('--targets <targets>', 'Comma-separated list of targets (cursor,windsurf,vscode,antigravity)')
  .option('--style <style>', 'Rule style (strict, balanced, minimal)')
  .option('--non-interactive', 'Run in non-interactive mode')
  .action(async (options) => {
    try {
      await runInit(options);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('create [name]')
  .description('Create a new skill')
  .option('--goal <goal>', 'Goal statement')
  .option('--scope <scope>', 'Comma-separated path globs')
  .option('--non-interactive', 'Run in non-interactive mode')
  .action(async (name, options) => {
    try {
      await runCreate(name, options);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('add-url <url>')
  .description('Add a URL as a documentation source')
  .option('--skill <skill-id>', 'Skill ID to add the URL to')
  .action(async (url, options) => {
    try {
      await addUrl(url, options.skill);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('add-file <file>')
  .description('Add a local file as a documentation source')
  .option('--skill <skill-id>', 'Skill ID to add the file to')
  .action(async (file, options) => {
    try {
      await addFile(file, options.skill);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('build')
  .description('Build skill content from sources')
  .action(async () => {
    try {
      await runBuild();
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('sync')
  .description('Generate and update editor-specific rules files')
  .option('--targets <targets>', 'Comma-separated list of targets to sync')
  .action(async (options) => {
    try {
      await runSync(options);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('Watch for changes and auto-sync')
  .action(async () => {
    try {
      await runWatch();
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('Diagnose configuration issues')
  .action(async () => {
    try {
      await runDoctor();
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('lint')
  .description('Lint skill configuration')
  .action(async () => {
    try {
      await runLint();
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();
