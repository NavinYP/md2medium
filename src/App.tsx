import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { MarkdownEditor } from './components/MarkdownEditor';
import { ArticlePreview } from './components/ArticlePreview';
import { FigureSidebar } from './components/FigureSidebar';
import { TableSettingsBar } from './components/TableSettingsBar';
import { GuideModal } from './components/GuideModal';
import { Toast } from './components/Toast';
import type { ToastProps } from './components/Toast';
import type { PublishSettings, TableMode } from './types';
import { AssetStore } from './utils/assetStore';
import { SAMPLE_MARKDOWN, getSampleAssets } from './utils/sampleArticle';
import { parseArticleMarkdown } from './utils/markdownParser';
import { renderTableToPng } from './utils/tableToImage';
import { copyArticleRichText, copyText } from './utils/clipboard';

export default function App() {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);
  const [markdownFileName, setMarkdownFileName] = useState<string>('sample-architecture-guide.md');
  const [settings, setSettings] = useState<PublishSettings>({
    captionMode: 'excluded',
    tableModeGlobal: 'ascii',
    platformPreset: 'medium',
    theme: 'dark',
  });
  const [isEditorCollapsed, setIsEditorCollapsed] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isCopyingFull, setIsCopyingFull] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; sub?: string; type?: ToastProps['type'] } | null>(null);

  // In-memory asset store
  const assetStore = useMemo(() => new AssetStore(), []);
  const [attachedFilesCount, setAttachedFilesCount] = useState<number>(3);
  const [doneFiguresMap, setDoneFiguresMap] = useState<Record<string, boolean>>({});

  // Table PNG Blob store
  const [tableStateMap, setTableStateMap] = useState<
    Record<string, { mode: TableMode; pngBlobUrl?: string; pngBlob?: Blob }>
  >({});

  // Initial load: populate sample assets into assetStore
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    assetStore.clear();
    const samples = getSampleAssets();
    for (const [filename, blob] of Object.entries(samples)) {
      const file = new File([blob], filename, { type: blob.type });
      assetStore.addFile(file, `assets/${filename}`);
    }
    setMarkdown(SAMPLE_MARKDOWN);
    setMarkdownFileName('sample-architecture-guide.md');
    setAttachedFilesCount(Object.keys(samples).length);
    setDoneFiguresMap({});
    showToast('Sample article loaded', '3 diagrams and 1 table attached', 'info');
  };

  const showToast = (message: string, sub?: string, type: ToastProps['type'] = 'success') => {
    setToast({ message, sub, type });
  };

  // Parse markdown
  const parsed = useMemo(() => {
    const article = parseArticleMarkdown(markdown, settings, assetStore, tableStateMap);
    // Apply done status
    article.figures.forEach(f => {
      f.isDone = !!doneFiguresMap[f.id];
    });
    return article;
  }, [markdown, settings, assetStore, tableStateMap, doneFiguresMap]);

  // Generate table PNGs whenever tables are in PNG mode
  useEffect(() => {
    parsed.tables.forEach(table => {
      if (table.mode === 'png' && !tableStateMap[table.id]?.pngBlobUrl) {
        renderTableToPng(table.headers, table.rows, table.alignments, settings.theme)
          .then(({ blob, blobUrl }) => {
            setTableStateMap(prev => ({
              ...prev,
              [table.id]: {
                mode: 'png',
                pngBlob: blob,
                pngBlobUrl: blobUrl,
              },
            }));
          })
          .catch(err => {
            console.error('Failed to generate table PNG', err);
          });
      }
    });
  }, [parsed.tables, settings.theme]);

  // Handle dropped files and folders
  const handleFilesDropped = (files: File[], primaryMd?: File) => {
    let imagesAdded = 0;
    files.forEach(file => {
      const isImg = /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);
      if (isImg) {
        assetStore.addFile(file, (file as any).webkitRelativePath || file.name);
        imagesAdded++;
      }
    });

    if (primaryMd) {
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target?.result as string;
        if (text) {
          setMarkdown(text);
          setMarkdownFileName(primaryMd.name);
          setDoneFiguresMap({});
          showToast(`Loaded ${primaryMd.name}`, `${imagesAdded} image assets attached`, 'success');
        }
      };
      reader.readAsText(primaryMd);
    } else if (imagesAdded > 0) {
      setAttachedFilesCount(assetStore.getAllFiles().length);
      showToast('Images updated', `${imagesAdded} files added to asset registry`, 'success');
      setSettings(s => ({ ...s }));
    }
  };

  const handleClear = () => {
    assetStore.clear();
    setMarkdown('');
    setMarkdownFileName('');
    setAttachedFilesCount(0);
    setDoneFiguresMap({});
    showToast('Draft cleared', '', 'info');
  };

  const handleToggleDone = (id: string) => {
    setDoneFiguresMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      const allDone = parsed.figures.length > 0 && parsed.figures.every(f => (f.id === id ? next[id] : next[f.id]));
      if (allDone) {
        try {
          confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        } catch (_) {}
      }
      return next;
    });
  };

  const handleMarkAllDone = () => {
    const next: Record<string, boolean> = {};
    parsed.figures.forEach(f => {
      next[f.id] = true;
    });
    setDoneFiguresMap(next);
    showToast('All figures marked as placed', '', 'success');
  };

  const handleResetAll = () => {
    setDoneFiguresMap({});
    showToast('Checklist reset', '', 'info');
  };

  const handleLocateSlot = (slotId: string) => {
    const el = document.getElementById(slotId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#b45309]');
      setTimeout(() => el.classList.remove('ring-2', 'ring-[#b45309]'), 1800);
    }
  };

  const handleCopyFullArticle = async () => {
    setIsCopyingFull(true);
    const result = await copyArticleRichText(parsed.clipboardHtml, parsed.plainText);
    setIsCopyingFull(false);

    if (result.success) {
      showToast(
        '✓ Full article copied! Press Cmd+V in Medium',
        'Semantic HTML ready. Headers, code blocks & lists will format natively.',
        'success'
      );
    } else {
      showToast(
        'Clipboard copy failed',
        'Check clipboard permissions or copy from the HTML source tab.',
        'warn'
      );
    }
  };

  const handleChangeTableMode = (mode: TableMode) => {
    setSettings(prev => ({ ...prev, tableModeGlobal: mode }));
    setTableStateMap(prev => {
      const next = { ...prev };
      parsed.tables.forEach(t => {
        next[t.id] = { ...next[t.id], mode };
      });
      return next;
    });
    showToast(
      `Table mode: ${mode.toUpperCase()}`,
      mode === 'ascii'
        ? 'Formatted as monospace code block for Medium'
        : mode === 'png'
        ? 'Generating 2x Retina PNG card in Media Checklist'
        : 'Native <table> HTML for Substack or Notion',
      'info'
    );
  };

  return (
    <div className="h-screen flex flex-col bg-[#1a1816] text-[#ede8df] selection:bg-[#92400e]/40 overflow-hidden">
      {/* Studio Header */}
      <Header
        settings={settings}
        onUpdateSettings={u => setSettings(s => ({ ...s, ...u }))}
        onCopyFullArticle={handleCopyFullArticle}
        isCopying={isCopyingFull}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Slim Top Utility Row (DropZone + Table Settings) */}
      <div className="px-4 py-2 bg-[#1f1c19] border-b border-[#332e29] shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <DropZone
            onFilesDropped={handleFilesDropped}
            onLoadSample={loadSampleData}
            attachedImagesCount={attachedFilesCount}
            markdownFileName={markdownFileName}
            onClear={handleClear}
          />
        </div>
        {parsed.tables.length > 0 && (
          <div className="shrink-0">
            <TableSettingsBar
              tableCount={parsed.tables.length}
              globalMode={settings.tableModeGlobal}
              onChangeGlobalMode={handleChangeTableMode}
            />
          </div>
        )}
      </div>

      {/* 3-Column Full-Height Split Workspace */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Column 1: Markdown Editor (Collapsible) */}
        <MarkdownEditor
          value={markdown}
          onChange={setMarkdown}
          wordCount={parsed.wordCount}
          readTime={parsed.readTimeMinutes}
          isCollapsed={isEditorCollapsed}
          onToggleCollapse={() => setIsEditorCollapsed(!isEditorCollapsed)}
          onCopyRaw={() => {
            copyText(markdown);
            showToast('✓ Raw Markdown copied', '', 'info');
          }}
        />

        {/* Column 2: Article Preview (Medium Layout) */}
        <ArticlePreview
          previewHtml={parsed.previewHtml}
          clipboardHtml={parsed.clipboardHtml}
          plainText={parsed.plainText}
          theme={settings.theme}
          onSlotClick={handleLocateSlot}
          showToast={showToast}
        />

        {/* Column 3: Figure & Media Checklist */}
        <FigureSidebar
          figures={parsed.figures}
          onToggleDone={handleToggleDone}
          onMarkAllDone={handleMarkAllDone}
          onResetAll={handleResetAll}
          onLocate={handleLocateSlot}
          showToast={showToast}
        />
      </div>

      {/* Guide & Tips Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          subMessage={toast.sub}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
