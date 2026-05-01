import { describe, it, expect } from 'vitest';
import { visibleWidth, EMOJI_WIDTH, stripAnsi } from './helpers';

describe('visibleWidth', () => {
  it('returns char count for plain ASCII', () => {
    expect(visibleWidth('hello')).toBe(5);
  });
  it('counts emojis as EMOJI_WIDTH cells', () => {
    expect(visibleWidth('📁')).toBe(EMOJI_WIDTH);
    expect(visibleWidth('📁 dir')).toBe(EMOJI_WIDTH + 4);
  });
  it('strips ANSI CSI sequences', () => {
    expect(visibleWidth('\x1b[32mhi\x1b[0m')).toBe(2);
  });
  it('strips OSC 8 wrappers', () => {
    expect(visibleWidth('\x1b]8;;https://x\x07X\x1b]8;;\x07')).toBe(1);
  });
});
