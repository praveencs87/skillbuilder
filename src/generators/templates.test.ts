import { describe, it, expect } from 'vitest';
import { generateTemplate } from './templates.js';
import { Skill } from '../types/config.js';

describe('generateTemplate', () => {
  const testSkill: Skill = {
    id: 'test',
    name: 'Test Skill',
    goal: 'Test goal statement',
    scopes: ['src/**'],
    sources: { urls: [], files: [] },
    constraints: {
      tone: 'concise',
      safety: 'strict'
    }
  };

  it('should generate strict template', () => {
    const result = generateTemplate({
      skill: testSkill,
      style: 'strict'
    });

    expect(result).toContain('# Test Skill');
    expect(result).toContain('Test goal statement');
    expect(result).toContain('## Do');
    expect(result).toContain("## Don't");
  });

  it('should generate balanced template', () => {
    const result = generateTemplate({
      skill: testSkill,
      style: 'balanced'
    });

    expect(result).toContain('# Test Skill');
    expect(result).toContain('## Purpose');
    expect(result).toContain('## Working in this project');
    expect(result).toContain('### Commands');
  });

  it('should generate minimal template', () => {
    const result = generateTemplate({
      skill: testSkill,
      style: 'minimal'
    });

    expect(result).toContain('# Test Skill');
    expect(result).toContain('Test goal statement');
    expect(result).toContain('## Key constraints');
  });

  it('should include source content when provided', () => {
    const result = generateTemplate({
      skill: testSkill,
      style: 'balanced',
      sourceContent: 'Reference documentation here'
    });

    expect(result).toContain('Reference documentation here');
  });

  it('should include scopes in constraints', () => {
    const result = generateTemplate({
      skill: testSkill,
      style: 'balanced'
    });

    expect(result).toContain('src/**');
  });
});
