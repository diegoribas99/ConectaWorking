import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, Calendar, Clock, User, 
  Eye, ChevronRight, ChevronLeft, 
  Tag as TagIcon
} from 'lucide-react';
import { Helmet } from 'react-helmet';

import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  featuredImage: string | null;
  status: string;
  publishedAt: string | null;
  readTime: number;
  viewCount: number;
  author: {
    name: string;
  };
  category: {
    name: string;
    slug: string;
  };
};

type Tag = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

const BlogTagPage: React.FC = () => {
  const [, params] = useRoute('/blog/tag/:slug');
  const tagSlug = params?.slug || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  // Fetching tag details
  const {
    data: tag,
    isLoading: tagLoading,
    error: tagError,
  } = useQuery<Tag>({
    queryKey: ['/api/blog/tags/slug', tagSlug],
    enabled: !!tagSlug,
    retry: false,
  });

  // Fetching blog posts for this tag
  const {
    data: blogData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      '/api/blog/posts',
      {
        limit: postsPerPage,
        offset: (currentPage - 1) * postsPerPage,
        search: searchTerm,
        tag: tagSlug,
        status: 'published',
      },
    ],
    enabled: !!tagSlug,
    retry: false,
  });

  // Handling pagination
  const totalPosts = blogData?.total || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (tagLoading || isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl mb-8" />
          
          <div className="relative flex-1 mb-8">
            <Skeleton className="h-10 w-full max-w-lg" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (tagError || !tag) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Tag não encontrada</h1>
          <p className="text-muted-foreground mb-8">
            A tag que você está procurando pode ter sido removida ou não existe.
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
        <title>Artigos com a tag {tag.name} | ConectaWorking Blog</title>
        <meta 
          name="description" 
          content={tag.description || `Confira nossos artigos, tutoriais e dicas sobre ${tag.name} para arquitetos e designers de interiores.`} 
        />
        <meta property="og:title" content={`Artigos com a tag ${tag.name}`} />
        <meta 
          property="og:description" 
          content={tag.description || `Confira nossos artigos, tutoriais e dicas sobre ${tag.name} para arquitetos e designers de interiores.`} 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex items-center gap-2">
            <Link href="/blog">
              <Button variant="ghost" className="hover:text-yellow-600 p-0">
                Blog
              </Button>
            </Link>
            <ChevronRight size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">Tag</span>
            <ChevronRight size={16} className="text-muted-foreground" />
            <span>{tag.name}</span>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <TagIcon size={24} className="text-yellow-500" />
            <h1 className="text-3xl font-bold">Tag: {tag.name}</h1>
          </div>
          
          {tag.description && (
            <p className="text-muted-foreground">
              {tag.description}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder={`Pesquisar na tag ${tag.name}...`}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Blog post grid */}
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Erro ao carregar os artigos. Por favor, tente novamente mais tarde.</p>
          </div>
        ) : blogData?.posts?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              Nenhum artigo encontrado com a tag {tag.name}
              {searchTerm && ` e termo de busca "${searchTerm}"`}.
            </p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm('')}>
                Limpar pesquisa
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogData?.posts?.map((post: BlogPost) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer group">
                    {post.featuredImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-2 right-2 bg-yellow-500">
                          {post.category.name}
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2 group-hover:text-yellow-600 transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(post.publishedAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="line-clamp-3 text-muted-foreground mb-4">
                        {post.summary}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {post.readTime} min de leitura
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {post.viewCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-600 font-medium">
                        Ler mais
                        <ChevronRight size={16} />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      className={currentPage === page ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default BlogTagPage;