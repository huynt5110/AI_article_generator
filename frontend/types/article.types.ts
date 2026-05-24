export type DraftStatus = 'DRAFT' | 'REVIEW_REQUIRED' | 'READY' | 'PUBLISHED';

export interface DraftArticle {
  id: string;
  uploadId: string;
  title: string | null;
  hook: string | null;
  structuredContent: StructuredContent;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
  provenances?: ProvenanceItem[];
}

export interface StructuredContent {
  sections: Array<{ heading: string; body: string }>;
  bestFor: string[];
  notFor: string[];
  keyFacts: Record<string, any>;
  ethicsNotes?: string[];
}

export interface ProvenanceItem {
  id: string;
  fieldPath: string;
  sourceParagraphKey: string;
  userModified: boolean;
  sourceText?: string;
}

export interface UpdateOperation {
  path: string;
  value: any;
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
