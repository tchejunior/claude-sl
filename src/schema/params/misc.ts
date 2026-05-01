import type { ParamDef, ResolvedOptions, CodeFragment } from '../types';
import { RJ } from '../../codegen/renderJs';
import { stubFragment } from '../stubRender';

function rw(jsFn: (o: ResolvedOptions) => CodeFragment, id: string): import('../types').ParamDef['render'] {
  return {
    js: jsFn,
    py: () => stubFragment(id),
    ps: () => stubFragment(id),
    sh: () => stubFragment(id),
  };
}

const wTruncate = (defaultMax: number) => (opts: ResolvedOptions) =>
  (opts.sub.truncate?.maxChars ?? defaultMax) + 2;

export const MISC_PARAMS: ParamDef[] = [
  { id: 'session_id', label: 'Session id', group: 'misc',
    jsonPath: 'session_id',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 8, basenameOnly: false }],
    estimateWidth: wTruncate(8), render: rw(RJ.sessionId, 'session_id') },
  { id: 'transcript_path', label: 'Transcript path', group: 'misc',
    jsonPath: 'transcript_path',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 30, basenameOnly: true }],
    estimateWidth: wTruncate(30), render: rw(RJ.transcriptPath, 'transcript_path') },
];
