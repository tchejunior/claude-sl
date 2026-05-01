export const EMOJI_WIDTH = 2;

const ANSI_CSI = /\x1b\[[0-9;]*m/g;
const ANSI_OSC8 = /\x1b\]8;;[^\x07]*\x07/g;
const EMOJI_RE = /\p{Extended_Pictographic}/gu;

export function stripAnsi(s: string): string {
  return s.replace(ANSI_CSI, '').replace(ANSI_OSC8, '');
}

export function visibleWidth(s: string): number {
  const stripped = stripAnsi(s);
  const emojiCount = (stripped.match(EMOJI_RE) || []).length;
  return stripped.replace(EMOJI_RE, '').length + emojiCount * EMOJI_WIDTH;
}
