import React, { useRef, useState } from 'react';
import { UploadCloud, FolderUp, FileText, Sparkles, X } from 'lucide-react';
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
      className={`px-3 py-2 rounded-lg border transition-all duration-150 flex flex-wrap items-center justify-between gap-2.5 ${
        isDragging
          ? 'border-[#b45309] bg-[#2d251e]'
          : 'border-[#332e29] bg-[#221e1a]'
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

      {/* Left: File / Drag info */}
      <div className="flex items-center gap-2 min-w-0">
        <UploadCloud className={`w-4 h-4 shrink-0 ${isDragging ? 'text-[#f59e0b]' : 'text-[#a89f91]'}`} />
        
        {markdownFileName ? (
          <div className="flex items-center gap-1.5 text-xs truncate">
            <span className="font-medium text-[#ede8df] truncate">{markdownFileName}</span>
            {attachedImagesCount > 0 && (
              <span className="text-[11px] text-[#b45309] font-mono px-1.5 py-0.2 rounded bg-[#382b20]">
                {attachedImagesCount} {attachedImagesCount === 1 ? 'image' : 'images'}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-[#9c9387] truncate">
            Drop your <code className="text-[#d6cfc5]">.md</code> draft or local image folder here
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#d6cfc5] hover:text-[#f5f0e6] bg-[#2c2722] hover:bg-[#38312b] border border-[#3d3731] transition-colors"
          title="Select markdown or image files"
        >
          <FileText className="w-3 h-3 text-[#a89f91]" />
          <span>Files</span>
        </button>

        <button
          onClick={() => folderInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#d6cfc5] hover:text-[#f5f0e6] bg-[#2c2722] hover:bg-[#38312b] border border-[#3d3731] transition-colors"
          title="Select image folder from Finder"
        >
          <FolderUp className="w-3 h-3 text-[#a89f91]" />
          <span>Folder</span>
        </button>

        <button
          onClick={onLoadSample}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#fde68a] hover:text-white bg-[#3b2b1e] hover:bg-[#4a3625] border border-[#523d29] transition-colors"
          title="Load sample technical article"
        >
          <Sparkles className="w-3 h-3 text-[#f59e0b]" />
          <span>Sample Article</span>
        </button>

        {(markdownFileName || attachedImagesCount > 0) && (
          <button
            onClick={onClear}
            className="p-1 rounded text-[#8c8376] hover:text-[#f87171] hover:bg-[#2c2722] transition-colors"
            title="Clear draft"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
