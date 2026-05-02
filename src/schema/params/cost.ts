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

const EMOJI_EXTRA = 3;
const wE = (n: number) => (opts: ResolvedOptions) => n + (opts.global.useEmojis ? EMOJI_EXTRA : 0);

export const COST_PARAMS: ParamDef[] = [
  { id: 'cost_total_usd', label: 'Total cost (USD)', group: 'cost', emoji: '💰',
    jsonPath: 'cost.total_cost_usd', estimateWidth: wE(8),
    render: rw('costTotalUsd', 'cost_total_usd') },
  { id: 'cost_duration', label: 'Total duration', group: 'cost', emoji: '⏱️',
    jsonPath: 'cost.total_duration_ms', estimateWidth: wE(8),
    render: rw('costDuration', 'cost_duration') },
  { id: 'cost_api_duration', label: 'API duration', group: 'cost', emoji: '⏱️',
    jsonPath: 'cost.total_api_duration_ms', estimateWidth: wE(8),
    render: rw('costApiDuration', 'cost_api_duration') },
  { id: 'cost_lines', label: 'Lines added/removed', group: 'cost', emoji: '📝',
    estimateWidth: wE(12), render: rw('costLines', 'cost_lines') },
];
