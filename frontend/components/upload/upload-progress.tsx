import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  progress: number;
}

export function UploadProgress({ progress }: UploadProgressProps) {
  return (
    <div className="space-y-2 mt-4">
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-zinc-600 dark:text-zinc-400">Uploading...</span>
        <span className="text-zinc-900 dark:text-zinc-100">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
