import { useMutation, useQueryClient } from '@tanstack/react-query';
import { draftsService } from '@/lib/api/drafts.service';
import { UpdateOperation, DraftArticle } from '@/types/article.types';
import { queryKeys } from '@/lib/react-query/query-keys';

export function useUpdateDraft(draftId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { operations: UpdateOperation[], title?: string, hook?: string }) =>
      draftsService.updateDraft(draftId, payload),
    
    // Optimistic Update Implementation
    onMutate: async (payload) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['draft', draftId] });

      // Snapshot the previous value
      const previousDraft = queryClient.getQueryData<DraftArticle>(['draft', draftId]);

      // Optimistically update cache
      if (previousDraft) {
        const updatedDraft = JSON.parse(JSON.stringify(previousDraft));
        
        if (payload.title !== undefined) updatedDraft.title = payload.title;
        if (payload.hook !== undefined) updatedDraft.hook = payload.hook;

        payload.operations.forEach((op) => {
          const keys = op.path.split('.');
          let current = updatedDraft;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = op.value;
        });

        queryClient.setQueryData(['draft', draftId], updatedDraft);
      }

      // Return context object with the snapshotted value
      return { previousDraft };
    },
    
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newDraft, context) => {
      if (context?.previousDraft) {
        queryClient.setQueryData(['draft', draftId], context.previousDraft);
      }
    },
    
    // Always refetch after error or success to ensure synchronization
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles });
    },
  });
}
