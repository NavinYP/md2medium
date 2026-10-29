/**
 * Renders a Markdown table into a crisp, publication-grade 2x Retina PNG card
 * directly using HTML5 Canvas in the browser with warm book tones.
 */
export async function renderTableToPng(
  headers: string[],
  rows: string[][],
  alignments: ('left' | 'center' | 'right')[] = [],
  theme: 'light' | 'dark' = 'light'
): Promise<{ blob: Blob; blobUrl: string }> {
  const scale = 2; // 2x Retina
  const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif';
  const monoFont = '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';

  // Warm bookish styling tokens
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#231f1c' : '#fbfaf7';
  const headerBg = isDark ? '#2b2622' : '#f3ede2';
  const borderColor = isDark ? '#3d3731' : '#e6dfd3';
  const textHeaderColor = isDark ? '#f5f0e6' : '#262320';
  const textBodyColor = isDark ? '#d6cfc5' : '#44403c';
  const zebraBg = isDark ? '#27221e' : '#f8f5ee';

  // Create measurement canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const cellPaddingX = 18;
  const colCount = headers.length;

  // Font setup for measurement
  ctx.font = `600 13.5px ${fontFamily}`;
  const colWidths: number[] = new Array(colCount).fill(0);

  for (let c = 0; c < colCount; c++) {
    const headerText = (headers[c] || '').trim();
    const hWidth = ctx.measureText(headerText).width + cellPaddingX * 2;
    colWidths[c] = Math.max(colWidths[c], hWidth);

    ctx.font = `400 13px ${monoFont}`;
    for (let r = 0; r < rows.length; r++) {
      const cellText = (rows[r][c] || '').trim();
      const cWidth = ctx.measureText(cellText).width + cellPaddingX * 2;
      colWidths[c] = Math.max(colWidths[c], cWidth);
    }
    colWidths[c] = Math.max(colWidths[c], 85);
  }

  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const headerHeight = 42;
  const rowHeight = 38;
  const tableHeight = headerHeight + rows.length * rowHeight;
  const margin = 14;
  const canvasWidth = tableWidth + margin * 2;
  const canvasHeight = tableHeight + margin * 2;

  // Resize canvas for 2x Retina
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = isDark ? '#1a1816' : '#f4efe6';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Table Card Box (with rounded corners)
  const cardX = margin;
  const cardY = margin;
  const radius = 8;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, tableWidth, tableHeight, radius);
  ctx.clip();

  // Card background
  ctx.fillStyle = bgColor;
  ctx.fillRect(cardX, cardY, tableWidth, tableHeight);

  // Header background
  ctx.fillStyle = headerBg;
  ctx.fillRect(cardX, cardY, tableWidth, headerHeight);

  // Header Bottom Border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX, cardY + headerHeight);
  ctx.lineTo(cardX + tableWidth, cardY + headerHeight);
  ctx.stroke();

  // Draw Header Text
  ctx.font = `600 13px ${fontFamily}`;
  ctx.fillStyle = textHeaderColor;
  ctx.textBaseline = 'middle';

  let currentX = cardX;
  for (let c = 0; c < colCount; c++) {
    const text = (headers[c] || '').trim();
    const align = alignments[c] || 'left';
    const colW = colWidths[c];
    let textX = currentX + cellPaddingX;

    if (align === 'right') {
      textX = currentX + colW - cellPaddingX;
      ctx.textAlign = 'right';
    } else if (align === 'center') {
      textX = currentX + colW / 2;
      ctx.textAlign = 'center';
    } else {
      ctx.textAlign = 'left';
    }

    ctx.fillText(text, textX, cardY + headerHeight / 2);
    currentX += colW;
  }

  // Draw Body Rows
  for (let r = 0; r < rows.length; r++) {
    const rowY = cardY + headerHeight + r * rowHeight;

    // Zebra striping
    if (r % 2 === 1) {
      ctx.fillStyle = zebraBg;
      ctx.fillRect(cardX, rowY, tableWidth, rowHeight);
    }

    // Row bottom border
    if (r < rows.length - 1) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX, rowY + rowHeight);
      ctx.lineTo(cardX + tableWidth, rowY + rowHeight);
      ctx.stroke();
    }

    // Row text
    ctx.font = `400 12.5px ${monoFont}`;
    ctx.fillStyle = textBodyColor;
    ctx.textBaseline = 'middle';

    let rowX = cardX;
    for (let c = 0; c < colCount; c++) {
      const cellText = (rows[r][c] || '').trim();
      const align = alignments[c] || 'left';
      const colW = colWidths[c];
      let textX = rowX + cellPaddingX;

      if (align === 'right') {
        textX = rowX + colW - cellPaddingX;
        ctx.textAlign = 'right';
      } else if (align === 'center') {
        textX = rowX + colW / 2;
        ctx.textAlign = 'center';
      } else {
        ctx.textAlign = 'left';
      }

      ctx.fillText(cellText, textX, rowY + rowHeight / 2);
      rowX += colW;
    }
  }

  // Card border outline
  ctx.restore();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, tableWidth, tableHeight, radius);
  ctx.stroke();

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Failed to generate PNG blob from canvas'));
        return;
      }
      const blobUrl = URL.createObjectURL(blob);
      resolve({ blob, blobUrl });
    }, 'image/png');
  });
}
