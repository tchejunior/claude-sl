import type { ParamId, ResolvedOptions } from '../schema/types';
import { PARAMS_BY_ID } from '../schema/params';
import { PY_HELPERS } from './runtimes/py';
import { packLines } from './pack';
import { collectHelpers } from './fragment';

export function emitPython(selected: ParamId[], opts: ResolvedOptions): string {
  const fragments = selected.map((id) => PARAMS_BY_ID[id].render.py(opts));
  const widths = selected.map((id) => PARAMS_BY_ID[id].estimateWidth(opts));
  const lineGroups = packLines(widths, opts);
  const rawHelpers = collectHelpers(fragments);
  const helperIds = ['__stripAnsi', '__pack', ...rawHelpers].filter(
    (h, i, a) => a.indexOf(h) === i,
  );
  const helperBlock = helperIds.map((h) => PY_HELPERS[h] ?? '').join('\n');

  const needsGit = rawHelpers.includes('__git');
  const gitBlock = needsGit
    ? opts.global.cacheGit
      ? `        __GIT = __cache_git(d.get('session_id','default'), ${opts.global.cacheStalenessSec}, __run_git)\n`
      : `        __GIT = __run_git()\n`
    : '';

  const lines = lineGroups
    .map((g) => {
      const inner = g.map((idx) => '            ' + fragments[idx].expr).join(',\n');
      return `        print(__pack([\n${inner},\n        ], ${JSON.stringify(opts.global.separator)}, ${opts.global.lineLength}, ${opts.global.hardLimit ? 'True' : 'False'}, ${opts.global.tolerancePct}))`;
    })
    .join('\n');

  return `#!/usr/bin/env python3
import json, sys

${helperBlock}

def main():
    try:
        d = json.load(sys.stdin)
${gitBlock}${lines}
    except Exception:
        print('[?]')

if __name__ == '__main__':
    main()
`;
}
