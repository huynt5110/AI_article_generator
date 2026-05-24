'use client';

import { useDraft } from '@/hooks/queries/use-draft';
import { useParams } from 'next/navigation';
import { ArticleContent } from '@/components/article-details/article-content';
import { MetadataSidebar } from '@/components/article-details/metadata-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ArticleDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: draft, isLoading, isError, error } = useDraft(id);

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-12 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <div className="flex-1 space-y-8 max-w-3xl">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-6 w-full max-w-xl" />
          <div className="space-y-4 pt-12">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <div className="w-full lg:w-[350px]">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !draft) {
    return (
      <div className="p-10 max-w-3xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load article details. {error instanceof Error ? error.message : ''}
          </AlertDescription>
        </Alert>
        <Link href="/articles">
          <Button variant="outline">Back to Articles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-start gap-12 p-6 md:p-10 max-w-7xl mx-auto w-full relative">
      <div className="flex-1 w-full min-w-0">
        <ArticleContent draft={draft} />
      </div>

      <div className="w-full lg:w-[350px] shrink-0 border-t lg:border-t-0 lg:border-l lg:pl-10 pt-10 lg:pt-0 border-zinc-200 dark:border-zinc-800">
        <MetadataSidebar draft={draft} />
      </div>
    </div>
  );
}
