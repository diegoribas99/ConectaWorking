import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { toast } from "@/hooks/use-toast";
import {
  Save, ArrowLeft, Eye, Calendar, CheckCircle, 
  XCircle, Loader2, FileImage, Clock, PlusCircle,
  Layout, Type, Image, List, Code, Youtube, 
  Quote, Table, Trash2, MoveVertical, Move,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';

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

// Definições de tipos
type BlockType = 
  | 'heading' 
  | 'text' 
  | 'image' 
  | 'list' 
  | 'code' 
  | 'video' 
  | 'quote' 
  | 'table';

type Block = {
  id: string;
  type: BlockType;
  content: string;
  settings?: any;
};

type BlogPostFull = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  blocksData?: Block[];
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

// Configuração do editor Quill (para edição de blocos individuais)
const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link'
];

// Função personalizada para lidar com o upload de imagens
const imageHandler = async (file: File) => {
  try {
    // Criar um FormData para enviar o arquivo
    const formData = new FormData();
    formData.append('image', file);
    
    // Upload da imagem
    const response = await fetch('/api/blog/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Falha ao fazer upload da imagem');
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    toast({
      title: "Erro ao inserir imagem",
      description: "Não foi possível fazer o upload da imagem. Tente novamente.",
      variant: "destructive",
    });
    return null;
  }
};

// Componentes para cada tipo de bloco
const HeadingBlock = ({ content, onChange, onDelete }: { content: string, onChange: (value: string) => void, onDelete: () => void }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Título</Label>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 size={16} />
        </Button>
      </div>
      <Input 
        value={content} 
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite um título..."
        className="text-xl font-bold"
      />
    </div>
  );
};

const TextBlock = ({ content, onChange, onDelete }: { content: string, onChange: (value: string) => void, onDelete: () => void }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Texto</Label>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 size={16} />
        </Button>
      </div>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onChange}
        modules={quillModules}
        formats={quillFormats}
        className="h-36 mb-12" // Add extra padding to handle the toolbar
      />
    </div>
  );
};

const ImageBlock = ({ content, onChange, onDelete }: { content: string, onChange: (value: string) => void, onDelete: () => void }) => {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const imageUrl = await imageHandler(file);
    if (imageUrl) {
      onChange(imageUrl);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Imagem</Label>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 size={16} />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center">
            <Input
              id="imageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('imageUpload')?.click()}
              className="w-full justify-start"
            >
              <FileImage className="mr-2" size={16} />
              Selecionar imagem
            </Button>
          </div>
          {content && (
            <Input 
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder="URL da imagem"
              className="mt-2"
            />
          )}
        </div>
        <div>
          {content ? (
            <div className="border rounded-md overflow-hidden">
              <img
                src={content}
                alt="Imagem do bloco"
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
  );
};

const ListBlock = ({ content, onChange, onDelete }: { content: string, onChange: (value: string) => void, onDelete: () => void }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Lista</Label>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 size={16} />
        </Button>
      </div>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onChange}
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
          ],
        }}
        formats={['bold', 'italic', 'underline', 'list', 'bullet']}
        className="h-36 mb-12" // Add extra padding to handle the toolbar
      />
    </div>
  );
};

const CodeBlock = ({ content, onChange, onDelete }: { content: string, onChange: (value: string) => void, onDelete: () => void }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Código</Label>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 size={16} />
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite o código aqui..."
        className="font-mono"
        rows={6}
      />
    </div>
  );
};

const VideoBlock = ({ content, onChange, onDelete }: { content: string, onChange: (value: string) => void, onDelete: () => void }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Vídeo (URL do YouTube)</Label>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 size={16} />
        </Button>
      </div>
      <Input
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
      />
      {content && (
        <div className="aspect-video mt-4">
          {content.includes('youtube.com') || content.includes('youtu.be') ? (
            <iframe
              src={content.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-muted-foreground">
              Prévia indisponível. Insira uma URL do YouTube válida.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const QuoteBlock = ({ content, onChange, onDelete }: { content: string, onChange: (value: string) => void, onDelete: () => void }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Citação</Label>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 size={16} />
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite a citação aqui..."
        rows={4}
      />
      {content && (
        <div className="border-l-4 border-yellow-500 pl-4 py-2 italic mt-2">
          {content}
        </div>
      )}
    </div>
  );
};

const TableBlock = ({ content, onChange, onDelete }: { content: string, onChange: (value: string) => void, onDelete: () => void }) => {
  // Simplified table editor - in a real implementation, we would have a proper table editor
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Tabela (HTML)</Label>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 size={16} />
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="<table><tr><td>Exemplo</td></tr></table>"
        rows={6}
      />
      {content && (
        <div className="mt-4 overflow-x-auto border rounded-md p-4">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  );
};

// Componente para renderizar o bloco apropriado com base no tipo
const BlockRenderer = ({ 
  block, 
  onUpdateBlock,
  onDeleteBlock 
}: { 
  block: Block, 
  onUpdateBlock: (id: string, content: string) => void,
  onDeleteBlock: (id: string) => void
}) => {
  const handleContentChange = (content: string) => {
    onUpdateBlock(block.id, content);
  };

  const handleDelete = () => {
    onDeleteBlock(block.id);
  };

  switch (block.type) {
    case 'heading':
      return <HeadingBlock content={block.content} onChange={handleContentChange} onDelete={handleDelete} />;
    case 'text':
      return <TextBlock content={block.content} onChange={handleContentChange} onDelete={handleDelete} />;
    case 'image':
      return <ImageBlock content={block.content} onChange={handleContentChange} onDelete={handleDelete} />;
    case 'list':
      return <ListBlock content={block.content} onChange={handleContentChange} onDelete={handleDelete} />;
    case 'code':
      return <CodeBlock content={block.content} onChange={handleContentChange} onDelete={handleDelete} />;
    case 'video':
      return <VideoBlock content={block.content} onChange={handleContentChange} onDelete={handleDelete} />;
    case 'quote':
      return <QuoteBlock content={block.content} onChange={handleContentChange} onDelete={handleDelete} />;
    case 'table':
      return <TableBlock content={block.content} onChange={handleContentChange} onDelete={handleDelete} />;
    default:
      return <div>Tipo de bloco não suportado</div>;
  }
};

// Componente principal da página
const BlogPostEditorPageDragDrop: React.FC = () => {
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
    blocksData: [],
    featuredImage: null,
    imageAlt: null,
    metaTitle: null,
    metaDescription: null,
    status: 'draft',
    readTime: 5,
    categoryId: 0,
    tags: [],
  });
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [blockSelectorOpen, setBlockSelectorOpen] = useState(false);

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
      
      // Se existirem blocos de dados, use-os
      if (postData.blocksData && postData.blocksData.length > 0) {
        setBlocks(postData.blocksData);
      } else if (postData.content) {
        // Se não houver blocos, mas houver conteúdo, crie um bloco de texto com o conteúdo
        setBlocks([
          {
            id: uuidv4(),
            type: 'text',
            content: postData.content
          }
        ]);
      }
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
  };

  // Handle featured image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadLoading(true);
    
    try {
      const imageUrl = await imageHandler(file);
      if (imageUrl) {
        setFormData(prev => ({
          ...prev,
          featuredImage: imageUrl,
        }));
        
        toast({
          title: "Imagem enviada",
          description: "A imagem foi enviada com sucesso.",
        });
      }
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

  // Manipulação de blocos
  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: uuidv4(),
      type,
      content: '',
    };
    
    setBlocks(prev => [...prev, newBlock]);
    setBlockSelectorOpen(false);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  const moveBlockUp = (index: number) => {
    if (index <= 0) return;
    
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index - 1];
    newBlocks[index - 1] = temp;
    
    setBlocks(newBlocks);
  };

  const moveBlockDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + 1];
    newBlocks[index + 1] = temp;
    
    setBlocks(newBlocks);
  };

  // Drag and drop handling
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setBlocks(items);
  };

  // Update the content field based on blocks before saving
  const updateContentFromBlocks = () => {
    // Combine all block content into a single HTML string
    let htmlContent = '';
    
    blocks.forEach(block => {
      switch (block.type) {
        case 'heading':
          htmlContent += `<h2>${block.content}</h2>`;
          break;
        case 'text':
          htmlContent += block.content;
          break;
        case 'image':
          htmlContent += `<img src="${block.content}" alt="Imagem" />`;
          break;
        case 'list':
          htmlContent += block.content;
          break;
        case 'code':
          htmlContent += `<pre><code>${block.content}</code></pre>`;
          break;
        case 'video':
          if (block.content.includes('youtube.com') || block.content.includes('youtu.be')) {
            const embedUrl = block.content.replace('watch?v=', 'embed/');
            htmlContent += `<iframe src="${embedUrl}" width="100%" height="315" frameborder="0" allowfullscreen></iframe>`;
          }
          break;
        case 'quote':
          htmlContent += `<blockquote>${block.content}</blockquote>`;
          break;
        case 'table':
          htmlContent += block.content;
          break;
        default:
          break;
      }
      
      htmlContent += '<br>';
    });
    
    return htmlContent;
  };

  // Save post mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<BlogPostFull>) => {
      // Adicionar os dados de blocos e atualizar o conteúdo
      const htmlContent = updateContentFromBlocks();
      data.content = htmlContent;
      data.blocksData = blocks;
      
      // Adicionar tags
      data.tags = selectedTags;
      
      // Definir a data de publicação se estiver sendo publicado
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
          blocksData: [],
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
        setBlocks([]);
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
    if (!formData.title || !formData.slug || !formData.summary || !formData.categoryId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios (título, slug, resumo e categoria).",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se há blocos
    if (blocks.length === 0) {
      toast({
        title: "Conteúdo vazio",
        description: "Adicione pelo menos um bloco de conteúdo ao artigo.",
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
    
    const updatedFormData = {
      ...formData,
      status: 'published',
      publishedAt: formData.publishedAt || new Date().toISOString(),
    };
    
    saveMutation.mutate(updatedFormData);
  };

  // Handle preview
  const handlePreview = () => {
    setPreviewDialogOpen(true);
  };

  // Calculate read time based on blocks content
  useEffect(() => {
    if (blocks.length > 0) {
      // Extrair o texto de todos os blocos
      let totalText = '';
      
      blocks.forEach(block => {
        // Remover tags HTML para contar apenas o texto
        const textContent = block.content.replace(/<[^>]*>/g, '');
        totalText += textContent + ' ';
      });
      
      // Calcular tempo de leitura (aproximadamente 200 palavras por minuto)
      const wordCount = totalText.split(/\s+/).length;
      const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
      
      setFormData(prev => ({
        ...prev,
        readTime: readTimeMinutes,
      }));
    }
  }, [blocks]);

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
          <div className="flex justify-between items-center mb-8 sticky top-16 z-10 bg-background pb-2 border-b">
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
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Metadados básicos */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    placeholder="Título do artigo"
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
                    placeholder="titulo-do-artigo"
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
              </CardContent>
            </Card>
            
            {/* Editor de blocos */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Conteúdo</h2>
                <Dialog open={blockSelectorOpen} onOpenChange={setBlockSelectorOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2" size={16} />
                      Adicionar Bloco
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Bloco</DialogTitle>
                      <DialogDescription>
                        Selecione o tipo de bloco que deseja adicionar ao artigo.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" onClick={() => addBlock('heading')} className="h-24 flex-col space-y-2">
                        <Type size={24} />
                        <span>Título</span>
                      </Button>
                      <Button variant="outline" onClick={() => addBlock('text')} className="h-24 flex-col space-y-2">
                        <Type size={24} />
                        <span>Texto</span>
                      </Button>
                      <Button variant="outline" onClick={() => addBlock('image')} className="h-24 flex-col space-y-2">
                        <Image size={24} />
                        <span>Imagem</span>
                      </Button>
                      <Button variant="outline" onClick={() => addBlock('list')} className="h-24 flex-col space-y-2">
                        <List size={24} />
                        <span>Lista</span>
                      </Button>
                      <Button variant="outline" onClick={() => addBlock('code')} className="h-24 flex-col space-y-2">
                        <Code size={24} />
                        <span>Código</span>
                      </Button>
                      <Button variant="outline" onClick={() => addBlock('video')} className="h-24 flex-col space-y-2">
                        <Youtube size={24} />
                        <span>Vídeo</span>
                      </Button>
                      <Button variant="outline" onClick={() => addBlock('quote')} className="h-24 flex-col space-y-2">
                        <Quote size={24} />
                        <span>Citação</span>
                      </Button>
                      <Button variant="outline" onClick={() => addBlock('table')} className="h-24 flex-col space-y-2">
                        <Table size={24} />
                        <span>Tabela</span>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="blocks">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {blocks.length === 0 ? (
                        <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-md p-4">
                          <div className="text-center">
                            <p className="text-muted-foreground mb-4">Nenhum bloco adicionado ainda</p>
                            <Button onClick={() => setBlockSelectorOpen(true)}>
                              <PlusCircle className="mr-2" size={16} />
                              Adicionar Bloco
                            </Button>
                          </div>
                        </div>
                      ) : (
                        blocks.map((block, index) => (
                          <Draggable key={block.id} draggableId={block.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border rounded-md p-4 space-y-4 bg-background"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div {...provided.dragHandleProps} className="mr-2 p-1 cursor-move hover:bg-muted rounded">
                                      <Move size={16} />
                                    </div>
                                    <Badge variant="outline">
                                      {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => moveBlockUp(index)} disabled={index === 0}>
                                      <ChevronUp size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => moveBlockDown(index)} disabled={index === blocks.length - 1}>
                                      <ChevronDown size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteBlock(block.id)}>
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                </div>
                                <BlockRenderer
                                  block={block}
                                  onUpdateBlock={updateBlock}
                                  onDeleteBlock={deleteBlock}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              {blocks.length > 0 && (
                <div className="flex justify-center mt-6">
                  <Button variant="outline" onClick={() => setBlockSelectorOpen(true)}>
                    <PlusCircle className="mr-2" size={16} />
                    Adicionar Bloco
                  </Button>
                </div>
              )}
            </div>
            
            {/* Imagem de destaque */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Imagem de Destaque</h2>
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
              </CardContent>
            </Card>
            
            {/* SEO */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold mb-4">SEO</h2>
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
                  {blocks.map((block, index) => {
                    switch (block.type) {
                      case 'heading':
                        return <h2 key={index} className="text-2xl font-bold mt-6 mb-4">{block.content}</h2>;
                      case 'text':
                        return <div key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: block.content }} />;
                      case 'image':
                        return (
                          <div key={index} className="my-6">
                            <img src={block.content} alt="Imagem" className="w-full h-auto rounded-md" />
                          </div>
                        );
                      case 'list':
                        return <div key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: block.content }} />;
                      case 'code':
                        return (
                          <pre key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md font-mono text-sm overflow-x-auto my-4">
                            <code>{block.content}</code>
                          </pre>
                        );
                      case 'video':
                        if (block.content.includes('youtube.com') || block.content.includes('youtu.be')) {
                          const embedUrl = block.content.replace('watch?v=', 'embed/');
                          return (
                            <div key={index} className="aspect-video my-6">
                              <iframe
                                src={embedUrl}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          );
                        }
                        return null;
                      case 'quote':
                        return (
                          <blockquote key={index} className="border-l-4 border-yellow-500 pl-4 py-2 italic my-6">
                            {block.content}
                          </blockquote>
                        );
                      case 'table':
                        return <div key={index} className="my-6" dangerouslySetInnerHTML={{ __html: block.content }} />;
                      default:
                        return null;
                    }
                  })}
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

export default BlogPostEditorPageDragDrop;