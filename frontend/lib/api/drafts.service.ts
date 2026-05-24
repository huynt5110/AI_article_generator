import { apiClient } from './client';
import { PaginatedDraftResponse, DraftStatus, DraftArticle, UpdateOperation } from '@/types/article.types';

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

  getDraftById: async (id: string): Promise<DraftArticle> => {
    const response = await apiClient.get<{ data: DraftArticle }>(`/drafts/${id}`);
    return response.data.data;
  },

  updateDraft: async (id: string, payload: { operations: UpdateOperation[], title?: string, hook?: string }): Promise<DraftArticle> => {
    const response = await apiClient.patch<{ data: DraftArticle }>(`/drafts/${id}`, payload);
    return response.data.data;
  },
};
