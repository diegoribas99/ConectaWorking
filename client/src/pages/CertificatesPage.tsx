import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Download, 
  Award, 
  Search, 
  ChevronDown, 
  Filter, 
  Share2, 
  Check, 
  Star,
  CalendarDays,
  Clock
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Tipos
interface Certificate {
  id: number;
  courseId: number;
  courseTitle: string;
  category: string;
  dateCompleted: Date;
  dateExpiry: Date | null;
  status: 'active' | 'expired' | 'pending';
  downloadUrl: string;
  shareUrl: string;
  hours: number;
  instructor: string;
  certificateNumber: string;
  verified: boolean;
}

export default function CertificatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  
  // Dados simulados de certificados
  const certificates: Certificate[] = [
    {
      id: 1,
      courseId: 101,
      courseTitle: 'Gerenciamento de Projetos Arquitetônicos',
      category: 'Gestão',
      dateCompleted: new Date(2024, 2, 15),
      dateExpiry: new Date(2026, 2, 15),
      status: 'active',
      downloadUrl: '#download-url-1',
      shareUrl: '#share-url-1',
      hours: 40,
      instructor: 'Carlos Mendes',
      certificateNumber: 'CERT-2024-ARQ-1234',
      verified: true
    },
    {
      id: 2,
      courseId: 102,
      courseTitle: 'Renderização 3D Avançada',
      category: 'Tecnologia',
      dateCompleted: new Date(2024, 1, 10),
      dateExpiry: null,
      status: 'active',
      downloadUrl: '#download-url-2',
      shareUrl: '#share-url-2',
      hours: 20,
      instructor: 'Mariana Costa',
      certificateNumber: 'CERT-2024-REND-5678',
      verified: true
    },
    {
      id: 3,
      courseId: 103,
      courseTitle: 'Fundamentos de Design de Interiores',
      category: 'Design',
      dateCompleted: new Date(2023, 8, 5),
      dateExpiry: new Date(2023, 11, 5),
      status: 'expired',
      downloadUrl: '#download-url-3',
      shareUrl: '#share-url-3',
      hours: 30,
      instructor: 'Julia Fernandes',
      certificateNumber: 'CERT-2023-INT-9012',
      verified: true
    },
    {
      id: 4,
      courseId: 104,
      courseTitle: 'Precificação Inteligente para Arquitetos',
      category: 'Negócios',
      dateCompleted: new Date(2024, 3, 20),
      dateExpiry: new Date(2026, 3, 20),
      status: 'active',
      downloadUrl: '#download-url-4',
      shareUrl: '#share-url-4',
      hours: 15,
      instructor: 'Rafael Santos',
      certificateNumber: 'CERT-2024-NEG-3456',
      verified: true
    },
    {
      id: 5,
      courseId: 105,
      courseTitle: 'Introdução ao BIM',
      category: 'Tecnologia',
      dateCompleted: new Date(2023, 11, 12),
      dateExpiry: new Date(2025, 11, 12),
      status: 'active',
      downloadUrl: '#download-url-5',
      shareUrl: '#share-url-5',
      hours: 25,
      instructor: 'Augusto Pereira',
      certificateNumber: 'CERT-2023-BIM-7890',
      verified: true
    },
  ];
  
  // Função para formatar datas
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Filtragem de certificados
  const filteredCertificates = certificates.filter(cert => {
    // Filtro por status
    if (statusFilter !== 'all' && cert.status !== statusFilter) return false;
    
    // Filtro por categoria
    if (categoryFilter !== 'all' && cert.category !== categoryFilter) return false;
    
    // Filtro de pesquisa
    if (searchTerm && !cert.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Filtro por tab
    if (activeTab === 'active' && cert.status !== 'active') return false;
    if (activeTab === 'expired' && cert.status !== 'expired') return false;
    
    return true;
  });
  
  // Categorias únicas para o filtro
  const categories = Array.from(new Set(certificates.map(cert => cert.category)));
  
  // Função para gerar a cor do badge com base no status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'expired': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Meus Certificados | ConectaWorking</title>
        <meta name="description" content="Gerencie seus certificados de cursos e treinamentos obtidos na plataforma ConectaWorking" />
      </Helmet>
      
      <div className="py-8 container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Meus Certificados</h1>
            <p className="text-muted-foreground">
              Gerencie seus certificados e compartilhe suas conquistas profissionais
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button className="bg-primary hover:bg-primary/90 text-black" size="sm">
              <Award className="mr-2 h-4 w-4" />
              Biblioteca de Cursos
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Filtros e Busca */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative w-full md:w-auto flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar certificados..."
                    className="pl-9 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="expired">Expirados</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs e Contagem */}
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="active">Ativos</TabsTrigger>
                  <TabsTrigger value="expired">Expirados</TabsTrigger>
                </TabsList>
                
                <div className="text-sm text-muted-foreground">
                  Mostrando {filteredCertificates.length} de {certificates.length} certificados
                </div>
              </div>
            </Tabs>
          </div>
          
          {/* Lista de Certificados */}
          {filteredCertificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map(certificate => (
                <Card key={certificate.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                  <CardHeader className="p-6 pb-4 relative bg-gradient-to-r from-primary/5 to-transparent border-b">
                    <div className="absolute top-4 right-4">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(certificate.status)} px-2 py-0.5 text-xs font-medium`}
                      >
                        {certificate.status === 'active' && 'Ativo'}
                        {certificate.status === 'expired' && 'Expirado'}
                        {certificate.status === 'pending' && 'Pendente'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{certificate.courseTitle}</h3>
                        <p className="text-sm text-muted-foreground">{certificate.category}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span>Emitido em:</span>
                        </div>
                        <span className="text-sm font-medium">{formatDate(certificate.dateCompleted)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Carga horária:</span>
                        </div>
                        <span className="text-sm font-medium">{certificate.hours}h</span>
                      </div>
                      
                      {certificate.dateExpiry && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span>Validade:</span>
                          </div>
                          <span 
                            className={`text-sm font-medium ${
                              certificate.status === 'expired' ? 'text-red-500' : ''
                            }`}
                          >
                            {formatDate(certificate.dateExpiry)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span>Instrutor:</span>
                        </div>
                        <span className="text-sm font-medium">{certificate.instructor}</span>
                      </div>
                      
                      <div className="pt-1">
                        <p className="text-xs text-muted-foreground mb-1">ID do Certificado:</p>
                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-muted py-1 px-2 rounded">{certificate.certificateNumber}</code>
                          {certificate.verified && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-2 py-0.5 text-xs font-medium">
                              <Check className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 bg-muted/30 border-t flex justify-between gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      asChild
                    >
                      <a href={certificate.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.126 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                          Twitter
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                          </svg>
                          Instagram
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                          </svg>
                          Pinterest
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M21.593 7.203a2.506 2.506 0 0 0-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 0 0-1.766 1.778C2.036 8.74 2 10.98 2 12s.037 3.26.403 4.795c.23.857.905 1.51 1.763 1.768C5.736 18.995 12 19 12 19s6.264.007 7.831-.404a2.51 2.51 0 0 0 1.767-1.763c.366-1.544.403-3.784.403-4.804s-.037-3.26-.408-4.826zM9.996 15.004V8.996l5.207 3.004-5.207 3.004z"/>
                          </svg>
                          YouTube
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <div className="flex flex-col items-center max-w-md mx-auto">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum certificado encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Não encontramos certificados que correspondam aos filtros selecionados. Tente ajustar seus filtros ou completar mais cursos para ganhar certificados.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setActiveTab('all');
                }}>
                  Limpar Filtros
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}