import type { CodeFragment, RenderFn, Lang } from './types';

export function stubFragment(id: string): CodeFragment {
  return { helpers: [], expr: JSON.stringify(`<${id}>`) };
}

export function stubRender(id: string): Record<Lang, RenderFn> {
  return {
    js: () => stubFragment(id),
    py: () => stubFragment(id),
    ps: () => stubFragment(id),
    sh: () => stubFragment(id),
  };
}
