import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Send, 
  Search, 
  Plus,
  Image,
  Video,
  FileText,
  MoreHorizontal,
  Filter,
  Rss,
  Globe,
  MessagesSquare,
  UserPlus,
  Hash,
  BellRing,
  Sparkles,
  Clock,
  Lock,
  Layers
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

// Tipos
interface User {
  id: number;
  name: string;
  avatar?: string;
  role: string;
  username: string;
  isOnline: boolean;
}

interface Post {
  id: number;
  userId: number;
  user: User;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  isLiked: boolean;
  isSaved: boolean;
}

interface Group {
  id: number;
  name: string;
  description: string;
  membersCount: number;
  image?: string;
  isPrivate: boolean;
}

interface ChatMessage {
  id: number;
  userId: number;
  user: User;
  content: string;
  createdAt: Date;
}

interface ChatRoom {
  id: number;
  name: string;
  lastMessage: string;
  lastMessageAt: Date;
  isUnread: boolean;
  participantsCount: number;
  participants: User[];
}

interface ForumTopic {
  id: number;
  title: string;
  userId: number;
  user: User;
  responsesCount: number;
  viewsCount: number;
  lastActivityAt: Date;
  isLocked: boolean;
  isPinned: boolean;
  tags: string[];
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [messageText, setMessageText] = useState('');
  const [postText, setPostText] = useState('');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  
  // Dados simulados de usuários
  const users: User[] = [
    {
      id: 1,
      name: 'Carlos Silva',
      avatar: '',
      role: 'Arquiteto',
      username: 'carlossilva',
      isOnline: true
    },
    {
      id: 2,
      name: 'Marina Costa',
      avatar: '',
      role: 'Designer de Interiores',
      username: 'marinacosta',
      isOnline: false
    },
    {
      id: 3,
      name: 'Rafael Mendes',
      avatar: '',
      role: 'Engenheiro Civil',
      username: 'rafaelmendes',
      isOnline: true
    },
    {
      id: 4,
      name: 'Julia Fernandes',
      avatar: '',
      role: 'Paisagista',
      username: 'juliafernandes',
      isOnline: false
    },
    {
      id: 5,
      name: 'Luciano Pereira',
      avatar: '',
      role: 'Arquiteto',
      username: 'lucianopereira',
      isOnline: true
    },
  ];
  
  // Dados simulados de posts
  const posts: Post[] = [
    {
      id: 1,
      userId: 2,
      user: users.find(u => u.id === 2) as User,
      content: 'Acabei de finalizar um projeto incrível de interiores para um escritório contemporâneo. Utilizei tons neutros com toques de amarelo para trazer mais energia ao ambiente. O que acham?',
      images: ['https://source.unsplash.com/random/600x400?interior,design,office'],
      likes: 24,
      comments: 8,
      shares: 3,
      createdAt: new Date(2024, 4, 8, 14, 30),
      isLiked: true,
      isSaved: false
    },
    {
      id: 2,
      userId: 3,
      user: users.find(u => u.id === 3) as User,
      content: 'Alguma recomendação de software para cálculo estrutural que seja mais intuitivo e integre bem com o BIM? Estou considerando mudar do que uso atualmente.',
      likes: 7,
      comments: 12,
      shares: 1,
      createdAt: new Date(2024, 4, 9, 9, 15),
      isLiked: false,
      isSaved: true
    },
    {
      id: 3,
      userId: 5,
      user: users.find(u => u.id === 5) as User,
      content: 'Participei ontem do webinar sobre Arquitetura Sustentável da ConectaWorking. Foi incrível! Aprendi técnicas novas que certamente vou aplicar nos próximos projetos. Alguém mais assistiu?',
      likes: 18,
      comments: 6,
      shares: 5,
      createdAt: new Date(2024, 4, 9, 17, 45),
      isLiked: false,
      isSaved: false
    },
  ];
  
  // Dados simulados de grupos
  const groups: Group[] = [
    {
      id: 1,
      name: 'Arquitetura Sustentável',
      description: 'Discussões e compartilhamento de conhecimentos sobre práticas sustentáveis em arquitetura',
      membersCount: 342,
      isPrivate: false
    },
    {
      id: 2,
      name: 'Design de Interiores Residenciais',
      description: 'Grupo dedicado ao design de interiores em ambientes residenciais',
      membersCount: 520,
      isPrivate: false
    },
    {
      id: 3,
      name: 'Clube de Estudos BIM',
      description: 'Aprendizado colaborativo sobre Building Information Modeling',
      membersCount: 158,
      isPrivate: true
    },
    {
      id: 4,
      name: 'Empreendedorismo na Arquitetura',
      description: 'Como desenvolver seu negócio na área de arquitetura e design',
      membersCount: 276,
      isPrivate: false
    },
    {
      id: 5,
      name: 'Marketing para Arquitetos',
      description: 'Estratégias de marketing e vendas para profissionais da arquitetura',
      membersCount: 189,
      isPrivate: false
    },
  ];
  
  // Dados simulados de salas de chat
  const chatRooms: ChatRoom[] = [
    {
      id: 1,
      name: 'Grupo de Estudos Revit',
      lastMessage: 'Pessoal, alguém tem um template bom para projetos residenciais?',
      lastMessageAt: new Date(2024, 4, 9, 18, 30),
      isUnread: true,
      participantsCount: 18,
      participants: [users[0], users[1], users[2]]
    },
    {
      id: 2,
      name: 'Marina Costa',
      lastMessage: 'Vou te enviar os desenhos amanhã pela manhã.',
      lastMessageAt: new Date(2024, 4, 9, 16, 15),
      isUnread: false,
      participantsCount: 2,
      participants: [users[0], users[1]]
    },
    {
      id: 3,
      name: 'Colaboradores Projeto XYZ',
      lastMessage: 'A reunião foi remarcada para quinta-feira.',
      lastMessageAt: new Date(2024, 4, 9, 14, 45),
      isUnread: true,
      participantsCount: 5,
      participants: [users[0], users[2], users[4]]
    },
    {
      id: 4,
      name: 'Rafael Mendes',
      lastMessage: 'Obrigado pela indicação!',
      lastMessageAt: new Date(2024, 4, 8, 20, 10),
      isUnread: false,
      participantsCount: 2,
      participants: [users[0], users[2]]
    },
  ];
  
  // Dados simulados de mensagens de chat
  const chatMessages: Record<number, ChatMessage[]> = {
    1: [
      {
        id: 101,
        userId: 3,
        user: users.find(u => u.id === 3) as User,
        content: 'Pessoal, alguém tem um template bom para projetos residenciais?',
        createdAt: new Date(2024, 4, 9, 18, 30)
      },
      {
        id: 102,
        userId: 1,
        user: users.find(u => u.id === 1) as User,
        content: 'Eu tenho alguns que posso compartilhar. São para casas até 300m²?',
        createdAt: new Date(2024, 4, 9, 18, 32)
      },
      {
        id: 103,
        userId: 2,
        user: users.find(u => u.id === 2) as User,
        content: 'Também tenho interesse. Estou procurando algo para apartamentos.',
        createdAt: new Date(2024, 4, 9, 18, 35)
      },
    ],
    2: [
      {
        id: 201,
        userId: 1,
        user: users.find(u => u.id === 1) as User,
        content: 'Marina, poderia me enviar os layouts do projeto até amanhã?',
        createdAt: new Date(2024, 4, 9, 16, 10)
      },
      {
        id: 202,
        userId: 2,
        user: users.find(u => u.id === 2) as User,
        content: 'Claro, estou finalizando eles hoje.',
        createdAt: new Date(2024, 4, 9, 16, 12)
      },
      {
        id: 203,
        userId: 1,
        user: users.find(u => u.id === 1) as User,
        content: 'Perfeito! Precisamos apresentar ao cliente na quinta.',
        createdAt: new Date(2024, 4, 9, 16, 14)
      },
      {
        id: 204,
        userId: 2,
        user: users.find(u => u.id === 2) as User,
        content: 'Vou te enviar os desenhos amanhã pela manhã.',
        createdAt: new Date(2024, 4, 9, 16, 15)
      },
    ]
  };
  
  // Dados simulados de tópicos do fórum
  const forumTopics: ForumTopic[] = [
    {
      id: 1,
      title: 'Precificação de projetos arquitetônicos em 2024',
      userId: 1,
      user: users.find(u => u.id === 1) as User,
      responsesCount: 28,
      viewsCount: 342,
      lastActivityAt: new Date(2024, 4, 9, 15, 20),
      isLocked: false,
      isPinned: true,
      tags: ['precificação', 'negócios', 'mercado']
    },
    {
      id: 2,
      title: 'Dúvida sobre regulamentação para projetos de acessibilidade',
      userId: 4,
      user: users.find(u => u.id === 4) as User,
      responsesCount: 14,
      viewsCount: 197,
      lastActivityAt: new Date(2024, 4, 9, 10, 45),
      isLocked: false,
      isPinned: false,
      tags: ['acessibilidade', 'regulamentação', 'nbr9050']
    },
    {
      id: 3,
      title: 'Melhores práticas de renderização para apresentações de clientes',
      userId: 2,
      user: users.find(u => u.id === 2) as User,
      responsesCount: 35,
      viewsCount: 523,
      lastActivityAt: new Date(2024, 4, 8, 16, 30),
      isLocked: false,
      isPinned: false,
      tags: ['renderização', 'apresentação', 'clientes']
    },
    {
      id: 4,
      title: 'Como abordar projetos de retrofit em edifícios históricos',
      userId: 5,
      user: users.find(u => u.id === 5) as User,
      responsesCount: 22,
      viewsCount: 278,
      lastActivityAt: new Date(2024, 4, 7, 14, 15),
      isLocked: false,
      isPinned: false,
      tags: ['retrofit', 'patrimônio', 'conservação']
    },
    {
      id: 5,
      title: '[PESQUISA] Softwares mais utilizados para modelagem 3D em 2024',
      userId: 3,
      user: users.find(u => u.id === 3) as User,
      responsesCount: 42,
      viewsCount: 615,
      lastActivityAt: new Date(2024, 4, 6, 9, 50),
      isLocked: true,
      isPinned: false,
      tags: ['software', 'modelagem', 'pesquisa', '3d']
    },
  ];
  
  // Função para formatar datas
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) {
      return 'Agora';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias`;
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };
  
  // Manipulador para enviar um post
  const handlePostSubmit = () => {
    // Aqui iria a lógica para enviar o post para a API
    console.log('Post enviado:', postText);
    setPostText('');
  };
  
  // Manipulador para enviar uma mensagem de chat
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;
    // Aqui iria a lógica para enviar a mensagem para a API
    console.log('Mensagem enviada:', messageText, 'para chat:', selectedChat);
    setMessageText('');
  };
  
  // Manipulador para selecionar um chat
  const handleSelectChat = (chatId: number) => {
    setSelectedChat(chatId);
  };
  
  return (
    <>
      <Helmet>
        <title>Comunidade | ConectaWorking</title>
        <meta name="description" content="Conecte-se com outros profissionais de arquitetura e design na comunidade ConectaWorking" />
      </Helmet>
      
      {/* Banner destacado estilo Netflix */}
      <div className="relative w-full h-[40vh] mb-8">
        <div className="absolute inset-0">
          <img 
            src="https://source.unsplash.com/random/1920x800?architecture,collaboration,team"
            alt="Comunidade ConectaWorking"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto h-full flex items-center">
          <div className="max-w-2xl text-white p-6">
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary mb-4">
              Comunidade
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
              Conecte-se e Colabore
            </h1>
            <p className="text-lg text-gray-200 mb-6">
              Compartilhe conhecimentos, desenvolva projetos colaborativos e amplie sua rede profissional na comunidade ConectaWorking.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-black">
                <UserPlus className="mr-2 h-4 w-4" /> Convidar Colegas
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                <Users className="mr-2 h-4 w-4" /> Encontrar Profissionais
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        
        {/* Tabs de navegação principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start mb-6 bg-transparent p-0 h-auto overflow-x-auto scrollbar-hide border-b border-border/50">
            <div className="flex space-x-8 min-w-max">
              <TabsTrigger 
                value="feed" 
                className="data-[state=active]:border-primary border-b-2 border-transparent px-1 pb-3 text-base font-medium min-w-max"
              >
                <Rss className="h-4 w-4 mr-2" />
                Feed de Atividades
              </TabsTrigger>
              <TabsTrigger 
                value="groups" 
                className="data-[state=active]:border-primary border-b-2 border-transparent px-1 pb-3 text-base font-medium min-w-max"
              >
                <Users className="h-4 w-4 mr-2" />
                Grupos
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="data-[state=active]:border-primary border-b-2 border-transparent px-1 pb-3 text-base font-medium min-w-max"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="forum" 
                className="data-[state=active]:border-primary border-b-2 border-transparent px-1 pb-3 text-base font-medium min-w-max"
              >
                <MessagesSquare className="h-4 w-4 mr-2" />
                Fórum
              </TabsTrigger>
              <TabsTrigger 
                value="discover" 
                className="data-[state=active]:border-primary border-b-2 border-transparent px-1 pb-3 text-base font-medium min-w-max"
              >
                <Globe className="h-4 w-4 mr-2" />
                Descobrir
              </TabsTrigger>
            </div>
          </TabsList>

          {/* Tab do Feed */}
          <TabsContent value="feed" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna esquerda - Feed Principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Card para criar post */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">CS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea 
                          placeholder="Compartilhe suas ideias, projetos ou dúvidas..."
                          className="resize-none border-none focus-visible:ring-0 px-0 py-0 shadow-none h-[80px]"
                          value={postText}
                          onChange={(e) => setPostText(e.target.value)}
                        />
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Image className="h-4 w-4 mr-2" />
                              Foto
                            </Button>
                            <Button variant="outline" size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Vídeo
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Documento
                            </Button>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-black"
                            onClick={handlePostSubmit}
                            disabled={!postText.trim()}
                          >
                            Publicar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Posts do feed */}
                {posts.map(post => (
                  <Card key={post.id} className="overflow-hidden border-0 group transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="p-6 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/40 hover:border-primary transition-colors duration-300">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {post.user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium group-hover:text-primary transition-colors">{post.user.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <span>{post.user.role}</span>
                              <span className="mx-1">•</span>
                              <span>{formatTimestamp(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuItem>Salvar post</DropdownMenuItem>
                            <DropdownMenuItem>Seguir {post.user.name}</DropdownMenuItem>
                            <DropdownMenuItem>Copiar link</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">Denunciar post</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 pt-2">
                      <p className="whitespace-pre-line mb-4">{post.content}</p>
                      {post.images && post.images.length > 0 && (
                        <div className="rounded-md overflow-hidden mt-4 relative">
                          {post.images.map((image, idx) => (
                            <div key={idx} className="relative overflow-hidden rounded-md group">
                              <img 
                                src={image} 
                                alt={`Imagem do post ${idx+1}`} 
                                className="w-full h-auto object-cover rounded-md transition-transform duration-500 group-hover:scale-105" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-4">
                                <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/20">
                                  <Image className="mr-2 h-4 w-4" /> Ver em tela cheia
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0 flex flex-col">
                      <div className="flex items-center justify-between w-full text-sm text-muted-foreground mb-4">
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1 fill-primary text-primary" /> 
                          {post.likes} curtidas
                        </span>
                        <div className="flex space-x-4">
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {post.comments} comentários
                          </span>
                          <span className="flex items-center">
                            <Share2 className="h-3 w-3 mr-1" />
                            {post.shares} compartilhamentos
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between w-full border-t border-border pt-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`transition-colors hover:bg-primary/10 ${post.isLiked ? 'text-primary' : ''}`}
                        >
                          <Heart 
                            className={`mr-2 h-4 w-4 transition-all ${post.isLiked ? 'fill-primary text-primary' : ''}`} 
                          />
                          Curtir
                        </Button>
                        <Button variant="ghost" size="sm" className="transition-colors hover:bg-primary/10">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Comentar
                        </Button>
                        <Button variant="ghost" size="sm" className="transition-colors hover:bg-primary/10">
                          <Share2 className="mr-2 h-4 w-4" />
                          Compartilhar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`transition-colors hover:bg-primary/10 ${post.isSaved ? 'text-primary' : ''}`}
                        >
                          <Bookmark 
                            className={`mr-2 h-4 w-4 transition-all ${post.isSaved ? 'fill-primary text-primary' : ''}`} 
                          />
                          Salvar
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {/* Coluna direita - Sugestões e Tendências */}
              <div className="space-y-6">
                {/* Próximos Eventos */}
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold">Próximos Eventos</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded text-center min-w-[50px]">
                        <div className="text-xs font-medium">MAI</div>
                        <div className="text-lg font-bold">15</div>
                      </div>
                      <div>
                        <h4 className="font-medium">Webinar: Tendências em Arquitetura Residencial 2024</h4>
                        <p className="text-sm text-muted-foreground mt-1">19:00 - 20:30 • Online</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded text-center min-w-[50px]">
                        <div className="text-xs font-medium">MAI</div>
                        <div className="text-lg font-bold">22</div>
                      </div>
                      <div>
                        <h4 className="font-medium">Workshop: Iluminação Inteligente em Projetos</h4>
                        <p className="text-sm text-muted-foreground mt-1">14:00 - 17:00 • São Paulo</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full text-sm">
                      Ver Todos os Eventos
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Sugestões para Seguir */}
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold">Sugestões para Seguir</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {users.slice(0, 3).map(user => (
                      <div key={user.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.role}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8">
                          Seguir
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full text-sm">
                      Ver Mais Sugestões
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Tópicos em Tendência */}
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold">Tópicos em Tendência</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-primary" />
                        <span className="font-medium">ArquiteturaSustentável</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">247 posts esta semana</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-primary" />
                        <span className="font-medium">DesignBiofílico</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">183 posts esta semana</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-primary" />
                        <span className="font-medium">MaterialsInovadores</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">129 posts esta semana</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full text-sm">
                      Explorar Tópicos
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Grupos */}
          <TabsContent value="groups" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Coluna esquerda - Filtros */}
              <div className="md:col-span-3 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold">Filtrar Grupos</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar grupos..."
                        className="pl-9 w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Por Categoria</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Arquitetura</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Design</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Sustentabilidade</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Negócios</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Tecnologia</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Educação</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Por Atividade</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" id="most-active" className="mr-2" />
                          <label htmlFor="most-active" className="text-sm">Mais ativos</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="newest" className="mr-2" />
                          <label htmlFor="newest" className="text-sm">Mais recentes</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="largest" className="mr-2" />
                          <label htmlFor="largest" className="text-sm">Mais membros</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" className="w-full" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Aplicar Filtros
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-black">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Novo Grupo
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold">Meus Grupos</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-md w-10 h-10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Clube de Arquitetos</div>
                        <div className="text-xs text-muted-foreground">342 membros</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-md w-10 h-10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Design Digital 3D</div>
                        <div className="text-xs text-muted-foreground">128 membros</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-md w-10 h-10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Empreendedores</div>
                        <div className="text-xs text-muted-foreground">276 membros</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="link" size="sm" className="w-full">
                      Ver Todos Meus Grupos
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Coluna direita - Lista de Grupos */}
              <div className="md:col-span-9">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map(group => (
                    <Card key={group.id} className="overflow-hidden border-0 group transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      <div className="h-36 relative">
                        <img 
                          src={`https://source.unsplash.com/random/600x400?${group.name.toLowerCase().replace(/\s+/g, ',')},architecture,design`}
                          alt={group.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end p-4">
                          <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{group.name}</h3>
                        </div>
                        {group.isPrivate && (
                          <Badge 
                            className="absolute top-2 right-2 bg-black/70 text-white"
                          >
                            <Lock className="h-3 w-3 mr-1" />
                            Privado
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/20">
                            Ver Grupo
                          </Button>
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
                            Participar
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{group.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{group.membersCount} membros</span>
                          </div>
                          <span>20 posts por semana</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-center mt-8">
                  <Button variant="outline">Carregar Mais Grupos</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Chat */}
          <TabsContent value="chat" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(80vh-160px)]">
              {/* Lista de Conversas */}
              <div className="md:col-span-3 border border-border rounded-md overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar conversas..." className="pl-9" />
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(80vh-220px)]">
                  <div className="p-2">
                    {chatRooms.map(room => (
                      <div 
                        key={room.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors duration-200 ${
                          selectedChat === room.id 
                            ? 'bg-primary/10' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleSelectChat(room.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {room.participantsCount <= 2 ? (
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {room.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="h-5 w-5" />
                              </div>
                            )}
                            {room.isUnread && (
                              <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-sm truncate">{room.name}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {formatTimestamp(room.lastMessageAt)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-1">{room.lastMessage}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="p-3 border-t border-border bg-muted/30">
                  <Button variant="outline" className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conversa
                  </Button>
                </div>
              </div>
              
              {/* Painel de Chat */}
              <div className="md:col-span-9 border border-border rounded-md overflow-hidden flex flex-col">
                {selectedChat ? (
                  <>
                    <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {chatRooms.find(r => r.id === selectedChat)?.participantsCount <= 2 ? (
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {chatRooms.find(r => r.id === selectedChat)?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                            <Users className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{chatRooms.find(r => r.id === selectedChat)?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {chatRooms.find(r => r.id === selectedChat)?.participantsCount} participantes
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4 h-[calc(80vh-280px)]">
                      <div className="space-y-4">
                        {chatMessages[selectedChat]?.map(message => (
                          <div key={message.id} className={`flex ${message.userId === 1 ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[80%] ${message.userId === 1 ? 'flex-row-reverse' : ''}`}>
                              {message.userId !== 1 && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {message.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                {message.userId !== 1 && (
                                  <p className="text-xs text-muted-foreground mb-1">
                                    {message.user.name} • {formatTimestamp(message.createdAt)}
                                  </p>
                                )}
                                <div className={`p-3 rounded-md max-w-[500px] ${
                                  message.userId === 1 
                                    ? 'bg-primary/10 text-primary-foreground' 
                                    : 'bg-muted'
                                }`}>
                                  <p className="text-sm">{message.content}</p>
                                </div>
                                {message.userId === 1 && (
                                  <p className="text-xs text-muted-foreground mt-1 text-right">
                                    {formatTimestamp(message.createdAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="p-4 border-t border-border bg-muted/30">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Digite sua mensagem..." 
                          className="flex-1"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          className="bg-primary hover:bg-primary/90 text-black" 
                          size="icon"
                          onClick={handleSendMessage}
                          disabled={!messageText.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-primary/10 rounded-full p-4 mb-4">
                      <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Suas Conversas</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      Selecione uma conversa à esquerda ou inicie uma nova para começar a conversar com outros profissionais
                    </p>
                    <Button className="bg-primary hover:bg-primary/90 text-black">
                      <Plus className="h-4 w-4 mr-2" />
                      Iniciar Nova Conversa
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Tab do Fórum */}
          <TabsContent value="forum" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna esquerda - Categorias e Tags */}
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold">Categorias</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Layers className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Arquitetura</span>
                      </div>
                      <Badge variant="outline">248</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Layers className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Design de Interiores</span>
                      </div>
                      <Badge variant="outline">187</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Layers className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Negócios</span>
                      </div>
                      <Badge variant="outline">145</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Layers className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Tecnologia</span>
                      </div>
                      <Badge variant="outline">132</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Layers className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Sustentabilidade</span>
                      </div>
                      <Badge variant="outline">97</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="link" size="sm" className="w-full">
                      Ver Todas as Categorias
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold">Tags Populares</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">precificação</Badge>
                      <Badge variant="outline">bim</Badge>
                      <Badge variant="outline">sustentabilidade</Badge>
                      <Badge variant="outline">renderização</Badge>
                      <Badge variant="outline">marketing</Badge>
                      <Badge variant="outline">legislação</Badge>
                      <Badge variant="outline">acessibilidade</Badge>
                      <Badge variant="outline">reformas</Badge>
                      <Badge variant="outline">iluminação</Badge>
                      <Badge variant="outline">contratos</Badge>
                      <Badge variant="outline">clientes</Badge>
                      <Badge variant="outline">orçamentos</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-black">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Novo Tópico
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Coluna direita - Tópicos */}
              <div className="lg:col-span-9">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <h3 className="text-lg font-semibold">Tópicos Recentes</h3>
                      <div className="flex space-x-2">
                        <div className="relative w-full md:w-auto">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar tópicos..."
                            className="pl-9 w-full md:w-[250px]"
                          />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Filter className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuItem>Mais recentes</DropdownMenuItem>
                            <DropdownMenuItem>Mais populares</DropdownMenuItem>
                            <DropdownMenuItem>Mais ativos</DropdownMenuItem>
                            <DropdownMenuItem>Sem respostas</DropdownMenuItem>
                            <DropdownMenuItem>Resolvidos</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {forumTopics.map(topic => (
                        <div 
                          key={topic.id} 
                          className="p-5 border-0 rounded-md bg-muted/30 transition-all duration-300 hover:shadow-md hover:bg-muted/50 group"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-3">
                              <div className="flex items-start gap-3 max-w-3xl">
                                <Avatar className="h-10 w-10 border-2 border-primary/30 group-hover:border-primary transition-colors duration-300">
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {topic.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium text-lg group-hover:text-primary transition-colors">
                                    {topic.isPinned && (
                                      <Badge variant="default" className="mr-2 bg-primary/80 text-black">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Destaque
                                      </Badge>
                                    )}
                                    {topic.isLocked && (
                                      <Badge variant="outline" className="mr-2 border-red-500 text-red-500">
                                        <Lock className="h-3 w-3 mr-1" />
                                        Fechado
                                      </Badge>
                                    )}
                                    {topic.title}
                                  </h4>
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {topic.tags.map((tag, idx) => (
                                      <Badge key={idx} variant="outline" className="px-2 py-0 border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors">
                                        <Hash className="h-3 w-3 mr-1 text-primary/80" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center text-xs text-muted-foreground ml-12">
                                <span className="font-medium text-foreground group-hover:text-primary/80 transition-colors">{topic.user.name}</span>
                                <span className="mx-2">•</span>
                                <Clock className="h-3 w-3 mr-1" />
                                <span>Última atividade: {formatTimestamp(topic.lastActivityAt)}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-3">
                              <Button variant="ghost" size="sm" className="h-8 opacity-0 group-hover:opacity-100 transition-all text-primary">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Responder
                              </Button>
                              <div className="flex gap-6 text-sm">
                                <div className="flex flex-col items-center">
                                  <span className="font-semibold text-lg">{topic.responsesCount}</span>
                                  <span className="text-xs text-muted-foreground">Respostas</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="font-semibold text-lg">{topic.viewsCount}</span>
                                  <span className="text-xs text-muted-foreground">Visitas</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button variant="outline">Carregar Mais Tópicos</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab de Descobrir */}
          <TabsContent value="discover" className="mt-0">
            <div className="space-y-8">
              {/* Banner destacado */}
              <div className="relative w-full h-64 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/30 z-10"></div>
                <img 
                  src="https://source.unsplash.com/random/1200x400?architecture,modern" 
                  alt="Arquitetura moderna" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Descubra a Comunidade ConectaWorking</h2>
                  <p className="text-white/90 max-w-xl mb-6">Conecte-se com profissionais de arquitetura e design, participe de grupos temáticos e expanda sua rede.</p>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-white text-primary hover:bg-white/90">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Explorar
                    </Button>
                    <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                      <BellRing className="h-4 w-4 mr-2" />
                      Receber Recomendações
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Profissionais em destaque */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Profissionais em Destaque</h3>
                  <Button variant="link">Ver Todos</Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {users.map(user => (
                    <Card key={user.id} className="transition-all duration-200 hover:shadow-md">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                          <AvatarFallback className="text-xl">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <h4 className="font-semibold text-lg">{user.name}</h4>
                        <p className="text-sm text-muted-foreground mb-4">{user.role}</p>
                        
                        <div className="flex justify-center gap-2 mb-4">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Arquitetura
                          </Badge>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Design
                          </Badge>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary"
                        >
                          Ver Perfil
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Eventos em destaque */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Eventos em Destaque</h3>
                  <Button variant="link">Ver Todos</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded text-center min-w-[60px]">
                          <div className="text-xs font-medium">MAI</div>
                          <div className="text-2xl font-bold">15</div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">Webinar: Tendências em Arquitetura Residencial 2024</h4>
                          <p className="text-sm text-muted-foreground mt-1 mb-3">19:00 - 20:30 • Online</p>
                          <p className="text-sm">
                            Uma análise profunda das principais tendências em arquitetura residencial para 2024, com foco em sustentabilidade e bem-estar.
                          </p>
                          
                          <div className="flex justify-between items-center mt-4">
                            <Badge variant="outline">180 participantes</Badge>
                            <Button variant="outline" size="sm">
                              Participar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded text-center min-w-[60px]">
                          <div className="text-xs font-medium">MAI</div>
                          <div className="text-2xl font-bold">22</div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">Workshop: Iluminação Inteligente em Projetos</h4>
                          <p className="text-sm text-muted-foreground mt-1 mb-3">14:00 - 17:00 • São Paulo</p>
                          <p className="text-sm">
                            Workshop prático sobre integração de sistemas de iluminação inteligente em projetos residenciais e comerciais.
                          </p>
                          
                          <div className="flex justify-between items-center mt-4">
                            <Badge variant="outline">98 participantes</Badge>
                            <Button variant="outline" size="sm">
                              Participar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-3 rounded text-center min-w-[60px]">
                          <div className="text-xs font-medium">JUN</div>
                          <div className="text-2xl font-bold">05</div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">Encontro: Networking de Arquitetos</h4>
                          <p className="text-sm text-muted-foreground mt-1 mb-3">18:30 - 21:30 • Rio de Janeiro</p>
                          <p className="text-sm">
                            Evento presencial para networking entre arquitetos, designers e profissionais da construção civil.
                          </p>
                          
                          <div className="flex justify-between items-center mt-4">
                            <Badge variant="outline">142 participantes</Badge>
                            <Button variant="outline" size="sm">
                              Participar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Artigos e Conteúdos */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Conteúdos em Destaque</h3>
                  <Button variant="link">Ver Todos</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="overflow-hidden">
                    <img 
                      src="https://source.unsplash.com/random/600x400?architecture,sustainable" 
                      alt="Arquitetura sustentável" 
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg mb-2">O Futuro da Arquitetura Sustentável</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Uma análise das principais tendências sustentáveis que estão revolucionando o setor da arquitetura.
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">JF</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">Julia Fernandes</span>
                        </div>
                        <span className="text-xs text-muted-foreground">7 min de leitura</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <img 
                      src="https://source.unsplash.com/random/600x400?interior,design" 
                      alt="Design de interiores" 
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg mb-2">Tendências de Cores para 2024</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Descubra as paletas de cores que definirão as tendências de design de interiores no próximo ano.
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">MC</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">Marina Costa</span>
                        </div>
                        <span className="text-xs text-muted-foreground">5 min de leitura</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <img 
                      src="https://source.unsplash.com/random/600x400?architecture,business" 
                      alt="Negócios de arquitetura" 
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg mb-2">Precificação Inteligente para Arquitetos</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Estratégias de precificação que valorizam seu trabalho e aumentam a rentabilidade do seu escritório.
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">RM</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">Rafael Mendes</span>
                        </div>
                        <span className="text-xs text-muted-foreground">9 min de leitura</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}