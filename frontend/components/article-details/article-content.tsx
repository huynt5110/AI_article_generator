import { DraftArticle } from '@/types/article.types';
import { ArticleHeader } from './article-header';
import { ArticleSections } from './article-sections';
import { KeyFactsPanel } from './key-facts-panel';

interface ArticleContentProps {
  draft: DraftArticle;
}

export function ArticleContent({ draft }: ArticleContentProps) {
  const { title, hook, structuredContent } = draft;

  return (
    <div className="max-w-3xl space-y-12 pb-24">
      <ArticleHeader title={title} hook={hook} />
      
      <ArticleSections sections={structuredContent?.sections || []} />
      
      {structuredContent && (
        <KeyFactsPanel 
          bestFor={structuredContent.bestFor}
          notFor={structuredContent.notFor}
          keyFacts={structuredContent.keyFacts}
          ethicsNotes={structuredContent.ethicsNotes}
        />
      )}
    </div>
  );
}
