import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface KeyFactsPanelProps {
  bestFor?: string[];
  notFor?: string[];
  keyFacts?: Record<string, any>;
  ethicsNotes?: string[];
}

export function KeyFactsPanel({ bestFor, notFor, keyFacts, ethicsNotes }: KeyFactsPanelProps) {
  const hasBestFor = bestFor && bestFor.length > 0;
  const hasNotFor = notFor && notFor.length > 0;
  const hasKeyFacts = keyFacts && Object.keys(keyFacts).length > 0;
  const hasEthicsNotes = ethicsNotes && ethicsNotes.length > 0;

  if (!hasBestFor && !hasNotFor && !hasKeyFacts && !hasEthicsNotes) return null;

  return (
    <div className="space-y-8 bg-zinc-50 dark:bg-zinc-900/50 p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
      
      {hasEthicsNotes && (
        <Alert variant="destructive" className="bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 ml-1">
              {ethicsNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {hasKeyFacts && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Key Facts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(keyFacts).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-2 last:border-0 sm:last:border-b">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-zinc-600 dark:text-zinc-400">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(hasBestFor || hasNotFor) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
          {hasBestFor && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">Best For</h3>
              <div className="flex flex-wrap gap-2">
                {bestFor.map((item, i) => (
                  <Badge key={i} variant="outline" className="h-auto whitespace-normal text-left py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {hasNotFor && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-500">Not For</h3>
              <div className="flex flex-wrap gap-2">
                {notFor.map((item, i) => (
                  <Badge key={i} variant="outline" className="h-auto whitespace-normal text-left py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
