import type { ParamDef } from '../types';
import { stubRender } from '../stubRender';

const w = (n: number) => () => n;

export const COST_PARAMS: ParamDef[] = [
  { id: 'cost_total_usd', label: 'Total cost (USD)', group: 'cost', emoji: '💰',
    jsonPath: 'cost.total_cost_usd', estimateWidth: w(8),
    render: stubRender('cost_total_usd') },
  { id: 'cost_duration', label: 'Total duration', group: 'cost', emoji: '⏱️',
    jsonPath: 'cost.total_duration_ms', estimateWidth: w(8),
    render: stubRender('cost_duration') },
  { id: 'cost_api_duration', label: 'API duration', group: 'cost', emoji: '⏱️',
    jsonPath: 'cost.total_api_duration_ms', estimateWidth: w(8),
    render: stubRender('cost_api_duration') },
  { id: 'cost_lines', label: 'Lines added/removed', group: 'cost', emoji: '📝',
    estimateWidth: w(12), render: stubRender('cost_lines') },
];
