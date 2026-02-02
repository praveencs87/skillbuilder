import { describe, it, expect } from 'vitest';
import { createMarker, wrapContent } from './merge.js';

describe('createMarker', () => {
  it('should create start marker', () => {
    const marker = createMarker('core', true);
    expect(marker).toBe('<!-- skillbuilder:begin core -->');
  });

  it('should create end marker', () => {
    const marker = createMarker('core', false);
    expect(marker).toBe('<!-- skillbuilder:end core -->');
  });
});

describe('wrapContent', () => {
  it('should wrap content with markers', () => {
    const content = 'Test content';
    const wrapped = wrapContent('test', content);
    
    expect(wrapped).toContain('<!-- skillbuilder:begin test -->');
    expect(wrapped).toContain('Test content');
    expect(wrapped).toContain('<!-- skillbuilder:end test -->');
  });

  it('should preserve newlines', () => {
    const content = 'Line 1\nLine 2';
    const wrapped = wrapContent('test', content);
    
    expect(wrapped).toContain('Line 1\nLine 2');
  });
});
