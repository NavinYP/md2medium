/**
 * Formats table headers and rows into clean, aligned ASCII monospace text
 * that pastes natively into Medium, Substack, GitHub, or any text editor.
 */
export function generateAsciiTable(
  headers: string[],
  rows: string[][],
  alignments: ('left' | 'center' | 'right')[] = []
): string {
  if (headers.length === 0) return '';

  const colCount = headers.length;
  const colWidths: number[] = new Array(colCount).fill(0);

  // Compute maximum width for each column
  for (let c = 0; c < colCount; c++) {
    colWidths[c] = Math.max(colWidths[c], (headers[c] || '').trim().length);
    for (let r = 0; r < rows.length; r++) {
      const cell = (rows[r][c] || '').trim();
      colWidths[c] = Math.max(colWidths[c], cell.length);
    }
    // Minimum column width of 3
    colWidths[c] = Math.max(colWidths[c], 3);
  }

  function padCell(text: string, width: number, align: 'left' | 'center' | 'right'): string {
    const trimmed = text.trim();
    const diff = width - trimmed.length;
    if (diff <= 0) return trimmed;

    if (align === 'right') {
      return ' '.repeat(diff) + trimmed;
    } else if (align === 'center') {
      const left = Math.floor(diff / 2);
      const right = diff - left;
      return ' '.repeat(left) + trimmed + ' '.repeat(right);
    } else {
      // Default left align
      return trimmed + ' '.repeat(diff);
    }
  }

  function makeBorder(char: '-' | '=' = '-'): string {
    return '+' + colWidths.map(w => char.repeat(w + 2)).join('+') + '+';
  }

  const lines: string[] = [];

  // Top border
  lines.push(makeBorder('-'));

  // Header row
  const headerRow = '|' + headers.map((h, i) => {
    const align = alignments[i] || 'left';
    return ' ' + padCell(h, colWidths[i], align) + ' ';
  }).join('|') + '|';
  lines.push(headerRow);

  // Header separator
  lines.push(makeBorder('='));

  // Body rows
  for (const row of rows) {
    const rowStr = '|' + colWidths.map((w, i) => {
      const cell = row[i] || '';
      const align = alignments[i] || 'left';
      return ' ' + padCell(cell, w, align) + ' ';
    }).join('|') + '|';
    lines.push(rowStr);
  }

  // Bottom border
  lines.push(makeBorder('-'));

  return lines.join('\n');
}
