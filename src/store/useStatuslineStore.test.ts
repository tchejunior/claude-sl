import { describe, it, expect, beforeEach } from 'vitest';
import { useStatuslineStore } from './useStatuslineStore';

beforeEach(() => useStatuslineStore.setState({ selected: [], subByParam: {} }));

describe('useStatuslineStore', () => {
  it('toggles a param and tracks order', () => {
    const s = useStatuslineStore.getState();
    s.toggleParam('model_display');
    s.toggleParam('cwd');
    expect(useStatuslineStore.getState().selected).toEqual(['model_display', 'cwd']);
    s.toggleParam('model_display');
    expect(useStatuslineStore.getState().selected).toEqual(['cwd']);
  });
});
