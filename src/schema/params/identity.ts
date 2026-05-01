import type { ParamDef, ResolvedOptions } from '../types';
import { stubRender } from '../stubRender';

const w = (n: number) => () => n;
const wTruncate = (defaultMax: number) => (opts: ResolvedOptions) =>
  (opts.sub.truncate?.maxChars ?? defaultMax) + 2;

export const IDENTITY_PARAMS: ParamDef[] = [
  { id: 'model_display', label: 'Model display name', group: 'identity',
    jsonPath: 'model.display_name', estimateWidth: w(10), render: stubRender('model_display') },
  { id: 'model_id', label: 'Model id', group: 'identity',
    jsonPath: 'model.id', estimateWidth: w(20), render: stubRender('model_id') },
  { id: 'version', label: 'Claude Code version', group: 'identity',
    jsonPath: 'version', estimateWidth: w(8), render: stubRender('version') },
  { id: 'output_style', label: 'Output style', group: 'identity',
    jsonPath: 'output_style.name', estimateWidth: w(12), render: stubRender('output_style') },
  { id: 'effort', label: 'Reasoning effort', group: 'identity',
    jsonPath: 'effort.level', estimateWidth: w(8), render: stubRender('effort') },
  { id: 'thinking', label: 'Thinking enabled', group: 'identity', emoji: '💭',
    jsonPath: 'thinking.enabled', estimateWidth: w(10), render: stubRender('thinking') },
  { id: 'vim', label: 'Vim mode', group: 'identity',
    jsonPath: 'vim.mode', estimateWidth: w(11), render: stubRender('vim') },
  { id: 'agent', label: 'Agent name', group: 'identity', emoji: '🤖',
    jsonPath: 'agent.name', estimateWidth: w(20), render: stubRender('agent') },
  { id: 'session_name', label: 'Session name', group: 'identity',
    jsonPath: 'session_name',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 24, basenameOnly: false }],
    estimateWidth: wTruncate(24), render: stubRender('session_name') },
];
