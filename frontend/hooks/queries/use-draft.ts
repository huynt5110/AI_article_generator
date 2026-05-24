import { useQuery } from '@tanstack/react-query';
import { draftsService } from '@/lib/api/drafts.service';

export function useDraft(id: string) {
  return useQuery({
    queryKey: ['draft', id],
    queryFn: () => draftsService.getDraftById(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
}
