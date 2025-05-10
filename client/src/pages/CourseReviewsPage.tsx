import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { 
  Star, 
  StarHalf, 
  Filter, 
  Search, 
  ChevronDown, 
  ThumbsUp, 
  Eye,
  Clock,
  Calendar,
  BarChart2,
  MessageCircle,
  BookOpen
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function CourseReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [location, setLocation] = useLocation();
  
  // Dados simulados
  const reviews: Review[] = [
    {
      id: 1,
      courseId: 1,
      courseTitle: "Arquitetura de Interiores: Do Conceito ao Projeto",
      courseImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW50ZXJpb3IlMjBhcmNoaXRlY3R1cmV8ZW58MHx8MHx8fDA%3D",
      userId: 101,
      userName: "Ana Silva",
      userAvatar: "",
      userInitials: "AS",
      rating: 5,
      title: "Curso excepcional com conteúdo prático",
      content: "Este curso superou todas as minhas expectativas. O conteúdo é extremamente prático e me ajudou a desenvolver projetos reais. A didática do professor é excelente, e os materiais complementares são muito úteis. Recomendo a todos os profissionais da área que desejam aprimorar suas habilidades em design de interiores.",
      date: new Date('2023-11-15'),
      helpfulCount: 24,
      verified: true
    },
    {
      id: 2,
      courseId: 2,
      courseTitle: "Renderização Avançada para Projetos Arquitetônicos",
      courseImage: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aW50ZXJpb3IlMjByZW5kZXJ8ZW58MHx8MHx8fDA%3D",
      userId: 102,
      userName: "Carlos Mendes",
      userAvatar: "https://randomuser.me/api/portraits/men/35.jpg",
      userInitials: "CM",
      rating: 4,
      title: "Ótimo conteúdo sobre iluminação",
      content: "O curso é muito bom, especialmente os módulos sobre iluminação e materiais. A qualidade das aulas é excelente, com demonstrações passo a passo. Só não dei 5 estrelas porque senti falta de mais exercícios práticos para fixação do conteúdo. De qualquer forma, já estou aplicando muito do que aprendi nos meus projetos profissionais.",
      date: new Date('2023-10-28'),
      helpfulCount: 16,
      verified: true
    },
    {
      id: 3,
      courseId: 3,
      courseTitle: "Design Sustentável para Edificações",
      courseImage: "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHN1c3RhaW5hYmxlJTIwYXJjaGl0ZWN0dXJlfGVufDB8fDB8fHww",
      userId: 103,
      userName: "Juliana Costa",
      userAvatar: "https://randomuser.me/api/portraits/women/45.jpg",
      userInitials: "JC",
      rating: 3,
      title: "Conteúdo bom, mas desatualizado",
      content: "O curso tem bons conceitos fundamentais sobre sustentabilidade, mas algumas técnicas e materiais mencionados estão desatualizados. Seria interessante uma atualização com as novas tecnologias e práticas sustentáveis que surgiram nos últimos anos. Os estudos de caso são interessantes, mas poderiam incluir exemplos mais recentes.",
      date: new Date('2023-09-05'),
      helpfulCount: 8,
      verified: false
    },
    {
      id: 4,
      courseId: 1,
      courseTitle: "Arquitetura de Interiores: Do Conceito ao Projeto",
      courseImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW50ZXJpb3IlMjBhcmNoaXRlY3R1cmV8ZW58MHx8MHx8fDA%3D",
      userId: 104,
      userName: "Roberto Almeida",
      userAvatar: "",
      userInitials: "RA",
      rating: 5,
      title: "Transformou minha carreira",
      content: "Este curso foi fundamental para minha transição de carreira para o design de interiores. Os módulos são muito bem estruturados, partindo dos conceitos básicos até técnicas mais avançadas. A professora explica de forma clara e objetiva, e os projetos práticos me ajudaram a montar um portfólio consistente. Já estou conseguindo meus primeiros clientes!",
      date: new Date('2023-11-20'),
      helpfulCount: 32,
      verified: true
    },
    {
      id: 5,
      courseId: 4,
      courseTitle: "Técnicas de Iluminação para Espaços Internos",
      courseImage: "https://images.unsplash.com/photo-1569533816166-49d08c516a77?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxpZ2h0aW5nJTIwZGVzaWdufGVufDB8fDB8fHww",
      userId: 105,
      userName: "Patricia Lima",
      userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
      userInitials: "PL",
      rating: 2,
      title: "Muito básico para o preço",
      content: "Achei o curso muito básico para o valor cobrado. As informações poderiam ser encontradas facilmente em tutoriais gratuitos na internet. Faltou profundidade técnica e exemplos mais elaborados de projetos de iluminação. A qualidade do áudio também deixou a desejar em várias aulas.",
      date: new Date('2023-10-10'),
      helpfulCount: 14,
      verified: true
    }
  ];

  // Dados de estatísticas de avaliações
  const ratingStats = {
    averageRating: 4.2,
    totalReviews: 768,
    distribution: [
      { rating: 5, percentage: 68 },
      { rating: 4, percentage: 20 },
      { rating: 3, percentage: 7 },
      { rating: 2, percentage: 3 },
      { rating: 1, percentage: 2 }
    ]
  };
  
  // Filtrar e ordenar avaliações
  const filteredReviews = reviews
    .filter(review => {
      // Filtrar por busca
      const matchesSearch = 
        review.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtrar por classificação
      const matchesRating = 
        filterRating === 'all' || 
        (filterRating === '5' && review.rating === 5) ||
        (filterRating === '4' && review.rating === 4) ||
        (filterRating === '3' && review.rating === 3) ||
        (filterRating === '2' && review.rating === 2) ||
        (filterRating === '1' && review.rating === 1);
      
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      // Ordenar avaliações
      if (sortBy === 'recent') {
        return b.date.getTime() - a.date.getTime();
      } else if (sortBy === 'highest') {
        return b.rating - a.rating;
      } else if (sortBy === 'lowest') {
        return a.rating - b.rating;
      } else if (sortBy === 'helpful') {
        return b.helpfulCount - a.helpfulCount;
      }
      return 0;
    });
  
  // Renderizar estrelas
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-primary text-primary" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-primary text-primary" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }
    
    return stars;
  };
  
  // Formatar data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Avaliações de Cursos | ConectaWorking</title>
        <meta name="description" content="Veja as avaliações e opiniões sobre os cursos da plataforma ConectaWorking" />
      </Helmet>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Avaliações de Cursos</h1>
        <p className="text-muted-foreground mt-2">
          Veja o que outros alunos estão dizendo sobre nossos cursos
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <h2 className="text-xl font-semibold">Média de Avaliações</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">{ratingStats.averageRating.toFixed(1)}</div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  {renderStars(ratingStats.averageRating)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {ratingStats.totalReviews} avaliações
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              {ratingStats.distribution.map(item => (
                <div key={item.rating} className="flex items-center gap-2">
                  <div className="w-8 text-sm text-muted-foreground flex items-center gap-1">
                    {item.rating} <Star className="h-3 w-3 fill-muted-foreground text-muted-foreground" />
                  </div>
                  <Progress value={item.percentage} className="h-2 flex-1" />
                  <div className="w-8 text-right text-sm text-muted-foreground">
                    {item.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-2">
            <h2 className="text-xl font-semibold">Estatísticas Gerais</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 p-4 rounded-lg flex flex-col items-center text-center">
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">42</div>
                <div className="text-sm text-muted-foreground">Cursos Avaliados</div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg flex flex-col items-center text-center">
                <ThumbsUp className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">92%</div>
                <div className="text-sm text-muted-foreground">Satisfação Geral</div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg flex flex-col items-center text-center">
                <MessageCircle className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">3.452</div>
                <div className="text-sm text-muted-foreground">Comentários</div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg flex flex-col items-center text-center">
                <BarChart2 className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">4.5</div>
                <div className="text-sm text-muted-foreground">Média Mensal</div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar nas avaliações..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-[130px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Estrelas" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="5">5 Estrelas</SelectItem>
                    <SelectItem value="4">4 Estrelas</SelectItem>
                    <SelectItem value="3">3 Estrelas</SelectItem>
                    <SelectItem value="2">2 Estrelas</SelectItem>
                    <SelectItem value="1">1 Estrela</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4" />
                      <SelectValue placeholder="Ordenar por" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais Recentes</SelectItem>
                    <SelectItem value="highest">Maior Nota</SelectItem>
                    <SelectItem value="lowest">Menor Nota</SelectItem>
                    <SelectItem value="helpful">Mais Úteis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList>
          <TabsTrigger value="all">Todas as Avaliações</TabsTrigger>
          <TabsTrigger value="my-courses">Meus Cursos</TabsTrigger>
          <TabsTrigger value="my-reviews">Minhas Avaliações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-muted/20">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Nenhuma avaliação encontrada</h3>
              <p className="text-muted-foreground">
                Tente ajustar seus filtros ou busca para encontrar avaliações.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map(review => (
                <Card key={review.id} className="overflow-hidden transition-all hover:shadow-md">
                  <div className="flex flex-col md:flex-row">
                    <div 
                      className="w-full md:w-52 h-40 md:h-auto bg-muted flex-shrink-0 cursor-pointer overflow-hidden border-r"
                      onClick={() => setLocation(`/cursos/${review.courseId}`)}
                    >
                      <img 
                        src={review.courseImage} 
                        alt={review.courseTitle}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    
                    <div className="flex-grow p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 
                            className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer"
                            onClick={() => setLocation(`/cursos/${review.courseId}`)}
                          >
                            {review.courseTitle}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(review.date)}
                            </div>
                          </div>
                        </div>
                        
                        {review.verified && (
                          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                            <Check className="mr-1 h-3 w-3" /> Verificado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.userAvatar} />
                          <AvatarFallback>{review.userInitials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{review.userName}</span>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">{review.title}</h4>
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {review.content}
                        </p>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <ThumbsUp className="mr-1 h-4 w-4" /> 
                          Útil ({review.helpfulCount})
                        </Button>
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 1000) + 100} visualizações</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-courses" className="mt-6">
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Avaliações dos seus cursos</h3>
            <p className="text-muted-foreground mb-4">
              Veja o que outras pessoas estão achando dos cursos que você está matriculado.
            </p>
            <Button onClick={() => setLocation('/cursos-netflix')}>
              Ver Meus Cursos
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="my-reviews" className="mt-6">
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Suas avaliações</h3>
            <p className="text-muted-foreground mb-4">
              Veja e gerencie as avaliações que você escreveu para os cursos.
            </p>
            <Button onClick={() => setLocation('/cursos-netflix')}>
              Avaliar um Curso
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Tipos
interface Review {
  id: number;
  courseId: number;
  courseTitle: string;
  courseImage: string;
  userId: number;
  userName: string;
  userAvatar: string;
  userInitials: string;
  rating: number;
  title: string;
  content: string;
  date: Date;
  helpfulCount: number;
  verified: boolean;
}