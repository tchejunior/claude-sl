import type { RenderFn, CodeFragment } from '../schema/types';

function f(helpers: string[], expr: string, extract?: string): CodeFragment {
  return { helpers, expr, extract };
}

export const RPS: Record<string, RenderFn> = {
  modelDisplay: () => f([], '$MODEL_DISPLAY', '$MODEL_DISPLAY=if($d.model.display_name){$d.model.display_name}else{"?"}'),
  modelId: () => f([], '$MODEL_ID', '$MODEL_ID=if($d.model.id){$d.model.id}else{"?"}'),
  version: () => f([], '$SL_VERSION', '$SL_VERSION=if($d.version){$d.version}else{"?"}'),
  outputStyle: () => f([], '$OUTPUT_STYLE', '$OUTPUT_STYLE=if($d.output_style.name){$d.output_style.name}else{"default"}'),
  effort: () => f([], '$EFFORT', '$EFFORT=if($d.effort.level){$d.effort.level}else{"?"}'),
  thinking: () => f([], '$THINKING', '$THINKING=if($d.thinking.enabled){"thinking:on"}else{""}'),
  vim: (opts) => opts.global.hideVimModeIndicator
    ? f([], '""')
    : f([], '$VIM_MODE', '$VIM_MODE=if($d.vim.mode){$d.vim.mode}else{""}'),
  agent: () => f([], '$AGENT_NAME', '$AGENT_NAME=if($d.agent.name){$d.agent.name}else{""}'),
  sessionName: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 24;
    return f(
      ['__truncatePath'],
      `(__TruncatePath $SESSION_NAME ${max} $false)`,
      `$SESSION_NAME=if($d.session_name){$d.session_name}else{""}`,
    );
  },

  cwd: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 40;
    const base = opts.sub.truncate?.basenameOnly ?? true;
    return f(
      ['__truncatePath'],
      `(__TruncatePath $CWD_RAW ${max} $${base})`,
      `$CWD_RAW=if($d.workspace.current_dir){$d.workspace.current_dir}elseif($d.cwd){$d.cwd}else{""}`,
    );
  },
  workspaceProject: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 40;
    const base = opts.sub.truncate?.basenameOnly ?? true;
    return f(
      ['__truncatePath'],
      `(__TruncatePath $WS_PROJECT ${max} $${base})`,
      `$WS_PROJECT=if($d.workspace.project_dir){$d.workspace.project_dir}else{""}`,
    );
  },
  workspaceAddedCount: () => f([], '$WS_ADDED_COUNT', '$WS_ADDED_CNT=if($d.workspace.added_dirs){$d.workspace.added_dirs.Count}else{0}; $WS_ADDED_COUNT=if($WS_ADDED_CNT -gt 0){$WS_ADDED_CNT}else{""}'),
  workspaceGitWorktree: () => f([], '$WS_GIT_WT', '$WS_GIT_WT=if($d.workspace.git_worktree){$d.workspace.git_worktree}else{""}'),
  worktreeName: () => f([], '$WT_NAME', '$WT_NAME=if($d.worktree.name){$d.worktree.name}else{""}'),
  worktreeBranch: () => f([], '$WT_BRANCH', '$WT_BRANCH=if($d.worktree.branch){$d.worktree.branch}else{""}'),
  worktreeOriginalBranch: () => f([], '$WT_ORIG_BRANCH', '$WT_ORIG_BRANCH=if($d.worktree.original_branch){$d.worktree.original_branch}else{""}'),

  gitBranch: (opts) => f(
    opts.global.cacheGit ? ['__git', '__cacheGit'] : ['__git'],
    '$GIT_BRANCH',
    '$_GIT=__RunGit(); $GIT_BRANCH=$_GIT[0]; $GIT_STAGED=[int]$_GIT[1]; $GIT_MODIFIED=[int]$_GIT[2]; $GIT_REMOTE=$_GIT[3]',
  ),
  gitStagedCount: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [1, 1];
    return f(
      opts.global.cacheGit ? ['ANSI_COLORS', '__git', '__cacheGit'] : ['ANSI_COLORS', '__git'],
      `(if($GIT_STAGED -gt 0){if($GIT_STAGED -ge ${ra}){$R}elseif($GIT_STAGED -ge ${wa}){$Y}else{$G};"S:$GIT_STAGED$X"}else{""})`,
      '$_GIT=__RunGit(); $GIT_BRANCH=$_GIT[0]; $GIT_STAGED=[int]$_GIT[1]; $GIT_MODIFIED=[int]$_GIT[2]; $GIT_REMOTE=$_GIT[3]',
    );
  },
  gitModifiedCount: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [1, 1];
    return f(
      opts.global.cacheGit ? ['ANSI_COLORS', '__git', '__cacheGit'] : ['ANSI_COLORS', '__git'],
      `(if($GIT_MODIFIED -gt 0){if($GIT_MODIFIED -ge ${ra}){$R}elseif($GIT_MODIFIED -ge ${wa}){$Y}else{$G};"M:$GIT_MODIFIED$X"}else{""})`,
      '$_GIT=__RunGit(); $GIT_BRANCH=$_GIT[0]; $GIT_STAGED=[int]$_GIT[1]; $GIT_MODIFIED=[int]$_GIT[2]; $GIT_REMOTE=$_GIT[3]',
    );
  },
  gitRemoteLink: (opts) => f(
    opts.global.cacheGit ? ['__git', '__cacheGit'] : ['__git'],
    '(if($GIT_REMOTE){"$ESC]8;;$GIT_REMOTE$([char]7)🔗$ESC]8;;$([char]7)"}else{""})',
    '$_GIT=__RunGit(); $GIT_BRANCH=$_GIT[0]; $GIT_STAGED=[int]$_GIT[1]; $GIT_MODIFIED=[int]$_GIT[2]; $GIT_REMOTE=$_GIT[3]',
  ),

  ctxUsedPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(
      ['ANSI_COLORS'],
      `(& { $p=[int]($d.context_window.used_percentage ?? 0); if($p -ge ${ra}){$R}elseif($p -ge ${wa}){$Y}else{$G}; "$p%$X" })`,
      '$CTX_USED=[int]($d.context_window.used_percentage ?? 0)',
    );
  },
  ctxRemainingPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(
      ['ANSI_COLORS'],
      `(& { $r=[int]($d.context_window.remaining_percentage ?? 100); $u=100-$r; if($u -ge ${ra}){$R}elseif($u -ge ${wa}){$Y}else{$G}; "$r% left$X" })`,
      '$CTX_REM=[int]($d.context_window.remaining_percentage ?? 100)',
    );
  },
  ctxTotalTokens: () => f([], '"$(($d.context_window.total_input_tokens ?? 0)+($d.context_window.total_output_tokens ?? 0))tok"'),
  ctxWindowSize: () => f([], '"$([int](($d.context_window.context_window_size ?? 0)/1000))k ctx"'),
  ctxBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS', '__bar'], `(__Bar ([int]($d.context_window.used_percentage ?? 0)) ${w} ${wa} ${ra})`);
  },
  ctxCurrentInput: () => f([], '"$(($d.context_window.current_usage.input_tokens ?? 0))in"'),
  ctxCacheRead: () => f([], '"$(($d.context_window.current_usage.cache_read_input_tokens ?? 0))cr"'),
  ctxCacheCreation: () => f([], '"$(($d.context_window.current_usage.cache_creation_input_tokens ?? 0))cw"'),
  exceeds200k: () => f([], '(if($d.exceeds_200k_tokens){"!200k"}else{""})'),

  costTotalUsd: () => f([], '"$" + ("{0:F4}" -f ($d.cost.total_cost_usd ?? 0))'),
  costDuration: () => f(['__duration'], '(__Duration ($d.cost.total_duration_ms ?? 0))'),
  costApiDuration: () => f(['__duration'], '(__Duration ($d.cost.total_api_duration_ms ?? 0))'),
  costLines: () => f([], '"+$($d.cost.total_lines_added ?? 0) -$($d.cost.total_lines_removed ?? 0)"'),

  rate5hPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS'], `(& { $p=[int]($d.rate_limits.five_hour.used_percentage ?? 0); if($p -ge ${ra}){$R}elseif($p -ge ${wa}){$Y}else{$G}; "5h:$p%$X" })`);
  },
  rate5hBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS', '__bar'], `(__Bar ([int]($d.rate_limits.five_hour.used_percentage ?? 0)) ${w} ${wa} ${ra})`);
  },
  rate5hResets: (opts) => {
    const fmt = opts.sub.timestamp?.format ?? 'until';
    return f(['__resetTime'], `(__ResetTime ($d.rate_limits.five_hour.resets_at ?? 0) ${JSON.stringify(fmt)})`);
  },
  rate7dPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS'], `(& { $p=[int]($d.rate_limits.seven_day.used_percentage ?? 0); if($p -ge ${ra}){$R}elseif($p -ge ${wa}){$Y}else{$G}; "7d:$p%$X" })`);
  },
  rate7dBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS', '__bar'], `(__Bar ([int]($d.rate_limits.seven_day.used_percentage ?? 0)) ${w} ${wa} ${ra})`);
  },
  rate7dResets: (opts) => {
    const fmt = opts.sub.timestamp?.format ?? 'until';
    return f(['__resetTime'], `(__ResetTime ($d.rate_limits.seven_day.resets_at ?? 0) ${JSON.stringify(fmt)})`);
  },

  sessionId: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 8;
    return f([], `(if($d.session_id){$d.session_id.Substring(0,[Math]::Min(${max},$d.session_id.Length))}else{""})`);
  },
  transcriptPath: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 30;
    const base = opts.sub.truncate?.basenameOnly ?? true;
    return f(['__truncatePath'], `(__TruncatePath ($d.transcript_path ?? "") ${max} $${base})`);
  },
};
