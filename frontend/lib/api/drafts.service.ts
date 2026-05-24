import { apiClient } from './client';
import { PaginatedDraftResponse, DraftStatus } from '@/types/article.types';

export const draftsService = {
  getDrafts: async (params?: {
    cursor?: string;
    limit?: number;
    status?: DraftStatus;
  }): Promise<PaginatedDraftResponse> => {
    const response = await apiClient.get<PaginatedDraftResponse>('/drafts', {
      params,
    });
    return response.data;
  },
};
