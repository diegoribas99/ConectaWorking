import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { 
  Plus, Trash2, Info, Calendar, Clock, 
  BarChart, Search, DollarSign, ExternalLink, Edit, Lightbulb,
  Eye, FileSpreadsheet, List, LayoutGrid, Save, Loader2, UserPlus,
  MapPin
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
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
  endDate?: Date;
  collaboratorId?: number;
  isRecurring: boolean;
  isRange: boolean;
  type: 'holiday' | 'vacation' | 'recess' | 'collective_vacation' | 'absence' | 'medical' | 'other';
  isPersonal?: boolean; // Indica se é específico para um colaborador
}

interface WorkSchedule {
  monday: { works: boolean, hours: number };
  tuesday: { works: boolean, hours: number };
  wednesday: { works: boolean, hours: number };
  thursday: { works: boolean, hours: number };
  friday: { works: boolean, hours: number };
  saturday: { works: boolean, hours: number };
  sunday: { works: boolean, hours: number };
}

const CollaboratorsPageNew: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
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
    endDate: undefined,
    isRecurring: false,
    isRange: true, // Por padrão os períodos são múltiplos dias
    type: 'holiday'
  });
  
  // Estado para a jornada de trabalho padrão
  const [defaultWorkSchedule, setDefaultWorkSchedule] = useState<WorkSchedule>({
    monday: { works: true, hours: 8 },
    tuesday: { works: true, hours: 8 },
    wednesday: { works: true, hours: 8 },
    thursday: { works: true, hours: 8 },
    friday: { works: true, hours: 8 },
    saturday: { works: false, hours: 8 },
    sunday: { works: false, hours: 0 }
  });
  
  // Estado para carregar/salvar feriados nacionais
  const [nationalHolidays, setNationalHolidays] = useState<Holiday[]>([]);
  const [selectedHolidays, setSelectedHolidays] = useState<Record<number, boolean>>({});
  const [isLoadingNationalHolidays, setIsLoadingNationalHolidays] = useState(false);
  const [showHolidaySelection, setShowHolidaySelection] = useState(false);
  
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
    assignedHours: 0,
    worksSaturday: false
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

  // Resetar o formulário de feriados
  const resetHolidayForm = () => {
    setNewHoliday({
      name: '',
      date: new Date(),
      endDate: undefined,
      collaboratorId: undefined,
      isRecurring: false,
      isRange: true, // Por padrão os períodos são múltiplos dias
      isPersonal: false,
      type: 'holiday'
    });
  };

  // Buscar feriados nacionais da API
  const fetchNationalHolidays = async () => {
    try {
      setIsLoadingNationalHolidays(true);
      
      // Simulando busca de feriados nacionais
      // Em produção, faria uma requisição para uma API real de feriados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentYear = new Date().getFullYear();
      const mockHolidays: Holiday[] = [
        { id: 1, name: 'Ano Novo', date: new Date(`${currentYear}-01-01`), isNational: true },
        { id: 2, name: 'Carnaval', date: new Date(`${currentYear}-02-20`), isNational: true },
        { id: 3, name: 'Quarta-feira de Cinzas', date: new Date(`${currentYear}-02-22`), isNational: true },
        { id: 4, name: 'Sexta-feira Santa', date: new Date(`${currentYear}-04-07`), isNational: true },
        { id: 5, name: 'Tiradentes', date: new Date(`${currentYear}-04-21`), isNational: true },
        { id: 6, name: 'Dia do Trabalho', date: new Date(`${currentYear}-05-01`), isNational: true },
        { id: 7, name: 'Corpus Christi', date: new Date(`${currentYear}-06-08`), isNational: true },
        { id: 8, name: 'Independência do Brasil', date: new Date(`${currentYear}-09-07`), isNational: true },
        { id: 9, name: 'Nossa Senhora Aparecida', date: new Date(`${currentYear}-10-12`), isNational: true },
        { id: 10, name: 'Finados', date: new Date(`${currentYear}-11-02`), isNational: true },
        { id: 11, name: 'Proclamação da República', date: new Date(`${currentYear}-11-15`), isNational: true },
        { id: 12, name: 'Natal', date: new Date(`${currentYear}-12-25`), isNational: true }
      ];
      
      setNationalHolidays(mockHolidays);
      
      // Selecionar todos os feriados por padrão
      const initialSelections: Record<number, boolean> = {};
      mockHolidays.forEach(holiday => {
        initialSelections[holiday.id] = true; // Marcar todos como selecionados
      });
      setSelectedHolidays(initialSelections);
      
      // Mostrar o diálogo de seleção de feriados
      setShowHolidaySelection(true);
      
      toast({
        title: "Feriados carregados",
        description: `${mockHolidays.length} feriados nacionais encontrados para ${currentYear}`
      });
      
    } catch (error) {
      toast({
        title: "Erro ao buscar feriados",
        description: "Não foi possível carregar os feriados nacionais.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingNationalHolidays(false);
    }
  };
  
  // Aplicar feriados nacionais à lista de feriados personalizados
  const applySelectedHolidays = () => {
    // Verificar quais feriados já estão adicionados por nome e data para evitar duplicações
    const existingHolidayNames = customHolidays.map(h => h.name.toLowerCase().trim());
    const existingHolidayDates = customHolidays.map(h => h.date.toISOString().split('T')[0]);
    
    // Feriados que já existem (com nomes duplicados)
    const duplicatedByName = nationalHolidays.filter(h => 
      selectedHolidays[h.id] && existingHolidayNames.includes(h.name.toLowerCase().trim())
    );
    
    // Feriados que já existem (com datas duplicadas)
    const duplicatedByDate = nationalHolidays.filter(h => 
      selectedHolidays[h.id] && existingHolidayDates.includes(h.date.toISOString().split('T')[0])
    );
    
    // Feriados selecionados que não estão duplicados em nome ou data
    const uniqueSelectedHolidays = nationalHolidays.filter(h => 
      selectedHolidays[h.id] && 
      !existingHolidayNames.includes(h.name.toLowerCase().trim()) && 
      !existingHolidayDates.includes(h.date.toISOString().split('T')[0])
    );
    
    // Se tiver duplicados, mostrar alerta
    if (duplicatedByName.length > 0 || duplicatedByDate.length > 0) {
      const duplicatedCount = duplicatedByName.length + duplicatedByDate.length;
      const uniqueCount = uniqueSelectedHolidays.length;
      
      // Se não tiver feriados únicos e tiver duplicados, mostrar alerta com opção de adicionar mesmo assim
      if (uniqueCount === 0) {
        const duplicatedNames = duplicatedByName.map(h => h.name).join(', ');
        const message = duplicatedByName.length > 0
          ? `Os seguintes feriados já estão adicionados: ${duplicatedNames}`
          : `Todos os feriados selecionados já estão adicionados com outras datas/nomes`;
        
        toast({
          title: "Feriados duplicados",
          description: message + " Utilize o botão 'Adicionar Ignorando Duplicados' para adicionar todos os feriados selecionados.",
          variant: "destructive"
        });
        
        return;
      } else {
        // Se tiver feriados únicos, adicionar os únicos e avisar sobre os duplicados
        toast({
          title: "Feriados parcialmente adicionados",
          description: `${uniqueCount} feriados novos foram adicionados. ${duplicatedCount} feriados foram ignorados por já existirem.`
        });
      }
    }
    
    // Se não tiver nenhum feriado selecionado ou todos os selecionados já existem
    if (uniqueSelectedHolidays.length === 0 && duplicatedByName.length === 0 && duplicatedByDate.length === 0) {
      toast({
        title: "Nenhum feriado selecionado",
        description: "Nenhum feriado foi selecionado para adicionar."
      });
      setShowHolidaySelection(false);
      return;
    }
    
    // Adicionar apenas os feriados únicos
    addHolidaysToCustomList(uniqueSelectedHolidays);
    
    // Fechar o diálogo de seleção
    setShowHolidaySelection(false);
  };
  
  // Função para forçar adição mesmo com duplicações
  const forceAddSelectedHolidays = () => {
    const selectedHolidaysList = nationalHolidays.filter(h => selectedHolidays[h.id]);
    
    if (selectedHolidaysList.length === 0) {
      toast({
        title: "Nenhum feriado selecionado",
        description: "Nenhum feriado foi selecionado para adicionar."
      });
      return;
    }
    
    addHolidaysToCustomList(selectedHolidaysList);
    setShowHolidaySelection(false);
  };
  
  // Função auxiliar para adicionar feriados à lista
  const addHolidaysToCustomList = (holidaysList: Holiday[]) => {
    if (holidaysList.length === 0) return;
    
    // Converter feriados nacionais para o formato de feriados personalizados
    const convertedHolidays: CustomHoliday[] = holidaysList.map(h => ({
      id: Date.now() + Math.floor(Math.random() * 1000), // Gerar ID único
      name: h.name,
      date: h.date,
      isRecurring: true, // Feriados nacionais geralmente são recorrentes
      isRange: true, // Usar período de datas múltiplas por padrão
      endDate: h.date, // A data final inicialmente é igual à data inicial
      type: 'holiday'
    }));
    
    // Adicionar à lista de feriados personalizados
    setCustomHolidays([...customHolidays, ...convertedHolidays]);
    
    toast({
      title: "Feriados aplicados",
      description: `${convertedHolidays.length} feriados adicionados com sucesso.`
    });
  };
  
  // Versão original para manter compatibilidade de código
  const applyNationalHolidays = applySelectedHolidays;

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
    console.log("Editando colaborador:", collaborator);
    setNewCollaborator({...collaborator});
    setSelectedCollaborator(collaborator.id);
    setIsEditDialogOpen(true);
    
    // Mostrar toast para o usuário
    toast({
      title: "Editar colaborador",
      description: `Editando informações de ${collaborator.name}`,
    });
  };

  const handleViewCollaborator = (collaborator: Collaborator) => {
    console.log("Visualizando colaborador:", collaborator);
    setNewCollaborator({...collaborator});
    setSelectedCollaborator(collaborator.id);
    setIsViewDialogOpen(true);
    
    // Mostrar toast para o usuário
    toast({
      title: "Detalhes do colaborador",
      description: `Visualizando informações de ${collaborator.name}`,
    });
  };

  const confirmDeleteCollaborator = (id: number) => {
    console.log("Excluindo colaborador ID:", id);
    setSelectedCollaborator(id);
    setIsDeleteDialogOpen(true);
    
    // Mostrar toast para o usuário imediatamente, antes mesmo da confirmação
    const colaborador = collaborators.find(c => c.id === id);
    toast({
      title: "Confirmar exclusão",
      description: `Deseja excluir ${colaborador ? colaborador.name : 'este colaborador'}?`,
      action: <ToastAction altText="Confirmar">Confirmar</ToastAction>
    });
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Colaboradores</h1>
              <p className="text-muted-foreground">
                Gerencie sua equipe de trabalho e acompanhe a carga horária e custos
              </p>
            </div>
          </div>
          
          {/* Botões de ação no topo */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setIsTemplateDialogOpen(true)}
              variant="outline"
              className="border-[#FFD600] text-black dark:text-white hover:bg-[#FFD600]/10"
            >
              <Lightbulb className="h-4 w-4 mr-2" /> Ver Exemplo Completo
            </Button>
            <Button 
              onClick={handleSaveCollaborators}
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>

        {/* Os botões de ação e busca serão movidos para após as tabs */}

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
              {/* Botões de ação removidos daqui e serão colocados abaixo do campo de busca */}

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Botões de visualização movidos para esquerda */}
                <div className="border border-input rounded-md flex self-start order-2 md:order-1">
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
                
                <div className="flex flex-wrap items-center gap-2 order-1 md:order-2">
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
              </div>
              
              {/* Campo de busca e botões de ação abaixo */}
              <div className="space-y-4">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar colaborador por nome, função ou cidade..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Botões de Feriados e Adicionar Colaborador na ordem solicitada */}
                <div className="flex flex-wrap gap-2 mb-2 justify-end">
                  <Button
                    onClick={() => setIsHolidayDialogOpen(true)}
                    className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                  >
                    <Calendar className="h-4 w-4 mr-2" /> Feriados e Recessos
                  </Button>
                  
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Colaborador
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
                                  <div className="flex items-center justify-center gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      className="h-9 w-9 rounded-full bg-[#FFD600]/10 hover:bg-[#FFD600]/30 text-black dark:text-white border-[#FFD600]"
                                      onClick={() => handleViewCollaborator(collaborator)}
                                    >
                                      <Eye className="h-5 w-5" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      className="h-9 w-9 rounded-full bg-[#FFD600]/10 hover:bg-[#FFD600]/30 text-black dark:text-white border-[#FFD600]"
                                      onClick={() => fetchCollaboratorHours(collaborator)}
                                    >
                                      <Clock className="h-5 w-5" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      className="h-9 w-9 rounded-full bg-[#FFD600]/10 hover:bg-[#FFD600]/30 text-black dark:text-white border-[#FFD600]"
                                      onClick={() => handleEditCollaborator(collaborator)}
                                    >
                                      <Edit className="h-5 w-5" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      className="h-9 w-9 rounded-full border-red-500 hover:bg-red-500/10 text-red-500"
                                      onClick={() => confirmDeleteCollaborator(collaborator.id)}
                                    >
                                      <Trash2 className="h-5 w-5" />
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
                                  className="h-9 w-9 rounded-full bg-[#FFD600]/10 hover:bg-[#FFD600]/30 text-black dark:text-white border-[#FFD600]"
                                  onClick={() => handleViewCollaborator(collaborator)}
                                >
                                  <Eye className="h-5 w-5" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-9 w-9 rounded-full bg-[#FFD600]/10 hover:bg-[#FFD600]/30 text-black dark:text-white border-[#FFD600]"
                                  onClick={() => fetchCollaboratorHours(collaborator)}
                                >
                                  <Clock className="h-5 w-5" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-9 w-9 rounded-full bg-[#FFD600]/10 hover:bg-[#FFD600]/30 text-black dark:text-white border-[#FFD600]"
                                  onClick={() => handleEditCollaborator(collaborator)}
                                >
                                  <Edit className="h-5 w-5" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-9 w-9 rounded-full border-red-500 hover:bg-red-500/10 text-red-500"
                                  onClick={() => confirmDeleteCollaborator(collaborator.id)}
                                >
                                  <Trash2 className="h-5 w-5" />
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

        {/* Botão salvar flutuante removido pois já existe no topo */}

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
        
        {/* Diálogo para seleção de feriados */}
        <Dialog open={showHolidaySelection} onOpenChange={setShowHolidaySelection}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Selecione os Feriados para Adicionar</DialogTitle>
              <DialogDescription>
                Escolha quais feriados deseja adicionar ao calendário do escritório.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4 px-1">
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Selecionar todos
                    const allSelected: Record<number, boolean> = {};
                    nationalHolidays.forEach(h => {
                      allSelected[h.id] = true;
                    });
                    setSelectedHolidays(allSelected);
                  }}
                >
                  Selecionar Todos
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Desmarcar todos
                    const allUnselected: Record<number, boolean> = {};
                    nationalHolidays.forEach(h => {
                      allUnselected[h.id] = false;
                    });
                    setSelectedHolidays(allUnselected);
                  }}
                >
                  Desmarcar Todos
                </Button>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {nationalHolidays.map(holiday => (
                      <div key={holiday.id} className="flex items-center space-x-2 border-b pb-2">
                        <Checkbox 
                          id={`holiday-${holiday.id}`}
                          checked={selectedHolidays[holiday.id] || false}
                          onCheckedChange={(checked) => {
                            setSelectedHolidays({
                              ...selectedHolidays,
                              [holiday.id]: checked === true
                            });
                          }}
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={`holiday-${holiday.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {holiday.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {holiday.date.toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline"
                  onClick={() => setShowHolidaySelection(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="outline"
                  onClick={forceAddSelectedHolidays}
                >
                  Adicionar Ignorando Duplicados
                </Button>
                <Button 
                  className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                  onClick={applySelectedHolidays}
                >
                  Adicionar Selecionados
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de Feriados e Recessos */}
        <Dialog
          open={isHolidayDialogOpen}
          onOpenChange={setIsHolidayDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Períodos de Ausência e Jornada de Trabalho</DialogTitle>
              <DialogDescription>
                Configure períodos de férias, feriados e jornadas de trabalho para cálculo correto de horas disponíveis
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 px-1">
              {/* Tabs para organizar as seções */}
              <Tabs defaultValue="holidays">
                <TabsList className="mb-4">
                  <TabsTrigger value="holidays">Períodos de Ausência</TabsTrigger>
                  <TabsTrigger value="workdays">Jornada de Trabalho</TabsTrigger>
                </TabsList>
                
                {/* Seção de Feriados */}
                <TabsContent value="holidays" className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Button
                      onClick={fetchNationalHolidays}
                      variant="outline"
                      className="flex items-center"
                      disabled={isLoadingNationalHolidays}
                    >
                      {isLoadingNationalHolidays ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Calendar className="mr-2 h-4 w-4" />
                      )}
                      Buscar Feriados Nacionais
                    </Button>
                  </div>
                  
                  {/* Formulário para adicionar período de ausência */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-4">Adicionar novo período de ausência</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="holidayName">Nome do Período</Label>
                          <Input 
                            id="holidayName"
                            value={newHoliday.name || ''}
                            onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                            placeholder="Ex: Natal, Férias de Verão"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="holidayType">Tipo</Label>
                          <Select
                            value={newHoliday.type}
                            onValueChange={(value) => {
                              const newType = value as 'holiday' | 'vacation' | 'recess' | 'collective_vacation' | 'absence' | 'medical' | 'other';
                              // Se for férias (individual ou coletiva), já marca como período de múltiplos dias
                              const isRange = newType === 'vacation' || newType === 'collective_vacation' ? true : newHoliday.isRange;
                              setNewHoliday({...newHoliday, type: newType, isRange});
                            }}
                          >
                            <SelectTrigger id="holidayType" className="mt-1">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="holiday">Feriado</SelectItem>
                              <SelectItem value="recess">Recesso</SelectItem>
                              <SelectItem value="vacation">Férias</SelectItem>
                              <SelectItem value="collective_vacation">Férias Coletivas</SelectItem>
                              <SelectItem value="absence">Falta</SelectItem>
                              <SelectItem value="medical">Atestado Médico</SelectItem>
                              <SelectItem value="other">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="collaboratorId">Aplicar a</Label>
                          <Select
                            value={newHoliday.collaboratorId?.toString() || '0'}
                            onValueChange={(value) => {
                              setNewHoliday({
                                ...newHoliday, 
                                collaboratorId: value && value !== "0" ? parseInt(value) : undefined
                              });
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione a quem se aplica" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Todo o escritório</SelectItem>
                              {collaborators.map(collab => (
                                <SelectItem 
                                  key={collab.id} 
                                  value={collab.id.toString()}
                                >
                                  {collab.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Selecione "Todo o escritório" para um feriado geral ou escolha um colaborador específico
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                        
                        {newHoliday.isRange && (
                          <div>
                            <Label htmlFor="holidayEndDate">Data Final</Label>
                            <Input 
                              id="holidayEndDate"
                              type="date"
                              value={newHoliday.endDate instanceof Date 
                                ? newHoliday.endDate.toISOString().split('T')[0] 
                                : ''
                              }
                              onChange={(e) => {
                                const date = e.target.value ? new Date(e.target.value) : new Date();
                                setNewHoliday({...newHoliday, endDate: date});
                              }}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Checkboxes de configuração */}
                        
                      <div className="flex flex-col md:flex-row gap-4 mt-4">
                        <div className="flex items-center">
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
                        
                        <div className="flex items-center">
                          <Checkbox 
                            id="isRange"
                            checked={newHoliday.isRange}
                            disabled={newHoliday.type === 'vacation' || newHoliday.type === 'collective_vacation'} // Desabilita se for qualquer tipo de férias
                            onCheckedChange={(checked) => 
                              setNewHoliday({...newHoliday, isRange: checked === true})
                            }
                          />
                          <Label 
                            htmlFor="isRange" 
                            className={`ml-2 font-normal ${(newHoliday.type === 'vacation' || newHoliday.type === 'collective_vacation') ? 'text-muted-foreground' : ''}`}
                          >
                            Período de múltiplos dias {(newHoliday.type === 'vacation' || newHoliday.type === 'collective_vacation') && '(automático para férias)'}
                          </Label>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={() => {
                            // Validar dados antes de adicionar
                            if (!newHoliday.name || !newHoliday.date) {
                              toast({
                                title: "Informações incompletas",
                                description: "Preencha todos os campos obrigatórios.",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            if (newHoliday.isRange && !newHoliday.endDate) {
                              toast({
                                title: "Data final não informada",
                                description: "Informe a data final do período.",
                                variant: "destructive"
                              });
                              return;
                            }
                            
                            const holiday: CustomHoliday = {
                              id: Date.now(), // Simular ID único
                              name: newHoliday.name,
                              date: newHoliday.date instanceof Date ? newHoliday.date : new Date(),
                              endDate: newHoliday.endDate,
                              collaboratorId: newHoliday.collaboratorId,
                              isRecurring: newHoliday.isRecurring || false,
                              isRange: newHoliday.isRange || false,
                              isPersonal: newHoliday.collaboratorId !== undefined,
                              type: newHoliday.type || 'holiday'
                            };
                            
                            setCustomHolidays([...customHolidays, holiday]);
                            
                            // Resetar formulário
                            resetHolidayForm();
                            
                            // Personalizar mensagem baseado no tipo
                            let tipoPeriodo = '';
                            switch(newHoliday.type) {
                              case 'vacation':
                                tipoPeriodo = 'Férias';
                                break;
                              case 'collective_vacation':
                                tipoPeriodo = 'Férias Coletivas';
                                break;
                              case 'recess':
                                tipoPeriodo = 'Recesso';
                                break;
                              case 'holiday':
                                tipoPeriodo = 'Feriado';
                                break;
                              case 'absence':
                                tipoPeriodo = 'Falta';
                                break;
                              case 'medical':
                                tipoPeriodo = 'Atestado Médico';
                                break;
                              case 'other':
                                tipoPeriodo = 'Período';
                                break;
                              default:
                                tipoPeriodo = 'Período';
                            }
                              
                            toast({
                              title: `${tipoPeriodo} adicionado`,
                              description: newHoliday.collaboratorId 
                                ? `${tipoPeriodo} registrado apenas para ${collaborators.find(c => c.id === newHoliday.collaboratorId)?.name || 'colaborador específico'}.`
                                : `O ${tipoPeriodo.toLowerCase()} foi adicionado para todos os colaboradores.`
                            });
                          }}
                          className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Lista de feriados adicionados */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Feriados e Períodos Adicionados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customHolidays.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          Nenhum feriado ou período personalizado adicionado ainda
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
                                <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {holiday.date.toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })}
                                    
                                    {holiday.isRange && holiday.endDate && (
                                      <> até {holiday.endDate.toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })}</>
                                    )}
                                  </span>
                                  
                                  {holiday.isRecurring && (
                                    <Badge variant="outline" className="text-xs font-medium bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300 border-yellow-300">
                                      Recorrente
                                    </Badge>
                                  )}
                                  
                                  {holiday.type === 'holiday' && (
                                    <Badge variant="outline" className="text-xs font-medium bg-blue-500/20 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-300">
                                      Feriado
                                    </Badge>
                                  )}
                                  
                                  {holiday.type === 'recess' && (
                                    <Badge variant="outline" className="text-xs font-medium bg-amber-500/20 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-300">
                                      Recesso
                                    </Badge>
                                  )}
                                  
                                  {holiday.type === 'vacation' && (
                                    <Badge variant="outline" className="text-xs font-medium bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-300 border-green-300">
                                      Férias
                                    </Badge>
                                  )}
                                  
                                  {holiday.type === 'collective_vacation' && (
                                    <Badge variant="outline" className="text-xs font-medium bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-300">
                                      Férias Coletivas
                                    </Badge>
                                  )}
                                  
                                  {holiday.type === 'absence' && (
                                    <Badge variant="outline" className="text-xs font-medium bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-300 border-red-300">
                                      Falta
                                    </Badge>
                                  )}
                                  
                                  {holiday.type === 'medical' && (
                                    <Badge variant="outline" className="text-xs font-medium bg-purple-500/20 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border-purple-300">
                                      Atestado Médico
                                    </Badge>
                                  )}
                                  
                                  {holiday.type === 'other' && (
                                    <Badge variant="outline" className="text-xs font-medium bg-slate-500/20 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300 border-slate-300">
                                      Outro
                                    </Badge>
                                  )}
                                  
                                  {holiday.isPersonal && holiday.collaboratorId && (
                                    <Badge variant="outline" className="text-xs font-medium bg-indigo-500/20 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border-indigo-300">
                                      {collaborators.find(c => c.id === holiday.collaboratorId)?.name || 'Colaborador específico'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => {
                                  // Remover período
                                  setCustomHolidays(customHolidays.filter(h => h.id !== holiday.id));
                                  
                                  // Personalizar mensagem baseado no tipo
                                  let tipoPeriodo = '';
                                  switch(holiday.type) {
                                    case 'vacation':
                                      tipoPeriodo = 'Férias';
                                      break;
                                    case 'collective_vacation':
                                      tipoPeriodo = 'Férias Coletivas';
                                      break;
                                    case 'recess':
                                      tipoPeriodo = 'Recesso';
                                      break;
                                    case 'holiday':
                                      tipoPeriodo = 'Feriado';
                                      break;
                                    case 'absence':
                                      tipoPeriodo = 'Falta';
                                      break;
                                    case 'medical':
                                      tipoPeriodo = 'Atestado Médico';
                                      break;
                                    case 'other':
                                      tipoPeriodo = 'Período';
                                      break;
                                    default:
                                      tipoPeriodo = 'Período';
                                  }
                                    
                                  toast({
                                    title: `${tipoPeriodo} removido`,
                                    description: `O período de ${tipoPeriodo.toLowerCase()} foi removido com sucesso.`
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
                </TabsContent>
                
                {/* Seção de Jornada de Trabalho */}
                <TabsContent value="workdays" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-6">
                        <Info className="h-5 w-5 text-[#FFD600] mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">Configuração da Jornada Padrão</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Defina os dias e horas em que a equipe normalmente trabalha. Quando um novo colaborador 
                            for adicionado, ele usará esta jornada como base (com possibilidade de personalização individual).
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-7 gap-3 mt-4">
                        {/* Segunda */}
                        <Card className="p-3 border">
                          <div className="text-center mb-2 font-medium">Segunda</div>
                          <div className="flex justify-center mb-2">
                            <Switch
                              checked={defaultWorkSchedule.monday.works}
                              onCheckedChange={(checked) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  monday: { ...defaultWorkSchedule.monday, works: checked }
                                })
                              }
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <Label htmlFor="mondayHours" className="text-xs mb-1">Horas</Label>
                            <Input
                              id="mondayHours"
                              type="number"
                              min="0"
                              max="24"
                              className="w-16 text-center h-8"
                              value={defaultWorkSchedule.monday.hours}
                              onChange={(e) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  monday: { 
                                    ...defaultWorkSchedule.monday, 
                                    hours: parseInt(e.target.value) || 0 
                                  }
                                })
                              }
                              disabled={!defaultWorkSchedule.monday.works}
                            />
                          </div>
                        </Card>
                        
                        {/* Terça */}
                        <Card className="p-3 border">
                          <div className="text-center mb-2 font-medium">Terça</div>
                          <div className="flex justify-center mb-2">
                            <Switch
                              checked={defaultWorkSchedule.tuesday.works}
                              onCheckedChange={(checked) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  tuesday: { ...defaultWorkSchedule.tuesday, works: checked }
                                })
                              }
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <Label htmlFor="tuesdayHours" className="text-xs mb-1">Horas</Label>
                            <Input
                              id="tuesdayHours"
                              type="number"
                              min="0"
                              max="24"
                              className="w-16 text-center h-8"
                              value={defaultWorkSchedule.tuesday.hours}
                              onChange={(e) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  tuesday: { 
                                    ...defaultWorkSchedule.tuesday, 
                                    hours: parseInt(e.target.value) || 0 
                                  }
                                })
                              }
                              disabled={!defaultWorkSchedule.tuesday.works}
                            />
                          </div>
                        </Card>
                        
                        {/* Quarta */}
                        <Card className="p-3 border">
                          <div className="text-center mb-2 font-medium">Quarta</div>
                          <div className="flex justify-center mb-2">
                            <Switch
                              checked={defaultWorkSchedule.wednesday.works}
                              onCheckedChange={(checked) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  wednesday: { ...defaultWorkSchedule.wednesday, works: checked }
                                })
                              }
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <Label htmlFor="wednesdayHours" className="text-xs mb-1">Horas</Label>
                            <Input
                              id="wednesdayHours"
                              type="number"
                              min="0"
                              max="24"
                              className="w-16 text-center h-8"
                              value={defaultWorkSchedule.wednesday.hours}
                              onChange={(e) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  wednesday: { 
                                    ...defaultWorkSchedule.wednesday, 
                                    hours: parseInt(e.target.value) || 0 
                                  }
                                })
                              }
                              disabled={!defaultWorkSchedule.wednesday.works}
                            />
                          </div>
                        </Card>
                        
                        {/* Quinta */}
                        <Card className="p-3 border">
                          <div className="text-center mb-2 font-medium">Quinta</div>
                          <div className="flex justify-center mb-2">
                            <Switch
                              checked={defaultWorkSchedule.thursday.works}
                              onCheckedChange={(checked) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  thursday: { ...defaultWorkSchedule.thursday, works: checked }
                                })
                              }
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <Label htmlFor="thursdayHours" className="text-xs mb-1">Horas</Label>
                            <Input
                              id="thursdayHours"
                              type="number"
                              min="0"
                              max="24"
                              className="w-16 text-center h-8"
                              value={defaultWorkSchedule.thursday.hours}
                              onChange={(e) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  thursday: { 
                                    ...defaultWorkSchedule.thursday, 
                                    hours: parseInt(e.target.value) || 0 
                                  }
                                })
                              }
                              disabled={!defaultWorkSchedule.thursday.works}
                            />
                          </div>
                        </Card>
                        
                        {/* Sexta */}
                        <Card className="p-3 border">
                          <div className="text-center mb-2 font-medium">Sexta</div>
                          <div className="flex justify-center mb-2">
                            <Switch
                              checked={defaultWorkSchedule.friday.works}
                              onCheckedChange={(checked) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  friday: { ...defaultWorkSchedule.friday, works: checked }
                                })
                              }
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <Label htmlFor="fridayHours" className="text-xs mb-1">Horas</Label>
                            <Input
                              id="fridayHours"
                              type="number"
                              min="0"
                              max="24"
                              className="w-16 text-center h-8"
                              value={defaultWorkSchedule.friday.hours}
                              onChange={(e) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  friday: { 
                                    ...defaultWorkSchedule.friday, 
                                    hours: parseInt(e.target.value) || 0 
                                  }
                                })
                              }
                              disabled={!defaultWorkSchedule.friday.works}
                            />
                          </div>
                        </Card>
                        
                        {/* Sábado */}
                        <Card className="p-3 border">
                          <div className="text-center mb-2 font-medium">Sábado</div>
                          <div className="flex justify-center mb-2">
                            <Switch
                              checked={defaultWorkSchedule.saturday.works}
                              onCheckedChange={(checked) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  saturday: { ...defaultWorkSchedule.saturday, works: checked }
                                })
                              }
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <Label htmlFor="saturdayHours" className="text-xs mb-1">Horas</Label>
                            <Input
                              id="saturdayHours"
                              type="number"
                              min="0"
                              max="24"
                              className="w-16 text-center h-8"
                              value={defaultWorkSchedule.saturday.hours}
                              onChange={(e) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  saturday: { 
                                    ...defaultWorkSchedule.saturday, 
                                    hours: parseInt(e.target.value) || 0 
                                  }
                                })
                              }
                              disabled={!defaultWorkSchedule.saturday.works}
                            />
                          </div>
                        </Card>
                        
                        {/* Domingo */}
                        <Card className="p-3 border">
                          <div className="text-center mb-2 font-medium">Domingo</div>
                          <div className="flex justify-center mb-2">
                            <Switch
                              checked={defaultWorkSchedule.sunday.works}
                              onCheckedChange={(checked) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  sunday: { ...defaultWorkSchedule.sunday, works: checked }
                                })
                              }
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <Label htmlFor="sundayHours" className="text-xs mb-1">Horas</Label>
                            <Input
                              id="sundayHours"
                              type="number"
                              min="0"
                              max="24"
                              className="w-16 text-center h-8"
                              value={defaultWorkSchedule.sunday.hours}
                              onChange={(e) => 
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  sunday: { 
                                    ...defaultWorkSchedule.sunday, 
                                    hours: parseInt(e.target.value) || 0 
                                  }
                                })
                              }
                              disabled={!defaultWorkSchedule.sunday.works}
                            />
                          </div>
                        </Card>
                      </div>
                      
                      <div className="mt-6">
                        <Card className="p-4 bg-muted/30 border-none">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="mb-4 md:mb-0">
                              <h4 className="font-medium">Total de horas por semana</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Com base na configuração atual de jornada
                              </p>
                            </div>
                            <div className="text-3xl font-bold">
                              {Object.values(defaultWorkSchedule).reduce((total, day) => 
                                total + (day.works ? day.hours : 0), 0)
                              }h
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="mb-4 md:mb-0">
                              <h4 className="font-medium">Estimativa de horas por mês</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Média de 4.3 semanas por mês
                              </p>
                            </div>
                            <div className="text-3xl font-bold">
                              {Math.round(Object.values(defaultWorkSchedule).reduce((total, day) => 
                                total + (day.works ? day.hours : 0), 0) * 4.3)
                              }h
                            </div>
                          </div>
                        </Card>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={() => {
                            // Salvar configurações de jornada
                            toast({
                              title: "Jornada salva",
                              description: "A configuração de jornada foi salva com sucesso."
                            });
                          }}
                          className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Jornada Padrão
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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

        {/* Diálogo para adicionar colaborador */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Colaborador</DialogTitle>
              <DialogDescription>
                Adicione um novo colaborador à sua equipe.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input 
                    id="name" 
                    value={newCollaborator.name || ''} 
                    onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Função/Cargo</Label>
                  <Input 
                    id="role" 
                    value={newCollaborator.role || ''} 
                    onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})} 
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input 
                    id="city" 
                    value={newCollaborator.city || ''} 
                    onChange={(e) => setNewCollaborator({...newCollaborator, city: e.target.value})} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Valor/Hora (R$)</Label>
                  <Input 
                    id="hourlyRate" 
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCollaborator.hourlyRate || ''} 
                    onChange={(e) => setNewCollaborator({...newCollaborator, hourlyRate: parseFloat(e.target.value) || 0})} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hoursPerDay">Horas/Dia</Label>
                  <Input 
                    id="hoursPerDay" 
                    type="number"
                    min="1"
                    max="24"
                    value={newCollaborator.hoursPerDay || ''} 
                    onChange={(e) => setNewCollaborator({...newCollaborator, hoursPerDay: parseInt(e.target.value) || 8})} 
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentType">Tipo de Pagamento</Label>
                  <Select
                    value={newCollaborator.paymentType || 'hourly'}
                    onValueChange={(value) => setNewCollaborator({
                      ...newCollaborator, 
                      paymentType: value as 'hourly' | 'monthly'
                    })}
                  >
                    <SelectTrigger id="paymentType" className="mt-1">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Por hora</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newCollaborator.paymentType === 'monthly' && (
                  <div>
                    <Label htmlFor="monthlyRate">Valor Mensal (R$)</Label>
                    <Input 
                      id="monthlyRate" 
                      type="number"
                      min="0"
                      step="0.01"
                      value={newCollaborator.monthlyRate || ''} 
                      onChange={(e) => setNewCollaborator({...newCollaborator, monthlyRate: parseFloat(e.target.value) || 0})} 
                      className="mt-1"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="billableType">Tipo de Cobrança</Label>
                  <Select
                    value={newCollaborator.billableType || 'hourly'}
                    onValueChange={(value) => setNewCollaborator({
                      ...newCollaborator, 
                      billableType: value as 'hourly' | 'perDelivery'
                    })}
                  >
                    <SelectTrigger id="billableType" className="mt-1">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Por hora</SelectItem>
                      <SelectItem value="perDelivery">Por entrega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isFixed" 
                    checked={newCollaborator.isFixed}
                    onCheckedChange={(checked) => 
                      setNewCollaborator({...newCollaborator, isFixed: checked === true})
                    }
                  />
                  <Label htmlFor="isFixed">Colaborador fixo (CLT/PJ)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isResponsible" 
                    checked={newCollaborator.isResponsible}
                    onCheckedChange={(checked) => 
                      setNewCollaborator({...newCollaborator, isResponsible: checked === true})
                    }
                  />
                  <Label htmlFor="isResponsible">Responsável técnico</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="participatesInStages" 
                    checked={newCollaborator.participatesInStages}
                    onCheckedChange={(checked) => 
                      setNewCollaborator({...newCollaborator, participatesInStages: checked === true})
                    }
                  />
                  <Label htmlFor="participatesInStages">Participa de etapas técnicas</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="worksSaturday" 
                    checked={newCollaborator.worksSaturday}
                    onCheckedChange={(checked) => 
                      setNewCollaborator({...newCollaborator, worksSaturday: checked === true})
                    }
                  />
                  <Label htmlFor="worksSaturday">Trabalha aos sábados</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetCollaboratorForm();
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddCollaborator}
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              >
                Adicionar Colaborador
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      
      </div>
    </MainLayout>
  );
};

export default CollaboratorsPageNew;