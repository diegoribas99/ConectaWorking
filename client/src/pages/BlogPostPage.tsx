import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, Clock, User, 
  Eye, ChevronRight, ChevronLeft,
  Folder, Tag as TagIcon, Share2, Heart
} from 'lucide-react';
import { Helmet } from 'react-helmet';

import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImage: string | null;
  imageAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
  publishedAt: string | null;
  viewCount: number;
  readTime: number;
  categoryId: number;
  userId: number;
  author: {
    name: string;
    avatar: string | null;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
};

type RelatedPost = {
  id: number;
  title: string;
  slug: string;
  featuredImage: string | null;
  publishedAt: string | null;
};

const BlogPostPage: React.FC = () => {
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug || '';
  const [liked, setLiked] = useState(false);

  // Track if the post view has been registered
  const [viewTracked, setViewTracked] = useState(false);

  // Fetch post details
  const {
    data: post,
    isLoading,
    error,
  } = useQuery<BlogPost>({
    queryKey: ['/api/blog/posts/slug', slug],
    enabled: !!slug,
    retry: false,
  });

  // Fetch related posts
  const {
    data: relatedPosts,
    isLoading: relatedPostsLoading,
  } = useQuery<RelatedPost[]>({
    queryKey: ['/api/blog/posts/related', post?.id, { limit: 3 }],
    enabled: !!post?.id,
    retry: false,
  });

  // Track view
  useEffect(() => {
    if (post?.id && !viewTracked) {
      const trackView = async () => {
        try {
          await apiRequest(`/api/blog/posts/${post.id}/view`, {
            method: 'POST',
          });
          setViewTracked(true);
        } catch (error) {
          console.error('Failed to track view:', error);
        }
      };

      trackView();
    }
  }, [post?.id, viewTracked]);

  // Handle like
  const handleLike = async () => {
    if (!post) return;

    try {
      await apiRequest(`/api/blog/posts/${post.id}/like`, {
        method: 'POST',
      });
      
      setLiked(true);
      toast({
        title: "Obrigado!",
        description: "Você curtiu este artigo.",
      });
    } catch (error) {
      console.error('Failed to like post:', error);
      toast({
        title: "Ops!",
        description: "Não foi possível registrar sua curtida.",
        variant: "destructive",
      });
    }
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || 'ConectaWorking Blog',
          text: post?.summary || 'Confira este artigo no blog da ConectaWorking',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "Link do artigo copiado para a área de transferência.",
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex items-center gap-6 mb-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-64 w-full mb-8 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-8">
            O artigo que você está procurando pode ter sido removido ou não existe.
          </p>
          <Link href="/blog">
            <Button>
              <ChevronLeft className="mr-2" size={16} />
              Voltar para o Blog
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* SEO Tags */}
      <Helmet>
        <title>{post.metaTitle || post.title} | ConectaWorking Blog</title>
        <meta 
          name="description" 
          content={post.metaDescription || post.summary} 
        />
        <meta property="og:title" content={post.metaTitle || post.title} />
        <meta 
          property="og:description" 
          content={post.metaDescription || post.summary} 
        />
        {post.featuredImage && (
          <meta property="og:image" content={post.featuredImage} />
        )}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="article:published_time" content={post.publishedAt || ''} />
        <meta property="article:section" content={post.category.name} />
        {post.tags?.map(tag => (
          <meta key={tag.id} property="article:tag" content={tag.name} />
        ))}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <article className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link href="/blog">
              <Button variant="ghost" className="hover:text-yellow-600 p-0">
                Blog
              </Button>
            </Link>
            <ChevronRight size={14} className="text-muted-foreground" />
            <Link href={`/blog/categoria/${post.category.slug}`}>
              <Button variant="ghost" className="hover:text-yellow-600 p-0">
                {post.category.name}
              </Button>
            </Link>
            <ChevronRight size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground truncate max-w-xs">{post.title}</span>
          </div>

          {/* Post Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                {formatDate(post.publishedAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                {post.readTime} min de leitura
              </div>
              <div className="flex items-center gap-1">
                <Eye size={16} />
                {post.viewCount} visualizações
              </div>
              {post.author && (
                <div className="flex items-center gap-1">
                  <User size={16} />
                  {post.author.name}
                </div>
              )}
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="rounded-lg overflow-hidden mb-8">
                <img
                  src={post.featuredImage}
                  alt={post.imageAlt || post.title}
                  className="w-full h-auto"
                />
              </div>
            )}
          </header>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8">
              <p className="font-medium mb-2">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-yellow-100 hover:text-yellow-800 dark:hover:bg-yellow-900 dark:hover:text-yellow-200">
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 ${liked ? 'text-red-500' : ''}`}
                onClick={handleLike}
                disabled={liked}
              >
                <Heart className={liked ? 'fill-current text-red-500' : ''} size={16} />
                {liked ? 'Curtido' : 'Curtir'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleShare}
              >
                <Share2 size={16} />
                Compartilhar
              </Button>
            </div>
            <Link href="/blog">
              <Button variant="ghost" className="flex items-center gap-2 hover:text-yellow-600">
                <ChevronLeft size={16} />
                Voltar para o blog
              </Button>
            </Link>
          </div>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="border-t pt-12">
              <h2 className="text-2xl font-bold mb-6">Artigos Relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                      {relatedPost.featuredImage && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={relatedPost.featuredImage}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="line-clamp-2 group-hover:text-yellow-600 transition-colors text-base">
                          {relatedPost.title}
                        </CardTitle>
                        {relatedPost.publishedAt && (
                          <CardDescription>
                            {formatDate(relatedPost.publishedAt)}
                          </CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </MainLayout>
  );
};

export default BlogPostPage;