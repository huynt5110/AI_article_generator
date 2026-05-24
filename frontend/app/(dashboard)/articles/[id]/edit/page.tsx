'use client';

import { use } from 'react';
import { useDraft } from '@/hooks/queries/use-draft';
import { ArticleEditor } from '@/components/editor/article-editor';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { data: draft, isLoading, isError, error } = useDraft(id);

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isError || !draft) {
    return (
      <div className="p-10 max-w-3xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load article draft. {error instanceof Error ? error.message : ''}
          </AlertDescription>
        </Alert>
        <Link href={`/articles/${id}`}>
          <Button variant="outline">Back to Article</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
      <ArticleEditor draft={draft} />
    </div>
  );
}
