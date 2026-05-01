import type { ParamId, ResolvedOptions } from '../schema/types';
import { PARAMS_BY_ID } from '../schema/params';
import { SAMPLE_STDIN } from '../samples/sampleStdin';
import { packLines } from '../codegen/pack';
import { stripAnsi } from '../schema/helpers';

const G = '\x1b[32m', Y = '\x1b[33m', R = '\x1b[31m', X = '\x1b[0m';

function bar(pct: number, w: number, wa: number, ra: number): string {
  const f = Math.round((pct / 100) * w);
  const b = '▓'.repeat(Math.max(0, f)) + '░'.repeat(Math.max(0, w - f));
  const c = pct >= ra ? R : pct >= wa ? Y : G;
  return c + b + X;
}

function resetTime(epoch: number | undefined, fmt: string): string {
  if (!epoch) return '?';
  const dt = new Date(epoch * 1000);
  const now = new Date();
  const diff = Math.max(0, dt.getTime() - now.getTime());
  const pad = (n: number) => String(n).padStart(2, '0');
  if (fmt === 'until') {
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
  if (fmt === 'YYYY-MM-DD') return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
  if (fmt === 'DD/MM/YY') return `${pad(dt.getDate())}/${pad(dt.getMonth()+1)}/${String(dt.getFullYear()).slice(2)}`;
  if (fmt === 'HH:mm') return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  return String(epoch);
}

function truncatePath(p: string, max: number, base: boolean): string {
  if (!p) return '';
  const s = base ? (p.split('/').pop() ?? p) : p;
  return s.length <= max ? s : '…' + s.slice(-(max - 1));
}

function duration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sc = s % 60;
  return m > 0 ? `${m}m ${sc}s` : `${sc}s`;
}

const d = SAMPLE_STDIN as Record<string, unknown>;
const cw = (d.context_window ?? {}) as Record<string, number> & { current_usage?: Record<string, number> };
const cu = (cw.current_usage ?? {}) as Record<string, number>;
const rl = (d.rate_limits ?? {}) as Record<string, Record<string, number>>;
const cost = (d.cost ?? {}) as Record<string, number>;

function evalParam(id: ParamId, opts: ResolvedOptions): string {
  const sub = opts.sub;
  const g = opts.global;
  switch (id) {
    case 'model_display': return String((d.model as Record<string,string>)?.display_name ?? '?');
    case 'model_id': return String((d.model as Record<string,string>)?.id ?? '?');
    case 'version': return String(d.version ?? '?');
    case 'output_style': return String((d.output_style as Record<string,string>)?.name ?? 'default');
    case 'effort': return String((d.effort as Record<string,string>)?.level ?? '?');
    case 'thinking': return (d.thinking as Record<string,boolean>)?.enabled ? 'thinking:on' : '';
    case 'vim': return g.hideVimModeIndicator ? '' : String((d.vim as Record<string,string>)?.mode ?? '');
    case 'agent': return String((d.agent as Record<string,string>)?.name ?? '');
    case 'session_name': return truncatePath(String(d.session_name ?? ''), sub.truncate?.maxChars ?? 24, false);

    case 'cwd': return truncatePath(String((d.workspace as Record<string,string>)?.current_dir ?? d.cwd ?? ''), sub.truncate?.maxChars ?? 40, sub.truncate?.basenameOnly ?? true);
    case 'workspace_project': return truncatePath(String((d.workspace as Record<string,string>)?.project_dir ?? ''), sub.truncate?.maxChars ?? 40, sub.truncate?.basenameOnly ?? true);
    case 'workspace_added_count': { const n = ((d.workspace as Record<string,unknown[]>)?.added_dirs ?? []).length; return n ? String(n) : ''; }
    case 'workspace_git_worktree': return String((d.workspace as Record<string,string>)?.git_worktree ?? '');
    case 'worktree_name': return String((d.worktree as Record<string,string>)?.name ?? '');
    case 'worktree_branch': return String((d.worktree as Record<string,string>)?.branch ?? '');
    case 'worktree_original_branch': return String((d.worktree as Record<string,string>)?.original_branch ?? '');

    case 'git_branch': return '🌿 main (preview)';
    case 'git_staged_count': return '';
    case 'git_modified_count': return '';
    case 'git_remote_link': return '';

    case 'ctx_used_pct': { const p = Math.floor(cw.used_percentage ?? 0); const [wa,ra] = sub.colorize?.thresholds ?? [75,90]; return (p>=ra?R:p>=wa?Y:G)+p+'%'+X; }
    case 'ctx_remaining_pct': { const r = Math.floor(cw.remaining_percentage ?? 100); const u = 100-r; const [wa,ra] = sub.colorize?.thresholds ?? [75,90]; return (u>=ra?R:u>=wa?Y:G)+r+'% left'+X; }
    case 'ctx_total_tokens': return ((cw.total_input_tokens??0)+(cw.total_output_tokens??0)).toLocaleString()+'tok';
    case 'ctx_window_size': return ((cw.context_window_size??0)/1000).toFixed(0)+'k ctx';
    case 'ctx_bar': return bar(cw.used_percentage??0, sub.bar?.width??10, ...(sub.colorize?.thresholds ?? [75,90]) as [number,number]);
    case 'ctx_current_input': return (cu.input_tokens??0).toLocaleString()+'in';
    case 'ctx_cache_read': return (cu.cache_read_input_tokens??0).toLocaleString()+'cr';
    case 'ctx_cache_creation': return (cu.cache_creation_input_tokens??0).toLocaleString()+'cw';
    case 'exceeds_200k': return d.exceeds_200k_tokens ? '!200k' : '';

    case 'cost_total_usd': return '$'+(cost.total_cost_usd??0).toFixed(4);
    case 'cost_duration': return duration(cost.total_duration_ms??0);
    case 'cost_api_duration': return duration(cost.total_api_duration_ms??0);
    case 'cost_lines': return `+${cost.total_lines_added??0} -${cost.total_lines_removed??0}`;

    case 'rate_5h_pct': { const p = Math.floor(rl.five_hour?.used_percentage??0); const [wa,ra] = sub.colorize?.thresholds??[75,90]; return (p>=ra?R:p>=wa?Y:G)+'5h:'+p+'%'+X; }
    case 'rate_5h_bar': return bar(rl.five_hour?.used_percentage??0, sub.bar?.width??10, ...(sub.colorize?.thresholds??[75,90]) as [number,number]);
    case 'rate_5h_resets': return resetTime(rl.five_hour?.resets_at, sub.timestamp?.format ?? 'until');
    case 'rate_7d_pct': { const p = Math.floor(rl.seven_day?.used_percentage??0); const [wa,ra] = sub.colorize?.thresholds??[75,90]; return (p>=ra?R:p>=wa?Y:G)+'7d:'+p+'%'+X; }
    case 'rate_7d_bar': return bar(rl.seven_day?.used_percentage??0, sub.bar?.width??10, ...(sub.colorize?.thresholds??[75,90]) as [number,number]);
    case 'rate_7d_resets': return resetTime(rl.seven_day?.resets_at, sub.timestamp?.format ?? 'until');

    case 'session_id': return String(d.session_id??'').slice(0, sub.truncate?.maxChars??8);
    case 'transcript_path': return truncatePath(String(d.transcript_path??''), sub.truncate?.maxChars??30, sub.truncate?.basenameOnly??true);

    default: return `<${id}>`;
  }
}

export function runPreview(selected: ParamId[], opts: ResolvedOptions): string {
  if (selected.length === 0) return '';
  const parts = selected.map((id) => evalParam(id, opts));
  const widths = selected.map((id) => PARAMS_BY_ID[id].estimateWidth(opts));
  const groups = packLines(widths, opts);
  const lines = groups.map((g) => {
    const lineParts = g.map((i) => parts[i]).filter((p) => {
      const visible = stripAnsi(p);
      return visible.length > 0;
    });
    return lineParts.join(opts.global.separator);
  });
  return lines.filter(Boolean).join('\n');
}
