import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Edit, 
  Settings, 
  MessageCircle, 
  Users, 
  FileText, 
  Award, 
  Calendar, 
  Bookmark, 
  Heart, 
  Eye, 
  Send, 
  Clock, 
  Pencil,
  Camera,
  Link,
  ExternalLink,
  Map,
  Briefcase,
  Mail,
  Phone,
  CheckCircle,
  Share2
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface UserActivity {
  id: number;
  type: 'post' | 'comment' | 'like' | 'share' | 'project' | 'completion';
  content: string;
  timestamp: Date;
  relatedTo?: string;
  imageUrl?: string;
}

interface UserAchievement {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  awardedAt: Date;
  category: 'engagement' | 'professional' | 'learning';
}

interface UserProject {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  likes: number;
  comments: number;
  views: number;
  createdAt: Date;
}

interface UserCourse {
  id: number;
  title: string;
  thumbnailUrl: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

interface UserSkill {
  name: string;
  level: number; // 0-100
}

const CommunityProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dados de exemplo do usuário
  const user = {
    id: 1,
    name: 'Carlos Silva',
    username: 'carlos.silva',
    role: 'Arquiteto',
    bio: 'Arquiteto especializado em projetos residenciais sustentáveis. Mais de 10 anos de experiência em projetos de médio e grande porte. Apaixonado por inovação em design e materiais ecológicos.',
    avatar: '',
    coverImage: 'https://source.unsplash.com/random/1200x300?architecture,modern',
    location: 'São Paulo, SP',
    website: 'arquitetocarlossilva.com.br',
    email: 'carlos@exemplo.com',
    phone: '+55 11 98765-4321',
    joinedAt: new Date(2022, 5, 12),
    isVerified: true,
    followers: 248,
    following: 153,
    projects: 37,
    contributions: 89,
    social: {
      linkedin: 'carlossilva-arq',
      instagram: 'carlossilva.arq',
      pinterest: 'carlossilva_arq'
    },
    skills: [
      { name: 'Projeto Residencial', level: 95 },
      { name: 'Arquitetura Sustentável', level: 90 },
      { name: 'Revit', level: 85 },
      { name: 'AutoCAD', level: 80 },
      { name: 'Sketchup', level: 75 },
      { name: 'Render', level: 70 }
    ] as UserSkill[],
    education: [
      { institution: 'Universidade de São Paulo', degree: 'Mestrado em Arquitetura Sustentável', year: '2015-2017' },
      { institution: 'Universidade de São Paulo', degree: 'Bacharelado em Arquitetura e Urbanismo', year: '2010-2014' }
    ],
    work: [
      { company: 'Studio Arquitetura Verde', position: 'Arquiteto Sênior', period: '2019-Atual' },
      { company: 'ABC Projetos', position: 'Arquiteto Pleno', period: '2015-2019' },
      { company: 'XYZ Arquitetura', position: 'Arquiteto Júnior', period: '2014-2015' }
    ]
  };
  
  // Dados de exemplo de atividades
  const activities: UserActivity[] = [
    {
      id: 1,
      type: 'post',
      content: 'Compartilhei um novo projeto de casa sustentável utilizando bambu como material principal.',
      timestamp: new Date(2023, 10, 15, 14, 30),
      imageUrl: 'https://source.unsplash.com/random/600x400?bamboo,house'
    },
    {
      id: 2,
      type: 'comment',
      content: 'Excelente abordagem sobre eficiência energética. Tenho utilizado soluções semelhantes nos meus projetos.',
      timestamp: new Date(2023, 10, 14, 10, 15),
      relatedTo: 'Eficiência Energética em Edifícios'
    },
    {
      id: 3,
      type: 'completion',
      content: 'Concluiu o curso Técnicas Avançadas de Renderização 3D',
      timestamp: new Date(2023, 10, 12, 18, 45)
    },
    {
      id: 4,
      type: 'project',
      content: 'Adicionou um novo projeto ao portfólio: Casa Horizonte',
      timestamp: new Date(2023, 10, 10, 9, 20),
      imageUrl: 'https://source.unsplash.com/random/600x400?modern,house'
    },
    {
      id: 5,
      type: 'like',
      content: 'Curtiu o post: Técnicas de Biofilia em Ambientes Internos',
      timestamp: new Date(2023, 10, 8, 16, 30)
    }
  ];
  
  // Dados de exemplo de conquistas
  const achievements: UserAchievement[] = [
    {
      id: 1,
      name: 'Colaborador Ativo',
      description: 'Participou de mais de 50 discussões na comunidade',
      icon: <MessageCircle className="h-5 w-5" />,
      awardedAt: new Date(2023, 9, 15),
      category: 'engagement'
    },
    {
      id: 2,
      name: 'Mestre em Sustentabilidade',
      description: 'Concluiu 5 cursos na área de arquitetura sustentável',
      icon: <Award className="h-5 w-5" />,
      awardedAt: new Date(2023, 8, 10),
      category: 'learning'
    },
    {
      id: 3,
      name: 'Profissional Certificado',
      description: 'Obteve certificação profissional de Arquiteto Sustentável',
      icon: <CheckCircle className="h-5 w-5" />,
      awardedAt: new Date(2023, 7, 22),
      category: 'professional'
    },
    {
      id: 4,
      name: 'Criador de Conteúdo',
      description: 'Criou mais de 20 posts educativos para a comunidade',
      icon: <Pencil className="h-5 w-5" />,
      awardedAt: new Date(2023, 6, 18),
      category: 'engagement'
    },
    {
      id: 5,
      name: 'Mentor',
      description: 'Ajudou mais de 30 profissionais com dúvidas técnicas',
      icon: <Users className="h-5 w-5" />,
      awardedAt: new Date(2023, 5, 5),
      category: 'professional'
    }
  ];
  
  // Dados de exemplo de projetos
  const projects: UserProject[] = [
    {
      id: 1,
      title: 'Casa Horizonte',
      description: 'Projeto residencial com foco em sustentabilidade e integração com a natureza. Utilização de energia solar e captação de água de chuva.',
      imageUrl: 'https://source.unsplash.com/random/600x400?house,modern',
      likes: 56,
      comments: 12,
      views: 340,
      createdAt: new Date(2023, 9, 15)
    },
    {
      id: 2,
      title: 'Escritório Verde',
      description: 'Reforma de escritório com princípios de biofilia e eficiência energética. Materiais reciclados e sistema de iluminação inteligente.',
      imageUrl: 'https://source.unsplash.com/random/600x400?office,green',
      likes: 42,
      comments: 8,
      views: 275,
      createdAt: new Date(2023, 8, 20)
    },
    {
      id: 3,
      title: 'Loft Minimalista',
      description: 'Projeto de loft com design minimalista e soluções multifuncionais para otimização de espaço.',
      imageUrl: 'https://source.unsplash.com/random/600x400?loft,minimal',
      likes: 38,
      comments: 6,
      views: 210,
      createdAt: new Date(2023, 7, 5)
    }
  ];
  
  // Dados de exemplo de cursos
  const courses: UserCourse[] = [
    {
      id: 1,
      title: 'Técnicas Avançadas de Renderização 3D',
      thumbnailUrl: 'https://source.unsplash.com/random/400x225?render,3d',
      progress: 100,
      totalLessons: 12,
      completedLessons: 12
    },
    {
      id: 2,
      title: 'Arquitetura Bioclimática',
      thumbnailUrl: 'https://source.unsplash.com/random/400x225?architecture,climate',
      progress: 75,
      totalLessons: 16,
      completedLessons: 12
    },
    {
      id: 3,
      title: 'BIM para Arquitetos',
      thumbnailUrl: 'https://source.unsplash.com/random/400x225?bim,architecture',
      progress: 40,
      totalLessons: 20,
      completedLessons: 8
    },
    {
      id: 4,
      title: 'Design de Interiores Comerciais',
      thumbnailUrl: 'https://source.unsplash.com/random/400x225?interior,commercial',
      progress: 25,
      totalLessons: 16,
      completedLessons: 4
    }
  ];
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
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
      return `${diffMinutes} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return formatDate(date);
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-purple-500" />;
      case 'project':
        return <Briefcase className="h-4 w-4 text-amber-500" />;
      case 'completion':
        return <Award className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{user.name} | Perfil na Comunidade ConectaWorking</title>
        <meta name="description" content={`Perfil profissional de ${user.name}, ${user.role} na comunidade ConectaWorking.`} />
      </Helmet>
      
      {/* Banner e Informações do Perfil */}
      <div className="relative h-[300px] overflow-hidden mb-[80px]">
        {/* Imagem de capa com gradient overlay */}
        <div className="absolute inset-0">
          <img 
            src={user.coverImage} 
            alt="Capa do perfil" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        {/* Conteúdo do cabeçalho */}
        <div className="relative container mx-auto h-full flex items-end pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end w-full">
            {/* Avatar do usuário */}
            <div className="mt-auto relative">
              <Avatar className="h-[160px] w-[160px] border-4 border-background shadow-lg">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
              {user.isVerified && (
                <div className="absolute bottom-2 right-2 bg-primary rounded-full p-1 border-2 border-background">
                  <CheckCircle className="h-6 w-6 text-black" />
                </div>
              )}
              <Button 
                variant="outline" 
                size="icon"
                className="absolute bottom-2 left-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={() => setIsEditing(true)}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Informações do usuário */}
            <div className="flex-1 text-white pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight group transition-colors">
                  {user.name}
                  {user.isVerified && (
                    <CheckCircle className="inline-block ml-2 h-5 w-5 text-primary" />
                  )}
                </h1>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 text-xs">
                    {user.role}
                  </Badge>
                  <Badge variant="outline" className="border-muted-foreground/30 text-xs">
                    Membro desde {formatDate(user.joinedAt)}
                  </Badge>
                </div>
              </div>
              <p className="text-lg text-muted-foreground mt-1 mb-4 max-w-2xl">
                @{user.username}
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span><b className="text-white">{user.followers}</b> seguidores</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>Seguindo <b className="text-white">{user.following}</b></span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="mr-1 h-4 w-4" />
                  <span><b className="text-white">{user.projects}</b> projetos</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  <span><b className="text-white">{user.contributions}</b> contribuições</span>
                </div>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex gap-2 mt-4 md:mt-0 ml-auto">
              <Button variant="outline" className="border-white text-white hover:bg-white/20">
                <MessageCircle className="mr-2 h-4 w-4" />
                Mensagem
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-black">
                <Users className="mr-2 h-4 w-4" />
                Seguir
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="border-white text-white hover:bg-white/20">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartilhar perfil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto pb-12">
        {isEditing ? (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-2xl font-bold">Editar perfil</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Nome</label>
                    <Input defaultValue={user.name} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Nome de usuário</label>
                    <Input defaultValue={user.username} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Cargo/Função</label>
                    <Input defaultValue={user.role} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Localização</label>
                    <Input defaultValue={user.location} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Website</label>
                    <Input defaultValue={user.website} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Bio/Sobre</label>
                    <Textarea 
                      defaultValue={user.bio} 
                      rows={5}
                      placeholder="Fale um pouco sobre você, sua experiência e especialidades..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">E-mail de contato</label>
                    <Input defaultValue={user.email} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Telefone</label>
                    <Input defaultValue={user.phone} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button className="bg-primary hover:bg-primary/90 text-black" onClick={() => setIsEditing(false)}>
                Salvar alterações
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="w-full sm:w-auto justify-start overflow-x-auto bg-transparent p-0 h-auto border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                <div className="flex space-x-2 min-w-max">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:border-primary border-b-2 border-transparent px-6 py-3 text-base font-medium"
                  >
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger 
                    value="projects" 
                    className="data-[state=active]:border-primary border-b-2 border-transparent px-6 py-3 text-base font-medium"
                  >
                    Projetos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="achievements" 
                    className="data-[state=active]:border-primary border-b-2 border-transparent px-6 py-3 text-base font-medium"
                  >
                    Conquistas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="learning" 
                    className="data-[state=active]:border-primary border-b-2 border-transparent px-6 py-3 text-base font-medium"
                  >
                    Aprendizado
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity" 
                    className="data-[state=active]:border-primary border-b-2 border-transparent px-6 py-3 text-base font-medium"
                  >
                    Atividade
                  </TabsTrigger>
                </div>
              </TabsList>
              
              {/* Tab do Overview */}
              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Coluna esquerda - Informações do perfil */}
                  <div className="lg:col-span-1 space-y-6">
                    <Card>
                      <CardHeader>
                        <h3 className="text-xl font-semibold">Sobre</h3>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <p className="text-muted-foreground">{user.bio}</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Map className="h-4 w-4 text-muted-foreground" />
                            <span>{user.location}</span>
                          </div>
                          {user.website && (
                            <div className="flex items-center gap-2">
                              <Link className="h-4 w-4 text-muted-foreground" />
                              <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {user.website}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{user.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Membro desde {formatDate(user.joinedAt)}</span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          <h4 className="font-medium">Redes Sociais</h4>
                          <div className="flex flex-wrap gap-3">
                            <Button variant="outline" size="sm" className="gap-2">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                              </svg>
                              <span className="flex-grow">LinkedIn</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3z" />
                              </svg>
                              <span className="flex-grow">Instagram</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.04 21.54c.96.29 1.93.46 2.96.46a10 10 0 0 0 10-10A10 10 0 0 0 12 2A10 10 0 0 0 2 12c0 4.25 2.67 7.9 6.44 9.34c-.04-.41-.08-.79-.08-1.2c0-2.57.01-4.68.01-5.32c0-.67.18-1.1.53-1.33c-.47-.07-.95-.11-1.4-.11c-.51 0-1.02.03-1.5.11c.11-.74.93-1.33 1.87-1.33c1.04 0 1.87.74 1.87 1.66c0 .81-.59 1.5-1.38 1.62c.68.15 1.34.48 1.88.96c.66.58 1.13 1.43 1.13 2.53v2.07c0 .88-.58 1.65-1.33 1.97c1.84-.63 3.28-2.15 3.74-4.05c.14-.59.13-1.2.04-1.76c.87-.15 1.69-.46 2.4-.9c.43-.27.79-.58 1.06-.94c.39-.5.62-1.08.62-1.7c0-.47-.12-.89-.39-1.28c-.24-.359-.6-.67-1.01-.91c-.6-.36-1.35-.6-2.15-.71v-.01c.7-.049 1.38-.17 2.02-.35c.81-.229 1.57-.59 2.16-1.079c.27-.21.53-.47.76-.75c.37-.449.63-.94.69-1.49c.04-.29.03-.57-.01-.85c.93-.07 1.78-.3 2.49-.83C20.48 4.84 21 5.38 21 6c0 1.299-2.34 2.34-5.25 2.34c-2.4 0-4.5-.64-5.45-1.59C8.43 8.14 7.5 10 7.5 12c0 1.93.99 3.63 2.5 4.59V21c0 .45.33.54.55.36c1.98-1.62 3.16-3.18 3.4-4.732a6.5 6.5 0 0 0 1.3.732c2.55 1.05 5.5.2 6.6-1.9c1.4 0 2.7-1.2 2.7-2.6c0-1.72-1.4-3-3-3.2c-.6-1.25-2.7-2.2-5.3-2.2c0 0-1 0-2 .17c.9-.45 1.9-.7 3-.7c3.86 0 7 3.14 7 7c0 3.59-2.71 6.54-6.2 6.94v3.37h1.49v-1.32c3.47-.46 6.2-3.41 6.2-7c0-3.86-3.14-7-7-7s-7 3.14-7 7c0 3.9 2.65 6.83 6.11 7h.89v1.32H9.04z" />
                              </svg>
                              <span className="flex-grow">Pinterest</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          <h4 className="font-medium">Habilidades</h4>
                          <div className="space-y-4">
                            {user.skills.map((skill, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{skill.name}</span>
                                  <span className="text-muted-foreground">{skill.level}%</span>
                                </div>
                                <Progress value={skill.level} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Coluna direita - Conteúdo principal */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Experiência */}
                    <Card>
                      <CardHeader>
                        <h3 className="text-xl font-semibold flex items-center">
                          <Briefcase className="mr-2 h-5 w-5 text-primary" />
                          Experiência Profissional
                        </h3>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {user.work.map((item, index) => (
                          <div key={index} className="relative pl-6 pb-4 border-l border-border last:pb-0">
                            <div className="absolute left-[-8px] top-0 h-4 w-4 rounded-full bg-primary/20 border-2 border-primary"></div>
                            <h4 className="font-semibold">{item.position}</h4>
                            <p className="text-muted-foreground">{item.company}</p>
                            <p className="text-sm text-muted-foreground">{item.period}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    {/* Educação */}
                    <Card>
                      <CardHeader>
                        <h3 className="text-xl font-semibold flex items-center">
                          <Award className="mr-2 h-5 w-5 text-primary" />
                          Formação Acadêmica
                        </h3>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {user.education.map((item, index) => (
                          <div key={index} className="relative pl-6 pb-4 border-l border-border last:pb-0">
                            <div className="absolute left-[-8px] top-0 h-4 w-4 rounded-full bg-primary/20 border-2 border-primary"></div>
                            <h4 className="font-semibold">{item.degree}</h4>
                            <p className="text-muted-foreground">{item.institution}</p>
                            <p className="text-sm text-muted-foreground">{item.year}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    {/* Projetos recentes */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <h3 className="text-xl font-semibold">Projetos Recentes</h3>
                        <Button variant="link" className="text-primary">
                          Ver todos
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {projects.slice(0, 2).map((project) => (
                            <div 
                              key={project.id} 
                              className="group overflow-hidden rounded-lg border border-border/60 transition-all duration-300 hover:shadow-md hover:border-primary/40"
                            >
                              <div className="relative h-48 overflow-hidden">
                                <img 
                                  src={project.imageUrl} 
                                  alt={project.title} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/20">
                                    Ver projeto
                                  </Button>
                                </div>
                              </div>
                              <div className="p-4">
                                <h4 className="font-semibold group-hover:text-primary transition-colors">
                                  {project.title}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {project.description}
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <Heart className="h-3 w-3 mr-1" />
                                    <span>{project.likes}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    <span>{project.comments}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Eye className="h-3 w-3 mr-1" />
                                    <span>{project.views}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Conquistas em destaque */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <h3 className="text-xl font-semibold">Conquistas em destaque</h3>
                        <Button variant="link" className="text-primary">
                          Ver todas
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {achievements.slice(0, 3).map((achievement) => (
                            <div 
                              key={achievement.id} 
                              className="border border-border/60 rounded-lg p-4 transition-all hover:border-primary/40 hover:shadow-md hover:scale-105 bg-muted/30"
                            >
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 mx-auto">
                                <div className="text-primary">
                                  {achievement.icon}
                                </div>
                              </div>
                              <h4 className="font-semibold text-center mb-1">{achievement.name}</h4>
                              <p className="text-xs text-muted-foreground text-center line-clamp-2">{achievement.description}</p>
                              <p className="text-xs text-center mt-2 text-primary">
                                {formatDate(achievement.awardedAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab de Projetos */}
              <TabsContent value="projects" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Meus Projetos</h2>
                  <Button className="bg-primary hover:bg-primary/90 text-black">
                    <FileText className="mr-2 h-4 w-4" />
                    Novo Projeto
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <Card key={project.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-0">
                      <div className="relative h-48">
                        <img 
                          src={project.imageUrl} 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <Button variant="outline" className="border-white text-white hover:bg-white/20">
                            Ver detalhes
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {project.description}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex gap-3">
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1 text-red-500" />
                              <span className="text-muted-foreground">{project.likes}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1 text-blue-500" />
                              <span className="text-muted-foreground">{project.comments}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1 text-green-500" />
                              <span className="text-muted-foreground">{project.views}</span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(project.createdAt)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              {/* Tab de Conquistas */}
              <TabsContent value="achievements" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Minhas Conquistas</h2>
                    <p className="text-muted-foreground">Conquistas desbloqueadas por participação na plataforma</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1">
                    <div className="sticky top-20 space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 h-auto py-3 font-medium"
                      >
                        <Award className="h-5 w-5 text-primary" />
                        <span>Todas as conquistas</span>
                        <Badge className="ml-auto bg-primary/20 text-primary hover:bg-primary/30">
                          {achievements.length}
                        </Badge>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2 h-auto py-3 font-medium"
                      >
                        <MessageCircle className="h-5 w-5 text-green-500" />
                        <span>Engajamento</span>
                        <Badge className="ml-auto bg-muted hover:bg-muted/80">
                          {achievements.filter(a => a.category === 'engagement').length}
                        </Badge>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2 h-auto py-3 font-medium"
                      >
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span>Aprendizado</span>
                        <Badge className="ml-auto bg-muted hover:bg-muted/80">
                          {achievements.filter(a => a.category === 'learning').length}
                        </Badge>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2 h-auto py-3 font-medium"
                      >
                        <Briefcase className="h-5 w-5 text-amber-500" />
                        <span>Profissional</span>
                        <Badge className="ml-auto bg-muted hover:bg-muted/80">
                          {achievements.filter(a => a.category === 'professional').length}
                        </Badge>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {achievements.map((achievement) => (
                        <Card 
                          key={achievement.id} 
                          className="overflow-hidden group transition-all duration-300 hover:shadow-md hover:scale-105 border-0 bg-muted/30"
                        >
                          <CardContent className="pt-6 pb-4 px-5 flex flex-col items-center text-center">
                            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                              <div className="text-primary">
                                {achievement.icon}
                              </div>
                            </div>
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                              {achievement.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {achievement.description}
                            </p>
                            <Badge className="mt-auto bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                              {formatDate(achievement.awardedAt)}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab de Aprendizado */}
              <TabsContent value="learning" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Meu Aprendizado</h2>
                    <p className="text-muted-foreground">Cursos, certificados e conhecimentos</p>
                  </div>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Certificados
                  </Button>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Cursos em Andamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {courses.filter(c => c.progress < 100).map((course) => (
                        <Card key={course.id} className="overflow-hidden group transition-all duration-300 hover:shadow-md hover:scale-105 border-0">
                          <div className="relative h-36">
                            <img 
                              src={course.thumbnailUrl} 
                              alt={course.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <Progress value={course.progress} className="h-1.5 bg-white/20" />
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {course.title}
                            </h4>
                            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                              <span>{course.progress}% concluído</span>
                              <span>{course.completedLessons} de {course.totalLessons} aulas</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Cursos Concluídos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {courses.filter(c => c.progress === 100).map((course) => (
                        <Card key={course.id} className="overflow-hidden group transition-all duration-300 hover:shadow-md hover:scale-105 border-0">
                          <div className="relative h-36">
                            <img 
                              src={course.thumbnailUrl} 
                              alt={course.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-primary text-black">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Concluído
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {course.title}
                            </h4>
                            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                              <span>100% concluído</span>
                              <span>{course.totalLessons} aulas</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Minhas Habilidades</h3>
                    <Card>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {user.skills.map((skill, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">{skill.name}</h4>
                                <span className="text-sm text-muted-foreground">{skill.level}%</span>
                              </div>
                              <Progress value={skill.level} className="h-2.5" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab de Atividade */}
              <TabsContent value="activity" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Atividade Recente</h2>
                    <p className="text-muted-foreground">Histórico de atividades e interações</p>
                  </div>
                </div>
                
                <div className="relative pl-6 border-l border-border space-y-8">
                  {activities.map((activity) => (
                    <div key={activity.id} className="relative">
                      <div className="absolute left-[-14px] top-0 h-5 w-5 rounded-full bg-muted flex items-center justify-center border border-border">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <Card className="group">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {activity.type === 'post' && 'Publicação'}
                              {activity.type === 'comment' && 'Comentário'}
                              {activity.type === 'like' && 'Curtida'}
                              {activity.type === 'share' && 'Compartilhamento'}
                              {activity.type === 'project' && 'Projeto'}
                              {activity.type === 'completion' && 'Conquista'}
                            </Badge>
                          </div>
                          
                          <p className="text-base mb-4">{activity.content}</p>
                          
                          {activity.relatedTo && (
                            <div className="pl-4 border-l-2 border-muted-foreground/20 text-muted-foreground text-sm">
                              Em: {activity.relatedTo}
                            </div>
                          )}
                          
                          {activity.imageUrl && (
                            <div className="mt-4 overflow-hidden rounded-md">
                              <img 
                                src={activity.imageUrl} 
                                alt="Imagem da atividade" 
                                className="w-full h-auto max-h-[300px] object-cover transition-transform duration-500 group-hover:scale-105" 
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button variant="outline">Carregar mais atividades</Button>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </>
  );
};

export default CommunityProfilePage;