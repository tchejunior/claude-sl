import { describe, it, expect } from 'vitest';
import { packLines } from './pack';
import type { ResolvedOptions } from '../schema/types';

const opts = (over: Partial<ResolvedOptions['global']> = {}): ResolvedOptions => ({
  global: {
    lineLength: 100, separator: ' | ', useEmojis: true, hardLimit: false,
    tolerancePct: 10, padding: 0, refreshInterval: null,
    hideVimModeIndicator: false, cacheGit: true, cacheStalenessSec: 5,
    ...over,
  },
  sub: {},
});

describe('packLines', () => {
  it('keeps everything on one line when under limit', () => {
    expect(packLines([10, 10, 10], opts())).toEqual([[0, 1, 2]]);
  });
  it('breaks when over limit', () => {
    expect(packLines([10, 10, 10], opts({ lineLength: 20 }))).toEqual([[0, 1], [2]]);
  });
  it('respects 10% tolerance under soft limit', () => {
    expect(packLines([50, 50], opts())).toEqual([[0, 1]]);
  });
  it('hard limit ignores tolerance', () => {
    expect(packLines([50, 50], opts({ hardLimit: true }))).toEqual([[0], [1]]);
  });
});
