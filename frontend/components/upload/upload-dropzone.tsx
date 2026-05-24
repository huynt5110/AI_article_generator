import { useRef } from 'react';
import { UploadCloud, FileType, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export function UploadDropzone({ file, onFileSelect, disabled }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleClick = () => {
    if (!disabled && !file) {
      inputRef.current?.click();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors 
        ${disabled ? 'opacity-50 cursor-not-allowed border-zinc-200 dark:border-zinc-800' : 
        file ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50' : 
        'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}`}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        disabled={disabled}
      />

      {file ? (
        <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded">
              <FileType className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate w-[200px] sm:w-[300px]">
                {file.name}
              </p>
              <p className="text-xs text-zinc-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-red-500 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full">
            <UploadCloud className="h-8 w-8 text-zinc-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Click to browse or drag file here</p>
            <p className="text-xs text-zinc-500">Supported format: .docx (Max 10MB)</p>
          </div>
        </div>
      )}
    </div>
  );
}
