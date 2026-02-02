import chokidar from 'chokidar';
import path from 'path';
import chalk from 'chalk';
import { SkillBuilderConfig } from '../types/config.js';
import { CONFIG_FILE } from '../utils/config.js';
import { buildAllSkills } from './ingestion.js';
import { generateAllRules } from '../generators/index.js';

export interface WatchOptions {
  repoRoot: string;
  config: SkillBuilderConfig;
  onError?: (error: Error) => void;
}

export function startWatch(options: WatchOptions): () => void {
  const { repoRoot, config, onError } = options;
  
  const watchPaths = [
    path.join(repoRoot, CONFIG_FILE),
    path.join(repoRoot, 'skills/**/*')
  ];
  
  for (const skill of config.skills) {
    for (const file of skill.sources.files) {
      const fullPath = path.isAbsolute(file) ? file : path.join(repoRoot, file);
      watchPaths.push(fullPath);
    }
  }
  
  console.log(chalk.blue('👀 Watching for changes...'));
  console.log(chalk.gray(`  ${watchPaths.length} paths monitored`));
  
  let debounceTimer: NodeJS.Timeout | null = null;
  
  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100
    }
  });
  
  const handleChange = async (changedPath: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(async () => {
      try {
        console.log(chalk.yellow(`\n📝 Change detected: ${path.relative(repoRoot, changedPath)}`));
        console.log(chalk.gray('   Rebuilding...'));
        
        const sourceContents = await buildAllSkills(config, repoRoot, false);
        await generateAllRules(config, repoRoot, sourceContents);
        
        console.log(chalk.green('✓ Sync complete\n'));
      } catch (error) {
        console.error(chalk.red(`✗ Sync failed: ${(error as Error).message}\n`));
        if (onError) {
          onError(error as Error);
        }
      }
    }, 1000);
  };
  
  watcher.on('change', handleChange);
  watcher.on('add', handleChange);
  watcher.on('unlink', handleChange);
  
  watcher.on('error', (error) => {
    console.error(chalk.red(`Watch error: ${error.message}`));
    if (onError) {
      onError(error);
    }
  });
  
  return () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    watcher.close();
    console.log(chalk.gray('Watch stopped'));
  };
}
