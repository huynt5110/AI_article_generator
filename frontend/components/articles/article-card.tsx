import Link from 'next/link';
import { DraftArticle, DraftStatus } from '@/types/article.types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface ArticleCardProps {
  article: DraftArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const getStatusBadge = (status: DraftStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'REVIEW_REQUIRED':
        return <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600 text-white">Review Required</Badge>;
      case 'READY':
        return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Ready</Badge>;
      case 'PUBLISHED':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Published</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formattedDate = new Date(article.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="flex flex-col transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl leading-tight line-clamp-2">
            {article.title || 'Untitled Draft'}
          </CardTitle>
          {getStatusBadge(article.status)}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3">
          {article.hook || 'No excerpt available. Open to see the structured content.'}
        </p>
      </CardContent>
      <CardFooter className="pt-4 border-t flex justify-between items-center">
        <span className="text-xs text-zinc-400 font-medium">Updated {formattedDate}</span>
        <Link href={`/articles/${article.id}/edit`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
