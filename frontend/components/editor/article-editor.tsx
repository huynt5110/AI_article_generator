'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DraftArticle, UpdateOperation } from '@/types/article.types';
import { useUpdateDraft } from '@/hooks/mutations/use-update-draft';
import { EditorHeader } from './editor-header';
import { SectionEditor } from './section-editor';
import { KeyFactsEditor } from './key-facts-editor';
import { ProvenanceSidebar } from './provenance-sidebar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Zod Schema for validation
const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  hook: z.string().min(1, 'Hook is required'),
  structuredContent: z.object({
    sections: z.array(z.object({
      heading: z.string(),
      body: z.string(),
    })),
    bestFor: z.array(z.string()),
    notFor: z.array(z.string()),
    keyFacts: z.record(z.string(), z.any()),
    ethicsNotes: z.array(z.string()).optional(),
  }),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleEditorProps {
  draft: DraftArticle;
}

export function ArticleEditor({ draft }: ArticleEditorProps) {
  const mutation = useUpdateDraft(draft.id);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: draft.title || '',
      hook: draft.hook || '',
      structuredContent: draft.structuredContent || {
        sections: [],
        bestFor: [],
        notFor: [],
        keyFacts: {},
      },
    },
  });

  const { register, control, handleSubmit, formState: { isDirty, dirtyFields } } = form;

  const onSubmit = (data: ArticleFormValues) => {
    if (!isDirty) return;

    const ops: UpdateOperation[] = [];

    if (dirtyFields.structuredContent?.sections) {
      ops.push({ path: 'sections', value: data.structuredContent.sections });
    }
    if (dirtyFields.structuredContent?.bestFor) {
      ops.push({ path: 'bestFor', value: data.structuredContent.bestFor });
    }
    if (dirtyFields.structuredContent?.notFor) {
      ops.push({ path: 'notFor', value: data.structuredContent.notFor });
    }
    if (dirtyFields.structuredContent?.keyFacts) {
      ops.push({ path: 'keyFacts', value: data.structuredContent.keyFacts });
    }

    // Call mutation with title and hook included
    mutation.mutate({
      operations: ops,
      ...(dirtyFields.title ? { title: data.title } : {}),
      ...(dirtyFields.hook ? { hook: data.hook } : {}),
    } as any, {
      onSuccess: () => {
        form.reset(data);
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50/50 dark:bg-zinc-950">
      <EditorHeader
        title={form.watch('title')}
        isSaving={mutation.isPending}
        isDirty={isDirty}
        onSave={handleSubmit(onSubmit)}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-12">

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xl">Article Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  className="text-lg font-medium border-transparent bg-transparent hover:border-zinc-200 focus:border-zinc-300 dark:hover:border-zinc-800 focus-visible:ring-0 shadow-none px-0 rounded-none border-b"
                  placeholder="Enter title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hook" className="text-lg">Hook / Summary</Label>
                <Textarea
                  id="hook"
                  {...register('hook')}
                  className="text-base bg-white dark:bg-zinc-900 shadow-sm min-h-[100px]"
                  placeholder="Enter hook..."
                />
              </div>
            </div>

            <SectionEditor control={control as any} />
            <KeyFactsEditor control={control as any} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label>Best For (comma separated)</Label>
                <Input
                  value={form.watch('structuredContent.bestFor')?.join(', ') || ''}
                  onChange={(e) => {
                    const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    form.setValue('structuredContent.bestFor', vals, { shouldDirty: true });
                  }}
                  placeholder="e.g. Couples, Budget Travelers"
                />
              </div>
              <div className="space-y-2">
                <Label>Not For (comma separated)</Label>
                <Input
                  value={form.watch('structuredContent.notFor')?.join(', ') || ''}
                  onChange={(e) => {
                    const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    form.setValue('structuredContent.notFor', vals, { shouldDirty: true });
                  }}
                  placeholder="e.g. Families, Luxury Travelers"
                />
              </div>
            </div>

          </div>
        </div>

        <div className="hidden lg:block w-[350px] border-l bg-white dark:bg-zinc-950">
          <ProvenanceSidebar
            provenances={draft.provenances}
            dirtyFields={dirtyFields}
          />
        </div>
      </div>
    </div>
  );
}
