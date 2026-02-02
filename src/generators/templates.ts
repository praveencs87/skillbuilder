import { Skill, RuleStyle } from '../types/config.js';

export interface TemplateContext {
  skill: Skill;
  style: RuleStyle;
  repoName?: string;
  sourceContent?: string;
}

export function generateStrictTemplate(ctx: TemplateContext): string {
  const { skill, sourceContent } = ctx;
  
  return `# ${skill.name}

## Goal
${skill.goal}

## Constraints
${generateConstraints(skill, 'strict')}

## Do
- Follow existing patterns exactly
- Run tests before committing
- Ask before large refactors
- Preserve existing code style

## Don't
- Make destructive changes without confirmation
- Modify generated files
- Touch infrastructure without approval
- Use em-dashes in output${skill.constraints.formatting?.noEmDash ? ' (use hyphens instead)' : ''}

${sourceContent ? `## Reference\n${sourceContent}` : ''}
`.trim();
}

export function generateBalancedTemplate(ctx: TemplateContext): string {
  const { skill, sourceContent } = ctx;
  
  return `# ${skill.name}

## Purpose
${skill.goal}

## Working in this project
${generateConstraints(skill, 'balanced')}

### Preferred patterns
- Follow existing code conventions
- Write clear, maintainable code
- Add tests for new features
- Document complex logic

### Safety rules
- Run tests before committing
- Ask before major refactors
- Don't modify generated folders
- Preserve user configurations

### Commands
\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
\`\`\`

${sourceContent ? `## Documentation\n${sourceContent}` : ''}
`.trim();
}

export function generateMinimalTemplate(ctx: TemplateContext): string {
  const { skill } = ctx;
  
  return `# ${skill.name}

${skill.goal}

## Key constraints
${generateConstraints(skill, 'minimal')}

## Safety
- Run tests before committing
- Ask before destructive changes
`.trim();
}

function generateConstraints(skill: Skill, style: RuleStyle): string {
  const constraints: string[] = [];
  
  if (skill.constraints.tone) {
    constraints.push(`- Tone: ${skill.constraints.tone}`);
  }
  
  if (skill.constraints.safety) {
    constraints.push(`- Safety level: ${skill.constraints.safety}`);
  }
  
  if (skill.constraints.formatting?.noEmDash) {
    constraints.push('- Never use em-dashes, use hyphens instead');
  }
  
  if (skill.scopes && skill.scopes.length > 0) {
    constraints.push(`- Applies to: ${skill.scopes.join(', ')}`);
  }
  
  if (constraints.length === 0) {
    return 'Follow best practices and maintain code quality.';
  }
  
  return constraints.join('\n');
}

export function generateTemplate(ctx: TemplateContext): string {
  switch (ctx.style) {
    case 'strict':
      return generateStrictTemplate(ctx);
    case 'balanced':
      return generateBalancedTemplate(ctx);
    case 'minimal':
      return generateMinimalTemplate(ctx);
    default:
      return generateBalancedTemplate(ctx);
  }
}
