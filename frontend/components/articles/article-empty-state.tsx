import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, UploadCloud } from 'lucide-react';

export function ArticleEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center border rounded-xl bg-white dark:bg-zinc-950 shadow-sm border-dashed">
      <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
        <FileText className="h-10 w-10 text-zinc-400" />
      </div>
      <h3 className="text-2xl font-semibold tracking-tight mb-2">No drafts yet.</h3>
      <p className="text-zinc-500 max-w-sm mx-auto mb-8">
        Upload your first travel notes document to get started transforming it into an editorial story.
      </p>
      <Link href="/upload">
        <Button size="lg" className="gap-2">
          <UploadCloud className="h-5 w-5" />
          Go to Upload
        </Button>
      </Link>
    </div>
  );
}
