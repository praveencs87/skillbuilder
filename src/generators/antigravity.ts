import path from 'path';
import { ensureDir } from '../utils/files.js';
import { safeMerge } from '../utils/merge.js';
import { SkillBuilderConfig } from '../types/config.js';
import { generateTemplate } from './templates.js';

export async function generateAntigravityRules(
  config: SkillBuilderConfig,
  repoRoot: string,
  sourceContents: Map<string, string>
): Promise<void> {
  const outputDir = path.join(repoRoot, config.output.antigravity?.dir || '.antigravity/rules');
  await ensureDir(outputDir);
  
  for (const skill of config.skills) {
    const content = generateTemplate({
      skill,
      style: config.style,
      sourceContent: sourceContents.get(skill.id)
    });
    
    const filePath = path.join(outputDir, `${skill.id}.md`);
    await safeMerge(filePath, 'core', content, false);
  }
}
