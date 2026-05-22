import { describe, it, expect } from 'vitest';
import { formatYear } from '../src/js/utils.js';

describe('formatYear utility tests', () => {
  it('should format negative years as BC', () => {
    expect(formatYear(-221)).toBe('前221年');
    expect(formatYear(-207)).toBe('前207年');
  });

  it('should format positive years as AD', () => {
    expect(formatYear(220)).toBe('公元220年');
    expect(formatYear(618)).toBe('公元618年');
    expect(formatYear(1912)).toBe('公元1912年');
  });

  it('should throw an error for non-number inputs', () => {
    expect(() => formatYear('220')).toThrow();
  });
});
