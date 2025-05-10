import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Play, Info, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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
    <Card className="overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-lg border-0">
      <div className="relative h-44 overflow-hidden">
        <img 
          src={course.thumbnailUrl} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex items-center justify-between">
            <Button size="sm" variant="default" className="bg-primary hover:bg-primary/90">
              <Play className="mr-1 h-3 w-3" /> Assistir
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-black/30">
              <Info className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {course.isPromoted && (
          <Badge className="absolute top-2 right-2 bg-primary text-black font-medium">
            Promoção
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium line-clamp-1 text-base group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <div className="flex items-center justify-between mt-1 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
            <span>{course.averageRating?.toFixed(1) || "Novo"}</span>
          </div>
          <span className="text-xs">{course.duration} horas • {course.totalLessons} aulas</span>
        </div>
      </CardContent>
    </Card>
  );

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
        <div className="relative w-full h-[60vh] mb-8">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      ) : featuredCourse && (
        <div className="relative w-full h-[60vh] mb-8">
          <div className="absolute inset-0">
            <img 
              src={featuredCourse.bannerUrl}
              alt={featuredCourse.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          </div>
          
          <div className="relative z-10 container mx-auto h-full flex items-center">
            <div className="max-w-2xl text-white p-6">
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary mb-4">
                Destaque
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                {featuredCourse.title}
              </h1>
              <p className="text-lg text-gray-200 mb-6">
                {featuredCourse.shortDescription}
              </p>
              <div className="flex flex-wrap gap-6 mb-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{featuredCourse.averageRating?.toFixed(1) || "Sem avaliações"}</span>
                </div>
                <div>Nível: {mapDifficultyToPortuguese(featuredCourse.difficulty)}</div>
                <div>{featuredCourse.totalLessons} aulas • {featuredCourse.duration}h total</div>
                <div>Mais de {featuredCourse.totalEnrollments} alunos</div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-black">
                  <Play className="mr-2 h-4 w-4" /> Começar agora
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                  <Info className="mr-2 h-4 w-4" /> Mais informações
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