import type { ParamId, ResolvedOptions } from '../schema/types';

export type EmitOs = 'mac' | 'linux' | 'win';
export type EmitFmt = 'sh' | 'py' | 'js' | 'ps';

export interface EmitSettingsInput {
  os: EmitOs;
  format: EmitFmt;
  selected: ParamId[];
}

const TIME_TRIGGERS: ReadonlyArray<ParamId> = [
  'rate_5h_resets', 'rate_7d_resets', 'cost_duration', 'cost_api_duration',
  'git_branch', 'git_staged_count', 'git_modified_count', 'git_remote_link',
];

function commandFor(os: EmitOs, fmt: EmitFmt): string {
  if (os === 'win') {
    if (fmt === 'sh') return '~/.claude/statusline.sh';
    if (fmt === 'ps') return 'powershell -NoProfile -File C:/Users/<you>/.claude/statusline.ps1';
    if (fmt === 'py') return 'python C:/Users/<you>/.claude/statusline.py';
    if (fmt === 'js') return 'node C:/Users/<you>/.claude/statusline.js';
  }
  if (fmt === 'sh') return '~/.claude/statusline.sh';
  if (fmt === 'py') return '~/.claude/statusline.py';
  if (fmt === 'js') return '~/.claude/statusline.js';
  throw new Error(`Unsupported os/format: ${os}/${fmt}`);
}

export function emitSettings(input: EmitSettingsInput, opts: ResolvedOptions): string {
  const obj: Record<string, unknown> = {
    type: 'command',
    command: commandFor(input.os, input.format),
  };
  if (opts.global.padding > 0) obj.padding = opts.global.padding;

  let refresh = opts.global.refreshInterval;
  if (refresh === null && input.selected.some((id) => TIME_TRIGGERS.includes(id))) {
    refresh = 5;
  }
  if (refresh !== null) obj.refreshInterval = refresh;
  if (opts.global.hideVimModeIndicator) obj.hideVimModeIndicator = true;

  return JSON.stringify({ statusLine: obj }, null, 2);
}
