import type { ParamDef, ResolvedOptions } from '../types';
import { stubRender } from '../stubRender';

const w = (n: number) => () => n;
const wTruncate = (defaultMax: number) => (opts: ResolvedOptions) =>
  (opts.sub.truncate?.maxChars ?? defaultMax) + 2;

export const WORKSPACE_PARAMS: ParamDef[] = [
  { id: 'cwd', label: 'Current directory', group: 'workspace', emoji: '📁',
    jsonPath: 'workspace.current_dir',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 40, basenameOnly: true }],
    estimateWidth: wTruncate(40), render: stubRender('cwd') },
  { id: 'workspace_project', label: 'Project directory', group: 'workspace', emoji: '📁',
    jsonPath: 'workspace.project_dir',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 40, basenameOnly: true }],
    estimateWidth: wTruncate(40), render: stubRender('workspace_project') },
  { id: 'workspace_added_count', label: 'Added dirs count', group: 'workspace',
    jsonPath: 'workspace.added_dirs', estimateWidth: w(6),
    render: stubRender('workspace_added_count') },
  { id: 'workspace_git_worktree', label: 'Git worktree (workspace)', group: 'workspace',
    jsonPath: 'workspace.git_worktree', estimateWidth: w(20),
    render: stubRender('workspace_git_worktree') },
  { id: 'worktree_name', label: 'Worktree name', group: 'workspace',
    jsonPath: 'worktree.name', estimateWidth: w(20), render: stubRender('worktree_name') },
  { id: 'worktree_branch', label: 'Worktree branch', group: 'workspace', emoji: '🌿',
    jsonPath: 'worktree.branch', estimateWidth: w(22), render: stubRender('worktree_branch') },
  { id: 'worktree_original_branch', label: 'Worktree original branch',
    group: 'workspace', emoji: '🌿',
    jsonPath: 'worktree.original_branch', estimateWidth: w(22),
    render: stubRender('worktree_original_branch') },
];
