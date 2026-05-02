export const PS_HELPERS: Record<string, string> = {
  ANSI_COLORS: `$ESC=if($PSVersionTable.PSVersion.Major -ge 7){"$([char]27)"}else{[char]27}
$G="$ESC[32m"; $Y="$ESC[33m"; $R="$ESC[31m"; $C="$ESC[36m"; $X="$ESC[0m"`,

  // eslint-disable-next-line no-useless-escape
  __stripAnsi: `function Strip-Ansi($s){ $s -replace '\x1b\[[0-9;]*m','' -replace '\x1b\]8;;[^\x07]*\x07','' }`,

  __bar: `function __Bar($pct,$w=10,$wa=75,$ra=90){
  $f=[Math]::Round(($pct/100)*$w); $e=$w-$f
  $b=([string][char]0x2593)*[Math]::Max(0,$f)+([string][char]0x2591)*[Math]::Max(0,$e)
  $c=if($pct -ge $ra){$R}elseif($pct -ge $wa){$Y}else{$G}
  "$c$b$X"
}`,

  __resetTime: `function __ResetTime($epoch,$fmt='until'){
  if(-not $epoch){return '?'}
  $dt=[DateTimeOffset]::FromUnixTimeSeconds($epoch).LocalDateTime
  $diff=[Math]::Max(0,($dt-(Get-Date)).TotalSeconds)
  if($fmt -eq 'until'){$h=[int]($diff/3600);$m=[int](($diff%3600)/60);if($h -gt 0){"\${h}h \${m}m"}else{"\${m}m"}}
  elseif($fmt -eq 'YYYY-MM-DD'){$dt.ToString('yyyy-MM-dd')}
  elseif($fmt -eq 'DD/MM/YY'){$dt.ToString('dd/MM/yy')}
  elseif($fmt -eq 'HH:mm'){$dt.ToString('HH:mm')}
  else{[string]$epoch}
}`,

  __truncatePath: `function __TruncatePath($p,$max=40,$base=$false){
  if(-not $p){return ''}
  $s=if($base){Split-Path $p -Leaf}else{$p}
  if($s.Length -le $max){$s}else{'…'+$s.Substring($s.Length-($max-1))}
}`,

  __duration: `function __Duration($ms=0){
  $s=[int]($ms/1000); $m=[int]($s/60); $sc=$s%60
  if($m -gt 0){"\${m}m \${sc}s"}else{"\${s}s"}
}`,

  __pack: `function __Pack($parts,$sep=' | ',$max=100,$hard=$false,$tol=10){
  $ps=$parts|Where-Object{$_ -ne $null -and $_ -ne ''}
  if(-not $ps){return ''}
  $lim=if($hard){$max}else{$max*(1+$tol/100)}
  $lines=@(@()); $run=0
  foreach($p in $ps){
    $l=(Strip-Ansi([string]$p)).Length; $add=$l+$(if($lines[-1].Count -gt 0){$sep.Length}else{0})
    if($lines[-1].Count -gt 0 -and ($run+$add) -gt $lim){$lines+=,@($p);$run=$l}
    else{$lines[-1]+=$p;$run+=$add}
  }
  ($lines|ForEach-Object{$_-join $sep})-join "\`n"
}`,

  __cacheGit: `function __CacheGit($sid,$ttl,$run){
  $f="$env:TEMP\\statusline-git-cache-$sid"
  try{$c=Get-Content $f -Raw|ConvertFrom-Json;if(([DateTimeOffset]::UtcNow.ToUnixTimeSeconds()-$c.ts) -lt $ttl){return $c.d}}catch{}
  $d=& $run
  try{@{ts=[DateTimeOffset]::UtcNow.ToUnixTimeSeconds();d=$d}|ConvertTo-Json -Compress|Set-Content $f}catch{}
  $d
}`,

  __git: `function __RunGit(){
  try{
    $branch=git rev-parse --abbrev-ref HEAD 2>$null
    $staged=(git diff --cached --numstat 2>$null|Measure-Object -Line).Lines
    $modified=(git diff --numstat 2>$null|Measure-Object -Line).Lines
    $remote=git remote get-url origin 2>$null
    @($branch,[int]$staged,[int]$modified,$remote)
  }catch{@('?',0,0,'')}
}`,
};
