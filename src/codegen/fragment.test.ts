import { describe, it, expect } from 'vitest';
import { collectHelpers } from './fragment';
import type { CodeFragment } from '../schema/types';

const f = (helpers: string[]): CodeFragment => ({ helpers, expr: '""' });

describe('collectHelpers', () => {
  it('returns unique helper ids preserving first-seen order', () => {
    expect(collectHelpers([f(['a','b']), f(['b','c']), f(['a','d'])])).toEqual(['a','b','c','d']);
  });
  it('handles empty input', () => {
    expect(collectHelpers([])).toEqual([]);
  });
});
