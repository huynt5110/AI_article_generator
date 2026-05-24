import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadsService } from '@/lib/api/uploads.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { AxiosProgressEvent } from 'axios';
import { UploadResponse } from '@/types/upload.types';

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation<
    UploadResponse,
    Error,
    { file: File; onProgress?: (progressEvent: AxiosProgressEvent) => void }
  >({
    mutationFn: ({ file, onProgress }) =>
      uploadsService.uploadDocument(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.articles,
      });
    },
  });
}
