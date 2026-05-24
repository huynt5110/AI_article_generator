import { Control, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface KeyFactsEditorProps {
  control: Control<any>;
}

export function KeyFactsEditor({ control }: KeyFactsEditorProps) {
  const keyFacts = useWatch({
    control,
    name: 'structuredContent.keyFacts',
  }) || {};

  const keys = Object.keys(keyFacts);

  if (keys.length === 0) {
    return (
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Key Facts</Label>
        <div className="text-sm text-zinc-500 italic">No key facts extracted.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Key Facts</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {keys.map((key) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={`kf-${key}`} className="text-xs text-zinc-500 uppercase tracking-wider">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
            <Input
              id={`kf-${key}`}
              {...control.register(`structuredContent.keyFacts.${key}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
