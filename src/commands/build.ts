import chalk from 'chalk';
import { loadConfig, findRepoRoot } from '../utils/config.js';
import { buildAllSkills } from '../build/ingestion.js';

export async function runBuild(): Promise<void> {
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.log(chalk.red('Not in a git repository'));
    process.exit(1);
  }
  
  console.log(chalk.bold('Building skills...\n'));
  
  const config = await loadConfig(repoRoot);
  const results = await buildAllSkills(config, repoRoot, true);
  
  console.log(chalk.green(`\n✓ Built ${results.size} skill(s)`));
  console.log(chalk.gray('  Run: ') + chalk.cyan('skillbuilder sync') + chalk.gray(' to generate rules'));
}
