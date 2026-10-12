import React, { useRef, useState } from 'react';
import { UploadCloud, FolderUp, FileText, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { extractDroppedFiles } from '../utils/assetStore';

interface DropZoneProps {
  onFilesDropped: (files: File[], mdFile?: File) => void;
  onLoadSample: () => void;
  attachedImagesCount: number;
  markdownFileName?: string;
  onClear: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesDropped,
  onLoadSample,
  attachedImagesCount,
  markdownFileName,
  onClear,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer) {
      const { files, mdFiles } = await extractDroppedFiles(e.dataTransfer);
      const primaryMd = mdFiles.length > 0 ? mdFiles[0] : undefined;
      onFilesDropped(files, primaryMd);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesList = Array.from(e.target.files);
      const mdFile = filesList.find(f => f.name.endsWith('.md') || f.name.endsWith('.markdown'));
      onFilesDropped(filesList, mdFile);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative mx-auto max-w-4xl p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all duration-200 mb-6 ${
        isDragging
          ? 'border-teal-400 bg-teal-950/30 scale-[1.01]'
          : markdownFileName || attachedImagesCount > 0
          ? 'border-slate-800 bg-slate-900/60'
          : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        accept=".md,.markdown,.png,.jpg,.jpeg,.webp,.gif,.svg"
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileInputChange}
        {...({ webkitdirectory: '', directory: '' } as any)}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Status / Icon */}
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div
            className={`p-3 rounded-xl border shrink-0 ${
              isDragging
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-800/80 text-teal-400 border-slate-700'
            }`}
          >
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            {markdownFileName || attachedImagesCount > 0 ? (
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-slate-100">
                    {markdownFileName ? markdownFileName : 'Draft loaded'}
                  </span>
                  {attachedImagesCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60 text-xs font-mono font-semibold">
                      {attachedImagesCount} image {attachedImagesCount === 1 ? 'asset' : 'assets'} attached
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Drop additional images or folders anytime to update assets.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Drag & Drop Markdown (.md) + Local Images Folder
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  100% Client-Side. Images are matched locally via in-browser Object URLs—never uploaded.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Select Files</span>
          </button>

          <button
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="Upload whole images folder from Finder / File Explorer"
          >
            <FolderUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Select Folder</span>
          </button>

          <button
            onClick={onLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 text-xs font-semibold border border-teal-800/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Load Sample Article</span>
          </button>

          {(markdownFileName || attachedImagesCount > 0) && (
            <button
              onClick={onClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Clear draft and assets"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
