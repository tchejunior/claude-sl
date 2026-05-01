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

export const COST_PARAMS: ParamDef[] = [
  { id: 'cost_total_usd', label: 'Total cost (USD)', group: 'cost', emoji: '💰',
    jsonPath: 'cost.total_cost_usd', estimateWidth: w(8),
    render: rw(RJ.costTotalUsd, 'cost_total_usd') },
  { id: 'cost_duration', label: 'Total duration', group: 'cost', emoji: '⏱️',
    jsonPath: 'cost.total_duration_ms', estimateWidth: w(8),
    render: rw(RJ.costDuration, 'cost_duration') },
  { id: 'cost_api_duration', label: 'API duration', group: 'cost', emoji: '⏱️',
    jsonPath: 'cost.total_api_duration_ms', estimateWidth: w(8),
    render: rw(RJ.costApiDuration, 'cost_api_duration') },
  { id: 'cost_lines', label: 'Lines added/removed', group: 'cost', emoji: '📝',
    estimateWidth: w(12), render: rw(RJ.costLines, 'cost_lines') },
];
