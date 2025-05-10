import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { toast } from "@/hooks/use-toast";
import {
  Save, ArrowLeft, Eye, Calendar, CheckCircle, 
  XCircle, Loader2, FileImage, Clock
} from 'lucide-react';

import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from '@/lib/queryClient';

// Import react-quill for rich text editing
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  categoryId: number;
  userId: number;
  tags: number[];
};

type Category = {
  id: number;
  name: string;
};

type Tag = {
  id: number;
  name: string;
};

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image'],
    [{ 'align': [] }],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'link', 'image',
  'align',
  'color', 'background'
];

const BlogPostEditorPage: React.FC = () => {
  const [, params] = useRoute('/blog/admin/post/:action/:id?');
  const action = params?.action || 'new';
  const postId = params?.id ? parseInt(params.id) : undefined;
  const isEditMode = action === 'edit' && postId !== undefined;
  const [location, navigate] = useLocation();
  
  // Form state
  const [formData, setFormData] = useState<Partial<BlogPostFull>>({
    title: '',
    slug: '',
    summary: '',
    content: '',
    featuredImage: null,
    imageAlt: null,
    metaTitle: null,
    metaDescription: null,
    status: 'draft',
    readTime: 5,
    categoryId: 0,
    tags: [],
  });
  
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // Fetch post data if in edit mode
  const {
    data: postData,
    isLoading: postLoading,
    error: postError,
  } = useQuery<BlogPostFull>({
    queryKey: ['/api/blog/posts', postId],
    enabled: isEditMode,
    retry: false,
  });

  // Fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery<Category[]>({
    queryKey: ['/api/blog/categories'],
    retry: false,
  });

  // Fetch tags
  const {
    data: tags,
    isLoading: tagsLoading,
  } = useQuery<Tag[]>({
    queryKey: ['/api/blog/tags'],
    retry: false,
  });

  // Set form data when post data is loaded in edit mode
  useEffect(() => {
    if (isEditMode && postData) {
      setFormData(postData);
      setSelectedTags(postData.tags || []);
    }
  }, [isEditMode, postData]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'title' && !formData.metaTitle) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        metaTitle: value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Auto-generate slug from title
    if (name === 'title' && (!formData.slug || formData.slug === '')) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  // Handle rich text editor changes
  const handleEditorChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
    }));

    // Calculate read time based on content (rough estimate)
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed
    
    setFormData(prev => ({
      ...prev,
      readTime: readTimeMinutes,
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle tag selection
  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });

    setFormData(prev => ({
      ...prev,
      tags: selectedTags.includes(tagId)
        ? selectedTags.filter(id => id !== tagId)
        : [...selectedTags, tagId],
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadLoading(true);
    
    // Create FormData
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      // Upload image
      const response = await fetch('/api/blog/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      // Update the form with the image URL
      setFormData(prev => ({
        ...prev,
        featuredImage: data.url,
      }));
      
      toast({
        title: "Imagem enviada",
        description: "A imagem foi enviada com sucesso.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Ocorreu um erro ao enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setImageUploadLoading(false);
    }
  };

  // Save post mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<BlogPostFull>) => {
      // Add tags to the data
      data.tags = selectedTags;
      
      // Format the data correctly for the API
      // Set publishedAt date if publishing
      if (data.status === 'published' && !data.publishedAt) {
        data.publishedAt = new Date().toISOString();
      }
      
      if (isEditMode) {
        return apiRequest(`/api/blog/posts/${postId}`, {
          method: 'PUT',
          data,
        });
      } else {
        return apiRequest('/api/blog/posts', {
          method: 'POST',
          data,
        });
      }
    },
    onSuccess: (data) => {
      toast({
        title: isEditMode ? "Artigo atualizado" : "Artigo criado",
        description: isEditMode 
          ? "O artigo foi atualizado com sucesso." 
          : "O artigo foi criado com sucesso.",
      });
      
      // Reset form if not in edit mode
      if (!isEditMode) {
        setFormData({
          title: '',
          slug: '',
          summary: '',
          content: '',
          featuredImage: null,
          imageAlt: null,
          metaTitle: null,
          metaDescription: null,
          status: 'draft',
          readTime: 5,
          categoryId: 0,
          tags: [],
        });
        setSelectedTags([]);
      }
      
      // Navigate to the post list
      navigate('/blog/admin');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts/admin'] });
    },
    onError: (error) => {
      console.error('Erro ao salvar artigo:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o artigo. Verifique os campos e tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.slug || !formData.summary || !formData.content || !formData.categoryId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios (título, slug, resumo, conteúdo e categoria).",
        variant: "destructive",
      });
      return;
    }
    
    saveMutation.mutate(formData);
  };

  // Handle publish
  const handlePublish = () => {
    // Set status to published and save
    setFormData(prev => ({
      ...prev,
      status: 'published',
      publishedAt: prev.publishedAt || new Date().toISOString(),
    }));
    
    // Close dialog and save
    setPublishDialogOpen(false);
    saveMutation.mutate({
      ...formData,
      status: 'published',
      publishedAt: formData.publishedAt || new Date().toISOString(),
    });
  };

  // Handle preview
  const handlePreview = () => {
    setPreviewDialogOpen(true);
  };

  if (isEditMode && postLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-36" />
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isEditMode && postError) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-8">
            O artigo que você está tentando editar não foi encontrado.
          </p>
          <Link href="/blog/admin">
            <Button>
              <ArrowLeft className="mr-2" size={16} />
              Voltar para o Gerenciador
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Link href="/blog/admin">
                <Button variant="ghost" className="hover:text-yellow-600">
                  <ArrowLeft className="mr-2" size={16} />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">
                {isEditMode ? 'Editar Artigo' : 'Novo Artigo'}
              </h1>
              {formData.status === 'published' && (
                <Badge className="ml-2 bg-green-500">Publicado</Badge>
              )}
              {formData.status === 'draft' && (
                <Badge variant="outline">Rascunho</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePreview}
                disabled={saveMutation.isPending}
              >
                <Eye className="mr-2" size={16} />
                Visualizar
              </Button>
              {formData.status === 'draft' && (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setPublishDialogOpen(true)}
                  disabled={saveMutation.isPending}
                >
                  <CheckCircle className="mr-2" size={16} />
                  Publicar
                </Button>
              )}
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600"
                onClick={handleSubmit}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={16} />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="content" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="content">Conteúdo</TabsTrigger>
                    <TabsTrigger value="seo">SEO e Meta Dados</TabsTrigger>
                    <TabsTrigger value="media">Mídia</TabsTrigger>
                  </TabsList>
                  
                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        name="slug"
                        value={formData.slug || ''}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria *</Label>
                        <Select
                          value={formData.categoryId?.toString() || ''}
                          onValueChange={(value) => handleSelectChange('categoryId', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {!categoriesLoading && categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status || 'draft'}
                          onValueChange={(value) => handleSelectChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Status do artigo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Rascunho</SelectItem>
                            <SelectItem value="published">Publicado</SelectItem>
                            <SelectItem value="archived">Arquivado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="summary">Resumo *</Label>
                      <Textarea
                        id="summary"
                        name="summary"
                        value={formData.summary || ''}
                        onChange={handleChange}
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">Conteúdo *</Label>
                      <div className="min-h-[400px]">
                        <ReactQuill
                          theme="snow"
                          value={formData.content || ''}
                          onChange={handleEditorChange}
                          modules={modules}
                          formats={formats}
                          className="h-64 mb-12" // Add extra padding to handle the toolbar
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {!tagsLoading && tags?.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              selectedTags.includes(tag.id) ? 'bg-yellow-500 hover:bg-yellow-600' : ''
                            }`}
                            onClick={() => toggleTag(tag.id)}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {formData.readTime || 5} min de leitura
                      </div>
                      {formData.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(formData.publishedAt).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* SEO Tab */}
                  <TabsContent value="seo" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="metaTitle">Título para SEO</Label>
                      <Input
                        id="metaTitle"
                        name="metaTitle"
                        value={formData.metaTitle || ''}
                        onChange={handleChange}
                        placeholder={formData.title}
                      />
                      <p className="text-sm text-muted-foreground">
                        Se não for preenchido, o título do artigo será usado
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="metaDescription">Descrição para SEO</Label>
                      <Textarea
                        id="metaDescription"
                        name="metaDescription"
                        value={formData.metaDescription || ''}
                        onChange={handleChange}
                        rows={3}
                        placeholder={formData.summary}
                      />
                      <p className="text-sm text-muted-foreground">
                        Se não for preenchido, o resumo do artigo será usado
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Prévia no Google</h3>
                      <div className="border p-4 rounded-md">
                        <div className="text-blue-600 text-xl truncate">
                          {formData.metaTitle || formData.title || 'Título do artigo'}
                        </div>
                        <div className="text-green-700 text-sm">
                          {window.location.origin}/blog/{formData.slug || 'artigo-slug'}
                        </div>
                        <div className="text-gray-600 mt-1">
                          {formData.metaDescription || formData.summary || 'Descrição do artigo...'}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Media Tab */}
                  <TabsContent value="media" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="featuredImage">Imagem de destaque</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center">
                            <Input
                              id="featuredImageUpload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('featuredImageUpload')?.click()}
                              disabled={imageUploadLoading}
                              className="w-full justify-start"
                            >
                              {imageUploadLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <FileImage className="mr-2" size={16} />
                                  Selecionar imagem
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Recomendado: 1200x630px (proporção 1.91:1)
                          </p>
                          
                          <div className="mt-4">
                            <Label htmlFor="imageAlt">Texto alternativo da imagem</Label>
                            <Input
                              id="imageAlt"
                              name="imageAlt"
                              value={formData.imageAlt || ''}
                              onChange={handleChange}
                              placeholder="Descrição da imagem para acessibilidade e SEO"
                            />
                          </div>
                        </div>
                        
                        <div>
                          {formData.featuredImage ? (
                            <div className="border rounded-md overflow-hidden">
                              <img
                                src={formData.featuredImage}
                                alt={formData.imageAlt || formData.title || 'Imagem de destaque'}
                                className="w-full h-auto"
                              />
                            </div>
                          ) : (
                            <div className="border rounded-md flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-900 text-muted-foreground">
                              Nenhuma imagem selecionada
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </form>
          
          {/* Preview Dialog */}
          <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Prévia do Artigo</DialogTitle>
                <DialogDescription>
                  Esta é uma prévia de como seu artigo ficará.
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4">
                <h1 className="text-3xl font-bold mb-4">{formData.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {formData.publishedAt 
                      ? new Date(formData.publishedAt).toLocaleDateString('pt-BR')
                      : new Date().toLocaleDateString('pt-BR')
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {formData.readTime || 5} min de leitura
                  </div>
                </div>
                
                {formData.featuredImage && (
                  <div className="rounded-lg overflow-hidden mb-8">
                    <img
                      src={formData.featuredImage}
                      alt={formData.imageAlt || formData.title || ''}
                      className="w-full h-auto"
                    />
                  </div>
                )}
                
                <div className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: formData.content || '' }} />
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button onClick={() => setPreviewDialogOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Publish Dialog */}
          <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publicar Artigo</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja publicar este artigo? Ele ficará visível para todos os visitantes.
                </DialogDescription>
              </DialogHeader>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handlePublish}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" size={16} />
                      Sim, Publicar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MainLayout>
  );
};

export default BlogPostEditorPage;