import type { ParamDef, ParamId } from '../types';
import { IDENTITY_PARAMS } from './identity';
import { WORKSPACE_PARAMS } from './workspace';
import { GIT_PARAMS } from './git';

export const PARAMS: ParamDef[] = [...IDENTITY_PARAMS, ...WORKSPACE_PARAMS, ...GIT_PARAMS];

export const PARAMS_BY_ID = Object.fromEntries(
  PARAMS.map((p) => [p.id, p]),
) as Partial<Record<ParamId, ParamDef>>;
