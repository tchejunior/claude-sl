import type { ParamDef, ParamId } from '../types';
import { IDENTITY_PARAMS } from './identity';
import { WORKSPACE_PARAMS } from './workspace';
import { GIT_PARAMS } from './git';
import { CONTEXT_PARAMS } from './context';

export const PARAMS: ParamDef[] = [...IDENTITY_PARAMS, ...WORKSPACE_PARAMS, ...GIT_PARAMS, ...CONTEXT_PARAMS];

export const PARAMS_BY_ID = Object.fromEntries(
  PARAMS.map((p) => [p.id, p]),
) as Partial<Record<ParamId, ParamDef>>;
