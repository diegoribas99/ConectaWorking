import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PlusCircle, Edit, Trash2, Eye, ChevronRight, ChevronLeft, Search,
  Folder, Tag as TagIcon, Settings, FileText, ArrowUpDown, Loader2
} from 'lucide-react';

import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  status: string;
  publishedAt: string | null;
  viewCount: number;
  categoryId: number;
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

const BlogAdminPage: React.FC = () => {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("posts");
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, type: string, name: string } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const itemsPerPage = 10;

  // Fetch blog posts with filtering
  const {
    data: blogPostsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: [
      '/api/blog/posts/admin',
      {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        search: searchTerm,
        status: statusFilter,
      },
    ],
    retry: false,
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['/api/blog/categories'],
    retry: false,
  });

  // Fetch tags
  const {
    data: tagsData,
    isLoading: tagsLoading,
    refetch: refetchTags,
  } = useQuery({
    queryKey: ['/api/blog/tags'],
    retry: false,
  });

  // Handle pagination
  const totalItems = blogPostsData?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  // Prepare item for deletion
  const confirmDelete = (id: number, type: string, name: string) => {
    setItemToDelete({ id, type, name });
    setDeleteDialogOpen(true);
  };

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!itemToDelete) return;
      
      const endpoint = `/api/blog/${itemToDelete.type}/${itemToDelete.id}`;
      return apiRequest(endpoint, { method: 'DELETE' });
    },
    onSuccess: () => {
      if (!itemToDelete) return;
      
      toast({
        title: "Item excluído",
        description: `${itemToDelete.name} foi excluído com sucesso.`,
      });
      
      // Refresh data based on deleted item type
      if (itemToDelete.type === 'posts') {
        refetchPosts();
      } else if (itemToDelete.type === 'categories') {
        refetchCategories();
      } else if (itemToDelete.type === 'tags') {
        refetchTags();
      }
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o item. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Slug generator helper
  const generateSlug = (text: string) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  // Status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Publicado</Badge>;
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'archived':
        return <Badge variant="secondary">Arquivado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Blog</h1>
            <p className="text-muted-foreground">
              Crie, edite e gerencie o conteúdo do blog
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/blog">
              <Button variant="outline">
                <Eye className="mr-2" size={16} />
                Ver Blog
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText size={16} />
              Artigos
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Folder size={16} />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <TagIcon size={16} />
              Tags
            </TabsTrigger>
          </TabsList>
          
          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="Buscar artigos..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="published">Publicados</SelectItem>
                    <SelectItem value="draft">Rascunhos</SelectItem>
                    <SelectItem value="archived">Arquivados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Link href="/blog/admin/post/new">
                <Button className="bg-yellow-500 hover:bg-yellow-600">
                  <PlusCircle className="mr-2" size={16} />
                  Novo Artigo
                </Button>
              </Link>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead className="w-[300px]">Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-12">Visitas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : blogPostsData?.posts?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhum artigo encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    blogPostsData?.posts?.map((post: BlogPost) => {
                      const category = categoriesData?.find((c: Category) => c.id === post.categoryId);
                      
                      return (
                        <TableRow key={post.id}>
                          <TableCell>{post.id}</TableCell>
                          <TableCell className="font-medium">
                            <div className="truncate max-w-[280px]" title={post.title}>
                              {post.title}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(post.status)}</TableCell>
                          <TableCell>{category?.name || '-'}</TableCell>
                          <TableCell>{formatDate(post.publishedAt)}</TableCell>
                          <TableCell>{post.viewCount}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/blog/${post.slug}`}>
                                <Button size="icon" variant="ghost">
                                  <Eye size={16} />
                                </Button>
                              </Link>
                              <Link href={`/blog/admin/post/edit/${post.id}`}>
                                <Button size="icon" variant="ghost">
                                  <Edit size={16} />
                                </Button>
                              </Link>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-red-500"
                                onClick={() => confirmDelete(post.id, 'posts', post.title)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination for posts */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
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
          </TabsContent>
          
          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Folder size={20} className="text-yellow-500" />
                Categorias
              </h2>
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600"
                onClick={() => {
                  // Open dialog in create mode
                  navigate("/blog/admin/category/new");
                }}
              >
                <PlusCircle className="mr-2" size={16} />
                Nova Categoria
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoriesLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : categoriesData?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhuma categoria encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categoriesData?.map((category: Category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.id}</TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.slug}</TableCell>
                        <TableCell>
                          <div className="truncate max-w-[280px]" title={category.description || ''}>
                            {category.description || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/blog/admin/category/edit/${category.id}`}>
                              <Button size="icon" variant="ghost">
                                <Edit size={16} />
                              </Button>
                            </Link>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-red-500"
                              onClick={() => confirmDelete(category.id, 'categories', category.name)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          {/* Tags Tab */}
          <TabsContent value="tags" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TagIcon size={20} className="text-yellow-500" />
                Tags
              </h2>
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600"
                onClick={() => {
                  // Open dialog in create mode
                  navigate("/blog/admin/tag/new");
                }}
              >
                <PlusCircle className="mr-2" size={16} />
                Nova Tag
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tagsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : tagsData?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhuma tag encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tagsData?.map((tag: Tag) => (
                      <TableRow key={tag.id}>
                        <TableCell>{tag.id}</TableCell>
                        <TableCell className="font-medium">{tag.name}</TableCell>
                        <TableCell>{tag.slug}</TableCell>
                        <TableCell>
                          <div className="truncate max-w-[280px]" title={tag.description || ''}>
                            {tag.description || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/blog/admin/tag/edit/${tag.id}`}>
                              <Button size="icon" variant="ghost">
                                <Edit size={16} />
                              </Button>
                            </Link>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-red-500"
                              onClick={() => confirmDelete(tag.id, 'tags', tag.name)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir "{itemToDelete?.name}"? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Sim, excluir"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default BlogAdminPage;