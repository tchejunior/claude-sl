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
const wTruncateE = (defaultMax: number) => (opts: ResolvedOptions) =>
  (opts.sub.truncate?.maxChars ?? defaultMax) + 2 + (opts.global.useEmojis ? EMOJI_EXTRA : 0);

export const WORKSPACE_PARAMS: ParamDef[] = [
  { id: 'cwd', label: 'Current directory', group: 'workspace', emoji: '📁',
    jsonPath: 'workspace.current_dir',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 40, basenameOnly: true }],
    estimateWidth: wTruncateE(40), render: rw('cwd', 'cwd') },
  { id: 'workspace_project', label: 'Project directory', group: 'workspace', emoji: '📁',
    jsonPath: 'workspace.project_dir',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 40, basenameOnly: true }],
    estimateWidth: wTruncateE(40), render: rw('workspaceProject', 'workspace_project') },
  { id: 'workspace_added_count', label: 'Added dirs count', group: 'workspace',
    jsonPath: 'workspace.added_dirs', estimateWidth: w(6),
    render: rw('workspaceAddedCount', 'workspace_added_count') },
  { id: 'workspace_git_worktree', label: 'Git worktree (workspace)', group: 'workspace',
    jsonPath: 'workspace.git_worktree', estimateWidth: w(20),
    render: rw('workspaceGitWorktree', 'workspace_git_worktree') },
  { id: 'worktree_name', label: 'Worktree name', group: 'workspace',
    jsonPath: 'worktree.name', estimateWidth: w(20), render: rw('worktreeName', 'worktree_name') },
  { id: 'worktree_branch', label: 'Worktree branch', group: 'workspace', emoji: '🌿',
    jsonPath: 'worktree.branch', estimateWidth: wE(22), render: rw('worktreeBranch', 'worktree_branch') },
  { id: 'worktree_original_branch', label: 'Worktree original branch',
    group: 'workspace', emoji: '🌿',
    jsonPath: 'worktree.original_branch', estimateWidth: wE(22),
    render: rw('worktreeOriginalBranch', 'worktree_original_branch') },
];
