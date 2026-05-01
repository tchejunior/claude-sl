import type { ParamId, ResolvedOptions } from '../schema/types';
import { PARAMS_BY_ID } from '../schema/params';
import { SH_HELPERS } from './runtimes/sh';
import { packLines } from './pack';
import { collectHelpers } from './fragment';

export function emitBash(selected: ParamId[], opts: ResolvedOptions): string {
  const fragments = selected.map((id) => PARAMS_BY_ID[id].render.sh(opts));
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
