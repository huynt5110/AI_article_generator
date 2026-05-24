import { ArticleList } from '@/components/articles/article-list';

export const metadata = {
  title: 'My Articles - Travel AI',
  description: 'View and manage your travel article drafts.',
};

export default function ArticlesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Articles</h1>
        <p className="text-zinc-500 text-lg">
          Manage your AI-generated travel drafts and historical stories.
        </p>
      </div>

      <ArticleList />
    </div>
  );
}
