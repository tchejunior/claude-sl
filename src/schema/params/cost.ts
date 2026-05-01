import type { ParamDef } from '../types';
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

export const COST_PARAMS: ParamDef[] = [
  { id: 'cost_total_usd', label: 'Total cost (USD)', group: 'cost', emoji: '💰',
    jsonPath: 'cost.total_cost_usd', estimateWidth: w(8),
    render: rw('costTotalUsd', 'cost_total_usd') },
  { id: 'cost_duration', label: 'Total duration', group: 'cost', emoji: '⏱️',
    jsonPath: 'cost.total_duration_ms', estimateWidth: w(8),
    render: rw('costDuration', 'cost_duration') },
  { id: 'cost_api_duration', label: 'API duration', group: 'cost', emoji: '⏱️',
    jsonPath: 'cost.total_api_duration_ms', estimateWidth: w(8),
    render: rw('costApiDuration', 'cost_api_duration') },
  { id: 'cost_lines', label: 'Lines added/removed', group: 'cost', emoji: '📝',
    estimateWidth: w(12), render: rw('costLines', 'cost_lines') },
];
