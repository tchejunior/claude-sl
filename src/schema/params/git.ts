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

export const GIT_PARAMS: ParamDef[] = [
  { id: 'git_branch', label: 'Git branch', group: 'git', emoji: '🌿',
    estimateWidth: wE(22), render: rw('gitBranch', 'git_branch') },
  { id: 'git_staged_count', label: 'Git staged count', group: 'git',
    subOptions: [{ kind: 'colorize', defaultThresholds: [1, 1] }],
    estimateWidth: w(4), render: rw('gitStagedCount', 'git_staged_count') },
  { id: 'git_modified_count', label: 'Git modified count', group: 'git',
    subOptions: [{ kind: 'colorize', defaultThresholds: [1, 1] }],
    estimateWidth: w(4), render: rw('gitModifiedCount', 'git_modified_count') },
  { id: 'git_remote_link', label: 'Git remote (clickable)', group: 'git',
    estimateWidth: w(24), render: rw('gitRemoteLink', 'git_remote_link') },
];
