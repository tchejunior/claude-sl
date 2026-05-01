import type { ParamDef, ResolvedOptions, CodeFragment } from '../types';
import { RJ } from '../../codegen/renderJs';
import { stubFragment } from '../stubRender';

function rw(jsFn: (o: ResolvedOptions) => CodeFragment, id: string): import('../types').ParamDef['render'] {
  return {
    js: jsFn,
    py: () => stubFragment(id),
    ps: () => stubFragment(id),
    sh: () => stubFragment(id),
  };
}

const w = (n: number) => () => n;
const wTruncate = (defaultMax: number) => (opts: ResolvedOptions) =>
  (opts.sub.truncate?.maxChars ?? defaultMax) + 2;

export const IDENTITY_PARAMS: ParamDef[] = [
  { id: 'model_display', label: 'Model display name', group: 'identity',
    jsonPath: 'model.display_name', estimateWidth: w(10), render: rw(RJ.modelDisplay, 'model_display') },
  { id: 'model_id', label: 'Model id', group: 'identity',
    jsonPath: 'model.id', estimateWidth: w(20), render: rw(RJ.modelId, 'model_id') },
  { id: 'version', label: 'Claude Code version', group: 'identity',
    jsonPath: 'version', estimateWidth: w(8), render: rw(RJ.version, 'version') },
  { id: 'output_style', label: 'Output style', group: 'identity',
    jsonPath: 'output_style.name', estimateWidth: w(12), render: rw(RJ.outputStyle, 'output_style') },
  { id: 'effort', label: 'Reasoning effort', group: 'identity',
    jsonPath: 'effort.level', estimateWidth: w(8), render: rw(RJ.effort, 'effort') },
  { id: 'thinking', label: 'Thinking enabled', group: 'identity', emoji: '💭',
    jsonPath: 'thinking.enabled', estimateWidth: w(10), render: rw(RJ.thinking, 'thinking') },
  { id: 'vim', label: 'Vim mode', group: 'identity',
    jsonPath: 'vim.mode', estimateWidth: w(11), render: rw(RJ.vim, 'vim') },
  { id: 'agent', label: 'Agent name', group: 'identity', emoji: '🤖',
    jsonPath: 'agent.name', estimateWidth: w(20), render: rw(RJ.agent, 'agent') },
  { id: 'session_name', label: 'Session name', group: 'identity',
    jsonPath: 'session_name',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 24, basenameOnly: false }],
    estimateWidth: wTruncate(24), render: rw(RJ.sessionName, 'session_name') },
];
