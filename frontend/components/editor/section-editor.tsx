import { useFieldArray, Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SectionEditorProps {
  control: Control<any>;
}

export function SectionEditor({ control }: SectionEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'structuredContent.sections',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Article Sections</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ heading: '', body: '' })}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Section
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="relative group shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="space-y-2">
                <Label htmlFor={`section-${index}-heading`}>Heading</Label>
                <Input
                  id={`section-${index}-heading`}
                  {...control.register(`structuredContent.sections.${index}.heading`)}
                  placeholder="Section heading..."
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`section-${index}-body`}>Content</Label>
                <Textarea
                  id={`section-${index}-body`}
                  {...control.register(`structuredContent.sections.${index}.body`)}
                  placeholder="Write the section content here..."
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}
        {fields.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg text-zinc-500 text-sm">
            No sections added. Click "Add Section" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
