import type { ParamId, ResolvedOptions } from '../schema/types';
import { PARAMS_BY_ID } from '../schema/params';
import { JS_HELPERS } from './runtimes/js';
import { packLines } from './pack';
import { collectHelpers } from './fragment';

// Category A params (thinking, agent) handle emoji inside renderJs.ts directly.
const CATEGORY_A: ReadonlySet<ParamId> = new Set(['thinking', 'agent'] as ParamId[]);

function jsWithEmoji(emoji: string, expr: string): string {
  return `((_v) => _v ? '${emoji} '+_v : '')(${expr})`;
}

export function emitJs(selected: ParamId[], opts: ResolvedOptions): string {
  const fragments = selected.map((id) => {
    const frag = PARAMS_BY_ID[id].render.js(opts);
    if (!opts.global.useEmojis || CATEGORY_A.has(id)) return frag;
    const emoji = PARAMS_BY_ID[id].emoji;
    if (!emoji) return frag;
    return { ...frag, expr: jsWithEmoji(emoji, frag.expr) };
  });
  const widths = selected.map((id) => PARAMS_BY_ID[id].estimateWidth(opts));
  const lineGroups = packLines(widths, opts);
  const rawHelpers = collectHelpers(fragments);
  const helperIds = ['__stripAnsi', '__pack', ...rawHelpers].filter(
    (h, i, a) => a.indexOf(h) === i,
  );
  const helperBlock = helperIds.map((h) => JS_HELPERS[h] ?? '').join('\n    ');

  const needsGit = rawHelpers.includes('__git');
  const gitBlock = needsGit
    ? opts.global.cacheGit
      ? `    const __GIT = __cacheGit(d.session_id ?? 'default', ${opts.global.cacheStalenessSec}, __runGit);\n`
      : `    const __GIT = __runGit();\n`
    : '';

  const linesCode = lineGroups
    .map((g) => {
      const inner = g.map((idx) => '      ' + fragments[idx].expr).join(',\n');
      return `    console.log(__pack([\n${inner},\n    ], ${JSON.stringify(opts.global.separator)}, ${opts.global.lineLength}, ${opts.global.hardLimit}, ${opts.global.tolerancePct}));`;
    })
    .join('\n');

  return `#!/usr/bin/env node
let input = '';
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  try {
    const d = JSON.parse(input);
    ${helperBlock}
${gitBlock}${linesCode}
  } catch (_e) {
    console.log('[?]');
  }
});
`;
}
