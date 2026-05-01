import type { ParamId, ResolvedOptions } from '../schema/types';
import { PARAMS_BY_ID } from '../schema/params';
import { PS_HELPERS } from './runtimes/ps';
import { packLines } from './pack';
import { collectHelpers } from './fragment';

export function emitPowershell(selected: ParamId[], opts: ResolvedOptions): string {
  const fragments = selected.map((id) => PARAMS_BY_ID[id].render.ps(opts));
  const widths = selected.map((id) => PARAMS_BY_ID[id].estimateWidth(opts));
  const lineGroups = packLines(widths, opts);
  const rawHelpers = collectHelpers(fragments);
  const helperIds = ['Strip-Ansi', '__pack', ...rawHelpers].filter(
    (h, i, a) => a.indexOf(h) === i,
  );
  const helperBlock = helperIds.map((h) => PS_HELPERS[h] ?? '').join('\n');
  const extracts = Array.from(
    new Set(fragments.map((f) => f.extract).filter(Boolean) as string[]),
  ).join('\n');

  const lines = lineGroups
    .map((g) => {
      const parts = g.map((idx) => fragments[idx].expr).join(', ');
      return `    Write-Host (__Pack @(${parts}) ${JSON.stringify(opts.global.separator)} ${opts.global.lineLength} $${opts.global.hardLimit} ${opts.global.tolerancePct})`;
    })
    .join('\n');

  return `$ErrorActionPreference = 'Continue'
try {
    $d = $input | Out-String | ConvertFrom-Json
${helperBlock}
${extracts}
${lines}
} catch {
    Write-Host '[?]'
}
`;
}
