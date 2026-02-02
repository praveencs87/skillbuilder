import { describe, it, expect } from 'vitest';
import { slugify, validateConfig, createDefaultConfig } from './config.js';
import { SkillBuilderConfig } from '../types/config.js';

describe('slugify', () => {
  it('should convert text to slug', () => {
    expect(slugify('Frontend Rules')).toBe('frontend-rules');
    expect(slugify('API Backend')).toBe('api-backend');
    expect(slugify('Test_Skill-123')).toBe('test-skill-123');
  });

  it('should handle special characters', () => {
    expect(slugify('Hello@World!')).toBe('hello-world');
    expect(slugify('Test & Demo')).toBe('test-demo');
  });

  it('should trim leading/trailing hyphens', () => {
    expect(slugify('-test-')).toBe('test');
    expect(slugify('--multiple--')).toBe('multiple');
  });
});

describe('validateConfig', () => {
  it('should validate correct config', () => {
    const config: SkillBuilderConfig = {
      version: '1.0',
      targets: ['cursor'],
      style: 'balanced',
      skills: [
        {
          id: 'test',
          name: 'Test',
          goal: 'Test goal',
          scopes: [],
          sources: { urls: [], files: [] },
          constraints: {}
        }
      ],
      output: {
        cursor: { dir: '.cursor/rules' }
      },
      limits: {
        maxUrlChars: 12000,
        maxFileChars: 12000,
        maxGeneratedCharsPerFile: 18000
      }
    };

    expect(() => validateConfig(config)).not.toThrow();
  });

  it('should reject config without version', () => {
    const config = {
      targets: ['cursor'],
      style: 'balanced',
      skills: []
    } as any;

    expect(() => validateConfig(config)).toThrow('version');
  });

  it('should reject config with invalid target', () => {
    const config = {
      version: '1.0',
      targets: ['invalid'],
      style: 'balanced',
      skills: []
    } as any;

    expect(() => validateConfig(config)).toThrow('Invalid target');
  });

  it('should reject config with invalid style', () => {
    const config = {
      version: '1.0',
      targets: ['cursor'],
      style: 'invalid',
      skills: []
    } as any;

    expect(() => validateConfig(config)).toThrow('Invalid style');
  });
});

describe('createDefaultConfig', () => {
  it('should create config with specified targets', () => {
    const config = createDefaultConfig(['cursor', 'windsurf'], 'balanced');
    
    expect(config.version).toBe('1.0');
    expect(config.targets).toEqual(['cursor', 'windsurf']);
    expect(config.style).toBe('balanced');
    expect(config.skills).toEqual([]);
  });

  it('should include default output paths', () => {
    const config = createDefaultConfig(['cursor'], 'strict');
    
    expect(config.output.cursor).toBeDefined();
    expect(config.output.cursor?.dir).toBe('.cursor/rules');
  });

  it('should include default limits', () => {
    const config = createDefaultConfig(['cursor'], 'minimal');
    
    expect(config.limits.maxUrlChars).toBe(12000);
    expect(config.limits.maxFileChars).toBe(12000);
    expect(config.limits.maxGeneratedCharsPerFile).toBe(18000);
  });
});
