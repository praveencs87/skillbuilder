import { SkillBuilderConfig, EditorTarget } from '../types/config.js';
import { generateCursorRules } from './cursor.js';
import { generateWindsurfRules } from './windsurf.js';
import { generateVSCodeRules } from './vscode.js';
import { generateAntigravityRules } from './antigravity.js';

export async function generateAllRules(
  config: SkillBuilderConfig,
  repoRoot: string,
  sourceContents: Map<string, string>
): Promise<void> {
  const generators: Record<EditorTarget, (config: SkillBuilderConfig, repoRoot: string, sources: Map<string, string>) => Promise<void>> = {
    cursor: generateCursorRules,
    windsurf: generateWindsurfRules,
    vscode: generateVSCodeRules,
    antigravity: generateAntigravityRules
  };
  
  for (const target of config.targets) {
    const generator = generators[target];
    if (generator) {
      await generator(config, repoRoot, sourceContents);
    }
  }
}
