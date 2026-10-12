export type TableMode = 'ascii' | 'png' | 'html';
export type PlatformPreset = 'medium' | 'substack' | 'linkedin';

export interface FigureItem {
  id: string;
  index: number;
  slotNumber: number;
  alt: string;
  src: string;
  filename: string;
  caption: string;
  blobUrl?: string;
  blob?: Blob;
  isTable?: boolean;
  tableId?: string;
  isDone: boolean;
}

export interface TableItem {
  id: string;
  index: number;
  rawMarkdown: string;
  headers: string[];
  rows: string[][];
  alignments: ('left' | 'center' | 'right')[];
  mode: TableMode;
  pngBlobUrl?: string;
  pngBlob?: Blob;
}

export interface PublishSettings {
  captionMode: 'excluded' | 'inline';
  tableModeGlobal: TableMode;
  platformPreset: PlatformPreset;
  theme: 'light' | 'dark';
}

export interface AssetMap {
  [key: string]: {
    file: File;
    blobUrl: string;
    blob: Blob;
  };
}

export interface ParsedArticle {
  title: string;
  subtitle?: string;
  figures: FigureItem[];
  tables: TableItem[];
  rawMarkdown: string;
  previewHtml: string;
  clipboardHtml: string;
  plainText: string;
  wordCount: number;
  readTimeMinutes: number;
}
