import { create } from 'zustand';
import type { ParamId, GlobalOptions, ResolvedSubOptions } from '../schema/types';

interface State {
  selected: ParamId[];
  global: GlobalOptions;
  subByParam: Record<string, ResolvedSubOptions>;
  os: 'mac' | 'linux' | 'win';
  format: 'sh' | 'py' | 'js' | 'ps';

  toggleParam(id: ParamId): void;
  reorder(from: number, to: number): void;
  setGlobal<K extends keyof GlobalOptions>(k: K, v: GlobalOptions[K]): void;
  setSub(id: ParamId, sub: Partial<ResolvedSubOptions>): void;
  setOs(os: State['os']): void;
  setFormat(f: State['format']): void;
}

const DEFAULT_GLOBAL: GlobalOptions = {
  lineLength: 100, separator: ' | ', useEmojis: true, hardLimit: false,
  tolerancePct: 10, padding: 0, refreshInterval: null,
  hideVimModeIndicator: false, cacheGit: true, cacheStalenessSec: 5,
};

export const useStatuslineStore = create<State>((set) => ({
  selected: [],
  global: DEFAULT_GLOBAL,
  subByParam: {},
  os: 'mac',
  format: 'sh',

  toggleParam: (id) => set((s) => ({
    selected: s.selected.includes(id) ? s.selected.filter((x) => x !== id) : [...s.selected, id],
  })),
  reorder: (from, to) => set((s) => {
    const next = [...s.selected];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    return { selected: next };
  }),
  setGlobal: (k, v) => set((s) => ({ global: { ...s.global, [k]: v } })),
  setSub: (id, sub) => set((s) => ({
    subByParam: { ...s.subByParam, [id]: { ...s.subByParam[id], ...sub } },
  })),
  setOs: (os) => set({ os }),
  setFormat: (format) => set({ format }),
}));
