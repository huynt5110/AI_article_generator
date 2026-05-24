interface Section {
  heading: string;
  body: string;
}

export function ArticleSections({ sections }: { sections: Section[] }) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="space-y-12">
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {section.heading}
          </h2>
          <div className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {section.body}
          </div>
        </div>
      ))}
    </div>
  );
}
