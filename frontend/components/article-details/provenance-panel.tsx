import { ProvenanceItem } from '@/types/article.types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';

interface ProvenancePanelProps {
  provenances?: ProvenanceItem[];
}

export function ProvenancePanel({ provenances }: ProvenancePanelProps) {
  if (!provenances || provenances.length === 0) return null;

  // Group by fieldPath for readability
  const grouped = provenances.reduce((acc, curr) => {
    if (!acc[curr.fieldPath]) acc[curr.fieldPath] = [];
    acc[curr.fieldPath].push(curr);
    return acc;
  }, {} as Record<string, ProvenanceItem[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold border-b pb-2">
        <BookOpen className="w-4 h-4" />
        <h3>Source References</h3>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {Object.entries(grouped).map(([field, items]) => (
            <div key={field} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                {field.replace('structuredContent.', '').replace('sections.', 'Section ')}
              </h4>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 text-sm space-y-2 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center text-xs text-zinc-400">
                      <span>Source: {item.sourceParagraphKey}</span>
                      {item.userModified && (
                        <span className="text-[10px] uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 px-1.5 py-0.5 rounded-sm">Modified</span>
                      )}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 line-clamp-4">
                      "{item.sourceText}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
