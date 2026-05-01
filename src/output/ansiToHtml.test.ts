import { describe, it, expect } from 'vitest';
import { ansiToHtml } from './ansiToHtml';

describe('ansiToHtml', () => {
  it('returns plain text unchanged (escaped)', () => {
    expect(ansiToHtml('hello')).toBe('hello');
  });
  it('wraps colored runs in spans', () => {
    expect(ansiToHtml('\x1b[32mok\x1b[0m')).toContain('color:#5af78e');
    expect(ansiToHtml('\x1b[32mok\x1b[0m')).toContain('ok</span>');
  });
  it('renders OSC 8 hyperlinks', () => {
    const html = ansiToHtml('\x1b]8;;https://example.com\x07click\x1b]8;;\x07');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('>click<');
  });
  it('escapes HTML special chars', () => {
    expect(ansiToHtml('<b>')).toBe('&lt;b&gt;');
  });
});
