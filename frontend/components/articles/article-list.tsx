'use client';

import { useArticles } from '@/hooks/queries/use-articles';
import { ArticleCard } from './article-card';
import { ArticleSkeleton } from './article-skeleton';
import { ArticleEmptyState } from './article-empty-state';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import React from 'react';

export function ArticleList() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useArticles(undefined, (query: any) => {
    const pages = query?.state?.data?.pages || [];

    // Check if the backend reported active processing jobs for this user
    const isProcessing = pages.some((page: any) => page?.meta?.isProcessing === true);

    // If backend reports active jobs, poll every 10 seconds
    return isProcessing ? 10000 : false;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load drafts. {error instanceof Error ? error.message : 'Please try again later.'}
        </AlertDescription>
      </Alert>
    );
  }

  const articles = data?.pages.flatMap((page) => page?.data?.data) || [];
  if (articles.length === 0) {
    return <ArticleEmptyState />;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-8 border-t">
          <Button
            variant="outline"
            size="lg"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full max-w-sm"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
