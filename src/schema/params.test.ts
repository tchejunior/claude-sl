import { describe, it, expect } from 'vitest';
import { PARAMS, PARAMS_BY_ID } from './params';

describe('PARAMS', () => {
  it('has unique ids', () => {
    const ids = PARAMS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every param exposes render functions for all four languages', () => {
    for (const p of PARAMS) {
      expect(p.render.js).toBeTypeOf('function');
      expect(p.render.py).toBeTypeOf('function');
      expect(p.render.ps).toBeTypeOf('function');
      expect(p.render.sh).toBeTypeOf('function');
    }
  });
  it('PARAMS_BY_ID is a valid lookup', () => {
    expect(PARAMS_BY_ID['model_display']?.label).toBeTruthy();
  });
  it('every ParamId has an entry', () => {
    expect(Object.keys(PARAMS_BY_ID).length).toBe(PARAMS.length);
  });
});
