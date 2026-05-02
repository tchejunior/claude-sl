import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SAMPLE_STDIN } from '../samples/sampleStdin';
import { emitJs } from './emitJs';
import { emitPython } from './emitPython';
import { emitBash } from './emitBash';
import type { ParamId, ResolvedOptions } from '../schema/types';

const STDIN = JSON.stringify(SAMPLE_STDIN);

const opts = (): ResolvedOptions => ({
  global: {
    lineLength: 100, separator: ' | ', useEmojis: false, hardLimit: false,
    tolerancePct: 10, padding: 0, refreshInterval: null,
    hideVimModeIndicator: false, cacheGit: false, cacheStalenessSec: 5,
  },
  sub: {},
});

const PARAMS: ParamId[] = ['model_display', 'version', 'effort'];

/* eslint-disable no-control-regex */
function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\]8;;[^\x07]*\x07/g, '');
}
/* eslint-enable no-control-regex */

function runScript(cmd: string, args: string[], script: string): string {
  const ext = cmd === 'node' ? 'js' : cmd === 'python3' || cmd === 'python' ? 'py' : 'sh';
  const file = join(tmpdir(), `sl-test-${Date.now()}.${ext}`);
  writeFileSync(file, script, { mode: 0o755 });
  try {
    const result = spawnSync(cmd, [...args, file], {
      input: STDIN,
      encoding: 'utf-8',
      timeout: 10000,
    });
    if (result.error) throw result.error;
    return result.stdout ?? '';
  } finally {
    try { unlinkSync(file); } catch { /* ignore */ }
  }
}

describe('JS emitter integration', () => {
  it('outputs model_display, version, effort from SAMPLE_STDIN', () => {
    const script = emitJs(PARAMS, opts());
    const out = stripAnsi(runScript('node', [], script));
    expect(out).toContain(SAMPLE_STDIN.model.display_name);
    expect(out).toContain(SAMPLE_STDIN.version);
    expect(out).toContain(SAMPLE_STDIN.effort.level);
  });

  it('outputs ctx_used_pct percentage', () => {
    const script = emitJs(['ctx_used_pct'], opts());
    const out = stripAnsi(runScript('node', [], script));
    expect(out).toContain(`${SAMPLE_STDIN.context_window.used_percentage}%`);
  });

  it('outputs session_id truncated to 8 chars', () => {
    const script = emitJs(['session_id'], opts());
    const out = stripAnsi(runScript('node', [], script));
    expect(out).toContain(SAMPLE_STDIN.session_id.slice(0, 8));
  });
});

describe('Python emitter integration', () => {
  const py = spawnSync('python3', ['--version'], { encoding: 'utf-8' });
  const hasPy = py.status === 0;
  const itPy = hasPy ? it : it.skip;

  itPy('outputs model_display, version, effort from SAMPLE_STDIN', () => {
    const script = emitPython(PARAMS, opts());
    const out = stripAnsi(runScript('python3', [], script));
    expect(out).toContain(SAMPLE_STDIN.model.display_name);
    expect(out).toContain(SAMPLE_STDIN.version);
    expect(out).toContain(SAMPLE_STDIN.effort.level);
  });

  itPy('outputs ctx_used_pct percentage', () => {
    const script = emitPython(['ctx_used_pct'], opts());
    const out = stripAnsi(runScript('python3', [], script));
    expect(out).toContain(`${SAMPLE_STDIN.context_window.used_percentage}%`);
  });

  itPy('outputs session_id truncated to 8 chars', () => {
    const script = emitPython(['session_id'], opts());
    const out = stripAnsi(runScript('python3', [], script));
    expect(out).toContain(SAMPLE_STDIN.session_id.slice(0, 8));
  });
});

describe('Bash emitter integration', () => {
  const isUnix = process.platform !== 'win32';
  const jqCheck = isUnix ? spawnSync('jq', ['--version'], { encoding: 'utf-8' }) : { status: 1 };
  const hasBash = isUnix && jqCheck.status === 0;
  const itBash = hasBash ? it : it.skip;

  itBash('outputs model_display, version, effort from SAMPLE_STDIN', () => {
    const script = emitBash(PARAMS, opts());
    const out = stripAnsi(runScript('bash', [], script));
    expect(out).toContain(SAMPLE_STDIN.model.display_name);
    expect(out).toContain(SAMPLE_STDIN.version);
    expect(out).toContain(SAMPLE_STDIN.effort.level);
  });

  itBash('outputs ctx_used_pct percentage', () => {
    const script = emitBash(['ctx_used_pct'], opts());
    const out = stripAnsi(runScript('bash', [], script));
    expect(out).toContain(`${SAMPLE_STDIN.context_window.used_percentage}%`);
  });
});
