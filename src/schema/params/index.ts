import type { ParamDef, ParamId } from '../types';
import { IDENTITY_PARAMS } from './identity';

export const PARAMS: ParamDef[] = [...IDENTITY_PARAMS];

export const PARAMS_BY_ID = Object.fromEntries(
  PARAMS.map((p) => [p.id, p]),
) as Partial<Record<ParamId, ParamDef>>;
