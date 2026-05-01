import type { ParamDef, ParamId } from '../types';
import { IDENTITY_PARAMS } from './identity';
import { WORKSPACE_PARAMS } from './workspace';
import { GIT_PARAMS } from './git';
import { CONTEXT_PARAMS } from './context';
import { COST_PARAMS } from './cost';
import { RATE_LIMITS_PARAMS } from './rateLimits';
import { MISC_PARAMS } from './misc';

export const PARAMS: ParamDef[] = [
  ...IDENTITY_PARAMS, ...WORKSPACE_PARAMS, ...GIT_PARAMS,
  ...CONTEXT_PARAMS, ...COST_PARAMS, ...RATE_LIMITS_PARAMS, ...MISC_PARAMS,
];

export const PARAMS_BY_ID = Object.fromEntries(
  PARAMS.map((p) => [p.id, p]),
) as Record<ParamId, ParamDef>;
