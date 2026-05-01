export const SH_HELPERS: Record<string, string> = {
  ANSI_COLORS: `G=$'\\e[32m'; Y=$'\\e[33m'; R=$'\\e[31m'; C=$'\\e[36m'; X=$'\\e[0m'`,

  __stripAnsi: `__strip_ansi() { echo "$1" | sed $'s/\\\\e\\\\[[0-9;]*m//g'; }`,

  __bar: `__bar() {\n  local pct=$1 w=\${2:-10} wa=\${3:-75} ra=\${4:-90}\n  local f=$(( (pct * w + 50) / 100 )) e bar="" i\n  e=$(( w - f ))\n  for ((i=0;i<f;i++)); do bar+=$'\\u2593'; done\n  for ((i=0;i<e;i++)); do bar+=$'\\u2591'; done\n  local c\n  if [ "$pct" -ge "$ra" ]; then c=$R\n  elif [ "$pct" -ge "$wa" ]; then c=$Y\n  else c=$G; fi\n  printf "%s%s%s" "$c" "$bar" "$X"\n}`,

  __resetTime: `__reset_time() {\n  local epoch=$1 fmt=\${2:-until}\n  local now; now=$(date +%s); local diff=$(( epoch - now ))\n  [ $diff -le 0 ] && echo "now" && return\n  if [ "$fmt" = "until" ]; then\n    local h=$(( diff/3600 )) m=$(( (diff%3600)/60 ))\n    [ $h -gt 0 ] && echo "\${h}h \${m}m" || echo "\${m}m"\n  elif [ "$fmt" = "YYYY-MM-DD" ]; then date -d "@$epoch" +%Y-%m-%d 2>/dev/null || date -r "$epoch" +%Y-%m-%d\n  elif [ "$fmt" = "DD/MM/YY" ]; then date -d "@$epoch" +%d/%m/%y 2>/dev/null || date -r "$epoch" +%d/%m/%y\n  elif [ "$fmt" = "HH:mm" ]; then date -d "@$epoch" +%H:%M 2>/dev/null || date -r "$epoch" +%H:%M\n  fi\n}`,

  __truncatePath: `__truncate_path() {\n  local p=$1 max=\${2:-40} base=\${3:-0}\n  [ -z "$p" ] && echo "" && return\n  [ "$base" = "1" ] || [ "$base" = "true" ] && p=$(basename "$p")\n  if [ \${#p} -le $max ]; then echo "$p"\n  else echo "…\${p: -(max-1)}"; fi\n}`,

  __duration: `__duration() {\n  local ms=\${1:-0} s m sc\n  s=$(( ms/1000 )); m=$(( s/60 )); sc=$(( s%60 ))\n  [ $m -gt 0 ] && echo "\${m}m \${sc}s" || echo "\${s}s"\n}`,

  __pack: `__pack() {\n  local sep=$1 max=$2 hard=$3 tol=$4; shift 4\n  local lim result="" run=0\n  if [ "$hard" = "true" ]; then lim=$max\n  else lim=$(awk "BEGIN{printf \\"%d\\",$max*(1+$tol/100)}"); fi\n  for p in "$@"; do\n    [ -z "$p" ] && continue\n    local l; l=$(echo "$p"|__strip_ansi|wc -m)\n    local add=$l\n    [ -n "$result" ] && add=$(( add + \${#sep} ))\n    if [ -n "$result" ] && [ $(( run + add )) -gt $lim ]; then\n      result="$result\\n$p"; run=$l\n    else\n      result="\${result:+$result$sep}$p"; run=$(( run + add ))\n    fi\n  done\n  printf "%b\\n" "$result"\n}`,

  __cacheGit: `__cache_git() {\n  local sid=$1 ttl=$2\n  local f="/tmp/statusline-git-cache-$sid"\n  local now; now=$(date +%s)\n  if [ -f "$f" ]; then\n    local ts; ts=$(head -1 "$f")\n    [ $(( now - ts )) -lt $ttl ] && tail -n +2 "$f" && return\n  fi\n  local r; r=$(__run_git)\n  { echo "$now"; echo "$r"; } > "$f"\n  echo "$r"\n}`,

  __git: `__run_git() {\n  local branch staged modified remote\n  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || branch="?"\n  staged=$(git diff --cached --numstat 2>/dev/null|wc -l|tr -d ' ')\n  modified=$(git diff --numstat 2>/dev/null|wc -l|tr -d ' ')\n  remote=$(git remote get-url origin 2>/dev/null) || remote=""\n  printf "%s\\n%s\\n%s\\n%s" "$branch" "\${staged:-0}" "\${modified:-0}" "$remote"\n}`,
};
