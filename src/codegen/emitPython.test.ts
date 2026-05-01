import { describe, it, expect } from 'vitest';
import { emitPython } from './emitPython';
import type { ParamId, ResolvedOptions } from '../schema/types';

const opts = (): ResolvedOptions => ({
  global: { lineLength: 100, separator: ' | ', useEmojis: true, hardLimit: false,
    tolerancePct: 10, padding: 0, refreshInterval: null, hideVimModeIndicator: false,
    cacheGit: true, cacheStalenessSec: 5 },
  sub: {},
});

describe('emitPython', () => {
  it('basic selection snapshot', () => {
    expect(emitPython(['model_display', 'cwd', 'ctx_bar'] as ParamId[], opts())).toMatchSnapshot();
  });
  it('git extraction block', () => {
    const out = emitPython(['model_display', 'git_branch'] as ParamId[], opts());
    expect(out).toContain('__GIT');
    expect(out).toMatchSnapshot();
  });
});
