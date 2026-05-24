export type DraftStatus = 'DRAFT' | 'REVIEW_REQUIRED' | 'READY' | 'PUBLISHED';

export interface DraftArticle {
  id: string;
  uploadId: string;
  title: string | null;
  hook: string | null;
  structuredContent: any;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDraftResponse {
  data: {
    data: DraftArticle[]
  };
  meta: {
    nextCursor: string | null;
    hasNextPage: boolean;
    total: number;
  };
}
