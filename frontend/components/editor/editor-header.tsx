import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface EditorHeaderProps {
  title: string;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
  id: string;
}

export function EditorHeader({ title, isSaving, isDirty, onSave, id }: EditorHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b px-6 py-4">
      <div className="flex items-center gap-4">
        <Link href={`/articles/${id}`} className={`text-zinc-500 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold truncate max-w-[300px] sm:max-w-[500px]">
            {title || 'Untitled Draft'}
          </h1>
          <span className="text-xs text-zinc-500">Draft Editor</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isDirty && !isSaving && (
          <span className="text-xs text-zinc-500 flex items-center gap-1 hidden sm:flex">
            <Check className="h-3 w-3" /> Saved
          </span>
        )}
        <Button
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className="min-w-[100px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
