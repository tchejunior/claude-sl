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
const wBar = (defaultBarWidth: number) => (opts: ResolvedOptions) =>
  (opts.sub.bar?.width ?? defaultBarWidth) + 6;

export const CONTEXT_PARAMS: ParamDef[] = [
  { id: 'ctx_used_pct', label: 'Context used %', group: 'context', emoji: '🧠',
    jsonPath: 'context_window.used_percentage', estimateWidth: w(8),
    render: rw('ctxUsedPct', 'ctx_used_pct') },
  { id: 'ctx_remaining_pct', label: 'Context remaining %', group: 'context', emoji: '🧠',
    jsonPath: 'context_window.remaining_percentage', estimateWidth: w(8),
    render: rw('ctxRemainingPct', 'ctx_remaining_pct') },
  { id: 'ctx_total_tokens', label: 'Total tokens (in+out)', group: 'context', emoji: '🧠',
    estimateWidth: w(10), render: rw('ctxTotalTokens', 'ctx_total_tokens') },
  { id: 'ctx_window_size', label: 'Context window size', group: 'context',
    estimateWidth: w(8), render: rw('ctxWindowSize', 'ctx_window_size') },
  { id: 'ctx_bar', label: 'Context usage bar', group: 'context', emoji: '🧠',
    subOptions: [{ kind: 'bar', defaultWidth: 10 },
                 { kind: 'colorize', defaultThresholds: [75, 90] }],
    estimateWidth: wBar(10), render: rw('ctxBar', 'ctx_bar') },
  { id: 'ctx_current_input', label: 'Current input tokens', group: 'context',
    jsonPath: 'context_window.current_usage.input_tokens', estimateWidth: w(8),
    render: rw('ctxCurrentInput', 'ctx_current_input') },
  { id: 'ctx_cache_read', label: 'Cache read tokens', group: 'context',
    jsonPath: 'context_window.current_usage.cache_read_input_tokens', estimateWidth: w(8),
    render: rw('ctxCacheRead', 'ctx_cache_read') },
  { id: 'ctx_cache_creation', label: 'Cache creation tokens', group: 'context',
    jsonPath: 'context_window.current_usage.cache_creation_input_tokens', estimateWidth: w(8),
    render: rw('ctxCacheCreation', 'ctx_cache_creation') },
  { id: 'exceeds_200k', label: 'Exceeds 200k tokens flag', group: 'context',
    jsonPath: 'exceeds_200k_tokens', estimateWidth: w(6),
    render: rw('exceeds200k', 'exceeds_200k') },
];
