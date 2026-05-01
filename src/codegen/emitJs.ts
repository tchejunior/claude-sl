import type { ParamId, ResolvedOptions } from '../schema/types';
import { PARAMS_BY_ID } from '../schema/params';
import { JS_HELPERS } from './runtimes/js';
import { packLines } from './pack';
import { collectHelpers } from './fragment';

export function emitJs(selected: ParamId[], opts: ResolvedOptions): string {
  const fragments = selected.map((id) => PARAMS_BY_ID[id].render.js(opts));
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
      const parts = g.map((idx) => fragments[idx].expr).join(', ');
      return `    console.log(__pack([${parts}], ${JSON.stringify(opts.global.separator)}, ${opts.global.lineLength}, ${opts.global.hardLimit}, ${opts.global.tolerancePct}));`;
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
