import type { ParamDef, ResolvedOptions } from '../types';
import { stubRender } from '../stubRender';

const wTruncate = (defaultMax: number) => (opts: ResolvedOptions) =>
  (opts.sub.truncate?.maxChars ?? defaultMax) + 2;

export const MISC_PARAMS: ParamDef[] = [
  { id: 'session_id', label: 'Session id', group: 'misc',
    jsonPath: 'session_id',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 8, basenameOnly: false }],
    estimateWidth: wTruncate(8), render: stubRender('session_id') },
  { id: 'transcript_path', label: 'Transcript path', group: 'misc',
    jsonPath: 'transcript_path',
    subOptions: [{ kind: 'truncate', defaultMaxChars: 30, basenameOnly: true }],
    estimateWidth: wTruncate(30), render: stubRender('transcript_path') },
];
