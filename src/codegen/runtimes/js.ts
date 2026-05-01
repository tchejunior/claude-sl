export const JS_HELPERS: Record<string, string> = {
  ANSI_COLORS: `const G='\\x1b[32m',Y='\\x1b[33m',R='\\x1b[31m',C='\\x1b[36m',X='\\x1b[0m';`,

  __stripAnsi: `const __stripAnsi=(s)=>String(s).replace(/\\x1b\\[[0-9;]*m/g,'').replace(/\\x1b\\]8;;[^\\x07]*\\x07/g,'');`,

  __bar: `const __bar=(pct,w=10,wa=75,ra=90)=>{const f=Math.round((pct/100)*w),b='\\u2593'.repeat(Math.max(0,f))+'\\u2591'.repeat(Math.max(0,w-f)),c=pct>=ra?R:pct>=wa?Y:G;return c+b+X};`,

  __resetTime: `const __resetTime=(epoch,fmt='until')=>{if(!epoch)return'?';const dt=new Date(epoch*1e3),now=new Date(),diff=Math.max(0,dt-now),pad=n=>String(n).padStart(2,'0');if(fmt==='until'){const h=Math.floor(diff/36e5),m=Math.floor((diff%36e5)/6e4);return h>0?h+'h '+m+'m':m+'m'}if(fmt==='YYYY-MM-DD')return dt.getFullYear()+'-'+pad(dt.getMonth()+1)+'-'+pad(dt.getDate());if(fmt==='DD/MM/YY')return pad(dt.getDate())+'/'+pad(dt.getMonth()+1)+'/'+String(dt.getFullYear()).slice(2);if(fmt==='HH:mm')return pad(dt.getHours())+':'+pad(dt.getMinutes());return String(epoch)};`,

  __truncatePath: `const __truncatePath=(p,max=40,base=false)=>{if(!p)return'';const s=base?(String(p).split('/').pop()||p):String(p);return s.length<=max?s:'\\u2026'+s.slice(-(max-1))};`,

  __duration: `const __duration=(ms=0)=>{const s=Math.floor(ms/1e3),m=Math.floor(s/60),sc=s%60;return m>0?m+'m '+sc+'s':sc+'s'};`,

  __pack: `const __pack=(parts,sep=' | ',max=100,hard=false,tol=10)=>{const ps=parts.filter(x=>x!=null&&x!=='');if(!ps.length)return'';const lim=hard?max:max*(1+tol/100),lines=[[]];let run=0;for(const p of ps){const l=__stripAnsi(String(p)).length,add=l+(lines[lines.length-1].length?sep.length:0);if(lines[lines.length-1].length&&run+add>lim){lines.push([p]);run=l}else{lines[lines.length-1].push(p);run+=add}}return lines.map(l=>l.join(sep)).join('\\n')};`,

  __cacheGit: `const __cacheGit=(sid,ttl,run)=>{const os=require('os'),fs=require('fs'),f=os.tmpdir()+'/statusline-git-cache-'+sid;try{const c=JSON.parse(fs.readFileSync(f,'utf8'));if(Date.now()-c.ts<ttl*1e3)return c.d}catch(e){}const d=run();try{fs.writeFileSync(f,JSON.stringify({ts:Date.now(),d}))}catch(e){}return d};`,

  __git: `const __runGit=()=>{try{const ex=(cmd)=>require('child_process').execSync(cmd,{stdio:['ignore','pipe','ignore'],encoding:'utf8'}).trim();const branch=ex('git rev-parse --abbrev-ref HEAD');const staged=parseInt(ex('git diff --cached --numstat 2>/dev/null|wc -l')||'0',10);const modified=parseInt(ex('git diff --numstat 2>/dev/null|wc -l')||'0',10);let remote='';try{remote=ex('git remote get-url origin 2>/dev/null')}catch(_){}return[branch,staged,modified,remote]}catch(_){return['?',0,0,'']}};`,
};
