import { z } from 'zod';

export const provenanceItemSchema = z.object({
  fieldPath: z.string().min(1),
  sourceParagraphKey: z.string().min(1),
});

export const articleExtractionSchema = z.object({
  title: z.string().min(1),
  hook: z.string().min(1),
  sections: z.array(
    z.object({
      heading: z.string(),
      body: z.string(),
    }),
  ),
  bestFor: z.array(z.string()),
  notFor: z.array(z.string()),
  keyFacts: z.record(z.string(), z.unknown()),
  ethicsNotes: z.array(z.string()),
  provenance: z.array(provenanceItemSchema),
});

export type ArticleExtraction = z.infer<typeof articleExtractionSchema>;
export type ProvenanceItem = z.infer<typeof provenanceItemSchema>;

export const PROMPT_VERSION = 'v1';
