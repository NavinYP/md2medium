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
  const [markdownFileName, setMarkdownFileName] = useState<string>('sample-rag-migration.md');
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
    setMarkdownFileName('sample-rag-migration.md');
    setAttachedFilesCount(Object.keys(samples).length);
    setDoneFiguresMap({});
    showToast('Loaded sample technical article', '3 diagrams and 1 table attached', 'info');
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
      showToast('Image assets updated', `${imagesAdded} files added to asset store`, 'success');
      // Trigger re-render by updating settings or dummy state
      setSettings(s => ({ ...s }));
    }
  };

  const handleClear = () => {
    assetStore.clear();
    setMarkdown('');
    setMarkdownFileName('');
    setAttachedFilesCount(0);
    setDoneFiguresMap({});
    showToast('Draft and assets cleared', '', 'info');
  };

  const handleToggleDone = (id: string) => {
    setDoneFiguresMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      // Check if all are now done
      const allDone = parsed.figures.length > 0 && parsed.figures.every(f => (f.id === id ? next[id] : next[f.id]));
      if (allDone) {
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
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
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (_) {}
    showToast('✓ All figures marked as done', '', 'success');
  };

  const handleResetAll = () => {
    setDoneFiguresMap({});
    showToast('Figure checklist reset', '', 'info');
  };

  const handleLocateSlot = (slotId: string) => {
    const el = document.getElementById(slotId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-teal-400');
      setTimeout(() => el.classList.remove('ring-4', 'ring-teal-400'), 1800);
    }
  };

  const handleCopyFullArticle = async () => {
    setIsCopyingFull(true);
    const result = await copyArticleRichText(parsed.clipboardHtml, parsed.plainText);
    setIsCopyingFull(false);

    if (result.success) {
      try {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.2 } });
      } catch (_) {}
      showToast(
        '✓ Full article copied! Now press Cmd+V in Medium',
        'Semantic HTML written to clipboard. All headers, code blocks & lists will format natively.',
        'success'
      );
    } else {
      showToast(
        'Clipboard copy failed',
        'Please check clipboard permissions in your browser or copy directly from the HTML source tab.',
        'warn'
      );
    }
  };

  const handleChangeTableMode = (mode: TableMode) => {
    setSettings(prev => ({ ...prev, tableModeGlobal: mode }));
    // Update all tables in state
    setTableStateMap(prev => {
      const next = { ...prev };
      parsed.tables.forEach(t => {
        next[t.id] = { ...next[t.id], mode };
      });
      return next;
    });
    showToast(
      `Table mode set to ${mode.toUpperCase()}`,
      mode === 'ascii'
        ? 'Formatted as monospace code block for Medium'
        : mode === 'png'
        ? 'Generating 2x Retina PNG card in Figure Checklist'
        : 'Native <table> HTML for Substack or Notion',
      'info'
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500/30">
      {/* Sticky Studio Header */}
      <Header
        settings={settings}
        onUpdateSettings={u => setSettings(s => ({ ...s, ...u }))}
        onCopyFullArticle={handleCopyFullArticle}
        isCopying={isCopyingFull}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Drop & Settings Row */}
        <div className="px-4 pt-4 shrink-0">
          <DropZone
            onFilesDropped={handleFilesDropped}
            onLoadSample={loadSampleData}
            attachedImagesCount={attachedFilesCount}
            markdownFileName={markdownFileName}
            onClear={handleClear}
          />
          <TableSettingsBar
            tableCount={parsed.tables.length}
            globalMode={settings.tableModeGlobal}
            onChangeGlobalMode={handleChangeTableMode}
          />
        </div>

        {/* 3-Column Split Studio Layout */}
        <div className="flex-1 flex overflow-hidden border-t border-slate-800">
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

          {/* Column 2: Medium Article Preview */}
          <ArticlePreview
            previewHtml={parsed.previewHtml}
            clipboardHtml={parsed.clipboardHtml}
            plainText={parsed.plainText}
            theme={settings.theme}
            onSlotClick={handleLocateSlot}
            showToast={showToast}
          />

          {/* Column 3: Sticky Figure & Table Checklist Sidebar */}
          <FigureSidebar
            figures={parsed.figures}
            onToggleDone={handleToggleDone}
            onMarkAllDone={handleMarkAllDone}
            onResetAll={handleResetAll}
            onLocate={handleLocateSlot}
            showToast={showToast}
          />
        </div>
      </div>

      {/* Guide & FAQ Modal */}
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
