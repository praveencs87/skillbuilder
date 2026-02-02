import chalk from 'chalk';
import { Glob } from 'glob';
import { loadConfig, findRepoRoot } from '../utils/config.js';
import { Skill } from '../types/config.js';

interface LintIssue {
  severity: 'error' | 'warning';
  skillId: string;
  message: string;
}

export async function runLint(): Promise<void> {
  console.log(chalk.bold('\n🔍 Linting SkillBuilder configuration...\n'));
  
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.log(chalk.red('✗ Not in a git repository'));
    process.exit(1);
  }
  
  const config = await loadConfig(repoRoot);
  const issues: LintIssue[] = [];
  
  for (const skill of config.skills) {
    lintSkill(skill, issues);
  }
  
  if (issues.length === 0) {
    console.log(chalk.green('✓ No issues found'));
    return;
  }
  
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  
  for (const issue of issues) {
    const icon = issue.severity === 'error' ? '✗' : '⚠';
    const color = issue.severity === 'error' ? chalk.red : chalk.yellow;
    console.log(color(`${icon} [${issue.skillId}] ${issue.message}`));
  }
  
  console.log();
  console.log(chalk.gray(`${errors.length} error(s), ${warnings.length} warning(s)`));
  
  if (errors.length > 0) {
    process.exit(1);
  }
}

function lintSkill(skill: Skill, issues: LintIssue[]): void {
  if (!skill.goal || skill.goal.trim().length === 0) {
    issues.push({
      severity: 'error',
      skillId: skill.id,
      message: 'Missing goal statement'
    });
  }
  
  if (skill.goal && skill.goal.length < 10) {
    issues.push({
      severity: 'warning',
      skillId: skill.id,
      message: 'Goal statement is very short'
    });
  }
  
  if (skill.goal && skill.goal.length > 500) {
    issues.push({
      severity: 'warning',
      skillId: skill.id,
      message: 'Goal statement is very long (>500 chars)'
    });
  }
  
  for (const scope of skill.scopes) {
    if (!isValidGlob(scope)) {
      issues.push({
        severity: 'error',
        skillId: skill.id,
        message: `Invalid glob pattern: ${scope}`
      });
    }
  }
  
  if (skill.sources.urls.length === 0 && skill.sources.files.length === 0) {
    issues.push({
      severity: 'warning',
      skillId: skill.id,
      message: 'No sources defined (URLs or files)'
    });
  }
  
  for (const url of skill.sources.urls) {
    if (!isValidUrl(url)) {
      issues.push({
        severity: 'error',
        skillId: skill.id,
        message: `Invalid URL: ${url}`
      });
    }
  }
}

function isValidGlob(pattern: string): boolean {
  try {
    new Glob(pattern, { cwd: '/' });
    return true;
  } catch {
    return false;
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
