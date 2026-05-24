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
  bestFor: z.union([z.array(z.string()), z.string().transform((s) => [s])]),
  notFor: z.union([z.array(z.string()), z.string().transform((s) => [s])]),
  keyFacts: z.record(z.string(), z.unknown()),
  ethicsNotes: z.union([z.array(z.string()), z.string().transform((s) => [s])]),
  provenance: z.array(provenanceItemSchema),
});

export type ArticleExtraction = z.infer<typeof articleExtractionSchema>;
export type ProvenanceItem = z.infer<typeof provenanceItemSchema>;

export const PROMPT_VERSION = 'v1';
