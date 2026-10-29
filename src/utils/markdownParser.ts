import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { FigureItem, TableItem, PublishSettings, ParsedArticle } from '../types';
import { generateAsciiTable } from './asciiTable';
import { AssetStore } from './assetStore';

/**
 * Parses markdown pipe tables into structured TableItem objects.
 */
function parseTableBlock(tableMd: string, index: number, globalMode: 'ascii' | 'png' | 'html'): TableItem | null {
  const lines = tableMd.trim().split('\n').map(l => l.trim()).filter(l => l.startsWith('|') && l.endsWith('|'));
  if (lines.length < 2) return null;

  const parseCells = (line: string) => {
    return line
      .slice(1, -1) // remove leading and trailing |
      .split('|')
      .map(cell => cell.trim());
  };

  const headers = parseCells(lines[0]);
  const separatorLine = lines[1];
  const sepCells = parseCells(separatorLine);

  // Parse alignments (:---, :---:, ---:)
  const alignments: ('left' | 'center' | 'right')[] = sepCells.map(cell => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });

  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    rows.push(parseCells(lines[i]));
  }

  return {
    id: `table-${index}`,
    index,
    rawMarkdown: tableMd,
    headers,
    rows,
    alignments,
    mode: globalMode,
  };
}

/**
 * Main parser converting markdown text into preview HTML, clipboard HTML,
 * figures list, and tables list.
 */
export function parseArticleMarkdown(
  markdown: string,
  settings: PublishSettings,
  assetStore: AssetStore,
  tableStateMap: Record<string, { mode: 'ascii' | 'png' | 'html'; pngBlobUrl?: string; pngBlob?: Blob }> = {}
): ParsedArticle {
  const lines = markdown.split('\n');
  let title = 'Untitled Article';
  let subtitle: string | undefined = undefined;

  // Extract H1 title and H2 subtitle if at the top
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('# ') && title === 'Untitled Article') {
      title = trimmed.replace(/^#\s+/, '').trim();
    } else if (trimmed.startsWith('## ') && !subtitle) {
      subtitle = trimmed.replace(/^##\s+/, '').trim();
    }
  }

  // 1. First pass: Detect and extract markdown tables
  const tableRegex = /((?:\|[^\n]+\|\r?\n){2,})/g;
  const rawTables: { match: string; table: TableItem }[] = [];
  let tableIdx = 0;
  let tMatch: RegExpExecArray | null;

  while ((tMatch = tableRegex.exec(markdown)) !== null) {
    const parsed = parseTableBlock(tMatch[0], tableIdx, settings.tableModeGlobal);
    if (parsed) {
      // Restore persisted mode or blob if available
      const existing = tableStateMap[parsed.id];
      if (existing) {
        parsed.mode = existing.mode;
        parsed.pngBlobUrl = existing.pngBlobUrl;
        parsed.pngBlob = existing.pngBlob;
      }
      rawTables.push({ match: tMatch[0], table: parsed });
      tableIdx++;
    }
  }

  // 2. Second pass: Detect images and adjacent captions
  // Matches: ![alt](src) followed optionally by an italic caption on the next line (*...* or _..._)
  const imgWithCaptionRegex = /!\[([^\]]*)\]\(([^)]+)\)(?:\r?\n\s*(\*|_)([^*_]+)\3)?/g;
  const figures: FigureItem[] = [];
  let figIdx = 0;

  // Temporary markdown with table and image tokens replaced
  let processedMarkdown = markdown;

  // Replace images with markers
  processedMarkdown = processedMarkdown.replace(imgWithCaptionRegex, (_match, alt, src, _mark, captionText) => {
    const rawSrc = (src || '').trim();
    const cleanAlt = (alt || '').trim();
    const cleanCap = (captionText || '').trim();
    const filename = rawSrc.split('/').pop() || rawSrc;

    // Look up local asset
    const asset = assetStore.findAsset(rawSrc);

    const fig: FigureItem = {
      id: `fig-${figIdx}`,
      index: figIdx,
      slotNumber: figIdx + 1,
      alt: cleanAlt || filename,
      src: rawSrc,
      filename,
      caption: cleanCap,
      blobUrl: asset?.blobUrl,
      blob: asset?.blob,
      isTable: false,
      isDone: false,
    };

    figures.push(fig);
    const marker = `%%FIGURE_SLOT_${figIdx}%%`;
    figIdx++;
    return marker;
  });

  // Replace tables with markers
  rawTables.forEach(({ match, table }) => {
    const marker = `%%TABLE_SLOT_${table.index}%%`;
    processedMarkdown = processedMarkdown.replace(match, marker);
  });

  // Also if any table is in 'png' mode, register it as a FigureItem!
  rawTables.forEach(({ table }) => {
    if (table.mode === 'png') {
      const slotNum = figures.length + 1;
      const tableFilename = `table-${table.index + 1}.png`;
      const figTable: FigureItem = {
        id: `fig-table-${table.index}`,
        index: figures.length,
        slotNumber: slotNum,
        alt: `Table ${table.index + 1}: ${table.headers.join(', ')}`,
        src: tableFilename,
        filename: tableFilename,
        caption: `Table ${table.index + 1}. ${table.headers.slice(0, 3).join(' / ')}`,
        blobUrl: table.pngBlobUrl,
        blob: table.pngBlob,
        isTable: true,
        tableId: table.id,
        isDone: false,
      };
      figures.push(figTable);
    }
  });

  // 3. Render base HTML via marked
  const rawHtml = marked.parse(processedMarkdown, { gfm: true, breaks: true }) as string;

  // 4. Transform markers into Preview HTML and Clipboard HTML
  let previewHtml = rawHtml;
  let clipboardHtml = rawHtml;

  // Replace image markers
  figures.filter(f => !f.isTable).forEach((fig) => {
    const marker = `%%FIGURE_SLOT_${fig.index}%%`;
    const totalFigs = figures.length;

    // Preview slot UI with warm, quiet styling
    const previewSlot = `
      <div class="my-7 p-3.5 rounded-lg border border-dashed border-[#b45309]/50 bg-[#26201b] text-[#ede8df] transition-all hover:border-[#d97706]" id="fig-slot-${fig.index}" data-fig="${fig.index}">
        <div class="flex items-center justify-between gap-2 font-sans text-xs font-medium mb-1">
          <span class="flex items-center gap-1.5">
            <span class="px-1.5 py-0.5 rounded bg-[#3b2b1e] text-[#fde68a] text-[10px] font-mono font-bold">SLOT ${fig.slotNumber}/${totalFigs}</span>
            <span class="font-mono text-[11px] text-[#d6cfc5]">${fig.filename}</span>
          </span>
          ${fig.blobUrl ? `<span class="text-[11px] text-[#86efac]">✓ Attached</span>` : `<span class="text-[11px] text-[#a89f91]">Drop file to attach</span>`}
        </div>
        ${fig.blobUrl ? `<div class="my-2 max-h-52 flex justify-center"><img src="${fig.blobUrl}" alt="${fig.alt}" class="max-h-48 object-contain rounded border border-[#3d342c]" /></div>` : ''}
        ${fig.caption ? `<div class="text-[12px] italic text-[#a89f91] mt-1.5 font-serif">${fig.caption}</div>` : ''}
      </div>
    `;

    // Medium-compliant clean clipboard HTML
    let clipSlot = `<p><strong>[DROP IMAGE ${fig.slotNumber}/${totalFigs}: ${fig.filename}]</strong></p>`;
    if (settings.captionMode === 'inline' && fig.caption) {
      clipSlot = `<p><strong>[DROP IMAGE ${fig.slotNumber}/${totalFigs}: ${fig.filename}]</strong><br><em>${fig.caption}</em></p>`;
    }

    previewHtml = previewHtml.replace(new RegExp(`<p>\\s*${marker}\\s*<\\/p>|${marker}`, 'g'), previewSlot);
    clipboardHtml = clipboardHtml.replace(new RegExp(`<p>\\s*${marker}\\s*<\\/p>|${marker}`, 'g'), clipSlot);
  });

  // Replace table markers
  rawTables.forEach(({ table }) => {
    const marker = `%%TABLE_SLOT_${table.index}%%`;

    let tablePreview = '';
    let tableClipboard = '';

    if (table.mode === 'ascii') {
      const ascii = generateAsciiTable(table.headers, table.rows, table.alignments);
      tablePreview = `<pre class="my-6"><code>${escapeHtml(ascii)}</code></pre>`;
      tableClipboard = `<pre><code>${escapeHtml(ascii)}</code></pre>`;
    } else if (table.mode === 'png') {
      const tableFilename = `table-${table.index + 1}.png`;
      tablePreview = `
        <div class="my-7 p-3.5 rounded-lg border border-dashed border-[#b45309]/50 bg-[#26201b] text-[#ede8df]" id="fig-slot-table-${table.index}">
          <div class="flex items-center justify-between gap-2 font-sans text-xs font-medium mb-1">
            <span class="flex items-center gap-1.5">
              <span class="px-1.5 py-0.5 rounded bg-[#3b2b1e] text-[#fde68a] text-[10px] font-mono font-bold">TABLE PNG CARD</span>
              <span class="font-mono text-[11px] text-[#d6cfc5]">${tableFilename}</span>
            </span>
            <span class="text-[11px] text-[#a89f91]">2x Retina Card</span>
          </div>
          ${table.pngBlobUrl ? `<div class="my-2 flex justify-center"><img src="${table.pngBlobUrl}" alt="Table ${table.index + 1}" class="max-h-64 object-contain rounded border border-[#3d342c]" /></div>` : '<div class="text-xs text-[#a89f91] py-2 text-center">Generating high-DPI table card...</div>'}
        </div>
      `;
      tableClipboard = `<p><strong>[DROP TABLE IMAGE: ${tableFilename}]</strong></p>`;
    } else {
      // Native HTML <table>
      const htmlTable = renderHtmlTable(table);
      tablePreview = htmlTable;
      tableClipboard = htmlTable;
    }

    previewHtml = previewHtml.replace(new RegExp(`<p>\\s*${marker}\\s*<\\/p>|${marker}`, 'g'), tablePreview);
    clipboardHtml = clipboardHtml.replace(new RegExp(`<p>\\s*${marker}\\s*<\\/p>|${marker}`, 'g'), tableClipboard);
  });

  // Calculate stats
  const plainText = markdown
    .replace(/[#*`~_\[\]()]/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .trim();
  const words = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const readTimeMinutes = Math.max(1, Math.ceil(words / 220));

  return {
    title,
    subtitle,
    figures,
    tables: rawTables.map(r => r.table),
    rawMarkdown: markdown,
    previewHtml: DOMPurify.sanitize(previewHtml, {
      ADD_TAGS: ['img', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
      ADD_ATTR: ['src', 'alt', 'data-fig', 'id', 'class'],
    }),
    clipboardHtml: cleanSemanticHtmlForClipboard(clipboardHtml),
    plainText: plainText,
    wordCount: words,
    readTimeMinutes,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderHtmlTable(table: TableItem): string {
  const headerHtml = table.headers
    .map((h, i) => `<th style="border: 1px solid #d6cfc5; padding: 8px 12px; background: #f5f2eb; text-align: ${table.alignments[i] || 'left'};">${escapeHtml(h)}</th>`)
    .join('');

  const rowsHtml = table.rows
    .map(row => {
      const cells = row
        .map((c, i) => `<td style="border: 1px solid #d6cfc5; padding: 8px 12px; text-align: ${table.alignments[i] || 'left'};">${escapeHtml(c)}</td>`)
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `<table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14.5px;"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
}

/**
 * Strips arbitrary class names and wrapper divs from clipboard HTML
 * to ensure Medium imports pure semantic tags.
 */
function cleanSemanticHtmlForClipboard(rawHtml: string): string {
  const cleaned = rawHtml
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/div>/gi, '')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/\sclass="[^"]*"/gi, '')
    .replace(/\sid="[^"]*"/gi, '')
    .replace(/\sdata-[a-z0-9-]+="[^"]*"/gi, '');

  return cleaned.trim();
}
