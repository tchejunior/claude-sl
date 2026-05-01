const COLORS: Record<string, string> = {
  '30': '#000000', '31': '#ff5c57', '32': '#5af78e', '33': '#f3f99d',
  '34': '#57c7ff', '35': '#ff6ac1', '36': '#9aedfe', '37': '#f1f1f0',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

interface LinkSlot { url: string; text: string; }

export function ansiToHtml(input: string): string {
  const slots: LinkSlot[] = [];
  const linkRe = /\x1b\]8;;([^\x07]*)\x07([^\x1b]*)\x1b\]8;;\x07/g;
  const withSlots = input.replace(linkRe, (_m, url, text) => {
    slots.push({ url, text });
    return `\x00SLOT${slots.length - 1}\x00`;
  });

  const csi = /\x1b\[([0-9;]*)m/g;
  let result = '';
  let cursor = 0;
  let openSpan = false;
  let m: RegExpExecArray | null;
  while ((m = csi.exec(withSlots))) {
    result += escapeHtml(withSlots.slice(cursor, m.index));
    cursor = m.index + m[0].length;
    const codes = m[1].split(';').filter(Boolean);
    if (codes.length === 0 || codes.includes('0')) {
      if (openSpan) { result += '</span>'; openSpan = false; }
      continue;
    }
    const color = codes.map((c) => COLORS[c]).find(Boolean);
    if (color) {
      if (openSpan) result += '</span>';
      result += `<span style="color:${color}">`;
      openSpan = true;
    }
  }
  result += escapeHtml(withSlots.slice(cursor));
  if (openSpan) result += '</span>';

  result = result.replace(/\x00SLOT(\d+)\x00/g, (_m, idxStr) => {
    const slot = slots[Number(idxStr)];
    return `<a href="${escapeHtml(slot.url)}" target="_blank" rel="noopener">${escapeHtml(slot.text)}</a>`;
  });

  return result;
}
