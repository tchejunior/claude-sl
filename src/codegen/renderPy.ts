import type { RenderFn, CodeFragment } from '../schema/types';

function f(helpers: string[], expr: string): CodeFragment {
  return { helpers, expr };
}

export const RPY: Record<string, RenderFn> = {
  // identity
  modelDisplay: () => f([], "(d.get('model') or {}).get('display_name','?')"),
  modelId: () => f([], "(d.get('model') or {}).get('id','?')"),
  version: () => f([], "d.get('version','?')"),
  outputStyle: () => f([], "(d.get('output_style') or {}).get('name','default')"),
  effort: () => f([], "(d.get('effort') or {}).get('level','?')"),
  thinking: () => f([], "'thinking:on' if (d.get('thinking') or {}).get('enabled') else ''"),
  vim: (opts) => f([], opts.global.hideVimModeIndicator ? "''" : "(d.get('vim') or {}).get('mode','')"),
  agent: () => f([], "(d.get('agent') or {}).get('name','')"),
  sessionName: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 24;
    return f(['__truncatePath'], `__truncate_path(d.get('session_name',''),${max},False)`);
  },

  // workspace
  cwd: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 40;
    const base = opts.sub.truncate?.basenameOnly ?? true;
    return f(['__truncatePath'], `__truncate_path((d.get('workspace') or {}).get('current_dir','') or d.get('cwd',''),${max},${base ? 'True' : 'False'})`);
  },
  workspaceProject: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 40;
    const base = opts.sub.truncate?.basenameOnly ?? true;
    return f(['__truncatePath'], `__truncate_path((d.get('workspace') or {}).get('project_dir',''),${max},${base ? 'True' : 'False'})`);
  },
  workspaceAddedCount: () => f([], "len((d.get('workspace') or {}).get('added_dirs',[]))or''"),
  workspaceGitWorktree: () => f([], "(d.get('workspace') or {}).get('git_worktree','')"),
  worktreeName: () => f([], "(d.get('worktree') or {}).get('name','')"),
  worktreeBranch: () => f([], "(d.get('worktree') or {}).get('branch','')"),
  worktreeOriginalBranch: () => f([], "(d.get('worktree') or {}).get('original_branch','')"),

  // git
  gitBranch: (opts) => f(
    opts.global.cacheGit ? ['__git', '__cacheGit'] : ['__git'],
    '__GIT[0]',
  ),
  gitStagedCount: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [1, 1];
    return f(
      opts.global.cacheGit ? ['ANSI_COLORS', '__git', '__cacheGit'] : ['ANSI_COLORS', '__git'],
      `(f'{R if __GIT[1]>=${ra} else Y if __GIT[1]>=${wa} else G}S:{__GIT[1]}{X}' if __GIT[1]>0 else '')`,
    );
  },
  gitModifiedCount: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [1, 1];
    return f(
      opts.global.cacheGit ? ['ANSI_COLORS', '__git', '__cacheGit'] : ['ANSI_COLORS', '__git'],
      `(f'{R if __GIT[2]>=${ra} else Y if __GIT[2]>=${wa} else G}M:{__GIT[2]}{X}' if __GIT[2]>0 else '')`,
    );
  },
  gitRemoteLink: (opts) => f(
    opts.global.cacheGit ? ['__git', '__cacheGit'] : ['__git'],
    "(f'\\x1b]8;;{__GIT[3]}\\x07🔗\\x1b]8;;\\x07' if __GIT[3] else '')",
  ),

  // context
  ctxUsedPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS'], `(lambda p:f'{R if p>=${ra} else Y if p>=${wa} else G}{p}%{X}')(int((d.get('context_window') or {}).get('used_percentage',0)))`);
  },
  ctxRemainingPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS'], `(lambda r,u:f'{R if u>=${ra} else Y if u>=${wa} else G}{r}% left{X}')(int((d.get('context_window') or {}).get('remaining_percentage',100)),100-int((d.get('context_window') or {}).get('remaining_percentage',100)))`);
  },
  ctxTotalTokens: () => f([], "f\"{(d.get('context_window') or {}).get('total_input_tokens',0)+(d.get('context_window') or {}).get('total_output_tokens',0)}tok\""),
  ctxWindowSize: () => f([], "f\"{(d.get('context_window') or {}).get('context_window_size',0)//1000}k ctx\""),
  ctxBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS', '__bar'], `__bar((d.get('context_window') or {}).get('used_percentage',0),${w},${wa},${ra})`);
  },
  ctxCurrentInput: () => f([], "f\"{(d.get('context_window') or {}).get('current_usage',{}).get('input_tokens',0)}in\""),
  ctxCacheRead: () => f([], "f\"{(d.get('context_window') or {}).get('current_usage',{}).get('cache_read_input_tokens',0)}cr\""),
  ctxCacheCreation: () => f([], "f\"{(d.get('context_window') or {}).get('current_usage',{}).get('cache_creation_input_tokens',0)}cw\""),
  exceeds200k: () => f([], "('!200k' if d.get('exceeds_200k_tokens') else '')"),

  // cost
  costTotalUsd: () => f([], "f\"${(d.get('cost') or {}).get('total_cost_usd',0):.4f}\""),
  costDuration: () => f(['__duration'], "__duration((d.get('cost') or {}).get('total_duration_ms',0))"),
  costApiDuration: () => f(['__duration'], "__duration((d.get('cost') or {}).get('total_api_duration_ms',0))"),
  costLines: () => f([], "f\"+{(d.get('cost') or {}).get('total_lines_added',0)} -{(d.get('cost') or {}).get('total_lines_removed',0)}\""),

  // rate limits
  rate5hPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS'], `(lambda p:f'{R if p>=${ra} else Y if p>=${wa} else G}5h:{p}%{X}')(int((d.get('rate_limits') or {}).get('five_hour',{}).get('used_percentage',0)))`);
  },
  rate5hBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS', '__bar'], `__bar((d.get('rate_limits') or {}).get('five_hour',{}).get('used_percentage',0),${w},${wa},${ra})`);
  },
  rate5hResets: (opts) => {
    const fmt = opts.sub.timestamp?.format ?? 'until';
    return f(['__resetTime'], `__reset_time((d.get('rate_limits') or {}).get('five_hour',{}).get('resets_at'),${JSON.stringify(fmt)})`);
  },
  rate7dPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS'], `(lambda p:f'{R if p>=${ra} else Y if p>=${wa} else G}7d:{p}%{X}')(int((d.get('rate_limits') or {}).get('seven_day',{}).get('used_percentage',0)))`);
  },
  rate7dBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(['ANSI_COLORS', '__bar'], `__bar((d.get('rate_limits') or {}).get('seven_day',{}).get('used_percentage',0),${w},${wa},${ra})`);
  },
  rate7dResets: (opts) => {
    const fmt = opts.sub.timestamp?.format ?? 'until';
    return f(['__resetTime'], `__reset_time((d.get('rate_limits') or {}).get('seven_day',{}).get('resets_at'),${JSON.stringify(fmt)})`);
  },

  // misc
  sessionId: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 8;
    return f([], `(d.get('session_id',''))[:${max}]`);
  },
  transcriptPath: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 30;
    const base = opts.sub.truncate?.basenameOnly ?? true;
    return f(['__truncatePath'], `__truncate_path(d.get('transcript_path',''),${max},${base ? 'True' : 'False'})`);
  },
};
