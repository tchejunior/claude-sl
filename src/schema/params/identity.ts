import type { ParamDef, ResolvedOptions } from '../types';
import { RJ } from '../../codegen/renderJs';
import { RPY } from '../../codegen/renderPy';
import { RSH } from '../../codegen/renderSh';
import { RPS } from '../../codegen/renderPs';
import { stubFragment } from '../stubRender';

function rw(key: string, id: string): import('../types').ParamDef['render'] {
  return {
    js: RJ[key] ?? (() => stubFragment(id)),
    py: RPY[key] ?? (() => stubFragment(id)),
    sh: RSH[key] ?? (() => stubFragment(id)),
    ps: RPS[key] ?? (() => stubFragment(id)),
  };
}

const w = (n: number) => () => n;
const EMOJI_EXTRA = 3;
const wE = (n: number) => (opts: ResolvedOptions) => n + (opts.global.useEmojis ? EMOJI_EXTRA : 0);
const wTruncate = (defaultMax: number) => (opts: ResolvedOptions) =>
  (opts.sub.truncate?.maxChars ?? defaultMax) + 2;

export const IDENTITY_PARAMS: ParamDef[] = [
  { id: 'model_display', label: 'Model display name', group: 'identity',
    jsonPath: 'model.display_name', estimateWidth: w(10), render: rw('modelDisplay', 'model_display') },
  { id: 'model_id', label: 'Model id', group: 'identity',
    jsonPath: 'model.id', estimateWidth: w(20), render: rw('modelId', 'model_id') },
  { id: 'version', label: 'Claude Code version', group: 'identity',
    jsonPath: 'version', estimateWidth: w(8), render: rw('version', 'version') },
  { id: 'output_style', label: 'Output style', group: 'identity',
    jsonPath: 'output_style.name', estimateWidth: w(12), render: rw('outputStyle', 'output_style') },
  { id: 'effort', label: 'Reasoning effort', group: 'identity',
    jsonPath: 'effort.level', estimateWidth: w(8), render: rw('effort', 'effort') },
  { id: 'thinking', label: 'Thinking enabled', group: 'identity', emoji: '💭',
    jsonPath: 'thinking.enabled', estimateWidth: wE(10), render: rw('thinking', 'thinking') },
  { id: 'vim', label: 'Vim mode', group: 'identity',
    jsonPath: 'vim.mode', estimateWidth: w(11), render: rw('vim', 'vim') },
  { id: 'agent', label: 'Agent name', group: 'identity', emoji: '🤖',
    jsonPath: 'agent.name', estimateWidth: wE(20), render: rw('agent', 'agent') },
  { id: 'session_name', label: 'Session name', group: 'identity',
    jsonPath: 'session_name',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 24, basenameOnly: false }],
    estimateWidth: wTruncate(24), render: rw('sessionName', 'session_name') },
];
