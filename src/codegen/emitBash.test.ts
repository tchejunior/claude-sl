import { describe, it, expect } from 'vitest';
import { emitBash } from './emitBash';
import type { ParamId, ResolvedOptions } from '../schema/types';

const opts = (): ResolvedOptions => ({
  global: { lineLength: 100, separator: ' | ', useEmojis: true, hardLimit: false,
    tolerancePct: 10, padding: 0, refreshInterval: null, hideVimModeIndicator: false,
    cacheGit: true, cacheStalenessSec: 5 },
  sub: {},
});

describe('emitBash', () => {
  it('basic selection snapshot', () => {
    expect(emitBash(['model_display', 'cwd', 'ctx_bar'] as ParamId[], opts())).toMatchSnapshot();
  });
});
