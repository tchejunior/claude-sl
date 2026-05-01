import { describe, it, expect } from 'vitest';
import { emitSettings } from './emitSettings';
import type { ResolvedOptions } from '../schema/types';

const opts = (over: Partial<ResolvedOptions['global']> = {}): ResolvedOptions => ({
  global: { lineLength: 100, separator: ' | ', useEmojis: true, hardLimit: false,
    tolerancePct: 10, padding: 0, refreshInterval: null, hideVimModeIndicator: false,
    cacheGit: true, cacheStalenessSec: 5, ...over },
  sub: {},
});

describe('emitSettings', () => {
  it('minimal posix bash', () => {
    const out = emitSettings({ os: 'mac', format: 'sh', selected: ['model_display'] }, opts());
    expect(out).toContain('"command": "~/.claude/statusline.sh"');
    expect(out).not.toContain('padding');
    expect(out).not.toContain('refreshInterval');
  });
  it('windows powershell command', () => {
    const out = emitSettings({ os: 'win', format: 'ps', selected: ['model_display'] }, opts());
    expect(out).toContain('powershell -NoProfile -File');
    expect(out).toContain('statusline.ps1');
  });
  it('emits padding when non-zero', () => {
    const out = emitSettings({ os: 'mac', format: 'sh', selected: ['model_display'] }, opts({ padding: 2 }));
    expect(out).toContain('"padding": 2');
  });
  it('auto-defaults refreshInterval to 5 when timestamp param selected', () => {
    const out = emitSettings({ os: 'mac', format: 'sh', selected: ['rate_5h_resets'] }, opts());
    expect(out).toContain('"refreshInterval": 5');
  });
  it('omits refreshInterval when no time-based params', () => {
    const out = emitSettings({ os: 'mac', format: 'sh', selected: ['model_display'] }, opts());
    expect(out).not.toContain('refreshInterval');
  });
});
