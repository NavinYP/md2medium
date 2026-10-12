import { AssetStore } from './assetStore';

/**
 * Copies rich-text HTML and fallback plain text to the system clipboard
 * so pasting into Medium, Substack, Notion, or LinkedIn Articles formats instantly.
 */
export async function copyArticleRichText(
  clipboardHtml: string,
  plainText: string
): Promise<{ success: boolean; method: 'clipboard-api' | 'fallback' }> {
  try {
    const htmlBlob = new Blob([clipboardHtml], { type: 'text/html' });
    const textBlob = new Blob([plainText], { type: 'text/plain' });

    if (navigator.clipboard && typeof (window as any).ClipboardItem !== 'undefined') {
      const item = new (window as any).ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
      return { success: true, method: 'clipboard-api' };
    }
  } catch (err) {
    console.warn('ClipboardItem API write failed, attempting fallback selection copy...', err);
  }

  // Fallback using offscreen DOM element
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.pointerEvents = 'none';
  container.style.opacity = '0';
  container.innerHTML = clipboardHtml;
  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNodeContents(container);
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
    const success = document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(container);
    return { success, method: 'fallback' };
  }

  document.body.removeChild(container);
  return { success: false, method: 'fallback' };
}

/**
 * Copies an image Blob directly to the clipboard as an image/png Blob
 * so pressing Cmd+V inside Medium pastes the actual image file.
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    const pngBlob = await AssetStore.convertToPngBlob(blob);

    if (navigator.clipboard && typeof (window as any).ClipboardItem !== 'undefined') {
      const item = new (window as any).ClipboardItem({
        'image/png': pngBlob,
      });
      await navigator.clipboard.write([item]);
      return true;
    }
    throw new Error('ClipboardItem API not supported for images in this browser');
  } catch (err) {
    console.error('Failed to copy image to clipboard:', err);
    return false;
  }
}

/**
 * Copies plain text to clipboard.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}
