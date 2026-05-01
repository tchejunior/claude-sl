import { describe, it, expect } from 'vitest';
import { emitJs } from './emitJs';
import type { ParamId, ResolvedOptions } from '../schema/types';

const opts = (): ResolvedOptions => ({
  global: {
    lineLength: 100, separator: ' | ', useEmojis: true, hardLimit: false,
    tolerancePct: 10, padding: 0, refreshInterval: null,
    hideVimModeIndicator: false, cacheGit: true, cacheStalenessSec: 5,
  },
  sub: {},
});

describe('emitJs', () => {
  it('produces a runnable script for a basic selection', () => {
    const ids: ParamId[] = ['model_display', 'cwd'];
    const script = emitJs(ids, opts());
    expect(script).toContain('#!/usr/bin/env node');
    expect(script).toContain("process.stdin.on('end'");
    expect(script).toMatchSnapshot();
  });
  it('emits ctx_bar with bar helper', () => {
    const ids: ParamId[] = ['model_display', 'ctx_bar'];
    const out = emitJs(ids, opts());
    expect(out).toContain('__bar(');
    expect(out).toMatchSnapshot();
  });
  it('emits git extraction block with cache when git params selected', () => {
    const ids: ParamId[] = ['model_display', 'git_branch', 'git_modified_count'];
    const out = emitJs(ids, opts());
    expect(out).toContain('__cacheGit');
    expect(out).toContain('__GIT');
    expect(out).toMatchSnapshot();
  });
  it('emits resetTime helper for rate_5h_resets', () => {
    const ids: ParamId[] = ['rate_5h_resets'];
    const out = emitJs(ids, opts());
    expect(out).toContain('__resetTime');
    expect(out).toMatchSnapshot();
  });
});
