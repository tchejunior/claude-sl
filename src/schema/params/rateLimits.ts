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
const wBar = (defaultBarWidth: number) => (opts: ResolvedOptions) =>
  (opts.sub.bar?.width ?? defaultBarWidth) + 16;

export const RATE_LIMITS_PARAMS: ParamDef[] = [
  { id: 'rate_5h_pct', label: '5h limit %', group: 'rate_limits',
    jsonPath: 'rate_limits.five_hour.used_percentage',
    estimateWidth: w(8), render: rw(RJ.rate5hPct, 'rate_5h_pct') },
  { id: 'rate_5h_bar', label: '5h limit bar', group: 'rate_limits',
    subOptions: [{ kind: 'bar', defaultWidth: 10 },
                 { kind: 'colorize', defaultThresholds: [75, 90] }],
    estimateWidth: wBar(10), render: rw(RJ.rate5hBar, 'rate_5h_bar') },
  { id: 'rate_5h_resets', label: '5h reset time', group: 'rate_limits', emoji: '⏱️',
    subOptions: [{ kind: 'timestamp', default: 'until' }],
    jsonPath: 'rate_limits.five_hour.resets_at',
    estimateWidth: w(12), render: rw(RJ.rate5hResets, 'rate_5h_resets') },
  { id: 'rate_7d_pct', label: '7d limit %', group: 'rate_limits',
    jsonPath: 'rate_limits.seven_day.used_percentage',
    estimateWidth: w(8), render: rw(RJ.rate7dPct, 'rate_7d_pct') },
  { id: 'rate_7d_bar', label: '7d limit bar', group: 'rate_limits',
    subOptions: [{ kind: 'bar', defaultWidth: 10 },
                 { kind: 'colorize', defaultThresholds: [75, 90] }],
    estimateWidth: wBar(10), render: rw(RJ.rate7dBar, 'rate_7d_bar') },
  { id: 'rate_7d_resets', label: '7d reset time', group: 'rate_limits', emoji: '⏱️',
    subOptions: [{ kind: 'timestamp', default: 'until' }],
    jsonPath: 'rate_limits.seven_day.resets_at',
    estimateWidth: w(12), render: rw(RJ.rate7dResets, 'rate_7d_resets') },
];
