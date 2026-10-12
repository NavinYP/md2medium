import type { AssetMap } from '../types';

export class AssetStore {
  private assets: AssetMap = {};

  /**
   * Resets all stored assets and revokes previous object URLs to prevent memory leaks.
   */
  public clear() {
    for (const key of Object.keys(this.assets)) {
      if (this.assets[key].blobUrl) {
        URL.revokeObjectURL(this.assets[key].blobUrl);
      }
    }
    this.assets = {};
  }

  /**
   * Register a single file into the asset registry with multiple lookup keys:
   * 1. Relative path (e.g. "article-assets/fig1.png")
   * 2. Basename (e.g. "fig1.png")
   * 3. Lowercase versions for case-insensitive lookup
   */
  public addFile(file: File, relativePath?: string) {
    const blobUrl = URL.createObjectURL(file);
    const entry = { file, blobUrl, blob: file };

    const filename = file.name;
    const cleanFilename = filename.toLowerCase();

    this.assets[filename] = entry;
    this.assets[cleanFilename] = entry;

    if (relativePath) {
      const cleanRel = relativePath.replace(/^\.\//, ''); // strip leading ./
      this.assets[cleanRel] = entry;
      this.assets[cleanRel.toLowerCase()] = entry;
    }
  }

  /**
   * Look up an asset by markdown image src reference (e.g. "article-assets/01.png" or "01.png")
   */
  public findAsset(src: string): { file: File; blobUrl: string; blob: Blob } | undefined {
    if (!src) return undefined;
    const cleanSrc = src.trim().replace(/^\.\//, '');
    const filename = cleanSrc.split('/').pop() || cleanSrc;

    return (
      this.assets[cleanSrc] ||
      this.assets[cleanSrc.toLowerCase()] ||
      this.assets[filename] ||
      this.assets[filename.toLowerCase()]
    );
  }

  /**
   * Retrieves all unique files currently registered.
   */
  public getAllFiles(): File[] {
    const files = new Set<File>();
    for (const key of Object.keys(this.assets)) {
      files.add(this.assets[key].file);
    }
    return Array.from(files);
  }

  /**
   * Converts any image Blob (SVG, WebP, JPEG) to a standardized image/png Blob
   * so it can be pasted directly into Medium via navigator.clipboard.write.
   */
  public static async convertToPngBlob(blob: Blob): Promise<Blob> {
    if (blob.type === 'image/png') {
      return blob;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(blob);
          return;
        }

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob(pngBlob => {
          if (pngBlob) {
            resolve(pngBlob);
          } else {
            resolve(blob);
          }
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(blob);
      };

      img.src = url;
    });
  }
}

/**
 * Traverses DataTransferItemList to recursively extract files from dropped folders and items.
 */
export async function extractDroppedFiles(dataTransfer: DataTransfer): Promise<{ files: File[]; mdFiles: File[] }> {
  const allFiles: File[] = [];
  const mdFiles: File[] = [];
  const items = dataTransfer.items;

  const traverseEntry = async (entry: any, path = ''): Promise<void> => {
    if (entry.isFile) {
      return new Promise(resolve => {
        entry.file((file: File) => {
          const relativePath = path ? `${path}/${file.name}` : file.name;
          // Attach relativePath property
          Object.defineProperty(file, 'webkitRelativePath', {
            value: relativePath,
            writable: false,
          });
          allFiles.push(file);
          if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
            mdFiles.push(file);
          }
          resolve();
        });
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const readEntries = async (): Promise<any[]> => {
        return new Promise(resolve => {
          dirReader.readEntries((entries: any[]) => resolve(entries));
        });
      };

      let entries = await readEntries();
      while (entries.length > 0) {
        for (const child of entries) {
          await traverseEntry(child, path ? `${path}/${entry.name}` : entry.name);
        }
        entries = await readEntries();
      }
    }
  };

  if (items && items.length > 0 && (items[0] as any).webkitGetAsEntry) {
    for (let i = 0; i < items.length; i++) {
      const entry = (items[i] as any).webkitGetAsEntry();
      if (entry) {
        await traverseEntry(entry);
      }
    }
  } else {
    // Fallback standard files
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      allFiles.push(file);
      if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
        mdFiles.push(file);
      }
    }
  }

  return { files: allFiles, mdFiles };
}
