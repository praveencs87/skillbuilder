import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, findRepoRoot } from '../utils/config.js';
import { buildAllSkills } from '../build/ingestion.js';
import { generateAllRules } from '../generators/index.js';

export async function runSync(options: { targets?: string } = {}): Promise<void> {
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.log(chalk.red('Not in a git repository'));
    process.exit(1);
  }
  
  const config = await loadConfig(repoRoot);
  
  if (options.targets) {
    const selectedTargets = options.targets.split(',');
    config.targets = config.targets.filter(t => selectedTargets.includes(t));
  }
  
  console.log(chalk.bold('Syncing rules...\n'));
  
  const spinner = ora('Building skills...').start();
  const sourceContents = await buildAllSkills(config, repoRoot, false);
  spinner.succeed('Skills built');
  
  spinner.start('Generating rules...');
  await generateAllRules(config, repoRoot, sourceContents);
  spinner.succeed('Rules generated');
  
  console.log(chalk.green('\n✓ Sync complete'));
  console.log(chalk.gray(`  Targets: ${config.targets.join(', ')}`));
  console.log(chalk.gray(`  Skills: ${config.skills.length}`));
}
