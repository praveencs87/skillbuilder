import * as clack from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import { findRepoRoot, createDefaultConfig, saveConfig, CONFIG_FILE } from '../utils/config.js';
import { ensureDir } from '../utils/files.js';
import { Skill, EditorTarget } from '../types/config.js';
import { buildAllSkills } from '../build/ingestion.js';
import { generateAllRules } from '../generators/index.js';

export async function runInit(options: { targets?: string; style?: string; nonInteractive?: boolean }): Promise<void> {
  clack.intro(chalk.bold('SkillBuilder Init'));
  
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    clack.outro(chalk.red('Not in a git repository. Please run this command in a git repo.'));
    process.exit(1);
  }
  
  const configPath = path.join(repoRoot, CONFIG_FILE);
  
  let targets: EditorTarget[];
  let style: string;
  let createExample: boolean;
  
  if (options.nonInteractive) {
    targets = (options.targets?.split(',').map(t => t.trim()) || ['cursor', 'windsurf']) as EditorTarget[];
    style = options.style || 'balanced';
    createExample = true;
  } else {
    const targetSelection = await clack.multiselect({
      message: 'Which editors should we support?',
      options: [
        { value: 'cursor', label: 'Cursor' },
        { value: 'windsurf', label: 'Windsurf' },
        { value: 'vscode', label: 'VS Code / GitHub Copilot' },
        { value: 'antigravity', label: 'Antigravity' }
      ],
      required: true
    });
    
    if (clack.isCancel(targetSelection)) {
      clack.cancel('Operation cancelled');
      process.exit(0);
    }
    
    targets = targetSelection as EditorTarget[];
    
    const styleSelection = await clack.select({
      message: 'Default rule style?',
      options: [
        { value: 'strict', label: 'Strict - Short rules, cautious about refactors' },
        { value: 'balanced', label: 'Balanced - Includes commands and structure hints' },
        { value: 'minimal', label: 'Minimal - Only high-level constraints' }
      ]
    });
    
    if (clack.isCancel(styleSelection)) {
      clack.cancel('Operation cancelled');
      process.exit(0);
    }
    
    style = styleSelection as string;
    
    const exampleSelection = await clack.confirm({
      message: 'Create example core skill?'
    });
    
    if (clack.isCancel(exampleSelection)) {
      clack.cancel('Operation cancelled');
      process.exit(0);
    }
    
    createExample = exampleSelection;
  }
  
  const spinner = clack.spinner();
  spinner.start('Creating configuration...');
  
  const config = createDefaultConfig(targets, style);
  
  if (createExample) {
    const coreSkill: Skill = {
      id: 'core',
      name: 'Core Project Rules',
      goal: 'How to work in this repository safely and consistently',
      scopes: [],
      sources: {
        urls: [],
        files: ['./README.md']
      },
      constraints: {
        tone: 'concise',
        safety: 'strict',
        formatting: {
          noEmDash: true
        }
      }
    };
    config.skills.push(coreSkill);
  }
  
  await saveConfig(config, repoRoot);
  spinner.stop('Configuration created');
  
  await ensureDir(path.join(repoRoot, 'skills'));
  
  if (createExample) {
    spinner.start('Generating initial rules...');
    try {
      const sourceContents = await buildAllSkills(config, repoRoot, false);
      await generateAllRules(config, repoRoot, sourceContents);
      spinner.stop('Initial rules generated');
    } catch (error) {
      spinner.stop('Rules generation skipped (some sources may be missing)');
    }
  }
  
  clack.outro(chalk.green('✓ SkillBuilder initialized!'));
  
  console.log(chalk.gray('\nNext steps:'));
  console.log(chalk.gray('  • Create a new skill: ') + chalk.cyan('skillbuilder create <name>'));
  console.log(chalk.gray('  • Add documentation: ') + chalk.cyan('skillbuilder add-url <url>'));
  console.log(chalk.gray('  • Sync rules: ') + chalk.cyan('skillbuilder sync'));
  console.log(chalk.gray('  • Watch for changes: ') + chalk.cyan('skillbuilder watch'));
}
