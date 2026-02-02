import chalk from 'chalk';
import { loadConfig, saveConfig, findRepoRoot } from '../utils/config.js';

export async function addUrl(url: string, skillId?: string): Promise<void> {
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.log(chalk.red('Not in a git repository'));
    process.exit(1);
  }
  
  try {
    new URL(url);
  } catch {
    console.log(chalk.red(`Invalid URL: ${url}`));
    process.exit(1);
  }
  
  const config = await loadConfig(repoRoot);
  
  if (!skillId && config.skills.length === 1) {
    skillId = config.skills[0].id;
  }
  
  if (!skillId) {
    console.log(chalk.red('Please specify --skill <skill-id>'));
    console.log(chalk.gray('Available skills:'));
    for (const skill of config.skills) {
      console.log(chalk.gray(`  • ${skill.id}: ${skill.name}`));
    }
    process.exit(1);
  }
  
  const skill = config.skills.find(s => s.id === skillId);
  if (!skill) {
    console.log(chalk.red(`Skill not found: ${skillId}`));
    process.exit(1);
  }
  
  if (skill.sources.urls.includes(url)) {
    console.log(chalk.yellow(`URL already added to skill: ${skillId}`));
    return;
  }
  
  skill.sources.urls.push(url);
  await saveConfig(config, repoRoot);
  
  console.log(chalk.green(`✓ URL added to skill: ${skill.name}`));
  console.log(chalk.gray('  Run: ') + chalk.cyan('skillbuilder sync') + chalk.gray(' to update rules'));
}

export async function addFile(filePath: string, skillId?: string): Promise<void> {
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.log(chalk.red('Not in a git repository'));
    process.exit(1);
  }
  
  const config = await loadConfig(repoRoot);
  
  if (!skillId && config.skills.length === 1) {
    skillId = config.skills[0].id;
  }
  
  if (!skillId) {
    console.log(chalk.red('Please specify --skill <skill-id>'));
    console.log(chalk.gray('Available skills:'));
    for (const skill of config.skills) {
      console.log(chalk.gray(`  • ${skill.id}: ${skill.name}`));
    }
    process.exit(1);
  }
  
  const skill = config.skills.find(s => s.id === skillId);
  if (!skill) {
    console.log(chalk.red(`Skill not found: ${skillId}`));
    process.exit(1);
  }
  
  if (skill.sources.files.includes(filePath)) {
    console.log(chalk.yellow(`File already added to skill: ${skillId}`));
    return;
  }
  
  skill.sources.files.push(filePath);
  await saveConfig(config, repoRoot);
  
  console.log(chalk.green(`✓ File added to skill: ${skill.name}`));
  console.log(chalk.gray('  Run: ') + chalk.cyan('skillbuilder sync') + chalk.gray(' to update rules'));
}
