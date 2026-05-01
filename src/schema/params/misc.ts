import type { ParamDef, ResolvedOptions } from '../types';
import { RJ } from '../../codegen/renderJs';
import { RPY } from '../../codegen/renderPy';
import { RSH } from '../../codegen/renderSh';
import { RPS } from '../../codegen/renderPs';
import { stubFragment } from '../stubRender';

function rw(key: string, id: string): import('../types').ParamDef['render'] {
  return {
    js: RJ[key] ?? (() => stubFragment(id)),
    py: RPY[key] ?? (() => stubFragment(id)),
    sh: RSH[key] ?? (() => stubFragment(id)),
    ps: RPS[key] ?? (() => stubFragment(id)),
  };
}

const wTruncate = (defaultMax: number) => (opts: ResolvedOptions) =>
  (opts.sub.truncate?.maxChars ?? defaultMax) + 2;

export const MISC_PARAMS: ParamDef[] = [
  { id: 'session_id', label: 'Session id', group: 'misc',
    jsonPath: 'session_id',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 8, basenameOnly: false }],
    estimateWidth: wTruncate(8), render: rw('sessionId', 'session_id') },
  { id: 'transcript_path', label: 'Transcript path', group: 'misc',
    jsonPath: 'transcript_path',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 30, basenameOnly: true }],
    estimateWidth: wTruncate(30), render: rw('transcriptPath', 'transcript_path') },
];
