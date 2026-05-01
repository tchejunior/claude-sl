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

export const GIT_PARAMS: ParamDef[] = [
  { id: 'git_branch', label: 'Git branch', group: 'git', emoji: '🌿',
    estimateWidth: w(22), render: rw(RJ.gitBranch, 'git_branch') },
  { id: 'git_staged_count', label: 'Git staged count', group: 'git',
    subOptions: [{ kind: 'colorize', defaultThresholds: [1, 1] }],
    estimateWidth: w(4), render: rw(RJ.gitStagedCount, 'git_staged_count') },
  { id: 'git_modified_count', label: 'Git modified count', group: 'git',
    subOptions: [{ kind: 'colorize', defaultThresholds: [1, 1] }],
    estimateWidth: w(4), render: rw(RJ.gitModifiedCount, 'git_modified_count') },
  { id: 'git_remote_link', label: 'Git remote (clickable)', group: 'git', emoji: '🔗',
    estimateWidth: w(24), render: rw(RJ.gitRemoteLink, 'git_remote_link') },
];
