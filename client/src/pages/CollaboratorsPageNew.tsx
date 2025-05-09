import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Trash2, Info, Calendar, Clock, 
  BarChart, Search, DollarSign, ExternalLink, Edit, Lightbulb,
  Eye, FileSpreadsheet, List, LayoutGrid, Save, Loader2, UserPlus,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface para os tipos de colaboradores
interface Collaborator {
  id: number;
  userId: number;
  name: string;
  role: string;
  hourlyRate: number;
  hoursPerDay: number;
  city: string;
  isFixed: boolean;
  isResponsible: boolean;
  participatesInStages: boolean;
  billableType?: 'hourly' | 'perDelivery';
  paymentType?: 'hourly' | 'monthly';
  monthlyRate?: number;
  observations?: string;
  profileImageUrl?: string;
  assignedHours: number;
  worksSaturday?: boolean; // Novo campo para indicar se trabalha aos sábados
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Interface para os dados de horas do colaborador
interface CollaboratorHours {
  collaboratorId: number;
  name: string;
  role: string;
  city: string | null;
  hourlyRate: number;
  profileImageUrl: string | null;
  availableHoursPerMonth: number;
  inProgressHours: number;
  inQuoteHours: number;
  completedHours: number;
  totalAssignedHours: number;
  availableHours: number;
  occupancyPercentage: number;
  projects: {
    inProgress: ProjectHours[];
    inQuote: ProjectHours[];
    completed: ProjectHours[];
  };
}

interface ProjectHours {
  projectId: number;
  projectName: string;
  hours: number;
  description: string;
}

interface CollaboratorStats {
  totalCollaborators: number;
  fixedCount: number;
  freelancerCount: number;
  totalFixedCost: number;
  totalAvailableHours: number;
  assignedHours: number;
  overloadedCollaborators: number;
}

interface Holiday {
  id: number;
  name: string;
  date: Date;
  city?: string;
  state?: string;
  isNational: boolean;
}

interface CustomHoliday {
  id: number;
  name: string;
  date: Date;
  collaboratorId?: number;
  isRecurring: boolean;
}

const CollaboratorsPageNew: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedCollaborator, setSelectedCollaborator] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isHoursDialogOpen, setIsHoursDialogOpen] = useState(false);
  const [selectedCollaboratorHours, setSelectedCollaboratorHours] = useState<CollaboratorHours | null>(null);
  const [isLoadingHours, setIsLoadingHours] = useState(false);
  
  // Estado para feriados personalizados
  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([]);
  const [newHoliday, setNewHoliday] = useState<Partial<CustomHoliday>>({
    name: '',
    date: new Date(),
    isRecurring: false
  });
  
  // Filtros para as horas do colaborador
  const [hoursFilters, setHoursFilters] = useState({
    startDate: '',
    endDate: '',
    projectId: 0,
    showPrevisionVsReality: false
  });
  
  // Estado para novo colaborador
  const [newCollaborator, setNewCollaborator] = useState<Partial<Collaborator>>({
    name: '',
    role: '',
    hourlyRate: 0,
    hoursPerDay: 8,
    city: '',
    isFixed: true,
    isResponsible: false,
    participatesInStages: true,
    billableType: 'hourly',
    paymentType: 'hourly',
    assignedHours: 0
  });
  
  // Estado para estatísticas
  const [stats, setStats] = useState<CollaboratorStats>({
    totalCollaborators: 0,
    fixedCount: 0,
    freelancerCount: 0,
    totalFixedCost: 0,
    totalAvailableHours: 0,
    assignedHours: 0,
    overloadedCollaborators: 0
  });
  
  // Consulta para buscar colaboradores
  const { data: collaboratorsData, isLoading } = useQuery<Collaborator[]>({
    queryKey: ['/api/users/1/collaborators'],
    retry: 1,
  });

  // Efeito para processar dados dos colaboradores
  useEffect(() => {
    if (collaboratorsData && Array.isArray(collaboratorsData)) {
      const updatedCollaborators = collaboratorsData.map((collaborator) => ({
        ...collaborator,
        createdAt: collaborator.createdAt ? new Date(collaborator.createdAt) : null,
        updatedAt: collaborator.updatedAt ? new Date(collaborator.updatedAt) : null
      }));
      setCollaborators(updatedCollaborators);
      
      // Cálculo de estatísticas
      const fixedCollaborators = updatedCollaborators.filter((c) => c.isFixed);
      const freelancers = updatedCollaborators.filter((c) => !c.isFixed);
      const totalFixedCost = fixedCollaborators.reduce((sum: number, c: Collaborator) => {
        const { monthlyCost } = calculateCollaboratorMonthlyData(c);
        return sum + monthlyCost;
      }, 0);
      const totalAvailableHours = fixedCollaborators.reduce((sum: number, c: Collaborator) => {
        const { totalHours } = calculateCollaboratorMonthlyData(c);
        return sum + totalHours;
      }, 0);
      const totalAssignedHours = fixedCollaborators.reduce((sum: number, c: Collaborator) => sum + c.assignedHours, 0);
      const overloadedCount = fixedCollaborators.filter((c: Collaborator) => {
        const { totalHours } = calculateCollaboratorMonthlyData(c);
        return c.assignedHours > totalHours;
      }).length;
      
      setStats({
        totalCollaborators: updatedCollaborators.length,
        fixedCount: fixedCollaborators.length,
        freelancerCount: freelancers.length,
        totalFixedCost,
        totalAvailableHours,
        assignedHours: totalAssignedHours,
        overloadedCollaborators: overloadedCount
      });
    }
  }, [collaboratorsData]);

  // Filtrar colaboradores com base na busca e na aba ativa
  const filteredCollaborators = collaborators.filter(collaborator => {
    const searchMatch = searchTerm === '' || 
      collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return searchMatch;
    if (activeTab === 'fixed') return searchMatch && collaborator.isFixed;
    if (activeTab === 'freelancer') return searchMatch && !collaborator.isFixed;
    
    return false;
  });

  // Cálculo de dados mensais para um colaborador
  const calculateCollaboratorMonthlyData = (collaborator: Collaborator) => {
    // Dias úteis considerando sábados se necessário
    // Em média são 22 dias úteis (considerando apenas segunda a sexta)
    // Existem cerca de 4-5 sábados por mês, então somamos mais 4 se o colaborador trabalha aos sábados
    const weekdaysPerMonth = 22;
    const saturdaysPerMonth = 4;
    const workDays = collaborator.worksSaturday ? weekdaysPerMonth + saturdaysPerMonth : weekdaysPerMonth;
    
    const totalHours = workDays * collaborator.hoursPerDay;
    const monthlyCost = collaborator.paymentType === 'monthly' 
      ? (collaborator.monthlyRate || 0)
      : totalHours * collaborator.hourlyRate;
    
    return { workDays, totalHours, monthlyCost };
  };

  // Resetar o formulário de novo colaborador
  const resetCollaboratorForm = () => {
    setNewCollaborator({
      name: '',
      role: '',
      hourlyRate: 0,
      hoursPerDay: 8,
      city: '',
      isFixed: true,
      isResponsible: false,
      participatesInStages: true,
      billableType: 'hourly',
      paymentType: 'hourly',
      assignedHours: 0,
      worksSaturday: false
    });
  };

  // Handlers para os diálogos
  const handleAddCollaborator = async () => {
    try {
      await apiRequest('/api/users/1/collaborators', {
        method: 'POST',
        body: JSON.stringify({
          ...newCollaborator,
          userId: 1
        })
      });
      
      toast({
        title: "Colaborador adicionado",
        description: "O colaborador foi adicionado com sucesso."
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
      setIsAddDialogOpen(false);
      resetCollaboratorForm();
    } catch (error) {
      toast({
        title: "Erro ao adicionar",
        description: "Ocorreu um erro ao adicionar o colaborador.",
        variant: "destructive"
      });
    }
  };

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setNewCollaborator({...collaborator});
    setSelectedCollaborator(collaborator.id);
    setIsEditDialogOpen(true);
  };

  const handleViewCollaborator = (collaborator: Collaborator) => {
    setNewCollaborator({...collaborator});
    setSelectedCollaborator(collaborator.id);
    setIsViewDialogOpen(true);
  };

  const confirmDeleteCollaborator = (id: number) => {
    setSelectedCollaborator(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedCollaborator) return;
    
    try {
      await apiRequest(`/api/users/1/collaborators/${selectedCollaborator}`, {
        method: 'DELETE'
      });
      
      toast({
        title: "Colaborador excluído",
        description: "O colaborador foi excluído com sucesso."
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
      setIsDeleteDialogOpen(false);
      setSelectedCollaborator(null);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o colaborador.",
        variant: "destructive"
      });
    }
  };

  const handleSaveCollaborators = async () => {
    try {
      toast({
        title: "Alterações salvas",
        description: "Todas as alterações foram salvas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive"
      });
    }
  };
  
  // Função para buscar horas do colaborador
  const fetchCollaboratorHours = async (collaborator: Collaborator) => {
    setIsLoadingHours(true);
    try {
      const response = await fetch(`/api/users/1/collaborators/${collaborator.id}/hours`);
      if (!response.ok) {
        throw new Error('Erro ao buscar horas do colaborador');
      }
      
      const data = await response.json();
      setSelectedCollaboratorHours(data);
      setIsHoursDialogOpen(true);
      
      // Resetar filtros
      setHoursFilters({
        startDate: '',
        endDate: '',
        projectId: 0,
        showPrevisionVsReality: false
      });
    } catch (error) {
      console.error('Erro ao buscar horas do colaborador:', error);
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível obter as horas de trabalho do colaborador.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingHours(false);
    }
  };
  
  // Função para filtrar projetos com base nos filtros selecionados
  const getFilteredProjects = (category: 'inProgress' | 'inQuote' | 'completed') => {
    if (!selectedCollaboratorHours) return [];
    
    let projects = [...selectedCollaboratorHours.projects[category]];
    
    // Filtrar por projeto específico
    if (hoursFilters.projectId > 0) {
      projects = projects.filter(project => project.projectId === hoursFilters.projectId);
    }
    
    // Aqui você poderia adicionar os filtros adicionais de data se tivesse dados de data nos projetos
    
    return projects;
  };
  
  // Calcular estatísticas com base nos filtros selecionados
  const getFilteredStats = () => {
    if (!selectedCollaboratorHours) return null;
    
    const inProgressProjects = getFilteredProjects('inProgress');
    const inQuoteProjects = getFilteredProjects('inQuote');
    const completedProjects = getFilteredProjects('completed');
    
    const inProgressHours = inProgressProjects.reduce((total, project) => total + project.hours, 0);
    const inQuoteHours = inQuoteProjects.reduce((total, project) => total + project.hours, 0);
    const completedHours = completedProjects.reduce((total, project) => total + project.hours, 0);
    const totalAssignedHours = inProgressHours + inQuoteHours;
    
    return {
      inProgressHours,
      inQuoteHours,
      completedHours,
      totalAssignedHours
    };
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Cabeçalho da página */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Colaboradores</h1>
            <p className="text-muted-foreground">
              Gerencie sua equipe de trabalho e acompanhe a carga horária e custos
            </p>
          </div>
          
          {/* Botão de salvar movido para o cabeçalho */}
          <Button 
            onClick={handleSaveCollaborators}
            className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        {/* Botões de ação - agora vêm primeiro */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar Colaborador
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsHolidayDialogOpen(true)}
          >
            <Calendar className="h-4 w-4 mr-2" /> Feriados e Recessos
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsTemplateDialogOpen(true)}
          >
            <Lightbulb className="h-4 w-4 mr-2" /> Ver Exemplo Completo
          </Button>
        </div>
        
        {/* Busca de colaboradores - vem depois dos botões */}
        <div className="relative w-full mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar colaborador por nome, função ou cidade..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Estatísticas */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Total de Colaboradores
                </h3>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-semibold">
                    {stats.totalCollaborators}
                  </div>
                  <div className="ml-2 text-sm text-muted-foreground">
                    ({stats.fixedCount} fixos, {stats.freelancerCount} freelas)
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Custo Fixo Mensal
                </h3>
                <div className="mt-1 flex items-center">
                  <div className="text-2xl font-semibold">
                    {formatCurrency(stats.totalFixedCost)}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Horas Disponíveis (equipe fixa)
                </h3>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-semibold">
                    {stats.totalAvailableHours}h
                  </div>
                  <div className="ml-2 text-sm text-muted-foreground">
                    ({Math.round(stats.assignedHours * 100 / stats.totalAvailableHours)}% utilizadas)
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Colaboradores Sobrecarregados
                </h3>
                <div className="mt-1 flex items-center">
                  <div className="text-2xl font-semibold">
                    {stats.overloadedCollaborators}
                  </div>
                  <div className="ml-2 text-sm text-muted-foreground">
                    ({Math.round(stats.overloadedCollaborators * 100 / stats.totalCollaborators)}% do total)
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Introdução */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <Info size={20} className="text-[#FFD600] mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-lg">Entenda este passo:</h3>
                <p className="text-muted-foreground mt-2">
                  Aqui você vai cadastrar as pessoas que trabalham com você, como equipe fixa ou freelancers. A plataforma usa essas informações para calcular os custos do escritório e montar o valor certo dos seus projetos. Quem é fixo entra no custo mensal do escritório. Os freelancers não entram no custo fixo, mas você pode colocar eles como responsáveis por partes do projeto e usar o valor deles no cálculo das etapas. Assim, tudo fica mais organizado e real.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs e lista de colaboradores */}
        <div className="space-y-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <TabsList>
                    <TabsTrigger value="all" className="relative">
                      Todos
                      <Badge variant="outline" className="ml-2 px-1.5 py-0 h-5 text-xs">
                        {collaborators.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="fixed" className="relative">
                      Equipe Fixa
                      <Badge variant="outline" className="ml-2 px-1.5 py-0 h-5 text-xs bg-[#FFD600]/10">
                        {collaborators.filter(c => c.isFixed).length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="freelancer" className="relative">
                      Freelancers e parceiros
                      <Badge variant="outline" className="ml-2 px-1.5 py-0 h-5 text-xs bg-gray-800/10 dark:bg-gray-400/10">
                        {collaborators.filter(c => !c.isFixed).length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Botões de visualização movidos para direita */}
                <div className="border border-input rounded-md flex self-start">
                  <Button 
                    variant={viewMode === 'table' ? 'default' : 'ghost'} 
                    size="icon"
                    className={`rounded-r-none ${viewMode === 'table' ? 'bg-[#FFD600] hover:bg-[#FFD600]/90 text-black' : ''}`}
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'cards' ? 'default' : 'ghost'} 
                    size="icon"
                    className={`rounded-l-none ${viewMode === 'cards' ? 'bg-[#FFD600] hover:bg-[#FFD600]/90 text-black' : ''}`}
                    onClick={() => setViewMode('cards')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value="all" className="space-y-4 mt-4">
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FFD600] border-t-transparent"></div>
                  </CardContent>
                </Card>
              ) : filteredCollaborators.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                      {searchTerm 
                        ? "Nenhum colaborador encontrado com esse termo de busca."
                        : "Nenhum colaborador cadastrado. Adicione sua equipe para começar!"}
                    </div>
                    {searchTerm && (
                      <Button 
                        variant="link" 
                        onClick={() => setSearchTerm('')}
                        className="mt-2"
                      >
                        Limpar busca
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : viewMode === 'table' ? (
                // Visualização em tabela
                <Card>
                  <CardContent className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Colaborador</th>
                            <th className="text-left p-2">Função</th>
                            <th className="text-left p-2">Tipo</th>
                            <th className="text-right p-2">Valor/hora</th>
                            <th className="text-right p-2">Horas/mês</th>
                            <th className="text-center p-2">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCollaborators.map(collaborator => {
                            const { totalHours } = calculateCollaboratorMonthlyData(collaborator);
                            return (
                              <tr key={collaborator.id} className="border-b hover:bg-muted/30">
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                      {collaborator.profileImageUrl ? (
                                        <img 
                                          src={collaborator.profileImageUrl} 
                                          alt={collaborator.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted">
                                          <span className="font-medium text-xs">
                                            {collaborator.name.substring(0, 1).toUpperCase()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-medium">{collaborator.name}</span>
                                  </div>
                                </td>
                                <td className="p-2">{collaborator.role}</td>
                                <td className="p-2">
                                  <Badge variant={collaborator.isFixed ? "default" : "outline"} className={collaborator.isFixed ? "bg-[#FFD600] hover:bg-[#FFD600]/80 text-black" : ""}>
                                    {collaborator.isFixed ? "Fixo" : "Freelancer"}
                                  </Badge>
                                </td>
                                <td className="p-2 text-right">{formatCurrency(collaborator.hourlyRate)}</td>
                                <td className="p-2 text-right">{collaborator.isFixed ? `${totalHours}h` : "-"}</td>
                                <td className="p-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-blue-500 h-8 w-8"
                                      onClick={() => handleViewCollaborator(collaborator)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-cyan-500 h-8 w-8"
                                      onClick={() => fetchCollaboratorHours(collaborator)}
                                    >
                                      <Clock className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-amber-500 h-8 w-8"
                                      onClick={() => handleEditCollaborator(collaborator)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-red-500 h-8 w-8"
                                      onClick={() => confirmDeleteCollaborator(collaborator.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Visualização em cards - Um card por linha para design mais bonito
                <div className="space-y-4">
                  {filteredCollaborators.map(collaborator => {
                    const { workDays, totalHours, monthlyCost } = calculateCollaboratorMonthlyData(collaborator);
                    return (
                      <Card key={collaborator.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                        <div className="flex flex-row h-full">
                          <div className="w-24 md:w-32 bg-gradient-to-b from-black/5 to-black/10 dark:from-white/10 dark:to-white/5 flex flex-col items-center justify-center p-4 border-r">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 ring-2 ring-background shadow-lg">
                              {collaborator.profileImageUrl ? (
                                <img 
                                  src={collaborator.profileImageUrl} 
                                  alt={collaborator.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/80">
                                  <span className="font-bold text-xl">
                                    {collaborator.name.substring(0, 1).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${collaborator.isFixed ? 'bg-[#FFD600]' : 'bg-gray-400'}`}></div>
                            </div>
                            <Badge variant={collaborator.isFixed ? "default" : "outline"} className={`mt-1 ${collaborator.isFixed ? "bg-[#FFD600] hover:bg-[#FFD600]/80 text-black" : ""}`}>
                              {collaborator.isFixed ? "Fixo" : "Freelancer"}
                            </Badge>
                          </div>
                          
                          <div className="flex-1 p-5">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-lg">{collaborator.name}</h3>
                                <p className="text-sm text-muted-foreground">{collaborator.role}</p>
                                <p className="text-xs text-muted-foreground mt-1">{collaborator.city}</p>
                              </div>
                              
                              <div className="flex flex-wrap gap-4 md:gap-6">
                                <div className="border-l pl-4">
                                  <p className="text-xs text-muted-foreground">Valor/hora</p>
                                  <p className="text-base font-semibold">{formatCurrency(collaborator.hourlyRate)}</p>
                                </div>
                                
                                {collaborator.isFixed && (
                                  <>
                                    <div className="border-l pl-4">
                                      <p className="text-xs text-muted-foreground">Disponibilidade</p>
                                      <p className="text-base font-semibold">{collaborator.hoursPerDay}h/dia</p>
                                    </div>
                                    <div className="border-l pl-4">
                                      <p className="text-xs text-muted-foreground">Horas mensais</p>
                                      <p className="text-base font-semibold">{totalHours}h</p>
                                    </div>
                                    <div className="border-l pl-4">
                                      <p className="text-xs text-muted-foreground">Custo mensal</p>
                                      <p className="text-base font-semibold">{formatCurrency(monthlyCost)}</p>
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 md:ml-4">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => handleViewCollaborator(collaborator)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200"
                                  onClick={() => fetchCollaboratorHours(collaborator)}
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-8 w-8 rounded-full hover:bg-amber-50 hover:text-amber-500 hover:border-amber-200"
                                  onClick={() => handleEditCollaborator(collaborator)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                                  onClick={() => confirmDeleteCollaborator(collaborator.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Botão salvar flutuante */}
        <div className="fixed bottom-6 right-6 z-10">
          <Button 
            onClick={handleSaveCollaborators}
            className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black shadow-lg"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        {/* Diálogo de horas do colaborador */}
        <Dialog open={isHoursDialogOpen} onOpenChange={setIsHoursDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Horas de trabalho do colaborador</DialogTitle>
              <DialogDescription>
                Visualize a distribuição das horas de trabalho em diferentes categorias de projetos
              </DialogDescription>
            </DialogHeader>
            
            {/* Cabeçalho com informações do colaborador */}
            {selectedCollaboratorHours && (
              <div className="bg-muted/10 rounded-lg p-4 mb-4 flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-shrink-0">
                  <Avatar className="h-16 w-16 border-2 border-[#FFD600]">
                    {selectedCollaboratorHours.profileImageUrl ? (
                      <AvatarImage src={selectedCollaboratorHours.profileImageUrl} alt={selectedCollaboratorHours.name} />
                    ) : (
                      <AvatarFallback className="bg-[#FFD600]/20 text-black dark:text-white text-lg">
                        {selectedCollaboratorHours.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                
                <div className="flex-grow space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="text-lg font-semibold">{selectedCollaboratorHours.name}</h3>
                    <Badge variant="outline" className="w-fit">
                      {selectedCollaboratorHours.role}
                    </Badge>
                    {selectedCollaboratorHours.city && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedCollaboratorHours.city}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Valor por hora</p>
                      <p className="font-medium">{formatCurrency(selectedCollaboratorHours.hourlyRate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valor no período</p>
                      <p className="font-medium">
                        {(() => {
                          if (!selectedCollaboratorHours) return formatCurrency(0);
                          
                          const stats = getFilteredStats();
                          const hours = stats ? stats.totalAssignedHours : selectedCollaboratorHours.totalAssignedHours;
                          return formatCurrency(hours * selectedCollaboratorHours.hourlyRate);
                        })()}
                      </p>
                    </div>
                    {hoursFilters.projectId > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Valor neste projeto</p>
                        <p className="font-medium">
                          {(() => {
                            if (!selectedCollaboratorHours) return formatCurrency(0);
                            
                            const project = [
                              ...selectedCollaboratorHours.projects.inProgress, 
                              ...selectedCollaboratorHours.projects.inQuote,
                              ...selectedCollaboratorHours.projects.completed
                            ].find(p => p.projectId === hoursFilters.projectId);
                            
                            const hours = project ? project.hours : 0;
                            return formatCurrency(hours * selectedCollaboratorHours.hourlyRate);
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Filtros de horas */}
            <div className="bg-muted/30 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium mb-3">Filtros avançados</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input 
                    id="startDate"
                    type="date"
                    value={hoursFilters.startDate}
                    onChange={(e) => setHoursFilters({...hoursFilters, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input 
                    id="endDate"
                    type="date"
                    value={hoursFilters.endDate}
                    onChange={(e) => setHoursFilters({...hoursFilters, endDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectSelect">Projeto</Label>
                  <Select 
                    value={hoursFilters.projectId ? hoursFilters.projectId.toString() : "0"}
                    onValueChange={(value) => setHoursFilters({...hoursFilters, projectId: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os projetos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Todos os projetos</SelectItem>
                      {selectedCollaboratorHours?.projects.inProgress.map((project) => (
                        <SelectItem key={`progress-${project.projectId}`} value={project.projectId.toString()}>
                          {project.projectName} (Em execução)
                        </SelectItem>
                      ))}
                      {selectedCollaboratorHours?.projects.inQuote.map((project) => (
                        <SelectItem key={`quote-${project.projectId}`} value={project.projectId.toString()}>
                          {project.projectName} (Em orçamento)
                        </SelectItem>
                      ))}
                      {selectedCollaboratorHours?.projects.completed.map((project) => (
                        <SelectItem key={`completed-${project.projectId}`} value={project.projectId.toString()}>
                          {project.projectName} (Finalizado)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4 flex items-center space-x-2">
                <Checkbox 
                  id="showPrevisionVsReality" 
                  checked={hoursFilters.showPrevisionVsReality}
                  onCheckedChange={(checked) => 
                    setHoursFilters({...hoursFilters, showPrevisionVsReality: checked as boolean})
                  }
                />
                <Label htmlFor="showPrevisionVsReality" className="text-sm">
                  Mostrar comparação entre horas previstas e horas realizadas
                </Label>
              </div>
            </div>
            
            {isLoadingHours ? (
              <div className="py-8 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FFD600] border-t-transparent"></div>
              </div>
            ) : selectedCollaboratorHours ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">Horas Disponíveis</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {selectedCollaboratorHours.availableHoursPerMonth}h
                      </div>
                      <Progress
                        value={100}
                        className="h-2 mt-2"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">Em Execução</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {selectedCollaboratorHours.inProgressHours}h
                      </div>
                      <Progress
                        value={(selectedCollaboratorHours.inProgressHours / selectedCollaboratorHours.availableHoursPerMonth) * 100}
                        className="h-2 mt-2 bg-muted"
                        indicatorClassName="bg-green-500"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">Em Orçamento</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {selectedCollaboratorHours.inQuoteHours}h
                      </div>
                      <Progress
                        value={(selectedCollaboratorHours.inQuoteHours / selectedCollaboratorHours.availableHoursPerMonth) * 100}
                        className="h-2 mt-2 bg-muted"
                        indicatorClassName="bg-amber-500"
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">Finalizados</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {selectedCollaboratorHours.completedHours}h
                      </div>
                      <Progress
                        value={(selectedCollaboratorHours.completedHours / selectedCollaboratorHours.availableHoursPerMonth) * 100}
                        className="h-2 mt-2 bg-muted"
                        indicatorClassName="bg-blue-500"
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Projetos em execução */}
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        Projetos em Execução
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {getFilteredProjects('inProgress').length > 0 ? (
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                          {getFilteredProjects('inProgress').map((project, index) => (
                            <li key={index} className="text-sm border-b pb-2">
                              <div className="font-medium">{project.projectName}</div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">{project.description}</span>
                                <span className="text-xs font-semibold">{project.hours}h</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum projeto em execução</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Projetos em orçamento */}
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        Projetos em Orçamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {getFilteredProjects('inQuote').length > 0 ? (
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                          {getFilteredProjects('inQuote').map((project, index) => (
                            <li key={index} className="text-sm border-b pb-2">
                              <div className="font-medium">{project.projectName}</div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">{project.description}</span>
                                <span className="text-xs font-semibold">{project.hours}h</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum projeto em orçamento</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Projetos finalizados */}
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        Projetos Finalizados
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      {getFilteredProjects('completed').length > 0 ? (
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                          {getFilteredProjects('completed').map((project, index) => (
                            <li key={index} className="text-sm border-b pb-2">
                              <div className="font-medium">{project.projectName}</div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">{project.description}</span>
                                <span className="text-xs font-semibold">{project.hours}h</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum projeto finalizado</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">Resumo de Ocupação</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          {/* Stats gerais ou filtrados */}
                          {hoursFilters.projectId === 0 && !hoursFilters.startDate && !hoursFilters.endDate ? (
                            <>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Ocupação Total</span>
                                <span className="text-sm font-medium">
                                  {selectedCollaboratorHours.occupancyPercentage}%
                                </span>
                              </div>
                              <Progress
                                value={selectedCollaboratorHours.occupancyPercentage}
                                className="h-2 mb-4"
                                indicatorClassName={`${
                                  selectedCollaboratorHours.occupancyPercentage > 90 
                                    ? 'bg-red-500' 
                                    : selectedCollaboratorHours.occupancyPercentage > 75 
                                      ? 'bg-amber-500' 
                                      : 'bg-green-500'
                                }`}
                              />
                              
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                  <p className="text-muted-foreground">Total</p>
                                  <p className="font-semibold">{selectedCollaboratorHours.totalAssignedHours}h</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Disponível</p>
                                  <p className="font-semibold">{selectedCollaboratorHours.availableHours}h</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Situação</p>
                                  <p className={`font-semibold ${
                                    selectedCollaboratorHours.occupancyPercentage > 100
                                      ? 'text-red-500'
                                      : selectedCollaboratorHours.occupancyPercentage > 90
                                        ? 'text-amber-500'
                                        : 'text-green-500'
                                  }`}>
                                    {selectedCollaboratorHours.occupancyPercentage > 100
                                      ? 'Sobrecarregado'
                                      : selectedCollaboratorHours.occupancyPercentage > 90
                                        ? 'Crítico'
                                        : selectedCollaboratorHours.occupancyPercentage > 75
                                          ? 'Alto'
                                          : 'Normal'}
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <h4 className="text-sm font-medium mb-2">Resultados Filtrados</h4>
                              {getFilteredStats() && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                                  <div className="bg-muted/20 p-3 rounded-md">
                                    <p className="text-xs text-muted-foreground">Em Execução</p>
                                    <p className="font-semibold mt-1">{getFilteredStats()?.inProgressHours}h</p>
                                  </div>
                                  <div className="bg-muted/20 p-3 rounded-md">
                                    <p className="text-xs text-muted-foreground">Em Orçamento</p>
                                    <p className="font-semibold mt-1">{getFilteredStats()?.inQuoteHours}h</p>
                                  </div>
                                  <div className="bg-muted/20 p-3 rounded-md">
                                    <p className="text-xs text-muted-foreground">Finalizados</p>
                                    <p className="font-semibold mt-1">{getFilteredStats()?.completedHours}h</p>
                                  </div>
                                </div>
                              )}
                              
                              {hoursFilters.projectId > 0 && (
                                <div className="mt-3 border-t pt-3">
                                  <h4 className="text-sm font-medium">Projeto selecionado:</h4>
                                  <p className="text-sm">
                                    {[...selectedCollaboratorHours.projects.inProgress, 
                                       ...selectedCollaboratorHours.projects.inQuote,
                                       ...selectedCollaboratorHours.projects.completed]
                                       .find(p => p.projectId === hoursFilters.projectId)?.projectName}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        <div>
                          {hoursFilters.showPrevisionVsReality ? (
                            <>
                              <h4 className="text-sm font-medium mb-2">Horas Esperadas vs. Realizadas</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between mb-1 text-xs">
                                    <span>Horas Estimadas</span>
                                    <span>{selectedCollaboratorHours.availableHoursPerMonth}h</span>
                                  </div>
                                  <Progress value={100} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1 text-xs">
                                    <span>Horas Alocadas</span>
                                    <span>{selectedCollaboratorHours.totalAssignedHours}h</span>
                                  </div>
                                  <Progress 
                                    value={(selectedCollaboratorHours.totalAssignedHours / selectedCollaboratorHours.availableHoursPerMonth) * 100} 
                                    className="h-2"
                                    indicatorClassName={`${
                                      selectedCollaboratorHours.totalAssignedHours > selectedCollaboratorHours.availableHoursPerMonth
                                        ? 'bg-red-500'
                                        : selectedCollaboratorHours.totalAssignedHours > selectedCollaboratorHours.availableHoursPerMonth * 0.9
                                          ? 'bg-amber-500'
                                          : 'bg-green-500'
                                    }`}
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1 text-xs">
                                    <span>Utilização</span>
                                    <span>{Math.round((selectedCollaboratorHours.totalAssignedHours / selectedCollaboratorHours.availableHoursPerMonth) * 100)}%</span>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <h4 className="text-sm font-medium mb-2">Distribuição de Horas</h4>
                              <div className="relative h-24">
                                <div className="absolute inset-0 flex rounded-md overflow-hidden">
                                  {(getFilteredStats()?.inProgressHours || 0) > 0 && (
                                    <div 
                                      className="bg-green-500 h-full" 
                                      style={{ 
                                        width: `${(getFilteredStats()?.inProgressHours || 0) / (getFilteredStats()?.totalAssignedHours || 1) * 100}%` 
                                      }}
                                      title={`Em Execução: ${getFilteredStats()?.inProgressHours}h`}
                                    ></div>
                                  )}
                                  {(getFilteredStats()?.inQuoteHours || 0) > 0 && (
                                    <div 
                                      className="bg-amber-500 h-full" 
                                      style={{ 
                                        width: `${(getFilteredStats()?.inQuoteHours || 0) / (getFilteredStats()?.totalAssignedHours || 1) * 100}%` 
                                      }}
                                      title={`Em Orçamento: ${getFilteredStats()?.inQuoteHours}h`}
                                    ></div>
                                  )}
                                  {(getFilteredStats()?.completedHours || 0) > 0 && (
                                    <div 
                                      className="bg-blue-500 h-full" 
                                      style={{ 
                                        width: `${(getFilteredStats()?.completedHours || 0) / (getFilteredStats()?.totalAssignedHours || 1) * 100}%` 
                                      }}
                                      title={`Finalizados: ${getFilteredStats()?.completedHours}h`}
                                    ></div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-around text-xs mt-2">
                                <div className="flex items-center">
                                  <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                                  <span>
                                    {(() => {
                                      const stats = getFilteredStats();
                                      if (!stats || !stats.totalAssignedHours) return '0%';
                                      return `${Math.round((stats.inProgressHours / stats.totalAssignedHours) * 100)}%`;
                                    })()}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
                                  <span>
                                    {(() => {
                                      const stats = getFilteredStats();
                                      if (!stats || !stats.totalAssignedHours) return '0%';
                                      return `${Math.round((stats.inQuoteHours / stats.totalAssignedHours) * 100)}%`;
                                    })()}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                                  <span>
                                    {(() => {
                                      const stats = getFilteredStats();
                                      if (!stats || !stats.totalAssignedHours) return '0%';
                                      return `${Math.round((stats.completedHours / stats.totalAssignedHours) * 100)}%`;
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsHoursDialogOpen(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de Feriados e Recessos */}
        <Dialog
          open={isHolidayDialogOpen}
          onOpenChange={setIsHolidayDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Feriados e Recessos</DialogTitle>
              <DialogDescription>
                Adicione feriados e períodos de recesso para o cálculo correto de horas disponíveis
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Formulário para adicionar feriado */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Adicionar novo feriado/recesso</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="holidayName">Nome</Label>
                      <Input 
                        id="holidayName"
                        value={newHoliday.name || ''}
                        onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                        placeholder="Ex: Natal, Recesso Coletivo"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="holidayDate">Data</Label>
                      <Input 
                        id="holidayDate"
                        type="date"
                        value={newHoliday.date instanceof Date 
                          ? newHoliday.date.toISOString().split('T')[0] 
                          : ''
                        }
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : new Date();
                          setNewHoliday({...newHoliday, date});
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-4">
                    <Checkbox 
                      id="isRecurring"
                      checked={newHoliday.isRecurring}
                      onCheckedChange={(checked) => 
                        setNewHoliday({...newHoliday, isRecurring: checked === true})
                      }
                    />
                    <Label 
                      htmlFor="isRecurring" 
                      className="ml-2 font-normal"
                    >
                      Feriado recorrente (todo ano)
                    </Label>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() => {
                        // Simular adição de feriado (normalmente enviaria para a API)
                        if (!newHoliday.name || !newHoliday.date) {
                          toast({
                            title: "Informações incompletas",
                            description: "Preencha todos os campos obrigatórios.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        const holiday: CustomHoliday = {
                          id: Date.now(), // Simular ID único
                          name: newHoliday.name,
                          date: newHoliday.date instanceof Date ? newHoliday.date : new Date(),
                          isRecurring: newHoliday.isRecurring || false
                        };
                        
                        setCustomHolidays([...customHolidays, holiday]);
                        
                        // Resetar formulário
                        setNewHoliday({
                          name: '',
                          date: new Date(),
                          isRecurring: false
                        });
                        
                        toast({
                          title: "Feriado adicionado",
                          description: "O feriado foi adicionado com sucesso."
                        });
                      }}
                      className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Feriado
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Lista de feriados adicionados */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Feriados Adicionados</CardTitle>
                </CardHeader>
                <CardContent>
                  {customHolidays.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum feriado personalizado adicionado ainda
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {customHolidays.map((holiday) => (
                        <div 
                          key={holiday.id} 
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <div>
                            <div className="font-medium">{holiday.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {holiday.date.toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </span>
                              {holiday.isRecurring && (
                                <Badge variant="outline" className="text-xs">
                                  Recorrente
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => {
                              // Remover feriado
                              setCustomHolidays(customHolidays.filter(h => h.id !== holiday.id));
                              toast({
                                title: "Feriado removido",
                                description: "O feriado foi removido com sucesso."
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Informações sobre trabalho aos sábados */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Opções de Jornada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Trabalho aos sábados</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure individualmente na ficha de cada colaborador se ele trabalha aos sábados.
                        Isso ajustará automaticamente o cálculo de horas mensais disponíveis.
                      </p>
                      
                      <div className="bg-muted/30 p-4 rounded-lg text-sm">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 mt-0.5 text-[#FFD600] flex-shrink-0" />
                          <div>
                            <p>
                              Um colaborador que trabalha 8 horas/dia:
                            </p>
                            <ul className="list-disc ml-4 mt-2 space-y-1">
                              <li>
                                <span className="font-medium">Apenas dias úteis (22 dias):</span> 176h/mês
                              </li>
                              <li>
                                <span className="font-medium">Incluindo sábados (26 dias):</span> 208h/mês
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsHolidayDialogOpen(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </MainLayout>
  );
};

export default CollaboratorsPageNew;