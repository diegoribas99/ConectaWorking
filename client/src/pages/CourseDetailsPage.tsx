import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Helmet } from 'react-helmet';
import { 
  Play, 
  Star, 
  Clock, 
  Users, 
  Award, 
  BookOpen, 
  CircleCheck, 
  ChevronDown, 
  ChevronUp,
  ListChecks,
  BarChart,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

// Tipos para os dados de cursos e aulas
type Lesson = {
  id: number;
  title: string;
  description: string | null;
  contentType: 'video' | 'text' | 'quiz' | 'download';
  contentUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  isFree: boolean;
  isCompleted?: boolean;
  progress?: number;
};

type Module = {
  id: number;
  title: string;
  description: string | null;
  lessons: Lesson[];
  isCompleted?: boolean;
  progress?: number;
};

type Instructor = {
  id: number;
  name: string;
  bio: string;
  profileImageUrl: string;
  speciality: string;
  isVerified: boolean;
  socialLinks?: Record<string, string>;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  userAvatar: string | null;
  createdAt: string;
};

type Course = {
  id: number;
  title: string;
  slug: string;
  description: string;
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
  averageRating: number | null;
  totalEnrollments: number;
  instructor: Instructor;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  modules: Module[];
  isEnrolled: boolean;
  progress?: number;
  requirements?: string;
  goals?: string;
  tags?: string[];
  reviews: Review[];
};

// Componente principal da página de detalhes do curso
export default function CourseDetailsPage() {
  const params = useParams();
  const courseSlug = params.slug;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

  // Simulação de carregamento de dados do curso
  useEffect(() => {
    const fetchCourse = async () => {
      // Simulação de chamada à API - em produção isso seria uma chamada real
      setTimeout(() => {
        // Dados de exemplo
        const mockInstructor: Instructor = {
          id: 1,
          name: "Ana Rodrigues",
          bio: "Arquiteta há mais de 15 anos, especialista em design de interiores sustentáveis. Formada pela USP com mestrado em sustentabilidade.",
          profileImageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
          speciality: "Arquitetura de Interiores",
          isVerified: true,
          socialLinks: {
            instagram: "https://instagram.com/ana.arq",
            linkedin: "https://linkedin.com/in/anarodrigues",
            website: "https://anarodrigues.arq.br"
          }
        };

        // Criar um conjunto de aulas mockadas
        const mockLessons: Lesson[] = Array(25).fill(null).map((_, index) => ({
          id: 100 + index,
          title: `Lição ${index + 1}: ${generateLessonTitle(index)}`,
          description: index % 3 === 0 ? `Descrição detalhada da lição ${index + 1} com objetivos e requisitos.` : null,
          contentType: (['video', 'text', 'quiz', 'download'] as const)[Math.floor(Math.random() * 4)],
          contentUrl: index % 5 !== 4 ? "https://example.com/lesson.mp4" : null,
          thumbnailUrl: `https://picsum.photos/seed/lesson-${index}/400/225`,
          duration: Math.floor(Math.random() * 40) + 5,
          isFree: index < 2,
          isCompleted: index < 5 ? true : undefined,
          progress: index === 5 ? 45 : undefined
        }));

        // Dividir as aulas em módulos
        const mockModules: Module[] = [
          {
            id: 1,
            title: "Introdução ao Curso",
            description: "Visão geral e fundamentos básicos",
            lessons: mockLessons.slice(0, 4),
            isCompleted: true,
            progress: 100
          },
          {
            id: 2,
            title: "Fundamentos de Design",
            description: "Princípios e conceitos essenciais",
            lessons: mockLessons.slice(4, 9),
            progress: 40
          },
          {
            id: 3,
            title: "Técnicas Avançadas",
            description: "Metodologias profissionais para projetos",
            lessons: mockLessons.slice(9, 15)
          },
          {
            id: 4,
            title: "Estudos de Caso",
            description: "Análise de projetos reais",
            lessons: mockLessons.slice(15, 20)
          },
          {
            id: 5,
            title: "Projeto Final",
            description: "Desenvolvimento do projeto de conclusão",
            lessons: mockLessons.slice(20)
          }
        ];

        // Avaliações do curso
        const mockReviews: Review[] = Array(12).fill(null).map((_, index) => ({
          id: 200 + index,
          rating: Math.floor(Math.random() * 3) + 3, // 3 a 5 estrelas
          comment: "Este curso superou minhas expectativas! O conteúdo é rico e bem estruturado, com exemplos práticos que facilitam a compreensão. Recomendo para todos os profissionais da área.",
          userName: `Usuário ${index + 1}`,
          userAvatar: index % 3 === 0 ? `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${index + 10}.jpg` : null,
          createdAt: new Date(Date.now() - (index * 86400000)).toISOString() // Datas decrescentes
        }));

        // Criar curso mockado
        const mockCourse: Course = {
          id: 1,
          title: "Arquitetura de Interiores: Do Conceito ao Projeto Executivo",
          slug: courseSlug || "arquitetura-interiores-conceito-projeto",
          description: "Neste curso completo, você aprenderá todo o processo de desenvolvimento de projetos de interiores, desde a concepção inicial até a documentação executiva final. Trabalhamos com metodologias profissionais utilizadas pelos melhores escritórios do mercado, com foco em soluções criativas e técnicas eficientes.\n\nO conteúdo abrange desde os princípios fundamentais de composição espacial até técnicas avançadas de documentação e apresentação de projetos. Você desenvolverá habilidades essenciais para criar ambientes funcionais, esteticamente agradáveis e alinhados às necessidades dos clientes.\n\nAo final do curso, você terá um projeto completo para seu portfólio, além de dominar as ferramentas e metodologias necessárias para se destacar no mercado de arquitetura de interiores.",
          shortDescription: "Domine o processo completo de projetos de interiores, da concepção à documentação executiva.",
          thumbnailUrl: "https://picsum.photos/seed/arquitetura-interiores/400/225",
          bannerUrl: "https://picsum.photos/seed/arquitetura-interiores-banner/1920/1080",
          trailerUrl: "https://example.com/trailer.mp4",
          difficulty: "intermediate",
          duration: 35,
          totalLessons: mockLessons.length,
          price: 397,
          isPromoted: true,
          promotionalPrice: 297,
          averageRating: 4.7,
          totalEnrollments: 1245,
          instructor: mockInstructor,
          category: {
            id: 2,
            name: "Design de Interiores",
            slug: "design-interiores"
          },
          modules: mockModules,
          isEnrolled: true,
          progress: 28,
          requirements: "Conhecimentos básicos de desenho arquitetônico. Familiaridade com software de modelagem 3D é desejável, mas não obrigatório.",
          goals: "Desenvolver projetos completos de interiores. Dominar o processo criativo e técnico. Criar documentação profissional. Apresentar projetos de forma eficiente para clientes.",
          tags: ["interiores", "projeto executivo", "design", "arquitetura residencial"],
          reviews: mockReviews
        };

        setCourse(mockCourse);
        setLoading(false);
      }, 1500);
    };

    fetchCourse();
  }, [courseSlug]);

  // Truncar texto com opção de expandir
  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return isOverviewExpanded ? text : `${text.substring(0, maxLength)}...`;
  };

  // Componente de resumo do progresso do curso
  const CourseProgressSummary = ({ progress, isEnrolled }: { progress?: number, isEnrolled: boolean }) => {
    if (!isEnrolled) return null;
    return (
      <div className="mt-4 bg-black/5 dark:bg-white/5 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Seu progresso</span>
          <span className="text-sm font-medium">{progress || 0}%</span>
        </div>
        <Progress value={progress || 0} className="h-2" />
      </div>
    );
  };

  // Componente de lição no acordeão
  const LessonItem = ({ lesson, moduleCompleted }: { lesson: Lesson, moduleCompleted?: boolean }) => (
    <div className={`flex items-center justify-between py-2 px-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 ${lesson.isCompleted ? 'opacity-75' : ''}`}>
      <div className="flex items-center space-x-3">
        {lesson.isCompleted ? (
          <CircleCheck className="h-4 w-4 text-green-500" />
        ) : lesson.progress ? (
          <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        ) : lesson.isFree || moduleCompleted ? (
          <Play className="h-4 w-4 text-primary" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
        <span className={`text-sm ${lesson.isCompleted ? 'line-through opacity-75' : ''}`}>
          {lesson.title}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        {lesson.isFree && !lesson.isCompleted && (
          <Badge variant="outline" className="text-[10px] h-4 px-1 border-green-500 text-green-500">
            GRÁTIS
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{lesson.duration}min</span>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{loading ? "Carregando curso..." : `${course?.title} | ConectaWorking`}</title>
        <meta 
          name="description" 
          content={course?.shortDescription || "Carregando detalhes do curso..."} 
        />
      </Helmet>

      {/* Banner do curso */}
      {loading ? (
        <div className="relative w-full h-[50vh] mb-6">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      ) : course && (
        <div className="relative w-full h-[50vh] mb-6">
          <div className="absolute inset-0">
            <img 
              src={course.bannerUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          </div>
          
          <div className="relative z-10 container mx-auto h-full flex items-center">
            <div className="max-w-2xl text-white p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-primary/90 text-black">
                  {course.category.name}
                </Badge>
                {course.isPromoted && (
                  <Badge variant="outline" className="border-primary text-primary">
                    {Math.round(100 - (course.promotionalPrice! / course.price * 100))}% OFF
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                {course.title}
              </h1>
              
              <p className="text-lg text-gray-200 mb-6">
                {course.shortDescription}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-300">
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.averageRating?.toFixed(1)} ({course.reviews.length} avaliações)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{course.duration} horas</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="mr-1 h-4 w-4" />
                  <span>{course.totalLessons} aulas</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>{course.totalEnrollments} alunos</span>
                </div>
                <div className="flex items-center">
                  <Award className="mr-1 h-4 w-4" />
                  <span>{mapDifficultyToPortuguese(course.difficulty)}</span>
                </div>
              </div>

              <div className="flex items-center mb-4">
                <Avatar className="h-10 w-10 mr-3 border-2 border-primary">
                  <AvatarImage src={course.instructor.profileImageUrl} alt={course.instructor.name} />
                  <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium flex items-center">
                    {course.instructor.name}
                    {course.instructor.isVerified && (
                      <Badge className="ml-2 bg-blue-500 h-5 px-1">
                        <CircleCheck className="h-3 w-3 mr-1" /> Verificado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-300">{course.instructor.speciality}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {course.isEnrolled ? (
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-black">
                    <Play className="mr-2 h-4 w-4" /> Continuar curso
                  </Button>
                ) : (
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-black">
                    {course.isPromoted ? (
                      <span>Matricular-se por R$ {course.promotionalPrice!.toFixed(2)}</span>
                    ) : (
                      <span>Matricular-se por R$ {course.price.toFixed(2)}</span>
                    )}
                  </Button>
                )}
                
                {course.trailerUrl && (
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                    <Play className="mr-2 h-4 w-4" /> Assistir trailer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-8 w-60" />
              <Skeleton className="h-80 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        ) : course && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="mb-8">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="curriculum">Conteúdo do Curso</TabsTrigger>
                  <TabsTrigger value="instructor">Instrutor</TabsTrigger>
                  <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Sobre este curso</h2>
                    <div className="text-muted-foreground whitespace-pre-line">
                      {truncateText(course.description)}
                      {course.description.length > 300 && (
                        <button 
                          onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                          className="text-primary ml-2 font-medium"
                        >
                          {isOverviewExpanded ? 'Ver menos' : 'Ver mais'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {course.requirements && (
                      <div>
                        <h3 className="text-lg font-bold mb-2 flex items-center">
                          <ListChecks className="mr-2 h-5 w-5 text-primary" />
                          Pré-requisitos
                        </h3>
                        <ul className="space-y-2 pl-7 list-disc text-muted-foreground">
                          {course.requirements.split('. ').map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {course.goals && (
                      <div>
                        <h3 className="text-lg font-bold mb-2 flex items-center">
                          <BarChart className="mr-2 h-5 w-5 text-primary" />
                          O que você vai aprender
                        </h3>
                        <ul className="space-y-2 pl-7 list-disc text-muted-foreground">
                          {course.goals.split('. ').map((goal, index) => (
                            <li key={index}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {course.tags && course.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="hover:bg-secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="curriculum">
                  <h2 className="text-2xl font-bold mb-4">Conteúdo do Curso</h2>
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center">
                        <BookOpen className="mr-1 h-4 w-4" />
                        <span>{course.modules.length} módulos</span>
                      </div>
                      <div className="flex items-center">
                        <Play className="mr-1 h-4 w-4" />
                        <span>{course.totalLessons} aulas</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{course.duration} horas no total</span>
                      </div>
                    </div>
                  </div>

                  <Accordion type="multiple" className="w-full" defaultValue={course.modules.map(m => m.id.toString())}>
                    {course.modules.map((module) => (
                      <AccordionItem key={module.id} value={module.id.toString()}>
                        <AccordionTrigger className="py-4 hover:no-underline">
                          <div className="flex items-start">
                            <div className="mr-3">
                              {module.isCompleted ? (
                                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                  <CircleCheck className="h-4 w-4" />
                                </div>
                              ) : module.progress ? (
                                <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center">
                                  <span className="text-xs font-medium">{module.progress}%</span>
                                </div>
                              ) : (
                                <div className="h-6 w-6 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                                  <span className="text-xs font-medium">{module.id}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold">{module.title}</h3>
                              {module.description && (
                                <p className="text-sm text-muted-foreground">{module.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 ml-4">
                            <span className="text-sm text-muted-foreground">{module.lessons.length} aulas</span>
                            <span className="text-sm text-muted-foreground">
                              {module.lessons.reduce((acc, lesson) => acc + lesson.duration, 0)} min
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1 ml-9">
                            {module.lessons.map((lesson) => (
                              <LessonItem 
                                key={lesson.id} 
                                lesson={lesson} 
                                moduleCompleted={module.isCompleted}
                              />
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
                
                <TabsContent value="instructor">
                  <h2 className="text-2xl font-bold mb-4">Sobre o Instrutor</h2>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <Avatar className="h-28 w-28 border-2 border-primary">
                        <AvatarImage src={course.instructor.profileImageUrl} alt={course.instructor.name} />
                        <AvatarFallback className="text-2xl">{course.instructor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold mr-2">{course.instructor.name}</h3>
                        {course.instructor.isVerified && (
                          <Badge className="bg-blue-500">
                            <CircleCheck className="h-3 w-3 mr-1" /> Verificado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">
                        {course.instructor.speciality}
                      </p>
                      <div className="space-y-6">
                        <p className="text-muted-foreground whitespace-pre-line">
                          {course.instructor.bio}
                        </p>
                        {course.instructor.socialLinks && (
                          <div>
                            <h4 className="font-medium mb-2">Redes sociais</h4>
                            <div className="flex space-x-3">
                              {Object.entries(course.instructor.socialLinks).map(([key, url]) => (
                                <Button key={key} variant="outline" size="sm" asChild>
                                  <a href={url} target="_blank" rel="noopener noreferrer">
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                  </a>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3">
                      <h2 className="text-2xl font-bold mb-4">Avaliações</h2>
                      <div className="bg-black/5 dark:bg-white/5 rounded-lg p-6 mb-4">
                        <div className="flex items-center justify-center mb-2">
                          <span className="text-5xl font-bold">{course.averageRating?.toFixed(1) || "N/A"}</span>
                          <div className="ml-3">
                            <div className="flex">
                              {Array(5).fill(null).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-5 w-5 ${i < Math.round(course.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {course.reviews.length} avaliações
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mt-6">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = course.reviews.filter(r => Math.round(r.rating) === rating).length;
                            const percentage = Math.round((count / course.reviews.length) * 100) || 0;
                            
                            return (
                              <div key={rating} className="flex items-center text-sm">
                                <span className="w-3">{rating}</span>
                                <Star className="h-3 w-3 mx-1 fill-yellow-400 text-yellow-400" />
                                <div className="flex-grow mx-2">
                                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded">
                                    <div 
                                      className="h-full bg-yellow-400 rounded" 
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-muted-foreground">{percentage}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {course.isEnrolled && (
                        <Button className="w-full">Avaliar este curso</Button>
                      )}
                    </div>
                    
                    <div className="md:w-2/3">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Comentários dos alunos</h3>
                      </div>
                      
                      <div className="space-y-6">
                        {course.reviews.slice(0, 5).map((review) => (
                          <Card key={review.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between mb-2">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    {review.userAvatar ? (
                                      <AvatarImage src={review.userAvatar} />
                                    ) : null}
                                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{review.userName}</span>
                                </div>
                                <div className="flex">
                                  {Array(5).fill(null).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < Math.round(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                              <div className="text-xs text-muted-foreground mt-2">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {course.reviews.length > 5 && (
                          <Button variant="outline" className="w-full">
                            Ver todas {course.reviews.length} avaliações
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-8">
              {/* Card de Matrícula */}
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">
                    {course.isEnrolled ? 'Continuar aprendendo' : 'Matricule-se agora'}
                  </h3>
                  
                  {!course.isEnrolled && (
                    <div className="mb-4">
                      {course.isPromoted ? (
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-3xl font-bold">R$ {course.promotionalPrice?.toFixed(2)}</span>
                            <span className="ml-2 text-lg line-through text-muted-foreground">
                              R$ {course.price.toFixed(2)}
                            </span>
                            <Badge className="ml-2 bg-primary text-black">
                              {Math.round(100 - (course.promotionalPrice! / course.price * 100))}% OFF
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold">R$ {course.price.toFixed(2)}</span>
                      )}
                    </div>
                  )}

                  <CourseProgressSummary 
                    progress={course.progress} 
                    isEnrolled={course.isEnrolled}
                  />
                  
                  <div className="mt-6 space-y-3">
                    {course.isEnrolled ? (
                      <Button className="w-full bg-primary hover:bg-primary/90 text-black">
                        <Play className="mr-2 h-4 w-4" /> Continuar curso
                      </Button>
                    ) : (
                      <Button className="w-full bg-primary hover:bg-primary/90 text-black">
                        Matricular-se
                      </Button>
                    )}
                    
                    {course.trailerUrl && (
                      <Button variant="outline" className="w-full">
                        <Play className="mr-2 h-4 w-4" /> Assistir trailer
                      </Button>
                    )}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Este curso inclui:</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center">
                        <Play className="h-4 w-4 mr-2 text-primary" />
                        <span>{course.totalLessons} aulas</span>
                      </li>
                      <li className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span>{course.duration} horas de conteúdo</span>
                      </li>
                      <li className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-primary" />
                        <span>Material complementar</span>
                      </li>
                      <li className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-primary" />
                        <span>Certificado de conclusão</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Função auxiliar para gerar títulos de lições de exemplo
function generateLessonTitle(index: number): string {
  const titles = [
    "Introdução aos conceitos fundamentais",
    "Fundamentos de iluminação e espaço",
    "Técnicas de composição espacial",
    "Aplicação de cores e texturas",
    "Princípios de ergonomia",
    "Desenvolvimento do conceito do projeto",
    "Análise de casos de sucesso",
    "Documentação técnica de projetos",
    "Orçamento e especificações",
    "Tendências contemporâneas",
    "Sustentabilidade aplicada ao design",
    "Psicologia do espaço",
    "Ferramentas digitais para apresentação",
    "Relação com clientes e briefing",
    "Técnicas avançadas de visualização"
  ];
  
  return titles[index % titles.length];
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