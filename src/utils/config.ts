import fs from 'fs/promises';
import path from 'path';
import { SkillBuilderConfig, DEFAULT_CONFIG } from '../types/config.js';

export const CONFIG_FILE = 'skillbuilder.json';

export async function findRepoRoot(startDir: string = process.cwd()): Promise<string | null> {
  let currentDir = startDir;
  
  while (true) {
    try {
      const gitPath = path.join(currentDir, '.git');
      await fs.access(gitPath);
      return currentDir;
    } catch {
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        return null;
      }
      currentDir = parentDir;
    }
  }
}

export async function loadConfig(repoRoot?: string): Promise<SkillBuilderConfig> {
  const root = repoRoot || await findRepoRoot() || process.cwd();
  const configPath = path.join(root, CONFIG_FILE);
  
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(content) as SkillBuilderConfig;
    return validateConfig(config);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Config file not found at ${configPath}. Run 'skillbuilder init' first.`);
    }
    throw new Error(`Failed to load config: ${(error as Error).message}`);
  }
}

export async function saveConfig(config: SkillBuilderConfig, repoRoot?: string): Promise<void> {
  const root = repoRoot || await findRepoRoot() || process.cwd();
  const configPath = path.join(root, CONFIG_FILE);
  
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

export function validateConfig(config: SkillBuilderConfig): SkillBuilderConfig {
  if (!config.version) {
    throw new Error('Config missing version field');
  }
  
  if (!Array.isArray(config.targets) || config.targets.length === 0) {
    throw new Error('Config must specify at least one target');
  }
  
  const validTargets = ['cursor', 'windsurf', 'vscode', 'antigravity'];
  for (const target of config.targets) {
    if (!validTargets.includes(target)) {
      throw new Error(`Invalid target: ${target}`);
    }
  }
  
  if (!['strict', 'balanced', 'minimal'].includes(config.style)) {
    throw new Error(`Invalid style: ${config.style}`);
  }
  
  if (!Array.isArray(config.skills)) {
    throw new Error('Config must have skills array');
  }
  
  for (const skill of config.skills) {
    if (!skill.id || !skill.name || !skill.goal) {
      throw new Error(`Skill missing required fields: ${JSON.stringify(skill)}`);
    }
  }
  
  return config;
}

export function createDefaultConfig(targets: string[], style: string): SkillBuilderConfig {
  return {
    version: '1.0',
    targets: targets as any[],
    style: style as any,
    skills: [],
    output: DEFAULT_CONFIG.output!,
    limits: DEFAULT_CONFIG.limits!
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
