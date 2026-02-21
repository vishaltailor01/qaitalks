// File Upload Component with Drag & Drop (Phase 2)
'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

// Client now delegates extraction to server `/ingest/file` endpoint.
// This avoids heavy client-side dependencies like `pdfjs-dist`.

interface FileUploadProps {
  onTextExtracted: (text: string, fileName: string) => void;
  disabled?: boolean;
}
function FileUpload({ onTextExtracted, disabled = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<{ fileName: string; fileSizeKB?: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setLastFile(null);

    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      const res = await fetch('/ingest/file', { method: 'POST', body: fd });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Upload failed: ${txt}`);
      }
      const j = await res.json();
      // j.chunks is [{chunk, length}, ...]
      const combined = Array.isArray(j.chunks) ? j.chunks.map((c: any) => c.chunk).join('\n\n') : '';
      setLastFile({ fileName: j.source || file.name, fileSizeKB: Math.round(file.size / 1024) });
      if (combined) onTextExtracted(combined, j.source || file.name);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer font-primary marker-highlight transition-all min-h-40
          ${isDragging
            ? 'border-logic-cyan bg-logic-cyan/5 scale-[1.02]'
            : 'border-slate-300 hover:border-logic-cyan/50 hover:bg-slate-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isProcessing ? 'pointer-events-none' : ''}
        `}
        tabIndex={0}
        role="button"
        aria-label="Upload file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.markdown,.html,.htm"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
          aria-label="Upload CV or Resume file (PDF, DOCX, TXT, Markdown, or HTML)"
        />

        {isProcessing ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-logic-cyan" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">Processing file...</p>
            <p className="text-xs text-slate-500">Extracting text from your document</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center text-4xl">
              {isDragging ? '📥' : '📎'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                {isDragging ? 'Drop your file here' : 'Upload CV/Resume'}
              </p>
              <p className="text-xs text-slate-500">
                Drag & drop or <span className="text-logic-cyan font-semibold">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PDF, DOCX, TXT, Markdown, HTML • Max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {lastFile && lastFile.success && (
        <div className="bg-green-50 border-2 border-green-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getFileTypeIcon(lastFile.fileType)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-900 mb-1">File processed successfully!</p>
              <p className="text-xs text-green-700 truncate">
                {lastFile.fileName} ({lastFile.fileSizeKB} KB)
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✓ Text extracted and populated in the resume field
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">Upload failed</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}

export default FileUpload;
