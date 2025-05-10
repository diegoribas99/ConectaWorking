import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, Calendar, Clock, User, 
  Eye, ChevronRight, ChevronLeft,
  Folder, Tag as TagIcon
} from 'lucide-react';
import { Helmet } from 'react-helmet';

import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

type Tag = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState<string>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  // Fetch blog posts with filters
  const {
    data: blogData,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery({
    queryKey: [
      '/api/blog/posts',
      {
        limit: postsPerPage,
        offset: (currentPage - 1) * postsPerPage,
        search: searchTerm,
        status: 'published',
        sort: currentTab === 'popular' ? 'viewCount' : 'publishedAt',
      },
    ],
    retry: false,
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['/api/blog/categories'],
    retry: false,
  });

  // Fetch tags
  const {
    data: tagsData,
    isLoading: tagsLoading,
    error: tagsError,
  } = useQuery({
    queryKey: ['/api/blog/tags'],
    retry: false,
  });

  // Handle pagination
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

  // Featured posts are the most viewed ones
  const featuredPosts = blogData?.posts
    ? [...blogData.posts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 3)
    : [];

  return (
    <MainLayout>
      {/* SEO Tags */}
      <Helmet>
        <title>Blog | Dicas e Insights para Arquitetos e Designers | ConectaWorking</title>
        <meta 
          name="description" 
          content="Confira nossos artigos, tutoriais e dicas para arquitetos e designers de interiores. Fique atualizado sobre as últimas tendências e práticas do mercado." 
        />
        <meta property="og:title" content="Blog | Dicas e Insights para Arquitetos e Designers | ConectaWorking" />
        <meta 
          property="og:description" 
          content="Confira nossos artigos, tutoriais e dicas para arquitetos e designers de interiores. Fique atualizado sobre as últimas tendências e práticas do mercado." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-4 mb-8">
          <h1 className="text-3xl font-bold">Blog ConectaWorking</h1>
          <p className="text-muted-foreground">
            Dicas, tutoriais e insights para arquitetos e designers de interiores.
          </p>
        </div>

        {/* Featured Posts Section */}
        {!postsLoading && featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Destaques</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post: BlogPost) => (
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
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Buscar no blog..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Folder size={20} className="text-yellow-500" />
                Categorias
              </h3>
              {categoriesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
              ) : categoriesError ? (
                <p className="text-red-500">Erro ao carregar categorias</p>
              ) : categoriesData?.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
              ) : (
                <div className="space-y-2">
                  {categoriesData?.map((category: Category) => (
                    <div key={category.id} className="flex justify-between items-center">
                      <Link href={`/blog/categoria/${category.slug}`}>
                        <Button variant="link" className="p-0 h-auto text-foreground hover:text-yellow-600 justify-start">
                          {category.name}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TagIcon size={20} className="text-yellow-500" />
                Tags
              </h3>
              {tagsLoading ? (
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ) : tagsError ? (
                <p className="text-red-500">Erro ao carregar tags</p>
              ) : tagsData?.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma tag encontrada</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tagsData?.map((tag: Tag) => (
                    <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-yellow-100 hover:text-yellow-800 dark:hover:bg-yellow-900 dark:hover:text-yellow-200">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="recent">Mais Recentes</TabsTrigger>
                <TabsTrigger value="popular">Mais Populares</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-6">
                {postsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
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
                ) : postsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Erro ao carregar os artigos. Por favor, tente novamente mais tarde.</p>
                  </div>
                ) : blogData?.posts?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-muted-foreground">
                      Nenhum artigo encontrado
                      {searchTerm && ` para "${searchTerm}"`}.
                    </p>
                    {searchTerm && (
                      <Button variant="link" onClick={() => setSearchTerm('')}>
                        Limpar pesquisa
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {blogData?.posts?.map((post: BlogPost) => (
                        <Link key={post.id} href={`/blog/${post.slug}`}>
                          <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer group">
                            {post.featuredImage && (
                              <div className="relative h-40 overflow-hidden">
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
                              <p className="line-clamp-2 text-muted-foreground">
                                {post.summary}
                              </p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center pt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {post.readTime} min
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
              </TabsContent>

              <TabsContent value="popular" className="space-y-6">
                {/* Conteúdo idêntico, apenas ordenado por popularidade */}
                {postsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
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
                ) : postsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Erro ao carregar os artigos. Por favor, tente novamente mais tarde.</p>
                  </div>
                ) : blogData?.posts?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-muted-foreground">
                      Nenhum artigo encontrado
                      {searchTerm && ` para "${searchTerm}"`}.
                    </p>
                    {searchTerm && (
                      <Button variant="link" onClick={() => setSearchTerm('')}>
                        Limpar pesquisa
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {blogData?.posts?.map((post: BlogPost) => (
                        <Link key={post.id} href={`/blog/${post.slug}`}>
                          <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer group">
                            {post.featuredImage && (
                              <div className="relative h-40 overflow-hidden">
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
                              <p className="line-clamp-2 text-muted-foreground">
                                {post.summary}
                              </p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center pt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {post.readTime} min
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

                    {/* Pagination - identical to the one above */}
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BlogPage;