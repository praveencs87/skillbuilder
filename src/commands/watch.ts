import chalk from 'chalk';
import { loadConfig, findRepoRoot } from '../utils/config.js';
import { startWatch } from '../build/watch.js';

export async function runWatch(): Promise<void> {
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.log(chalk.red('Not in a git repository'));
    process.exit(1);
  }
  
  const config = await loadConfig(repoRoot);
  
  console.log(chalk.bold('Starting watch mode...\n'));
  
  const stopWatch = startWatch({
    repoRoot,
    config,
    onError: (error) => {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });
  
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\nStopping watch mode...'));
    stopWatch();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    stopWatch();
    process.exit(0);
  });
}
