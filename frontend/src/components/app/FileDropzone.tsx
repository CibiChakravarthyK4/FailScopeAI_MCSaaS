import { useRef, useState } from 'react';
import { TraceRing } from '../ui/TraceRing';
import { FormMessage } from '../ui/FormMessage';
import { formatFileSize } from '../../utils/formatBytes';

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="flex-shrink-0 text-muted">
      <path d="M6 2h9l5 5v15H6V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M15 2v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface Props {
  label: string;
  helperText: string;
  accept: string;
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  error?: string | null;
  required?: boolean;
}

export function FileDropzone({ label, helperText, accept, multiple, files, onFilesChange, error, required }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const list = Array.from(incoming);
    onFilesChange(multiple ? [...files, ...list] : [list[0]]);
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-fs-blue-deep"> *</span>}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
          isDragOver ? 'border-brand-blue bg-brand-blue-light' : 'border-line bg-white hover:bg-brand-blue-light/40'
        }`}
      >
        <TraceRing size={28} />
        <p className="mt-3 text-sm text-ink">
          Drag and drop your file{multiple ? 's' : ''} here, or{' '}
          <span className="font-medium text-brand-blue">Browse</span>
        </p>
        <p className="mt-1 text-xs text-muted">{helperText}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="mt-2">
          <FormMessage>{error}</FormMessage>
        </div>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileIcon />
                <span className="truncate text-ink">{file.name}</span>
                <span className="flex-shrink-0 text-xs text-muted">{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${file.name}`}
                className="flex-shrink-0 text-muted hover:text-ink"
              >
                <XIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
