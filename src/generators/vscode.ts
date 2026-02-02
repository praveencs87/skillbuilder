import path from 'path';
import { ensureDir } from '../utils/files.js';
import { safeMerge } from '../utils/merge.js';
import { SkillBuilderConfig } from '../types/config.js';
import { generateTemplate } from './templates.js';

export async function generateVSCodeRules(
  config: SkillBuilderConfig,
  repoRoot: string,
  sourceContents: Map<string, string>
): Promise<void> {
  const filePath = path.join(repoRoot, config.output.vscode?.file || '.github/copilot-instructions.md');
  await ensureDir(path.dirname(filePath));
  
  const sections = config.skills.map(skill => {
    const content = generateTemplate({
      skill,
      style: config.style,
      sourceContent: sourceContents.get(skill.id)
    });
    
    if (skill.scopes && skill.scopes.length > 0) {
      return `## ${skill.name}\n\nWhen working in ${skill.scopes.join(' or ')}, follow these rules:\n\n${content}`;
    }
    
    return `## ${skill.name}\n\n${content}`;
  });
  
  const fullContent = `# GitHub Copilot Instructions

This file contains AI instructions for working in this repository.

${sections.join('\n\n---\n\n')}
`;
  
  await safeMerge(filePath, 'core', fullContent, false);
}
