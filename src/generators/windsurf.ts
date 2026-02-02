import path from 'path';
import { ensureDir } from '../utils/files.js';
import { safeMerge } from '../utils/merge.js';
import { SkillBuilderConfig } from '../types/config.js';
import { generateTemplate } from './templates.js';

export async function generateWindsurfRules(
  config: SkillBuilderConfig,
  repoRoot: string,
  sourceContents: Map<string, string>
): Promise<void> {
  const outputDir = path.join(repoRoot, config.output.windsurf?.dir || '.windsurf/rules');
  await ensureDir(outputDir);
  
  for (const skill of config.skills) {
    let content = generateTemplate({
      skill,
      style: config.style,
      sourceContent: sourceContents.get(skill.id)
    });
    
    if (skill.scopes && skill.scopes.length > 0) {
      content = `<!-- Scopes: ${skill.scopes.join(', ')} -->\n\n${content}`;
    }
    
    const filePath = path.join(outputDir, `${skill.id}.md`);
    await safeMerge(filePath, 'core', content, false);
  }
  
  if (config.output.windsurf?.global) {
    const globalPath = path.join(repoRoot, config.output.windsurf.global);
    const globalContent = generateGlobalRules(config, sourceContents);
    await safeMerge(globalPath, 'core', globalContent, false);
  }
}

function generateGlobalRules(
  config: SkillBuilderConfig,
  sourceContents: Map<string, string>
): string {
  const sections = config.skills.map(skill => {
    const content = generateTemplate({
      skill,
      style: config.style,
      sourceContent: sourceContents.get(skill.id)
    });
    
    if (skill.scopes && skill.scopes.length > 0) {
      return `## ${skill.name} (applies to: ${skill.scopes.join(', ')})\n\n${content}`;
    }
    
    return `## ${skill.name}\n\n${content}`;
  });
  
  return sections.join('\n\n---\n\n');
}
