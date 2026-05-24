import { useInfiniteQuery } from '@tanstack/react-query';
import { draftsService } from '@/lib/api/drafts.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { DraftStatus } from '@/types/article.types';

export function useArticles(status?: DraftStatus, refetchInterval?: number | false | ((query: any) => number | false)) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.articles, status],
    queryFn: ({ pageParam }) =>
      draftsService.getDrafts({
        cursor: pageParam,
        limit: 10,
        status,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.hasNextPage ? lastPage.meta.nextCursor : undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: true,
    refetchInterval,
  });
}
