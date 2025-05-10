import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Play, Info, Star, ChevronRight, Clock, Users, Award, 
  Bookmark, BookOpen, TrendingUp, RotateCw, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Tipos para os dados de cursos
type Instructor = {
  id: number;
  name: string;
  profileImageUrl: string;
  speciality: string;
  isVerified: boolean;
};

type Course = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string;
  bannerUrl: string;
  trailerUrl: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  duration: number;
  totalLessons: number;
  price: number;
  isPromoted: boolean;
  promotionalPrice: number | null;
  isFeatured: boolean;
  averageRating: number | null;
  totalEnrollments: number;
  instructor: Instructor;
  category: {
    id: number;
    name: string;
    slug: string;
  };
};

type Category = {
  id: number;
  name: string;
  slug: string;
  featuredImage?: string;
  iconName?: string;
};

// Componente principal da página Netflix de cursos
export default function NetflixCoursesPage() {
  const [featuredCourse, setFeaturedCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coursesByCategory, setCoursesByCategory] = useState<Record<number, Course[]>>({});
  const [loading, setLoading] = useState(true);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [continueLearning, setContinueLearning] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);

  // Simulação de carregamento de dados
  useEffect(() => {
    const fetchData = async () => {
      // Simulação de chamada à API
      setTimeout(() => {
        // Dados de exemplo
        const mockInstructor: Instructor = {
          id: 1,
          name: "Ana Rodrigues",
          profileImageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
          speciality: "Arquitetura de Interiores",
          isVerified: true
        };

        const mockCategories: Category[] = [
          { id: 1, name: "Arquitetura Residencial", slug: "arquitetura-residencial" },
          { id: 2, name: "Design de Interiores", slug: "design-interiores" },
          { id: 3, name: "Renderização 3D", slug: "renderizacao-3d" },
          { id: 4, name: "Sustentabilidade", slug: "sustentabilidade" },
          { id: 5, name: "Gestão de Projetos", slug: "gestao-projetos" }
        ];

        // Criar cursos de exemplo para cada categoria
        const mockCoursesByCat: Record<number, Course[]> = {};
        const allCourses: Course[] = [];

        mockCategories.forEach(category => {
          const coursesForCat = Array(8).fill(null).map((_, index) => ({
            id: category.id * 100 + index,
            title: `Curso ${index + 1} de ${category.name}`,
            slug: `curso-${index + 1}-${category.slug}`,
            shortDescription: `Uma introdução completa ao universo de ${category.name} para profissionais.`,
            thumbnailUrl: `https://picsum.photos/seed/${category.slug}-${index}/400/225`,
            bannerUrl: `https://picsum.photos/seed/${category.slug}-banner-${index}/1920/1080`,
            trailerUrl: index % 3 === 0 ? "https://example.com/trailer.mp4" : null,
            difficulty: (['beginner', 'intermediate', 'advanced', 'all-levels'] as const)[Math.floor(Math.random() * 4)],
            duration: Math.floor(Math.random() * 20) + 5,
            totalLessons: Math.floor(Math.random() * 30) + 10,
            price: Math.floor(Math.random() * 500) + 100,
            isPromoted: Math.random() > 0.7,
            promotionalPrice: Math.random() > 0.7 ? Math.floor(Math.random() * 100) + 50 : null,
            isFeatured: index === 0,
            averageRating: Math.random() * 2 + 3, // Entre 3 e 5
            totalEnrollments: Math.floor(Math.random() * 5000),
            instructor: mockInstructor,
            category: {
              id: category.id,
              name: category.name,
              slug: category.slug
            }
          }));

          mockCoursesByCat[category.id] = coursesForCat;
          allCourses.push(...coursesForCat);
        });

        // Definir o curso destaque (featured)
        const featured = allCourses.find(c => c.isFeatured) || allCourses[0];
        
        // Popular cursos por popularidade
        const popular = [...allCourses].sort((a, b) => b.totalEnrollments - a.totalEnrollments).slice(0, 10);
        
        // Cursos para continuar aprendendo (simulação)
        const continued = allCourses.filter((_, index) => index % 7 === 0).slice(0, 5);
        
        // Cursos recomendados (simulação)
        const recommended = allCourses.filter((_, index) => index % 5 === 0).slice(0, 10);

        // Atualizar o estado com os dados
        setFeaturedCourse(featured);
        setCategories(mockCategories);
        setCoursesByCategory(mockCoursesByCat);
        setPopularCourses(popular);
        setContinueLearning(continued);
        setRecommendedCourses(recommended);
        setLoading(false);
      }, 1500);
    };

    fetchData();
  }, []);

  // Componente de cartão de curso em tamanho reduzido
  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 bg-black/5 dark:bg-white/5 rounded-xl">
      <div className="relative h-44 overflow-hidden rounded-t-xl">
        <img 
          src={course.thumbnailUrl} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="default" className="bg-primary hover:bg-primary/90 text-black font-medium rounded-full">
              <Play className="mr-1 h-3 w-3" /> Assistir
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-black/30 h-8 w-8 rounded-full">
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver detalhes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-white hover:bg-black/30 h-8 w-8 rounded-full ml-auto">
                    <Bookmark className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Salvar para depois</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {course.isPromoted && (
          <Badge className="absolute top-2 right-2 bg-primary text-black font-medium rounded-full px-2.5 py-0.5">
            <Sparkles className="h-3 w-3 mr-1" /> Promoção
          </Badge>
        )}
        {course.instructor && (
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 border-2 border-primary">
                    <AvatarImage src={course.instructor.profileImageUrl} alt={course.instructor.name} />
                    <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{course.instructor.name}</p>
                  <p className="text-xs text-muted-foreground">{course.instructor.speciality}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium line-clamp-1 text-base group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{course.averageRating?.toFixed(1) || "Novo"}</span>
            </div>
            <Badge variant="outline" className="text-xs font-normal rounded-full h-5 px-2 bg-primary/10 text-primary border-primary/20">
              {mapDifficultyToPortuguese(course.difficulty)}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{course.duration}h</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-3 w-3 mr-1" />
              <span>{course.totalLessons} aulas</span>
            </div>
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>{formatEnrollments(course.totalEnrollments)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // Função para formatar o número de matrículas
  function formatEnrollments(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }

  // Componente de esqueleto de carregamento para carrosséis
  const CarouselSkeleton = () => (
    <div className="space-y-5">
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-44 w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Cursos ConectaWorking | Aprenda arquitetura e design</title>
        <meta 
          name="description" 
          content="Aprenda arquitetura, design de interiores e gestão de projetos com nossos cursos online. Desenvolvido por profissionais para profissionais." 
        />
      </Helmet>

      {/* Banner de destaque */}
      {loading ? (
        <div className="relative w-full h-[70vh] mb-8">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      ) : featuredCourse && (
        <div className="relative w-full h-[70vh] mb-10 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={featuredCourse.bannerUrl}
              alt={featuredCourse.title}
              className="w-full h-full object-cover transform scale-105 animate-slowly-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          </div>
          
          <div className="relative z-10 container mx-auto h-full flex items-center">
            <div className="max-w-2xl text-white p-6">
              <div className="flex items-center gap-3 mb-5">
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary px-3 py-1 rounded-full">
                  <Sparkles className="mr-2 h-4 w-4" /> Destaque da Semana
                </Badge>
                {featuredCourse.isPromoted && (
                  <Badge className="bg-primary text-black font-medium px-3 py-1 rounded-full">
                    Promoção Especial
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight drop-shadow-md">
                {featuredCourse.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 border-2 border-primary mr-3">
                    <AvatarImage src={featuredCourse.instructor.profileImageUrl} alt={featuredCourse.instructor.name} />
                    <AvatarFallback>{featuredCourse.instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{featuredCourse.instructor.name}</p>
                    <p className="text-sm text-gray-300">{featuredCourse.instructor.speciality}</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-black/30 px-3 py-1 rounded-full ml-2">
                  <Star className="mr-1 h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{featuredCourse.averageRating?.toFixed(1) || "Novo"}</span>
                </div>
              </div>
              
              <p className="text-xl text-gray-100 mb-6 leading-relaxed drop-shadow-sm">
                {featuredCourse.shortDescription}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mb-7 text-sm bg-black/30 p-4 rounded-xl backdrop-blur-sm">
                <div className="flex items-center">
                  <Badge variant="outline" className="flex items-center gap-1 border-primary/30 bg-primary/10 text-primary">
                    <Award className="h-3.5 w-3.5" />
                    {mapDifficultyToPortuguese(featuredCourse.difficulty)}
                  </Badge>
                </div>
                
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-primary" />
                  <span>{featuredCourse.duration}h total</span>
                </div>
                
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4 text-primary" />
                  <span>{featuredCourse.totalLessons} aulas</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-primary" />
                  <span>Mais de {formatEnrollments(featuredCourse.totalEnrollments)} alunos</span>
                </div>
                
                {featuredCourse.price > 0 && (
                  <div className="flex items-center ml-auto">
                    {featuredCourse.isPromoted && featuredCourse.promotionalPrice ? (
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400 line-through text-xs">R$ {featuredCourse.price.toFixed(2)}</span>
                        <span className="text-primary font-bold text-xl">R$ {featuredCourse.promotionalPrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-primary font-bold text-xl">R$ {featuredCourse.price.toFixed(2)}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-black font-medium px-8 rounded-full">
                  <Play className="mr-2 h-5 w-5" /> Começar agora
                </Button>
                
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 rounded-full">
                  <Info className="mr-2 h-5 w-5" /> Mais informações
                </Button>
                
                <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 rounded-full">
                  <Bookmark className="mr-2 h-5 w-5" /> Salvar para depois
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 space-y-12">
        {/* Tabs de navegação */}
        <Tabs defaultValue="home" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="home">Início</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="latest">Lançamentos</TabsTrigger>
            <TabsTrigger value="mylearning">Meu Aprendizado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="space-y-12">
            {/* Continuar assistindo */}
            {loading ? (
              <CarouselSkeleton />
            ) : continueLearning.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  Continuar assistindo
                  <ChevronRight className="ml-1 h-5 w-5" />
                </h2>
                <Carousel className="w-full">
                  <CarouselContent>
                    {continueLearning.map((course) => (
                      <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
                        <CourseCard course={course} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-0" />
                  <CarouselNext className="right-0" />
                </Carousel>
              </section>
            )}

            {/* Cursos populares */}
            {loading ? (
              <CarouselSkeleton />
            ) : (
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  Mais populares
                  <ChevronRight className="ml-1 h-5 w-5" />
                </h2>
                <Carousel className="w-full">
                  <CarouselContent>
                    {popularCourses.map((course) => (
                      <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
                        <CourseCard course={course} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-0" />
                  <CarouselNext className="right-0" />
                </Carousel>
              </section>
            )}

            {/* Cursos por categoria */}
            {loading ? (
              <div className="space-y-16">
                {Array(3).fill(null).map((_, i) => (
                  <CarouselSkeleton key={i} />
                ))}
              </div>
            ) : (
              categories.map((category) => (
                <section key={category.id} className="pt-4">
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    {category.name}
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </h2>
                  <Carousel className="w-full">
                    <CarouselContent>
                      {coursesByCategory[category.id]?.map((course) => (
                        <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
                          <CourseCard course={course} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </Carousel>
                </section>
              ))
            )}
          </TabsContent>

          <TabsContent value="categories">
            <h2 className="text-2xl font-bold mb-6">Todas as Categorias</h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array(8).fill(null).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Card key={category.id} className="overflow-hidden h-40 group cursor-pointer hover:shadow-lg transition-all">
                    <div className="relative h-full">
                      <img 
                        src={`https://picsum.photos/seed/${category.slug}/600/400`}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                        <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="latest">
            <h2 className="text-2xl font-bold mb-6">Lançamentos Recentes</h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array(10).fill(null).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-44 w-full rounded-md" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {recommendedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mylearning">
            <h2 className="text-2xl font-bold mb-6">Meu Aprendizado</h2>
            {loading ? (
              <CarouselSkeleton />
            ) : continueLearning.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {continueLearning.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">Você ainda não começou nenhum curso</h3>
                <p className="text-muted-foreground mb-6">Explore nosso catálogo e comece a sua jornada de aprendizado</p>
                <Button className="bg-primary hover:bg-primary/90">Ver cursos recomendados</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// Função auxiliar para traduzir a dificuldade
function mapDifficultyToPortuguese(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all-levels'): string {
  const difficultyMap = {
    'beginner': 'Iniciante',
    'intermediate': 'Intermediário',
    'advanced': 'Avançado',
    'all-levels': 'Todos os níveis'
  };
  return difficultyMap[difficulty];
}