import { ProvenanceItem } from '@/types/article.types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ProvenanceSidebarProps {
  provenances?: ProvenanceItem[];
  dirtyFields: Record<string, any>;
}

export function ProvenanceSidebar({ provenances, dirtyFields }: ProvenanceSidebarProps) {
  if (!provenances || provenances.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-zinc-500">
        No provenance data available.
      </div>
    );
  }

  const isFieldModified = (path: string) => {
    const keys = path.split('.');
    let current = dirtyFields;
    for (const key of keys) {
      if (!current || !current[key]) return false;
      current = current[key];
    }
    return true;
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-lg">Source References</h3>
          <p className="text-xs text-zinc-500 mt-1">Mappings from original travel notes.</p>
        </div>

        <div className="space-y-6">
          {provenances.map((prov) => {
            const modified = prov.userModified || isFieldModified(prov.fieldPath);
            
            // Format sections[0].body -> Section 1 - Body
            const formatFieldPath = (path: string) => {
              let friendly = path;
              
              // Keep section index, e.g., sections[0] -> Section 1
              friendly = friendly.replace(/sections\[(\d+)\]/g, (_, index) => `Section ${parseInt(index, 10) + 1}`);
              
              // For all other arrays like bestFor[1], ethicsNotes[0], strip the index entirely
              friendly = friendly.replace(/\[\d+\]/g, '');
              
              return friendly
                .split('.')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/([A-Z])/g, ' $1').trim())
                .join(' - ');
            };
            
            const fieldName = formatFieldPath(prov.fieldPath);

            return (
              <div key={prov.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
                    {fieldName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      {prov.sourceParagraphKey}
                    </span>
                    {modified && (
                      <Badge variant="outline" className="text-[10px] h-5 border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
                        Modified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md border border-zinc-100 dark:border-zinc-800">
                  {prov.sourceText || 'Original text mapping unavailable.'}
                </div>
                <Separator className="mt-4 opacity-50" />
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
