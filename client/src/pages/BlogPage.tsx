import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, Filter, Calendar, Clock, User, 
  Tag, Eye, ChevronRight, ChevronLeft 
} from 'lucide-react';

import MainLayout from '@components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  tags: Array<{
    name: string;
    slug: string;
  }>;
};

const BlogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  // Fetching blog categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/blog/categories'],
    retry: false,
  });

  // Fetching blog tags
  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ['/api/blog/tags'],
    retry: false,
  });

  // Fetching blog posts with filters
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
        category: categoryFilter,
        tag: tagFilter,
        status: 'published',
      },
    ],
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

  // Formatted date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-4 mb-8">
          <h1 className="text-3xl font-bold">Blog ConectaWorking</h1>
          <p className="text-muted-foreground">
            Dicas, tutoriais e insights sobre arquitetura, design de interiores e gestão de projetos
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Pesquisar artigos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2" size={16} />
                <SelectValue placeholder="Categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {!categoriesLoading &&
                  categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[180px]">
                <Tag className="mr-2" size={16} />
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as tags</SelectItem>
                {!tagsLoading &&
                  tags?.map((tag: any) => (
                    <SelectItem key={tag.id} value={tag.slug}>
                      {tag.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Blog post grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
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
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Erro ao carregar os artigos. Por favor, tente novamente mais tarde.</p>
          </div>
        ) : blogData?.posts?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">Nenhum artigo encontrado para os filtros selecionados.</p>
            <Button variant="link" onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setTagFilter('');
            }}>
              Limpar filtros
            </Button>
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

        {/* Featured categories section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Categorias principais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {!categoriesLoading && categories?.slice(0, 8)?.map((category: any) => (
              <Link key={category.id} href={`/blog/categoria/${category.slug}`}>
                <Card className="hover:border-yellow-500 transition-colors cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium group-hover:text-yellow-600 transition-colors">
                      {category.name}
                    </span>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-yellow-600 transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BlogPage;