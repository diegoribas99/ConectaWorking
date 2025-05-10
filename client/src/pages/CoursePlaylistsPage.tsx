import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { 
  Play, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  ListMusic, 
  Music, 
  Clock, 
  Share2, 
  Search,
  Check 
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CoursePlaylistsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [location, setLocation] = useLocation();

  // Dados simulados
  const playlists: Playlist[] = [
    {
      id: 1,
      name: "Fundamentos de Arquitetura",
      description: "Playlist de cursos introdutórios sobre fundamentos de arquitetura",
      courses: [
        { id: 1, title: "Introdução à Arquitetura", thumbnailUrl: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFyY2hpdGVjdHVyZSUyMGRlc2lnbnxlbnwwfHwwfHx8MA%3D%3D", duration: 240, coursesCount: 7, lessonsCount: 18 },
        { id: 2, title: "Teorias do Espaço", thumbnailUrl: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGFyY2hpdGVjdHVyZSUyMGRlc2lnbnxlbnwwfHwwfHx8MA%3D%3D", duration: 320, coursesCount: 5, lessonsCount: 22 },
        { id: 3, title: "Sustentabilidade em Projetos", thumbnailUrl: "https://images.unsplash.com/photo-1545043135-4a42992e6da8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3VzdGFpbmFibGUlMjBhcmNoaXRlY3R1cmV8ZW58MHx8MHx8fDA%3D", duration: 180, coursesCount: 3, lessonsCount: 15 }
      ],
      totalDuration: 740,
      courseCount: 3,
      createdAt: new Date('2023-08-15'),
      isPublic: true
    },
    {
      id: 2,
      name: "Design de Interiores Avançado",
      description: "Técnicas avançadas de design de interiores para espaços comerciais e residenciais",
      courses: [
        { id: 4, title: "Iluminação em Interiores", thumbnailUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aW50ZXJpb3IlMjBkZXNpZ258ZW58MHx8MHx8fDA%3D", duration: 210, coursesCount: 4, lessonsCount: 12 },
        { id: 5, title: "Escolha de Materiais", thumbnailUrl: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aW50ZXJpb3IlMjBtYXRlcmlhbHN8ZW58MHx8MHx8fDA%3D", duration: 280, coursesCount: 6, lessonsCount: 20 }
      ],
      totalDuration: 490,
      courseCount: 2,
      createdAt: new Date('2023-10-22'),
      isPublic: false
    },
    {
      id: 3,
      name: "Técnicas de Renderização",
      description: "Cursos sobre técnicas de renderização e apresentação de projetos",
      courses: [
        { id: 6, title: "Renderização com V-Ray", thumbnailUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aW50ZXJpb3IlMjByZW5kZXJ8ZW58MHx8MHx8fDA%3D", duration: 360, coursesCount: 8, lessonsCount: 24 },
        { id: 7, title: "Fotorrealismo em Projetos", thumbnailUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aW50ZXJpb3IlMjByZW5kZXJ8ZW58MHx8MHx8fDA%3D", duration: 240, coursesCount: 5, lessonsCount: 18 },
        { id: 8, title: "Pós-produção em Imagens", thumbnailUrl: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aW50ZXJpb3IlMjBtYXRlcmlhbHN8ZW58MHx8MHx8fDA%3D", duration: 190, coursesCount: 4, lessonsCount: 14 }
      ],
      totalDuration: 790,
      courseCount: 3,
      createdAt: new Date('2023-11-05'),
      isPublic: true
    }
  ];
  
  // Filtrar playlists com base na busca
  const filteredPlaylists = playlists.filter(playlist => 
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Formatadores
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Manipuladores de eventos
  const handleCreatePlaylist = () => {
    // Lógica para criar uma nova playlist
    console.log('Criando playlist:', newPlaylistName);
    setIsCreateDialogOpen(false);
    setNewPlaylistName('');
  };
  
  const handleViewPlaylistDetails = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
  };

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Minhas Playlists de Cursos | ConectaWorking</title>
        <meta name="description" content="Gerencie suas playlists de cursos da plataforma ConectaWorking" />
      </Helmet>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Playlists de Cursos</h1>
        <p className="text-muted-foreground mt-2">
          Organize seus cursos em playlists personalizadas para melhor organização e compartilhamento
        </p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar playlists..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Criar Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Playlist</DialogTitle>
              <DialogDescription>
                Crie uma playlist para organizar seus cursos favoritos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Playlist</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Cursos de Design de Interiores" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input id="description" placeholder="Descreva o propósito desta playlist" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="isPublic" className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="isPublic" className="h-4 w-4" />
                  <span>Tornar playlist pública</span>
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
              >
                Criar Playlist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="mine">Minhas Playlists</TabsTrigger>
          <TabsTrigger value="public">Públicas</TabsTrigger>
          <TabsTrigger value="shared">Compartilhadas Comigo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {filteredPlaylists.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-muted/20">
              <ListMusic className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Nenhuma playlist encontrada</h3>
              <p className="text-muted-foreground">
                Crie uma nova playlist ou tente uma busca diferente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaylists.map(playlist => (
                <Card key={playlist.id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{playlist.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {playlist.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleViewPlaylistDetails(playlist)}
                            className="cursor-pointer"
                          >
                            <Play className="mr-2 h-4 w-4" /> Reproduzir
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <div 
                      className="grid grid-cols-3 gap-2 mb-4 cursor-pointer"
                      onClick={() => handleViewPlaylistDetails(playlist)}
                    >
                      {playlist.courses.slice(0, 3).map((course, index) => (
                        <div 
                          key={course.id} 
                          className="relative aspect-video rounded-md overflow-hidden bg-muted"
                          style={{ opacity: index === 2 && playlist.courses.length > 3 ? 0.7 : 1 }}
                        >
                          <img 
                            src={course.thumbnailUrl} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          {index === 2 && playlist.courses.length > 3 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-medium">
                              +{playlist.courses.length - 3}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(playlist.totalDuration)}</span>
                      <span className="mx-1">•</span>
                      <Music className="h-4 w-4" />
                      <span>{playlist.courseCount} cursos</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between items-center pt-2">
                    <div className="text-sm text-muted-foreground">
                      Criada em {formatDate(playlist.createdAt)}
                    </div>
                    <Badge variant={playlist.isPublic ? "outline" : "secondary"}>
                      {playlist.isPublic ? "Pública" : "Privada"}
                    </Badge>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="mine" className="mt-6">
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            <ListMusic className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Suas playlists pessoais</h3>
            <p className="text-muted-foreground mb-4">
              Aqui você encontrará as playlists que você criou.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Criar Minha Primeira Playlist
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="public" className="mt-6">
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            <ListMusic className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Playlists públicas</h3>
            <p className="text-muted-foreground">
              Explore playlists criadas pela comunidade para inspiração e aprendizado.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="shared" className="mt-6">
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            <ListMusic className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Playlists compartilhadas com você</h3>
            <p className="text-muted-foreground">
              Playlists que outros usuários compartilharam diretamente com você.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Modal de detalhes da playlist */}
      {selectedPlaylist && (
        <Dialog open={!!selectedPlaylist} onOpenChange={() => setSelectedPlaylist(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedPlaylist.name}</DialogTitle>
              <DialogDescription>
                {selectedPlaylist.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center justify-between mt-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(selectedPlaylist.totalDuration)}</span>
                <span className="mx-1">•</span>
                <Music className="h-4 w-4" />
                <span>{selectedPlaylist.courseCount} cursos</span>
                <span className="mx-1">•</span>
                <span>Criada em {formatDate(selectedPlaylist.createdAt)}</span>
              </div>
              <Badge variant={selectedPlaylist.isPublic ? "outline" : "secondary"}>
                {selectedPlaylist.isPublic ? "Pública" : "Privada"}
              </Badge>
            </div>
            
            <ScrollArea className="h-[450px] rounded-md">
              {selectedPlaylist.courses.map((course, index) => (
                <div key={course.id}>
                  {index > 0 && <Separator />}
                  <div 
                    className="flex gap-4 p-4 hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/cursos/${course.id}`)}
                  >
                    <div className="relative w-48 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(course.duration)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-grow">
                      <h3 className="font-medium mb-1">{course.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{course.coursesCount} módulos</span>
                        <span className="mx-1">•</span>
                        <span>{course.lessonsCount} aulas</span>
                      </div>
                      <div className="mt-auto">
                        <Button variant="ghost" size="sm" className="px-2 h-7">
                          <Play className="mr-1 h-3 w-3" /> Assistir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setSelectedPlaylist(null)}>
                Fechar
              </Button>
              <Button>
                <Play className="mr-2 h-4 w-4" /> Reproduzir Todos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Tipos
interface Course {
  id: number;
  title: string;
  thumbnailUrl: string;
  duration: number;
  coursesCount: number;
  lessonsCount: number;
}

interface Playlist {
  id: number;
  name: string;
  description: string;
  courses: Course[];
  totalDuration: number;
  courseCount: number;
  createdAt: Date;
  isPublic: boolean;
}