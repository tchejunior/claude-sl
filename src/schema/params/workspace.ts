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
const wTruncate = (defaultMax: number) => (opts: ResolvedOptions) =>
  (opts.sub.truncate?.maxChars ?? defaultMax) + 2;

export const WORKSPACE_PARAMS: ParamDef[] = [
  { id: 'cwd', label: 'Current directory', group: 'workspace', emoji: '📁',
    jsonPath: 'workspace.current_dir',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 40, basenameOnly: true }],
    estimateWidth: wTruncate(40), render: rw(RJ.cwd, 'cwd') },
  { id: 'workspace_project', label: 'Project directory', group: 'workspace', emoji: '📁',
    jsonPath: 'workspace.project_dir',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 40, basenameOnly: true }],
    estimateWidth: wTruncate(40), render: rw(RJ.workspaceProject, 'workspace_project') },
  { id: 'workspace_added_count', label: 'Added dirs count', group: 'workspace',
    jsonPath: 'workspace.added_dirs', estimateWidth: w(6),
    render: rw(RJ.workspaceAddedCount, 'workspace_added_count') },
  { id: 'workspace_git_worktree', label: 'Git worktree (workspace)', group: 'workspace',
    jsonPath: 'workspace.git_worktree', estimateWidth: w(20),
    render: rw(RJ.workspaceGitWorktree, 'workspace_git_worktree') },
  { id: 'worktree_name', label: 'Worktree name', group: 'workspace',
    jsonPath: 'worktree.name', estimateWidth: w(20), render: rw(RJ.worktreeName, 'worktree_name') },
  { id: 'worktree_branch', label: 'Worktree branch', group: 'workspace', emoji: '🌿',
    jsonPath: 'worktree.branch', estimateWidth: w(22), render: rw(RJ.worktreeBranch, 'worktree_branch') },
  { id: 'worktree_original_branch', label: 'Worktree original branch',
    group: 'workspace', emoji: '🌿',
    jsonPath: 'worktree.original_branch', estimateWidth: w(22),
    render: rw(RJ.worktreeOriginalBranch, 'worktree_original_branch') },
];
