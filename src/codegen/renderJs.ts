import type { RenderFn, CodeFragment } from '../schema/types';

function f(helpers: string[], expr: string): CodeFragment {
  return { helpers, expr };
}

export const RJ: Record<string, RenderFn> = {
  // identity
  modelDisplay: () => f([], "d.model?.display_name??'?'"),
  modelId: () => f([], "d.model?.id??'?'"),
  version: () => f([], "d.version??'?'"),
  outputStyle: () => f([], "d.output_style?.name??'default'"),
  effort: () => f([], "d.effort?.level??'?'"),
  thinking: () => f([], "d.thinking?.enabled?'thinking:on':''"),
  vim: (opts) => f([], opts.global.hideVimModeIndicator ? "''" : "d.vim?.mode??''"),
  agent: () => f([], "d.agent?.name??''"),
  sessionName: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 24;
    return f(['__truncatePath'], `__truncatePath(d.session_name??'',${max},false)`);
  },

  // workspace
  cwd: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 40;
    const base = opts.sub.truncate?.basenameOnly ?? true;
    return f(['__truncatePath'], `__truncatePath(d.workspace?.current_dir??d.cwd??'',${max},${base})`);
  },
  workspaceProject: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 40;
    const base = opts.sub.truncate?.basenameOnly ?? true;
    return f(['__truncatePath'], `__truncatePath(d.workspace?.project_dir??'',${max},${base})`);
  },
  workspaceAddedCount: () => f([], "(d.workspace?.added_dirs??[]).length||''"),
  workspaceGitWorktree: () => f([], "d.workspace?.git_worktree??''"),
  worktreeName: () => f([], "d.worktree?.name??''"),
  worktreeBranch: () => f([], "d.worktree?.branch??''"),
  worktreeOriginalBranch: () => f([], "d.worktree?.original_branch??''"),

  // git (shell-derived — emitter injects __GIT array)
  gitBranch: (opts) => f(
    opts.global.cacheGit ? ['__git', '__cacheGit'] : ['__git'],
    '__GIT[0]'
  ),
  gitStagedCount: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [1, 1];
    return f(
      opts.global.cacheGit ? ['ANSI_COLORS', '__git', '__cacheGit'] : ['ANSI_COLORS', '__git'],
      `(__GIT[1]>0?(__GIT[1]>=${ra}?R:__GIT[1]>=${wa}?Y:G)+'S:'+__GIT[1]+X:'')`
    );
  },
  gitModifiedCount: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [1, 1];
    return f(
      opts.global.cacheGit ? ['ANSI_COLORS', '__git', '__cacheGit'] : ['ANSI_COLORS', '__git'],
      `(__GIT[2]>0?(__GIT[2]>=${ra}?R:__GIT[2]>=${wa}?Y:G)+'M:'+__GIT[2]+X:'')`
    );
  },
  gitRemoteLink: (opts) => f(
    opts.global.cacheGit ? ['__git', '__cacheGit'] : ['__git'],
    "(__GIT[3]?'\\x1b]8;;'+__GIT[3]+'\\x07🔗\\x1b]8;;\\x07':'')"
  ),

  // context
  ctxUsedPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS'], `(()=>{const _p=Math.floor(d.context_window?.used_percentage??0);return(_p>=${ra}?R:_p>=${wa}?Y:G)+_p+'%'+X})()`);
  },
  ctxRemainingPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS'], `(()=>{const _r=Math.floor(d.context_window?.remaining_percentage??100),_u=100-_r;return(_u>=${ra}?R:_u>=${wa}?Y:G)+_r+'% left'+X})()`);
  },
  ctxTotalTokens: () => f([], "((d.context_window?.total_input_tokens??0)+(d.context_window?.total_output_tokens??0)).toLocaleString()+'tok'"),
  ctxWindowSize: () => f([], "((d.context_window?.context_window_size??0)/1000).toFixed(0)+'k ctx'"),
  ctxBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS', '__bar'], `__bar(d.context_window?.used_percentage??0,${w},${wa},${ra})`);
  },
  ctxCurrentInput: () => f([], "(d.context_window?.current_usage?.input_tokens??0).toLocaleString()+'in'"),
  ctxCacheRead: () => f([], "(d.context_window?.current_usage?.cache_read_input_tokens??0).toLocaleString()+'cr'"),
  ctxCacheCreation: () => f([], "(d.context_window?.current_usage?.cache_creation_input_tokens??0).toLocaleString()+'cw'"),
  exceeds200k: () => f([], "d.exceeds_200k_tokens?'!200k':''"),

  // cost
  costTotalUsd: () => f([], "'$'+(d.cost?.total_cost_usd??0).toFixed(4)"),
  costDuration: () => f(['__duration'], "__duration(d.cost?.total_duration_ms??0)"),
  costApiDuration: () => f(['__duration'], "__duration(d.cost?.total_api_duration_ms??0)"),
  costLines: () => f([], "'+' + (d.cost?.total_lines_added??0) + ' -' + (d.cost?.total_lines_removed??0)"),

  // rate limits
  rate5hPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS'], `(()=>{const _p=Math.floor(d.rate_limits?.five_hour?.used_percentage??0);return(_p>=${ra}?R:_p>=${wa}?Y:G)+'5h:'+_p+'%'+X})()`);
  },
  rate5hBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS', '__bar'], `__bar(d.rate_limits?.five_hour?.used_percentage??0,${w},${wa},${ra})`);
  },
  rate5hResets: (opts) => {
    const fmt = opts.sub.timestamp?.format ?? 'until';
    return f(['__resetTime'], `__resetTime(d.rate_limits?.five_hour?.resets_at,${JSON.stringify(fmt)})`);
  },
  rate7dPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS'], `(()=>{const _p=Math.floor(d.rate_limits?.seven_day?.used_percentage??0);return(_p>=${ra}?R:_p>=${wa}?Y:G)+'7d:'+_p+'%'+X})()`);
  },
  rate7dBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS', '__bar'], `__bar(d.rate_limits?.seven_day?.used_percentage??0,${w},${wa},${ra})`);
  },
  rate7dResets: (opts) => {
    const fmt = opts.sub.timestamp?.format ?? 'until';
    return f(['__resetTime'], `__resetTime(d.rate_limits?.seven_day?.resets_at,${JSON.stringify(fmt)})`);
  },

  // misc
  sessionId: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 8;
    return f([], `(d.session_id??'').slice(0,${max})`);
  },
  transcriptPath: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 30;
    const base = opts.sub.truncate?.basenameOnly ?? true;
    return f(['__truncatePath'], `__truncatePath(d.transcript_path??'',${max},${base})`);
  },
};
