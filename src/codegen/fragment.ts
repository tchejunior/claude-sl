import type { CodeFragment } from '../schema/types';

export function collectHelpers(fragments: CodeFragment[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const f of fragments) {
    for (const h of f.helpers) {
      if (!seen.has(h)) { seen.add(h); out.push(h); }
    }
  }
  return out;
}
