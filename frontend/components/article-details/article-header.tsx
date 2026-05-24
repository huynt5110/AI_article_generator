export function ArticleHeader({ title, hook }: { title: string | null; hook: string | null }) {
  return (
    <div className="space-y-6 pb-8 border-b border-zinc-200 dark:border-zinc-800">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
        {title || 'Untitled Draft'}
      </h1>
      {hook && (
        <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {hook}
        </p>
      )}
    </div>
  );
}
