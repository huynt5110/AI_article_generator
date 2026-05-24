import Link from 'next/link';
import { DraftArticle, DraftStatus } from '@/types/article.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil } from 'lucide-react';
import { ProvenancePanel } from './provenance-panel';

interface MetadataSidebarProps {
  draft: DraftArticle;
}

export function MetadataSidebar({ draft }: MetadataSidebarProps) {
  const getStatusBadge = (status: DraftStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary" className="w-fit">Draft</Badge>;
      case 'REVIEW_REQUIRED':
        return <Badge variant="destructive" className="w-fit bg-amber-500 hover:bg-amber-600 text-white">Review Required</Badge>;
      case 'READY':
        return <Badge variant="default" className="w-fit bg-emerald-500 hover:bg-emerald-600">Ready</Badge>;
      case 'PUBLISHED':
        return <Badge variant="default" className="w-fit bg-blue-500 hover:bg-blue-600">Published</Badge>;
      default:
        return <Badge variant="outline" className="w-fit">{status}</Badge>;
    }
  };

  const formattedDate = new Date(draft.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
    <div className="flex flex-col gap-8 sticky top-6">
      
      <div className="flex flex-col gap-6">
        <Link href="/articles">
          <Button variant="ghost" className="w-fit -ml-4 text-zinc-500 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Button>
        </Link>

        <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</span>
            {getStatusBadge(draft.status)}
          </div>
          
          <div className="flex flex-col gap-1 pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Last Updated</span>
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{formattedDate}</span>
          </div>

          <div className="pt-4">
            <Link href={`/articles/${draft.id}/edit`}>
              <Button className="w-full gap-2">
                <Pencil className="w-4 h-4" />
                Edit Article
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ProvenancePanel provenances={draft.provenances} />
      
    </div>
  );
}
