export type EditorTarget = 'cursor' | 'windsurf' | 'vscode' | 'antigravity';

export type RuleStyle = 'strict' | 'balanced' | 'minimal';

export interface SkillSource {
  urls: string[];
  files: string[];
}

export interface SkillConstraints {
  tone?: string;
  safety?: string;
  formatting?: {
    noEmDash?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface Skill {
  id: string;
  name: string;
  goal: string;
  scopes: string[];
  sources: SkillSource;
  constraints: SkillConstraints;
}

export interface OutputConfig {
  cursor?: { dir: string };
  windsurf?: { dir: string; global?: string };
  vscode?: { file: string };
  antigravity?: { dir: string };
}

export interface Limits {
  maxUrlChars: number;
  maxFileChars: number;
  maxGeneratedCharsPerFile: number;
}

export interface SkillBuilderConfig {
  version: string;
  targets: EditorTarget[];
  style: RuleStyle;
  skills: Skill[];
  output: OutputConfig;
  limits: Limits;
}

export const DEFAULT_CONFIG: Partial<SkillBuilderConfig> = {
  version: '1.0',
  style: 'balanced',
  output: {
    cursor: { dir: '.cursor/rules' },
    windsurf: { dir: '.windsurf/rules', global: '.windsurf/global_rules.md' },
    vscode: { file: '.github/copilot-instructions.md' },
    antigravity: { dir: '.antigravity/rules' }
  },
  limits: {
    maxUrlChars: 12000,
    maxFileChars: 12000,
    maxGeneratedCharsPerFile: 18000
  }
};
