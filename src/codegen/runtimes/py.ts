export const PY_HELPERS: Record<string, string> = {
  ANSI_COLORS: `G='\\x1b[32m'; Y='\\x1b[33m'; R='\\x1b[31m'; C='\\x1b[36m'; X='\\x1b[0m'`,

  __stripAnsi: `import re as _re\ndef __strip_ansi(s):\n    s=_re.sub(r'\\x1b\\[[0-9;]*m','',str(s))\n    return _re.sub(r'\\x1b\\]8;;[^\\x07]*\\x07','',s)`,

  __bar: `def __bar(pct,w=10,wa=75,ra=90):\n    f=round((pct/100)*w); b='\\u2593'*max(0,f)+'\\u2591'*max(0,w-f)\n    c=R if pct>=ra else Y if pct>=wa else G\n    return c+b+X`,

  __resetTime: `def __reset_time(epoch,fmt='until'):\n    if not epoch: return '?'\n    from datetime import datetime,timezone\n    dt=datetime.fromtimestamp(epoch,tz=timezone.utc); now=datetime.now(tz=timezone.utc)\n    diff=max(0,(dt-now).total_seconds())\n    if fmt=='until':\n        h=int(diff//3600); m=int((diff%3600)//60)\n        return f'{h}h {m}m' if h>0 else f'{m}m'\n    if fmt=='YYYY-MM-DD': return dt.strftime('%Y-%m-%d')\n    if fmt=='DD/MM/YY': return dt.strftime('%d/%m/%y')\n    if fmt=='HH:mm': return dt.strftime('%H:%M')\n    return str(epoch)`,

  __truncatePath: `def __truncate_path(p,max_len=40,base=False):\n    if not p: return ''\n    s=p.split('/')[-1] if base else p\n    return s if len(s)<=max_len else '\\u2026'+s[-(max_len-1):]`,

  __duration: `def __duration(ms=0):\n    s=int(ms//1000); m=s//60; sc=s%60\n    return f'{m}m {sc}s' if m>0 else f'{sc}s'`,

  __pack: `def __pack(parts,sep=' | ',max_len=100,hard=False,tol=10):\n    ps=[str(p) for p in parts if p is not None and p!='']\n    if not ps: return ''\n    lim=max_len if hard else max_len*(1+tol/100)\n    lines=[[]]; run=0\n    for p in ps:\n        l=len(__strip_ansi(p)); add=l+(len(sep) if lines[-1] else 0)\n        if lines[-1] and run+add>lim: lines.append([p]); run=l\n        else: lines[-1].append(p); run+=add\n    return '\\n'.join(sep.join(line) for line in lines)`,

  __cacheGit: `def __cache_git(sid,ttl,run):\n    import os,json,time as _t\n    f=os.path.join(os.environ.get('TMPDIR','/tmp'),f'statusline-git-cache-{sid}')\n    try:\n        with open(f) as fp: c=json.load(fp)\n        if _t.time()-c['ts']<ttl: return c['d']\n    except Exception: pass\n    d=run()\n    try:\n        with open(f,'w') as fp: json.dump({'ts':_t.time(),'d':d},fp)\n    except Exception: pass\n    return d`,

  __git: `def __run_git():\n    import subprocess\n    def e(cmd):\n        r=subprocess.run(cmd,shell=True,capture_output=True,text=True)\n        return r.stdout.strip()\n    try:\n        branch=e('git rev-parse --abbrev-ref HEAD') or '?'\n        staged=int(e('git diff --cached --numstat 2>/dev/null|wc -l') or '0')\n        modified=int(e('git diff --numstat 2>/dev/null|wc -l') or '0')\n        remote=e('git remote get-url origin 2>/dev/null')\n        return [branch,staged,modified,remote]\n    except Exception: return ['?',0,0,'']`,
};
