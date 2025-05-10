import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, Clock, User, Tag, Eye, Share2, 
  Facebook, Twitter, Linkedin, ChevronLeft,
  ArrowRight, MessageSquare
} from 'lucide-react';
import { Helmet } from 'react-helmet';

import MainLayout from '@components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { queryClient } from '@lib/queryClient';

type BlogComment = {
  id: number;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  status: string;
};

type BlogPostFull = {
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
  readTime: number;
  viewCount: number;
  author: {
    id: number;
    name: string;
    username: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  relatedPosts: Array<{
    id: number;
    title: string;
    slug: string;
    featuredImage: string | null;
    readTime: number;
  }>;
};

const BlogPostPage: React.FC = () => {
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug || '';

  // Fetching blog post by slug
  const {
    data: post,
    isLoading,
    error,
  } = useQuery<BlogPostFull>({
    queryKey: ['/api/blog/posts/slug', slug],
    enabled: !!slug,
    retry: false,
  });

  // Fetching blog comments
  const {
    data: comments,
    isLoading: commentsLoading,
  } = useQuery<BlogComment[]>({
    queryKey: ['/api/blog/posts', post?.id, 'comments'],
    enabled: !!post?.id,
    retry: false,
  });

  // Track view count
  useEffect(() => {
    if (post?.id) {
      // Make API call to increment view count
      fetch(`/api/blog/posts/${post.id}/view`, {
        method: 'POST',
      }).then(() => {
        // Invalidate the query to refetch with updated view count
        queryClient.invalidateQueries({ queryKey: ['/api/blog/posts/slug', slug] });
      });
    }
  }, [post?.id, slug]);

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Share post function
  const sharePost = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    const url = window.location.href;
    const title = post?.title || '';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Comment submission handler
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for comment submission will be added
    // based on the form data
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <div className="flex gap-4 mb-8">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-96 w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
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
        <meta name="description" content={post.metaDescription || post.summary} />
        <meta property="og:title" content={post.metaTitle || post.title} />
        <meta property="og:description" content={post.metaDescription || post.summary} />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.metaTitle || post.title} />
        <meta name="twitter:description" content={post.metaDescription || post.summary} />
        {post.featuredImage && <meta name="twitter:image" content={post.featuredImage} />}
        <link rel="canonical" href={window.location.href} />
        <meta name="article:published_time" content={post.publishedAt || ''} />
        <meta name="article:author" content={post.author.name} />
        <meta name="article:section" content={post.category.name} />
        {post.tags.map((tag) => (
          <meta key={tag.id} name="article:tag" content={tag.name} />
        ))}
      </Helmet>

      <article className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back to blog link */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-6 hover:text-yellow-600">
              <ChevronLeft className="mr-2" size={16} />
              Voltar para o Blog
            </Button>
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                {formatDate(post.publishedAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                {post.readTime} min de leitura
              </div>
              <div className="flex items-center gap-1">
                <User size={16} />
                {post.author.name}
              </div>
              <div className="flex items-center gap-1">
                <Eye size={16} />
                {post.viewCount} visualizações
              </div>
            </div>

            {/* Category and Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Link href={`/blog/categoria/${post.category.slug}`}>
                <Badge variant="outline" className="bg-yellow-500 text-white hover:bg-yellow-600">
                  {post.category.name}
                </Badge>
              </Link>
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                  <Badge variant="outline" className="hover:bg-yellow-50">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="rounded-lg overflow-hidden mb-8">
                <img
                  src={post.featuredImage}
                  alt={post.imageAlt || post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Share section */}
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 border-t border-b mb-12">
            <span className="font-medium flex items-center gap-2 mb-4 sm:mb-0">
              <Share2 size={18} />
              Compartilhar este artigo
            </span>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => sharePost('facebook')}
                aria-label="Compartilhar no Facebook"
              >
                <Facebook size={18} />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => sharePost('twitter')}
                aria-label="Compartilhar no Twitter"
              >
                <Twitter size={18} />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => sharePost('linkedin')}
                aria-label="Compartilhar no LinkedIn"
              >
                <Linkedin size={18} />
              </Button>
            </div>
          </div>

          {/* Author section */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-12">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-yellow-500 text-white">
                  {post.author.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold">{post.author.name}</h3>
                <p className="text-sm text-muted-foreground">Autor</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Arquiteto e especialista em design de interiores com mais de 10 anos de experiência no mercado.
              Compartilha conhecimentos sobre tendências, processos e métodos para melhorar a eficiência em projetos.
            </p>
          </div>

          {/* Comments section */}
          <section id="comments" className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare size={24} />
              Comentários ({comments?.length || 0})
            </h2>

            {/* Comment form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Deixe seu comentário</CardTitle>
                <CardDescription>
                  Seu endereço de e-mail não será publicado. Os campos obrigatórios estão marcados com *
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Nome *
                      </label>
                      <Input id="name" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        E-mail *
                      </label>
                      <Input id="email" type="email" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="comment" className="text-sm font-medium">
                      Comentário *
                    </label>
                    <Textarea id="comment" rows={5} required />
                  </div>
                  <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600">
                    Enviar comentário
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Comment list */}
            {commentsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Ainda não há comentários. Seja o primeiro a comentar!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments?.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {comment.authorName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{comment.authorName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Related posts */}
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Artigos relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {post.relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <Card className="overflow-hidden h-full hover:shadow-md transition-shadow cursor-pointer group">
                      {relatedPost.featuredImage && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={relatedPost.featuredImage}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                          {relatedPost.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock size={14} className="mr-1" />
                          {relatedPost.readTime} min de leitura
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Call to action */}
          <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Pronto para melhorar seu processo de trabalho?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Conheça as ferramentas e metodologias da ConectaWorking para otimizar seus projetos
              de arquitetura e design de interiores.
            </p>
            <Link href="/register">
              <Button className="bg-yellow-500 hover:bg-yellow-600">
                Comece agora
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </MainLayout>
  );
};

export default BlogPostPage;