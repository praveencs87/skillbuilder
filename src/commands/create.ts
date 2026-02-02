import * as clack from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs/promises';
import { loadConfig, saveConfig, slugify, findRepoRoot } from '../utils/config.js';
import { Skill } from '../types/config.js';

export async function runCreate(
  skillName?: string,
  options: { goal?: string; scope?: string; nonInteractive?: boolean } = {}
): Promise<void> {
  const repoRoot = await findRepoRoot();
  if (!repoRoot) {
    console.log(chalk.red('Not in a git repository'));
    process.exit(1);
  }
  
  const config = await loadConfig(repoRoot);
  
  let name: string;
  let goal: string;
  let scopes: string[];
  
  if (options.nonInteractive && skillName && options.goal) {
    name = skillName;
    goal = options.goal;
    scopes = options.scope ? options.scope.split(',') : [];
  } else {
    clack.intro(chalk.bold('Create New Skill'));
    
    const nameInput = await clack.text({
      message: 'Skill name:',
      placeholder: 'frontend-rules',
      defaultValue: skillName,
      validate: (value) => {
        if (!value) return 'Name is required';
        if (config.skills.some(s => s.id === slugify(value))) {
          return 'A skill with this name already exists';
        }
      }
    });
    
    if (clack.isCancel(nameInput)) {
      clack.cancel('Operation cancelled');
      process.exit(0);
    }
    
    name = nameInput;
    
    const goalInput = await clack.text({
      message: 'Goal statement:',
      placeholder: 'Rules for working in the Next.js frontend',
      validate: (value) => {
        if (!value) return 'Goal is required';
        if (value.length < 10) return 'Goal should be at least 10 characters';
      }
    });
    
    if (clack.isCancel(goalInput)) {
      clack.cancel('Operation cancelled');
      process.exit(0);
    }
    
    goal = goalInput;
    
    const addScopes = await clack.confirm({
      message: 'Add path scopes?'
    });
    
    if (clack.isCancel(addScopes)) {
      clack.cancel('Operation cancelled');
      process.exit(0);
    }
    
    if (addScopes) {
      const scopesInput = await clack.text({
        message: 'Enter glob patterns (comma-separated):',
        placeholder: 'apps/web/**, src/frontend/**'
      });
      
      if (clack.isCancel(scopesInput)) {
        clack.cancel('Operation cancelled');
        process.exit(0);
      }
      
      scopes = scopesInput.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      scopes = [];
    }
  }
  
  const skillId = slugify(name);
  
  const newSkill: Skill = {
    id: skillId,
    name,
    goal,
    scopes,
    sources: {
      urls: [],
      files: []
    },
    constraints: {
      tone: 'concise',
      safety: config.style === 'strict' ? 'strict' : 'balanced',
      formatting: {
        noEmDash: true
      }
    }
  };
  
  config.skills.push(newSkill);
  await saveConfig(config, repoRoot);
  
  const skillDir = path.join(repoRoot, 'skills', skillId);
  await fs.mkdir(skillDir, { recursive: true });
  
  const skillMd = `# ${name}

${goal}

## Scopes
${scopes.length > 0 ? scopes.map(s => `- ${s}`).join('\n') : 'No scopes defined'}

## Sources
Add documentation sources with:
- \`skillbuilder add-url <url> --skill ${skillId}\`
- \`skillbuilder add-file <path> --skill ${skillId}\`
`;
  
  await fs.writeFile(path.join(skillDir, 'skill.md'), skillMd, 'utf-8');
  
  if (!options.nonInteractive) {
    clack.outro(chalk.green(`✓ Skill created: ${name}`));
    
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('  • Add sources: ') + chalk.cyan(`skillbuilder add-url <url> --skill ${skillId}`));
    console.log(chalk.gray('  • Sync rules: ') + chalk.cyan('skillbuilder sync'));
  } else {
    console.log(chalk.green(`✓ Skill created: ${name}`));
  }
}
