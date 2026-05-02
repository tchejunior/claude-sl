import type { RenderFn, CodeFragment } from '../schema/types';

function f(helpers: string[], expr: string, extract?: string): CodeFragment {
  return { helpers, expr, extract };
}

export const RSH: Record<string, RenderFn> = {
  modelDisplay: () => f([], '"${MODEL_DISPLAY}"', 'MODEL_DISPLAY=$(echo "$input"|jq -r \'.model.display_name//"?"\')'),
  modelId: () => f([], '"${MODEL_ID}"', 'MODEL_ID=$(echo "$input"|jq -r \'.model.id//"?"\')'),
  version: () => f([], '"${SL_VERSION}"', 'SL_VERSION=$(echo "$input"|jq -r \'.version//"?"\')'),
  outputStyle: () => f([], '"${OUTPUT_STYLE}"', 'OUTPUT_STYLE=$(echo "$input"|jq -r \'.output_style.name//"default"\')'),
  effort: () => f([], '"${EFFORT}"', 'EFFORT=$(echo "$input"|jq -r \'.effort.level//"?"\')'),
  thinking: (opts) => f([], '"${THINKING}"', opts.global.useEmojis
    ? 'THINKING=$(echo "$input"|jq -r \'if .thinking.enabled then "💭" else "" end\')'
    : 'THINKING=$(echo "$input"|jq -r \'if .thinking.enabled then "thinking:on" else "" end\')'),
  vim: (opts) => opts.global.hideVimModeIndicator
    ? f([], '""')
    : f([], '"${VIM_MODE}"', 'VIM_MODE=$(echo "$input"|jq -r \'.vim.mode//empty\')'),
  agent: (opts) => f([], '"${AGENT_NAME}"', opts.global.useEmojis
    ? 'AGENT_NAME=$(echo "$input"|jq -r \'.agent.name//empty\'|awk \'NF{print "🤖 " $0}\')'
    : 'AGENT_NAME=$(echo "$input"|jq -r \'.agent.name//empty\')'),
  sessionName: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 24;
    return f(
      ['__truncatePath'],
      `"$(__truncate_path "$(echo "$input"|jq -r '.session_name//empty')" ${max} 0)"`,
      `SESSION_NAME=$(echo "$input"|jq -r '.session_name//empty')`,
    );
  },

  cwd: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 40;
    const base = opts.sub.truncate?.basenameOnly ?? true ? '1' : '0';
    return f(
      ['__truncatePath'],
      `"$(__truncate_path "\${CWD_RAW}" ${max} ${base})"`,
      'CWD_RAW=$(echo "$input"|jq -r \'.workspace.current_dir//(.cwd//"")\')');
  },
  workspaceProject: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 40;
    const base = opts.sub.truncate?.basenameOnly ?? true ? '1' : '0';
    return f(
      ['__truncatePath'],
      `"$(__truncate_path "\${WS_PROJECT}" ${max} ${base})"`,
      'WS_PROJECT=$(echo "$input"|jq -r \'.workspace.project_dir//empty\')');
  },
  workspaceAddedCount: () => f([], '"${WS_ADDED_COUNT}"', 'WS_ADDED_COUNT=$(echo "$input"|jq -r \'(.workspace.added_dirs//[])|length|if .==0 then "" else tostring end\')'),
  workspaceGitWorktree: () => f([], '"${WS_GIT_WT}"', 'WS_GIT_WT=$(echo "$input"|jq -r \'.workspace.git_worktree//empty\')'),
  worktreeName: () => f([], '"${WT_NAME}"', 'WT_NAME=$(echo "$input"|jq -r \'.worktree.name//empty\')'),
  worktreeBranch: () => f([], '"${WT_BRANCH}"', 'WT_BRANCH=$(echo "$input"|jq -r \'.worktree.branch//empty\')'),
  worktreeOriginalBranch: () => f([], '"${WT_ORIG_BRANCH}"', 'WT_ORIG_BRANCH=$(echo "$input"|jq -r \'.worktree.original_branch//empty\')'),

  gitBranch: (opts) => f(
    opts.global.cacheGit ? ['__git', '__cacheGit'] : ['__git'],
    '"${GIT_BRANCH}"',
    'GIT_INFO=$(__run_git); GIT_BRANCH=$(echo "$GIT_INFO"|sed -n \'1p\'); GIT_STAGED=$(echo "$GIT_INFO"|sed -n \'2p\'); GIT_MODIFIED=$(echo "$GIT_INFO"|sed -n \'3p\'); GIT_REMOTE=$(echo "$GIT_INFO"|sed -n \'4p\')',
  ),
  gitStagedCount: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [1, 1];
    const GS = '"${GIT_STAGED}"';
    const GS0 = '"${GIT_STAGED:-0}"';
    return f(
      opts.global.cacheGit ? ['ANSI_COLORS', '__git', '__cacheGit'] : ['ANSI_COLORS', '__git'],
      `"$([ ${GS0} -gt 0 ] && printf "%s" "$([ ${GS} -ge ${ra} ] && printf "$R" || [ ${GS} -ge ${wa} ] && printf "$Y" || printf "$G")S:${GS}$X")"`,
      'GIT_INFO=$(__run_git); GIT_BRANCH=$(echo "$GIT_INFO"|sed -n \'1p\'); GIT_STAGED=$(echo "$GIT_INFO"|sed -n \'2p\'); GIT_MODIFIED=$(echo "$GIT_INFO"|sed -n \'3p\'); GIT_REMOTE=$(echo "$GIT_INFO"|sed -n \'4p\')',
    );
  },
  gitModifiedCount: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [1, 1];
    const GM = '"${GIT_MODIFIED}"';
    const GM0 = '"${GIT_MODIFIED:-0}"';
    return f(
      opts.global.cacheGit ? ['ANSI_COLORS', '__git', '__cacheGit'] : ['ANSI_COLORS', '__git'],
      `"$([ ${GM0} -gt 0 ] && printf "%s" "$([ ${GM} -ge ${ra} ] && printf "$R" || [ ${GM} -ge ${wa} ] && printf "$Y" || printf "$G")M:${GM}$X")"`,
      'GIT_INFO=$(__run_git); GIT_BRANCH=$(echo "$GIT_INFO"|sed -n \'1p\'); GIT_STAGED=$(echo "$GIT_INFO"|sed -n \'2p\'); GIT_MODIFIED=$(echo "$GIT_INFO"|sed -n \'3p\'); GIT_REMOTE=$(echo "$GIT_INFO"|sed -n \'4p\')',
    );
  },
  gitRemoteLink: (opts) => f(
    opts.global.cacheGit ? ['__git', '__cacheGit'] : ['__git'],
    '"$([ -n "${GIT_REMOTE}" ] && printf "\\e]8;;%s\\e\\\\🔗\\e]8;;\\e\\\\" "${GIT_REMOTE}")"',
    'GIT_INFO=$(__run_git); GIT_BRANCH=$(echo "$GIT_INFO"|sed -n \'1p\'); GIT_STAGED=$(echo "$GIT_INFO"|sed -n \'2p\'); GIT_MODIFIED=$(echo "$GIT_INFO"|sed -n \'3p\'); GIT_REMOTE=$(echo "$GIT_INFO"|sed -n \'4p\')',
  ),

  ctxUsedPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(
      ['ANSI_COLORS'],
      `"$(CTX_PCT=$(echo "$input"|jq -r '.context_window.used_percentage//0|floor'); [ "$CTX_PCT" -ge ${ra} ] && printf "$R" || [ "$CTX_PCT" -ge ${wa} ] && printf "$Y" || printf "$G"; printf "%s%%%s" "$CTX_PCT" "$X")"`,
      'CTX_USED=$(echo "$input"|jq -r \'.context_window.used_percentage//0|floor\')',
    );
  },
  ctxRemainingPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(
      ['ANSI_COLORS'],
      `"$(CTX_REM=$(echo "$input"|jq -r '.context_window.remaining_percentage//100|floor'); CTX_U=$((100-CTX_REM)); [ "$CTX_U" -ge ${ra} ] && printf "$R" || [ "$CTX_U" -ge ${wa} ] && printf "$Y" || printf "$G"; printf "%s%% left%s" "$CTX_REM" "$X")"`,
      'CTX_REM=$(echo "$input"|jq -r \'.context_window.remaining_percentage//100|floor\')',
    );
  },
  ctxTotalTokens: () => f([], '"${CTX_TOTAL_TOK}tok"', 'CTX_TOTAL_TOK=$(echo "$input"|jq -r \'(.context_window.total_input_tokens//0)+(.context_window.total_output_tokens//0)\')'),
  ctxWindowSize: () => f([], '"${CTX_WIN_SIZE}k ctx"', 'CTX_WIN_SIZE=$(echo "$input"|jq -r \'(.context_window.context_window_size//0)/1000|floor\')'),
  ctxBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(
      ['ANSI_COLORS', '__bar'],
      `"$(__bar "\${CTX_BAR_PCT}" ${w} ${wa} ${ra})"`,
      'CTX_BAR_PCT=$(echo "$input"|jq -r \'.context_window.used_percentage//0|floor\')',
    );
  },
  ctxCurrentInput: () => f([], '"${CTX_CUR_IN}in"', 'CTX_CUR_IN=$(echo "$input"|jq -r \'.context_window.current_usage.input_tokens//0\')'),
  ctxCacheRead: () => f([], '"${CTX_CR}cr"', 'CTX_CR=$(echo "$input"|jq -r \'.context_window.current_usage.cache_read_input_tokens//0\')'),
  ctxCacheCreation: () => f([], '"${CTX_CW}cw"', 'CTX_CW=$(echo "$input"|jq -r \'.context_window.current_usage.cache_creation_input_tokens//0\')'),
  exceeds200k: () => f([], '"$(echo "$input"|jq -r \'if .exceeds_200k_tokens then "!200k" else "" end\')"'),

  costTotalUsd: () => f([], '"\\$$(echo "$input"|jq -r \'.cost.total_cost_usd//0|.*10000|round/10000\')"'),
  costDuration: () => f(['__duration'], '"$(__duration "$(echo "$input"|jq -r \'.cost.total_duration_ms//0\')")"'),
  costApiDuration: () => f(['__duration'], '"$(__duration "$(echo "$input"|jq -r \'.cost.total_api_duration_ms//0\')")"'),
  costLines: () => f([], '"+$(echo "$input"|jq -r \'.cost.total_lines_added//0\') -$(echo "$input"|jq -r \'.cost.total_lines_removed//0\')"'),

  rate5hPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(
      ['ANSI_COLORS'],
      `"$(P5H=$(echo "$input"|jq -r '.rate_limits.five_hour.used_percentage//0|floor'); [ "$P5H" -ge ${ra} ] && printf "$R" || [ "$P5H" -ge ${wa} ] && printf "$Y" || printf "$G"; printf "5h:%s%%%s" "$P5H" "$X")"`,
      'P5H=$(echo "$input"|jq -r \'.rate_limits.five_hour.used_percentage//0|floor\')',
    );
  },
  rate5hBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(
      ['ANSI_COLORS', '__bar'],
      `"$(__bar "$(echo "$input"|jq -r '.rate_limits.five_hour.used_percentage//0|floor')" ${w} ${wa} ${ra})"`,
      'R5H_PCT=$(echo "$input"|jq -r \'.rate_limits.five_hour.used_percentage//0|floor\')',
    );
  },
  rate5hResets: (opts) => {
    const fmt = opts.sub.timestamp?.format ?? 'until';
    return f(
      ['__resetTime'],
      `"$(__reset_time "$(echo "$input"|jq -r '.rate_limits.five_hour.resets_at//0')" "${fmt}")"`,
      'R5H_TS=$(echo "$input"|jq -r \'.rate_limits.five_hour.resets_at//0\')',
    );
  },
  rate7dPct: (opts) => {
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(
      ['ANSI_COLORS'],
      `"$(P7D=$(echo "$input"|jq -r '.rate_limits.seven_day.used_percentage//0|floor'); [ "$P7D" -ge ${ra} ] && printf "$R" || [ "$P7D" -ge ${wa} ] && printf "$Y" || printf "$G"; printf "7d:%s%%%s" "$P7D" "$X")"`,
      'P7D=$(echo "$input"|jq -r \'.rate_limits.seven_day.used_percentage//0|floor\')',
    );
  },
  rate7dBar: (opts) => {
    const w = opts.sub.bar?.width ?? 10;
    const [wa, ra] = opts.sub.colorize?.thresholds ?? [75, 90];
    return f(
      ['ANSI_COLORS', '__bar'],
      `"$(__bar "$(echo "$input"|jq -r '.rate_limits.seven_day.used_percentage//0|floor')" ${w} ${wa} ${ra})"`,
      'R7D_PCT=$(echo "$input"|jq -r \'.rate_limits.seven_day.used_percentage//0|floor\')',
    );
  },
  rate7dResets: (opts) => {
    const fmt = opts.sub.timestamp?.format ?? 'until';
    return f(
      ['__resetTime'],
      `"$(__reset_time "$(echo "$input"|jq -r '.rate_limits.seven_day.resets_at//0')" "${fmt}")"`,
      'R7D_TS=$(echo "$input"|jq -r \'.rate_limits.seven_day.resets_at//0\')',
    );
  },

  sessionId: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 8;
    return f(
      [],
      `"$(echo "$input"|jq -r '.session_id//empty'|head -c ${max})"`,
      `SID=$(echo "$input"|jq -r '.session_id//empty'|head -c ${max})`,
    );
  },
  transcriptPath: (opts) => {
    const max = opts.sub.truncate?.maxChars ?? 30;
    const base = opts.sub.truncate?.basenameOnly ?? true ? '1' : '0';
    return f(
      ['__truncatePath'],
      `"$(__truncate_path "$(echo "$input"|jq -r '.transcript_path//empty')" ${max} ${base})"`,
      'TRANSCRIPT=$(echo "$input"|jq -r \'.transcript_path//empty\')',
    );
  },
};
