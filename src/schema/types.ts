export type Lang = 'js' | 'py' | 'ps' | 'sh';

export type ParamGroup =
  | 'identity' | 'workspace' | 'git' | 'context' | 'cost' | 'rate_limits' | 'misc';

export type ParamId =
  // identity
  | 'model_display' | 'model_id' | 'version' | 'output_style' | 'effort'
  | 'thinking' | 'vim' | 'agent' | 'session_name'
  // workspace
  | 'cwd' | 'workspace_project' | 'workspace_added_count' | 'workspace_git_worktree'
  | 'worktree_name' | 'worktree_branch' | 'worktree_original_branch'
  // git
  | 'git_branch' | 'git_staged_count' | 'git_modified_count' | 'git_remote_link'
  // context
  | 'ctx_used_pct' | 'ctx_remaining_pct' | 'ctx_total_tokens' | 'ctx_window_size'
  | 'ctx_bar' | 'ctx_current_input' | 'ctx_cache_read' | 'ctx_cache_creation'
  | 'exceeds_200k'
  // cost
  | 'cost_total_usd' | 'cost_duration' | 'cost_api_duration' | 'cost_lines'
  // rate_limits
  | 'rate_5h_pct' | 'rate_5h_bar' | 'rate_5h_resets'
  | 'rate_7d_pct' | 'rate_7d_bar' | 'rate_7d_resets'
  // misc
  | 'session_id' | 'transcript_path';

export type TimestampFormat = 'until' | 'YYYY-MM-DD' | 'DD/MM/YY' | 'HH:mm';

export type SubOptionDef =
  | { kind: 'bar'; defaultWidth: number }
  | { kind: 'timestamp'; default: TimestampFormat }
  | { kind: 'truncate'; defaultMaxChars: number; basenameOnly: boolean }
  | { kind: 'colorize'; defaultThresholds: [number, number] };

export interface ResolvedSubOptions {
  bar?: { width: number };
  timestamp?: { format: TimestampFormat };
  truncate?: { maxChars: number; basenameOnly: boolean };
  colorize?: { thresholds: [number, number] };
}

export interface GlobalOptions {
  lineLength: number;
  separator: string;
  useEmojis: boolean;
  hardLimit: boolean;
  tolerancePct: number;
  padding: number;
  refreshInterval: number | null;
  hideVimModeIndicator: boolean;
  cacheGit: boolean;
  cacheStalenessSec: number;
}

export interface ResolvedOptions {
  global: GlobalOptions;
  sub: ResolvedSubOptions;
}

export interface CodeFragment {
  helpers: string[];
  expr: string;
  extract?: string;
}

export type RenderFn = (opts: ResolvedOptions) => CodeFragment;

export interface ParamDef {
  id: ParamId;
  label: string;
  group: ParamGroup;
  emoji?: string;
  jsonPath?: string;
  subOptions?: SubOptionDef[];
  estimateWidth(opts: ResolvedOptions): number;
  render: Record<Lang, RenderFn>;
}
