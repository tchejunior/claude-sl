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
const wBar = (defaultBarWidth: number) => (opts: ResolvedOptions) =>
  (opts.sub.bar?.width ?? defaultBarWidth) + 16;

export const RATE_LIMITS_PARAMS: ParamDef[] = [
  { id: 'rate_5h_pct', label: '5h limit %', group: 'rate_limits',
    jsonPath: 'rate_limits.five_hour.used_percentage',
    estimateWidth: w(8), render: rw('rate5hPct', 'rate_5h_pct') },
  { id: 'rate_5h_bar', label: '5h limit bar', group: 'rate_limits',
    subOptions: [{ kind: 'bar', defaultWidth: 10 },
                 { kind: 'colorize', defaultThresholds: [75, 90] }],
    estimateWidth: wBar(10), render: rw('rate5hBar', 'rate_5h_bar') },
  { id: 'rate_5h_resets', label: '5h reset time', group: 'rate_limits', emoji: '⏱️',
    subOptions: [{ kind: 'timestamp', default: 'until' }],
    jsonPath: 'rate_limits.five_hour.resets_at',
    estimateWidth: wE(12), render: rw('rate5hResets', 'rate_5h_resets') },
  { id: 'rate_7d_pct', label: '7d limit %', group: 'rate_limits',
    jsonPath: 'rate_limits.seven_day.used_percentage',
    estimateWidth: w(8), render: rw('rate7dPct', 'rate_7d_pct') },
  { id: 'rate_7d_bar', label: '7d limit bar', group: 'rate_limits',
    subOptions: [{ kind: 'bar', defaultWidth: 10 },
                 { kind: 'colorize', defaultThresholds: [75, 90] }],
    estimateWidth: wBar(10), render: rw('rate7dBar', 'rate_7d_bar') },
  { id: 'rate_7d_resets', label: '7d reset time', group: 'rate_limits', emoji: '⏱️',
    subOptions: [{ kind: 'timestamp', default: 'until' }],
    jsonPath: 'rate_limits.seven_day.resets_at',
    estimateWidth: wE(12), render: rw('rate7dResets', 'rate_7d_resets') },
];
