import type { ResolvedOptions } from '../schema/types';

export function packLines(widths: number[], opts: ResolvedOptions): number[][] {
  const { lineLength, separator, hardLimit, tolerancePct } = opts.global;
  const sepW = separator.length;
  const limit = hardLimit ? lineLength : lineLength * (1 + tolerancePct / 100);

  const lines: number[][] = [[]];
  let running = 0;
  widths.forEach((wi, i) => {
    const cur = lines[lines.length - 1];
    const addCost = cur.length > 0 ? sepW + wi : wi;
    const checkCost = hardLimit ? addCost : wi;
    if (cur.length > 0 && running + checkCost > limit) {
      lines.push([i]); running = wi;
    } else {
      cur.push(i); running += addCost;
    }
  });
  return lines.filter((l) => l.length > 0);
}
