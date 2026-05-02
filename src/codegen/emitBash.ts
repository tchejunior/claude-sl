import type { ParamId, ResolvedOptions } from '../schema/types';
import { PARAMS_BY_ID } from '../schema/params';
import { SH_HELPERS } from './runtimes/sh';
import { packLines } from './pack';
import { collectHelpers } from './fragment';

// Category A params (thinking, agent) handle emoji inside renderSh.ts directly.
const CATEGORY_A: ReadonlySet<ParamId> = new Set(['thinking', 'agent'] as ParamId[]);

function bashWithEmoji(emoji: string, expr: string): string {
  const inner = expr.startsWith('"') && expr.endsWith('"') ? expr.slice(1, -1) : expr;
  const simpleVar = inner.match(/^\$\{([^:}=?+#%/]+)\}$/);
  if (simpleVar) {
    const v = simpleVar[1];
    return `"\${${v}:+${emoji} \${${v}}}"`;
  }
  const capture = (inner.startsWith('$(') || inner.startsWith('${')) ? `_EV=${inner}` : `_EV=$(${inner})`;
  return `"$(${capture}; printf '%s' "\${_EV:+${emoji} }\${_EV}")"`;
}

export function emitBash(selected: ParamId[], opts: ResolvedOptions): string {
  const fragments = selected.map((id) => {
    const frag = PARAMS_BY_ID[id].render.sh(opts);
    if (!opts.global.useEmojis || CATEGORY_A.has(id)) return frag;
    const emoji = PARAMS_BY_ID[id].emoji;
    if (!emoji) return frag;
    return { ...frag, expr: bashWithEmoji(emoji, frag.expr) };
  });
  const widths = selected.map((id) => PARAMS_BY_ID[id].estimateWidth(opts));
  const lineGroups = packLines(widths, opts);
  const rawHelpers = collectHelpers(fragments);
  const helperIds = ['__stripAnsi', '__pack', ...rawHelpers].filter(
    (h, i, a) => a.indexOf(h) === i,
  );
  const helperBlock = helperIds.map((h) => SH_HELPERS[h] ?? '').join('\n');
  const extracts = Array.from(
    new Set(fragments.map((f) => f.extract).filter(Boolean) as string[]),
  ).join('\n');

  const lines = lineGroups
    .map((g) => {
      const parts = g.map((idx) => fragments[idx].expr).join(' ');
      return `__pack ${JSON.stringify(opts.global.separator)} ${opts.global.lineLength} ${opts.global.hardLimit ? 'true' : 'false'} ${opts.global.tolerancePct} ${parts}`;
    })
    .join('\n');

  return `#!/bin/bash
# Requires: jq
input=$(cat)
${helperBlock}
${extracts}
${lines}
`;
}
