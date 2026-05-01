import type { ParamDef } from '../types';
import { stubRender } from '../stubRender';

const w = (n: number) => () => n;

export const GIT_PARAMS: ParamDef[] = [
  { id: 'git_branch', label: 'Git branch', group: 'git', emoji: '🌿',
    estimateWidth: w(22), render: stubRender('git_branch') },
  { id: 'git_staged_count', label: 'Git staged count', group: 'git',
    subOptions: [{ kind: 'colorize', defaultThresholds: [1, 1] }],
    estimateWidth: w(4), render: stubRender('git_staged_count') },
  { id: 'git_modified_count', label: 'Git modified count', group: 'git',
    subOptions: [{ kind: 'colorize', defaultThresholds: [1, 1] }],
    estimateWidth: w(4), render: stubRender('git_modified_count') },
  { id: 'git_remote_link', label: 'Git remote (clickable)', group: 'git', emoji: '🔗',
    estimateWidth: w(24), render: stubRender('git_remote_link') },
];
