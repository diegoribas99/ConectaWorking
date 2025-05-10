import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  CheckCircle,
  Circle,
  PlayCircle,
  Lock,
  Download,
  FileText,
  HelpCircle,
  MessageSquare,
  Copy,
  Share,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Settings,
  Maximize
} from 'lucide-react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

type Course = {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string;
  modules: Module[];
  isEnrolled: boolean;
  progress?: number;
};

type Note = {
  id: number;
  text: string;
  timestamp: number;
  createdAt: string;
};

type Comment = {
  id: number;
  userName: string;
  userAvatar: string | null;
  text: string;
  createdAt: string;
  replies?: Comment[];
};

// Componente principal da página de aula com player de vídeo
export default function CourseLessonPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const courseSlug = params.courseSlug;
  const lessonId = params.lessonId ? parseInt(params.lessonId) : null;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [savedForLater, setSavedForLater] = useState(false);
  const [likedLesson, setLikedLesson] = useState(false);
  
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Simulação de carregamento de dados do curso e aula
  useEffect(() => {
    const fetchCourseAndLesson = async () => {
      // Simulação de chamada à API - em produção isso seria uma chamada real
      setTimeout(() => {
        // Criar um conjunto de aulas mockadas
        const mockLessons: Lesson[] = Array(25).fill(null).map((_, index) => ({
          id: 100 + index,
          title: `Lição ${index + 1}: ${generateLessonTitle(index)}`,
          description: index % 3 === 0 ? `Descrição detalhada da lição ${index + 1} com objetivos e requisitos.` : null,
          contentType: (['video', 'text', 'download', 'quiz'] as const)[index % 4],
          contentUrl: index % 5 !== 4 ? "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" : null,
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

        // Criar curso mockado
        const mockCourse: Course = {
          id: 1,
          title: "Arquitetura de Interiores: Do Conceito ao Projeto Executivo",
          slug: courseSlug || "arquitetura-interiores-conceito-projeto",
          thumbnailUrl: "https://picsum.photos/seed/arquitetura-interiores/400/225",
          modules: mockModules,
          isEnrolled: true,
          progress: 28
        };

        // Encontrar a aula atual
        let currentMod: Module | null = null;
        let currentLes: Lesson | null = null;

        for (const mod of mockModules) {
          const found = mod.lessons.find(les => les.id === lessonId);
          if (found) {
            currentMod = mod;
            currentLes = found;
            break;
          }
        }

        // Se não foi especificado um ID de aula ou a aula não foi encontrada,
        // usar a primeira aula do primeiro módulo
        if (!currentLes) {
          currentMod = mockModules[0];
          currentLes = currentMod.lessons[0];
        }

        // Criar notas mockadas
        const mockNotes: Note[] = [
          {
            id: 1,
            text: "Importante: Conceito de espaço negativo e sua aplicação em projetos residenciais.",
            timestamp: 125,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            text: "Revisar os princípios de harmonia de cores mencionados aqui.",
            timestamp: 278,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        // Criar comentários mockados
        const mockComments: Comment[] = [
          {
            id: 1,
            userName: "Carolina Silva",
            userAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
            text: "Adorei a explicação sobre o uso de cores complementares! Já estou aplicando nos meus projetos.",
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            replies: [
              {
                id: 3,
                userName: "Ana Instrutora",
                userAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
                text: "Fico feliz que tenha gostado, Carolina! Compartilhe seus resultados no fórum da comunidade.",
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]
          },
          {
            id: 2,
            userName: "Rafael Mendes",
            userAvatar: null,
            text: "Essa dica sobre iluminação natural transformou meu último projeto. Obrigado pelo conhecimento compartilhado!",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        setCourse(mockCourse);
        setCurrentModule(currentMod);
        setCurrentLesson(currentLes);
        setNotes(mockNotes);
        setComments(mockComments);
        setLoading(false);
      }, 1500);
    };

    fetchCourseAndLesson();
  }, [courseSlug, lessonId]);

  // Encontrar aula anterior e próxima aula
  const findAdjacentLessons = () => {
    if (!course || !currentLesson) return { prev: null, next: null };
    
    let allLessons: Lesson[] = [];
    course.modules.forEach(mod => {
      allLessons = [...allLessons, ...mod.lessons];
    });
    
    const currentIndex = allLessons.findIndex(les => les.id === currentLesson.id);
    
    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
    };
  };

  const { prev, next } = findAdjacentLessons();

  // Navegar para outra aula
  const navigateToLesson = (lesson: Lesson) => {
    setLocation(`/cursos/${courseSlug}/aula/${lesson.id}`);
  };

  // Controles do player de vídeo
  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  const handleProgress = (state: { played: number }) => {
    if (!state.played) return;
    setPlayed(state.played);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleSeekChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    
    const bounds = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const width = bounds.width;
    const percent = x / width;
    
    setPlayed(percent);
    playerRef.current?.seekTo(percent);
  };

  const handleFullScreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Formatar segundos para MM:SS
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Componente de linha de aula na lista de aulas do módulo
  const LessonListItem = ({ lesson, isActive }: { lesson: Lesson, isActive: boolean }) => (
    <div 
      className={`flex items-center justify-between py-3 px-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors ${isActive ? 'bg-black/5 dark:bg-white/10' : ''}`}
      onClick={() => navigateToLesson(lesson)}
    >
      <div className="flex items-center space-x-3">
        {lesson.isCompleted ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : lesson.progress ? (
          <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        ) : isActive ? (
          <PlayCircle className="h-4 w-4 text-primary" />
        ) : lesson.isFree ? (
          <Circle className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
        <div>
          <span className={`text-sm ${isActive ? 'font-medium' : ''} ${lesson.isCompleted ? 'line-through opacity-75' : ''}`}>
            {lesson.title}
          </span>
          <div className="flex items-center space-x-2 mt-0.5">
            {lesson.contentType === 'video' && <Play className="h-3 w-3 text-muted-foreground" />}
            {lesson.contentType === 'text' && <FileText className="h-3 w-3 text-muted-foreground" />}
            {lesson.contentType === 'quiz' && <HelpCircle className="h-3 w-3 text-muted-foreground" />}
            {lesson.contentType === 'download' && <Download className="h-3 w-3 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">{lesson.duration}min</span>
            {lesson.isFree && <span className="text-xs text-green-500 font-medium">GRÁTIS</span>}
          </div>
        </div>
      </div>
      {lesson.progress !== undefined && lesson.progress > 0 && lesson.progress < 100 && (
        <div className="w-12">
          <Progress value={lesson.progress} className="h-1" />
        </div>
      )}
    </div>
  );

  // Componente de nota na lista de notas
  const NoteItem = ({ note }: { note: Note }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 px-2 text-xs"
            onClick={() => playerRef.current?.seekTo(note.timestamp / duration)}
          >
            {formatTime(note.timestamp)}
            <Play className="ml-1 h-3 w-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copiar</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                <span>Compartilhar</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm">{note.text}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(note.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );

  // Componente de comentário na lista de discussões
  const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
    <div className={`mb-4 ${isReply ? 'ml-10 mt-4' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          {comment.userAvatar ? (
            <AvatarImage src={comment.userAvatar} />
          ) : null}
          <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium text-sm">{comment.userName}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm mt-1">{comment.text}</p>
          <div className="flex space-x-2 mt-2">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              Responder
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <ThumbsUp className="mr-1 h-3 w-3" />
              Curtir
            </Button>
          </div>
        </div>
      </div>
      
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} isReply />
      ))}
    </div>
  );

  // Conteúdo baseado no tipo de aula
  const LessonContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.contentType) {
      case 'video':
        return (
          <div ref={containerRef} className="relative w-full aspect-video bg-black">
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <>
                <ReactPlayer
                  ref={playerRef}
                  url={currentLesson.contentUrl || ''}
                  width="100%"
                  height="100%"
                  playing={playing}
                  volume={volume}
                  muted={muted}
                  onProgress={handleProgress}
                  onDuration={handleDuration}
                />
                
                {/* Controles customizados */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* Barra de progresso */}
                  <div 
                    ref={progressBarRef}
                    className="w-full h-2 bg-gray-600 rounded cursor-pointer mb-3"
                    onClick={handleSeekChange}
                  >
                    <div 
                      className="h-full bg-primary rounded"
                      style={{ width: `${played * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-white"
                              onClick={handlePlayPause}
                            >
                              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{playing ? 'Pausar' : 'Reproduzir'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-white"
                              onClick={() => playerRef.current?.seekTo(played - 0.05)}
                            >
                              <SkipBack className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Voltar 10 segundos</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-white"
                              onClick={() => playerRef.current?.seekTo(played + 0.05)}
                            >
                              <SkipForward className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Avançar 10 segundos</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <div className="flex items-center space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-white"
                                onClick={handleToggleMute}
                              >
                                {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{muted ? 'Ativar som' : 'Silenciar'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-20"
                        />
                      </div>
                      
                      <span className="text-sm text-white">
                        {formatTime(duration * played)} / {formatTime(duration)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-white"
                              onClick={() => setSavedForLater(!savedForLater)}
                            >
                              {savedForLater ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{savedForLater ? 'Remover dos salvos' : 'Salvar para depois'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-white"
                              onClick={() => setLikedLesson(!likedLesson)}
                            >
                              <ThumbsUp className={`h-5 w-5 ${likedLesson ? 'fill-primary text-primary' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{likedLesson ? 'Descurtir' : 'Curtir'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-white"
                            >
                              <Settings className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Configurações</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-white"
                              onClick={handleFullScreen}
                            >
                              <Maximize className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tela cheia</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      case 'text':
        return (
          <div className="p-6 bg-card rounded-md">
            <h3 className="text-xl font-bold mb-4">{currentLesson.title}</h3>
            <div className="prose prose-sm max-w-none">
              <p>Este é um material de texto para a aula. Em uma implementação real, este conteúdo seria carregado do banco de dados e poderia conter formatação rica, imagens e outros elementos multimídia.</p>
              
              <h4>Tópicos abordados</h4>
              <ul>
                <li>Introdução ao tema</li>
                <li>Conceitos fundamentais</li>
                <li>Aplicações práticas</li>
                <li>Estudos de caso</li>
              </ul>
              
              <h4>Material complementar</h4>
              <p>Além deste texto, você pode encontrar materiais complementares para download na seção de recursos adicionais desta aula.</p>
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div className="p-6 bg-card rounded-md">
            <h3 className="text-xl font-bold mb-4">Quiz: {currentLesson.title}</h3>
            <p className="text-muted-foreground mb-6">Responda as perguntas abaixo para testar seu conhecimento sobre o conteúdo desta aula.</p>
            
            <div className="space-y-6">
              {/* Exemplo de pergunta de quiz */}
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Pergunta 1:</h4>
                <p className="mb-4">Qual dos seguintes elementos é mais importante considerar ao planejar a iluminação natural em um projeto residencial?</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="q1a" name="q1" />
                    <label htmlFor="q1a">Orientação solar do imóvel</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="q1b" name="q1" />
                    <label htmlFor="q1b">Tipo de lâmpadas a serem utilizadas</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="q1c" name="q1" />
                    <label htmlFor="q1c">Cor das paredes internas</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="q1d" name="q1" />
                    <label htmlFor="q1d">Altura do pé-direito</label>
                  </div>
                </div>
              </div>
              
              <Button className="bg-primary hover:bg-primary/90 text-black">Verificar respostas</Button>
            </div>
          </div>
        );
      case 'download':
        return (
          <div className="p-6 bg-card rounded-md">
            <h3 className="text-xl font-bold mb-4">Material para Download: {currentLesson.title}</h3>
            <p className="text-muted-foreground mb-6">Baixe os arquivos disponibilizados para esta aula.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6" />
                  <div>
                    <p className="font-medium">Guia_Completo_Design_Interiores.pdf</p>
                    <p className="text-xs text-muted-foreground">PDF • 3.2 MB</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Baixar
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6" />
                  <div>
                    <p className="font-medium">Modelos_3D_Biblioteca.zip</p>
                    <p className="text-xs text-muted-foreground">ZIP • 24.8 MB</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Baixar
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6" />
                  <div>
                    <p className="font-medium">Planilha_Orçamento.xlsx</p>
                    <p className="text-xs text-muted-foreground">XLSX • 1.5 MB</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Baixar
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6 bg-card rounded-md">
            <p className="text-center text-muted-foreground">Conteúdo não disponível</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Helmet>
        <title>
          {loading ? "Carregando aula..." : `${currentLesson?.title} | ${course?.title}`}
        </title>
      </Helmet>

      {/* Barra de navegação superior */}
      <header className="flex items-center justify-between border-b px-4 py-2 h-14 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => setLocation(`/cursos/${courseSlug}`)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar ao curso
          </Button>
          
          {loading ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <h1 className="text-sm font-medium truncate max-w-[300px]">
              {course?.title}
            </h1>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {prev && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateToLesson(prev)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Anterior
            </Button>
          )}
          
          {next && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateToLesson(next)}
            >
              Próxima
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conteúdo da aula */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Player ou conteúdo da aula */}
          {LessonContent()}
          
          {/* Informações e tabs da aula */}
          <div className="flex-1 p-6 overflow-auto">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : currentLesson && (
              <>
                <h2 className="text-2xl font-bold mb-1">{currentLesson.title}</h2>
                {currentLesson.description && (
                  <p className="text-muted-foreground mb-4">{currentLesson.description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{currentLesson.duration} minutos</span>
                  </div>
                  {currentModule && (
                    <div>
                      Módulo {currentModule.id}: {currentModule.title}
                    </div>
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <Tabs defaultValue="notas" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="notas">Minhas Notas</TabsTrigger>
                    <TabsTrigger value="discussao">Discussão</TabsTrigger>
                    <TabsTrigger value="recursos">Recursos Adicionais</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="notas">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Minhas Anotações</h3>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
                        + Nova Nota
                      </Button>
                    </div>
                    
                    {notes.length > 0 ? (
                      <div className="space-y-4">
                        {notes.map(note => <NoteItem key={note.id} note={note} />)}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h4 className="text-lg font-medium mb-2">Nenhuma nota ainda</h4>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Adicione notas durante a aula para revisar conceitos importantes mais tarde.
                        </p>
                        <Button className="bg-primary hover:bg-primary/90 text-black">
                          Criar primeira nota
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="discussao">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Discussão da Aula</h3>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
                        + Novo Comentário
                      </Button>
                    </div>
                    
                    {comments.length > 0 ? (
                      <div className="space-y-6">
                        {comments.map(comment => <CommentItem key={comment.id} comment={comment} />)}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h4 className="text-lg font-medium mb-2">Nenhum comentário ainda</h4>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Seja o primeiro a comentar e iniciar a discussão sobre esta aula!
                        </p>
                        <Button className="bg-primary hover:bg-primary/90 text-black">
                          Adicionar comentário
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="recursos">
                    <h3 className="text-lg font-bold mb-4">Recursos Adicionais</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-6 w-6" />
                          <div>
                            <p className="font-medium">Leitura Complementar.pdf</p>
                            <p className="text-xs text-muted-foreground">PDF • 2.1 MB</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" /> Baixar
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-6 w-6" />
                          <div>
                            <p className="font-medium">Exercícios Práticos</p>
                            <p className="text-xs text-muted-foreground">Acessar exercícios para fixação do conteúdo</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Acessar
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-6 w-6" />
                          <div>
                            <p className="font-medium">Links Úteis</p>
                            <p className="text-xs text-muted-foreground">Referências externas recomendadas</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Links
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
        
        {/* Barra lateral com lista de aulas */}
        <div className="w-80 border-l flex flex-col bg-muted/20">
          <div className="p-4 border-b">
            <h2 className="font-bold">Conteúdo do Curso</h2>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4">
              {loading ? (
                <div className="space-y-6">
                  {Array(3).fill(null).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <div className="space-y-2 pl-4">
                        {Array(4).fill(null).map((_, j) => (
                          <Skeleton key={j} className="h-10 w-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : course && (
                <div className="space-y-6">
                  {course.modules.map((module) => (
                    <div key={module.id}>
                      <h3 className="font-medium mb-2">
                        {module.id}. {module.title}
                      </h3>
                      <div className="space-y-1 ml-2">
                        {module.lessons.map((lesson) => (
                          <LessonListItem 
                            key={lesson.id} 
                            lesson={lesson} 
                            isActive={currentLesson?.id === lesson.id}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Botão de marcar aula como concluída */}
          {!loading && currentLesson && (
            <div className="p-4 border-t">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como concluída
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
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