import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { 
  Plus, Trash2, Info, Calendar, Clock, 
  BarChart, Search, DollarSign, ExternalLink, Edit, Lightbulb,
  Eye, FileSpreadsheet, List, LayoutGrid, Save, Loader2, UserPlus,
  MapPin, Upload, X, File, ArrowUpDown, Trash, MoreHorizontal, User,
  Filter, Grid, Download, Settings, FilePlus, Check, AlertCircle
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

// Ícones usados no componente
const Icons = {
  user: User,
  upload: Upload,
  plus: Plus,
  trash: Trash,
  trash2: Trash2,
  x: X,
  file: File,
  calendar: Calendar,
  filter: Filter,
  list: List,
  grid: Grid,
  eye: Eye,
  edit: Edit,
  more: MoreHorizontal,
  search: Search,
  sort: ArrowUpDown,
  download: Download,
  userPlus: UserPlus,
  settings: Settings,
  filePlus: FilePlus,
  check: Check,
  alert: AlertCircle,
  mapPin: MapPin
};

// Interface para os tipos de colaboradores
interface Collaborator {
  id: number;
  userId: number;
  
  // Informações Básicas
  name: string;
  displayName?: string;
  role: string;
  collaboratorType?: 'fixed' | 'freelancer' | 'intern' | 'outsourced';
  birthDate?: Date;
  preferredPeriod?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  profileImageUrl?: string;
  
  // Contato
  email?: string;
  phone?: string;
  whatsapp?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  socialMedia?: string[]; // Outras redes sociais
  
  // Endereço e Localização
  address?: string;
  neighborhood?: string;
  city: string;
  state?: string;
  zipCode?: string;
  complement?: string;
  country?: string;
  
  // Documentação e Dados Legais
  documentType?: 'cpf' | 'cnpj';
  documentNumber?: string;
  identityNumber?: string;
  identityIssuer?: string;
  contractType?: 'clt' | 'pj' | 'rpa' | 'other';
  
  // Dados Financeiros
  hourlyRate: number;
  hoursPerDay: number;
  billableType?: 'hourly' | 'perDelivery';
  paymentType?: 'hourly' | 'monthly';
  monthlyRate?: number;
  bankName?: string;
  bankBranch?: string;
  bankAccount?: string;
  bankAccountType?: string;
  
  // Organização Interna
  status?: 'active' | 'inactive' | 'vacation' | 'terminated';
  startDate?: Date;
  endDate?: Date;
  observations?: string;
  
  // Especialidades e Perfil Técnico
  software?: string[];
  preferredArea?: string[];
  skills?: string[];
  portfolioUrl?: string;
  
  // Permissões e Responsabilidades
  isResponsible: boolean;
  participatesInStages: boolean;
  systemPermissions?: string[];
  
  // Dados de uso interno do sistema
  isFixed: boolean;
  assignedHours: number;
  worksSaturday?: boolean;
  documents?: string[];
  
  // Controle de datas
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
    // Informações Básicas
    name: '',
    displayName: '',
    role: '',
    collaboratorType: 'fixed',
    city: '',
    birthDate: undefined,
    preferredPeriod: 'morning',
    profileImageUrl: '',
    
    // Contato
    email: '',
    phone: '',
    whatsapp: '',
    linkedin: '',
    instagram: '',
    website: '',
    socialMedia: [],
    
    // Endereço e Localização
    address: '',
    neighborhood: '',
    state: '',
    zipCode: '',
    complement: '',
    country: 'Brasil',
    
    // Documentação e Dados Legais
    documentType: 'cpf',
    documentNumber: '',
    identityNumber: '',
    identityIssuer: '',
    contractType: 'clt',
    
    // Dados Financeiros
    hourlyRate: 0,
    hoursPerDay: 8,
    billableType: 'hourly',
    paymentType: 'hourly',
    monthlyRate: 0,
    bankName: '',
    bankBranch: '',
    bankAccount: '',
    bankAccountType: '',
    
    // Organização Interna
    status: 'active',
    startDate: undefined,
    endDate: undefined,
    observations: '',
    
    // Especialidades e Perfil Técnico
    software: [],
    preferredArea: [],
    skills: [],
    portfolioUrl: '',
    
    // Permissões e Responsabilidades
    isResponsible: false,
    participatesInStages: true,
    systemPermissions: [],
    
    // Dados de uso interno do sistema
    isFixed: true,
    assignedHours: 0,
    worksSaturday: false,
    documents: []
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
      // Informações Básicas
      name: '',
      displayName: '',
      role: '',
      collaboratorType: 'fixed',
      city: '',
      birthDate: undefined,
      preferredPeriod: 'morning',
      profileImageUrl: '',
      
      // Contato
      email: '',
      phone: '',
      whatsapp: '',
      linkedin: '',
      instagram: '',
      website: '',
      socialMedia: [],
      
      // Endereço e Localização
      address: '',
      neighborhood: '',
      state: '',
      zipCode: '',
      complement: '',
      country: 'Brasil',
      
      // Documentação e Dados Legais
      documentType: 'cpf',
      documentNumber: '',
      identityNumber: '',
      identityIssuer: '',
      contractType: 'clt',
      
      // Dados Financeiros
      hourlyRate: 0,
      hoursPerDay: 8,
      billableType: 'hourly',
      paymentType: 'hourly',
      monthlyRate: 0,
      bankName: '',
      bankBranch: '',
      bankAccount: '',
      bankAccountType: '',
      
      // Organização Interna
      status: 'active',
      startDate: undefined,
      endDate: undefined,
      observations: '',
      
      // Especialidades e Perfil Técnico
      software: [],
      preferredArea: [],
      skills: [],
      portfolioUrl: '',
      
      // Permissões e Responsabilidades
      isResponsible: false,
      participatesInStages: true,
      systemPermissions: [],
      
      // Dados de uso interno do sistema
      isFixed: true,
      assignedHours: 0,
      worksSaturday: false,
      documents: []
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
  
  // Função para salvar edições do colaborador
  const handleSaveCollaboratorEdits = async () => {
    if (!selectedCollaborator || !newCollaborator) return;
    
    try {
      // Criar uma cópia do objeto sem os campos de data que causam problemas
      const collaboratorToUpdate = {
        ...newCollaborator,
        // Remover os campos que causam problemas
        createdAt: undefined,
        updatedAt: undefined
      };
      
      // Fazer a chamada PUT para a API para atualizar o colaborador
      await apiRequest(`/api/users/1/collaborators/${selectedCollaborator}`, {
        method: 'PUT',
        body: JSON.stringify(collaboratorToUpdate)
      });
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Colaborador atualizado",
        description: "As informações foram salvas com sucesso"
      });
      
      // Fechar o modal e atualizar a lista
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
    } catch (error) {
      console.error("Erro ao atualizar colaborador:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao atualizar as informações do colaborador",
        variant: "destructive"
      });
    }
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
        
        {/* Diálogo de visualização do colaborador */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Colaborador</DialogTitle>
              <DialogDescription>
                Visualize as informações completas deste colaborador
              </DialogDescription>
            </DialogHeader>
            
            {selectedCollaborator && newCollaborator && (
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[#FFD600]">
                    {newCollaborator.profileImageUrl ? (
                      <img 
                        src={newCollaborator.profileImageUrl} 
                        alt={newCollaborator.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#FFD600]/20">
                        <span className="font-semibold text-2xl text-black dark:text-white">
                          {newCollaborator.name?.substring(0, 1).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{newCollaborator.name}</h3>
                    <div className="flex items-center mt-1">
                      <Badge variant={newCollaborator.isFixed ? "default" : "outline"} className={`${newCollaborator.isFixed ? "bg-[#FFD600] hover:bg-[#FFD600]/80 text-black" : ""} mr-2`}>
                        {newCollaborator.isFixed ? "Fixo" : "Freelancer"}
                      </Badge>
                      <span className="text-muted-foreground">{newCollaborator.role}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium">Informações Básicas</h4>
                    <div className="space-y-3 mt-3">
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="text-muted-foreground text-sm">Nome:</span>
                        <span>{newCollaborator.name}</span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="text-muted-foreground text-sm">Função:</span>
                        <span>{newCollaborator.role}</span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="text-muted-foreground text-sm">Cidade:</span>
                        <span>{newCollaborator.city}</span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="text-muted-foreground text-sm">Tipo:</span>
                        <span>{newCollaborator.isFixed ? 'Colaborador Fixo' : 'Freelancer'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Informações Financeiras</h4>
                    <div className="space-y-3 mt-3">
                      <div className="grid grid-cols-[140px_1fr] gap-2">
                        <span className="text-muted-foreground text-sm">Valor por hora:</span>
                        <span className="font-medium">{formatCurrency(Number(newCollaborator.hourlyRate))}</span>
                      </div>
                      
                      {newCollaborator.isFixed && (
                        <>
                          <div className="grid grid-cols-[140px_1fr] gap-2">
                            <span className="text-muted-foreground text-sm">Horas por dia:</span>
                            <span>{newCollaborator.hoursPerDay}h</span>
                          </div>
                          <div className="grid grid-cols-[140px_1fr] gap-2">
                            <span className="text-muted-foreground text-sm">Horas mensais:</span>
                            <span>{calculateCollaboratorMonthlyData(newCollaborator as Collaborator).totalHours}h</span>
                          </div>
                          <div className="grid grid-cols-[140px_1fr] gap-2">
                            <span className="text-muted-foreground text-sm">Custo mensal:</span>
                            <span className="font-medium">{formatCurrency(calculateCollaboratorMonthlyData(newCollaborator as Collaborator).monthlyCost)}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="grid grid-cols-[140px_1fr] gap-2">
                        <span className="text-muted-foreground text-sm">Tipo de cobrança:</span>
                        <span>{newCollaborator.billableType === 'hourly' ? 'Por hora' : 'Por entrega'}</span>
                      </div>
                      
                      <div className="grid grid-cols-[140px_1fr] gap-2">
                        <span className="text-muted-foreground text-sm">Tipo de pagamento:</span>
                        <span>{newCollaborator.paymentType === 'hourly' ? 'Por hora' : 'Mensal'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">Funções e Participação</h4>
                  <div className="space-y-3 mt-3">
                    <div className="flex gap-6">
                      <div className="flex gap-2 items-center">
                        <div className={`w-4 h-4 rounded-full ${newCollaborator.isResponsible ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Responsável por projetos</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className={`w-4 h-4 rounded-full ${newCollaborator.participatesInStages ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Participa de etapas</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className={`w-4 h-4 rounded-full ${newCollaborator.worksSaturday ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Trabalha aos sábados</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {newCollaborator.observations && (
                  <div>
                    <h4 className="text-sm font-medium">Observações</h4>
                    <p className="mt-2 text-muted-foreground">{newCollaborator.observations}</p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Fechar
              </Button>
              <Button 
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  if (selectedCollaborator) {
                    const collaborator = collaborators.find(c => c.id === selectedCollaborator);
                    if (collaborator) {
                      handleEditCollaborator(collaborator);
                    }
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" /> Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de edição do colaborador */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Colaborador</DialogTitle>
              <DialogDescription>
                Atualize as informações do colaborador
              </DialogDescription>
            </DialogHeader>
            
            {selectedCollaborator && newCollaborator && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome</Label>
                    <Input 
                      id="edit-name" 
                      value={newCollaborator.name || ''} 
                      onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Função</Label>
                    <Input 
                      id="edit-role" 
                      value={newCollaborator.role || ''} 
                      onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">Cidade</Label>
                    <Input 
                      id="edit-city" 
                      value={newCollaborator.city || ''} 
                      onChange={(e) => setNewCollaborator({...newCollaborator, city: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Tipo</Label>
                    <Select 
                      value={newCollaborator.isFixed ? "fixed" : "freelancer"}
                      onValueChange={(value) => setNewCollaborator({...newCollaborator, isFixed: value === "fixed"})}
                    >
                      <SelectTrigger id="edit-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Colaborador Fixo</SelectItem>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-hourly-rate">Valor por Hora</Label>
                    <Input 
                      id="edit-hourly-rate" 
                      type="number"
                      min="0"
                      step="0.01"
                      value={newCollaborator.hourlyRate || 0} 
                      onChange={(e) => setNewCollaborator({...newCollaborator, hourlyRate: Number(e.target.value)})}
                    />
                  </div>
                  
                  {newCollaborator.isFixed && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-hours-per-day">Horas por Dia</Label>
                      <Input 
                        id="edit-hours-per-day" 
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={newCollaborator.hoursPerDay || 8} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, hoursPerDay: Number(e.target.value)})}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-billable-type">Tipo de Cobrança</Label>
                    <Select 
                      value={newCollaborator.billableType || "hourly"}
                      onValueChange={(value) => setNewCollaborator({
                        ...newCollaborator, 
                        billableType: value as 'hourly' | 'perDelivery'
                      })}
                    >
                      <SelectTrigger id="edit-billable-type">
                        <SelectValue placeholder="Selecione o tipo de cobrança" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Por Hora</SelectItem>
                        <SelectItem value="perDelivery">Por Entrega</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-payment-type">Tipo de Pagamento</Label>
                    <Select 
                      value={newCollaborator.paymentType || "hourly"}
                      onValueChange={(value) => setNewCollaborator({
                        ...newCollaborator, 
                        paymentType: value as 'hourly' | 'monthly'
                      })}
                    >
                      <SelectTrigger id="edit-payment-type">
                        <SelectValue placeholder="Selecione o tipo de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Por Hora</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Funções e Participação</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="edit-is-responsible" 
                        checked={newCollaborator.isResponsible}
                        onCheckedChange={(checked) => 
                          setNewCollaborator({...newCollaborator, isResponsible: checked as boolean})
                        }
                      />
                      <Label htmlFor="edit-is-responsible">Pode ser responsável por projetos</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="edit-participates-in-stages" 
                        checked={newCollaborator.participatesInStages}
                        onCheckedChange={(checked) => 
                          setNewCollaborator({...newCollaborator, participatesInStages: checked as boolean})
                        }
                      />
                      <Label htmlFor="edit-participates-in-stages">Participa de etapas do projeto</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="edit-works-saturday" 
                        checked={newCollaborator.worksSaturday}
                        onCheckedChange={(checked) => 
                          setNewCollaborator({...newCollaborator, worksSaturday: checked as boolean})
                        }
                      />
                      <Label htmlFor="edit-works-saturday">Trabalha aos sábados</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-observations">Observações</Label>
                  <Textarea 
                    id="edit-observations" 
                    value={newCollaborator.observations || ''} 
                    onChange={(e) => setNewCollaborator({...newCollaborator, observations: e.target.value})}
                    placeholder="Informações adicionais sobre o colaborador..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button 
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                onClick={handleSaveCollaboratorEdits}
              >
                <Save className="h-4 w-4 mr-2" /> Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de confirmação para excluir colaborador */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedCollaborator && (
                  <>
                    Tem certeza que deseja excluir este colaborador? 
                    Esta ação não pode ser desfeita.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-red-500 hover:bg-red-600">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Colaborador</DialogTitle>
              <DialogDescription>
                Adicione um novo colaborador à sua equipe com todas as informações necessárias.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="contact">Contato</TabsTrigger>
                <TabsTrigger value="address">Endereço</TabsTrigger>
                <TabsTrigger value="documents">Documentação</TabsTrigger>
                <TabsTrigger value="advanced">Configurações</TabsTrigger>
              </TabsList>
              
              {/* Aba: Informações Básicas */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 py-2">
                  <div className="flex justify-center mb-4">
                    <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-[#FFD600]">
                      {newCollaborator.profileImageUrl ? (
                        <img 
                          src={newCollaborator.profileImageUrl} 
                          alt="Foto do colaborador" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icons.user className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center mb-2">
                    <Button variant="outline" size="sm">
                      <Icons.upload className="w-4 h-4 mr-2" />
                      Carregar foto
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome completo <span className="text-red-500">*</span></Label>
                      <Input 
                        id="name" 
                        value={newCollaborator.name || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="displayName">Nome de exibição/Apelido</Label>
                      <Input 
                        id="displayName" 
                        value={newCollaborator.displayName || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, displayName: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Função/Cargo <span className="text-red-500">*</span></Label>
                      <Input 
                        id="role" 
                        value={newCollaborator.role || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="collaboratorType">Tipo de colaborador</Label>
                      <Select
                        value={newCollaborator.collaboratorType || 'fixed'}
                        onValueChange={(value) => setNewCollaborator({
                          ...newCollaborator, 
                          collaboratorType: value as 'fixed' | 'freelancer' | 'intern' | 'outsourced'
                        })}
                      >
                        <SelectTrigger id="collaboratorType" className="mt-1">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixo</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                          <SelectItem value="intern">Estagiário</SelectItem>
                          <SelectItem value="outsourced">Terceirizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birthDate">Data de nascimento</Label>
                      <Input 
                        id="birthDate" 
                        type="date"
                        value={newCollaborator.birthDate ? new Date(newCollaborator.birthDate).toISOString().split('T')[0] : ''} 
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          setNewCollaborator({...newCollaborator, birthDate: date});
                        }} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="preferredPeriod">Período preferencial</Label>
                      <Select
                        value={newCollaborator.preferredPeriod || 'morning'}
                        onValueChange={(value) => setNewCollaborator({
                          ...newCollaborator, 
                          preferredPeriod: value as 'morning' | 'afternoon' | 'evening' | 'flexible'
                        })}
                      >
                        <SelectTrigger id="preferredPeriod" className="mt-1">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Manhã</SelectItem>
                          <SelectItem value="afternoon">Tarde</SelectItem>
                          <SelectItem value="evening">Noite</SelectItem>
                          <SelectItem value="flexible">Flexível</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Aba: Contato */}
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 py-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={newCollaborator.email || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, email: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        value={newCollaborator.phone || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, phone: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input 
                        id="whatsapp" 
                        value={newCollaborator.whatsapp || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, whatsapp: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input 
                        id="linkedin" 
                        value={newCollaborator.linkedin || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, linkedin: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instagram">Instagram profissional</Label>
                      <Input 
                        id="instagram" 
                        value={newCollaborator.instagram || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, instagram: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="website">Site</Label>
                      <Input 
                        id="website" 
                        value={newCollaborator.website || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, website: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {/* Outras redes sociais */}
                  <div className="mt-4">
                    <Label className="mb-2 block">Outras redes sociais</Label>
                    <div className="flex flex-col space-y-2">
                      {(newCollaborator.socialMedia || []).map((social, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input 
                            value={social} 
                            onChange={(e) => {
                              const newSocialMedia = [...(newCollaborator.socialMedia || [])];
                              newSocialMedia[index] = e.target.value;
                              setNewCollaborator({...newCollaborator, socialMedia: newSocialMedia});
                            }} 
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const newSocialMedia = [...(newCollaborator.socialMedia || [])];
                              newSocialMedia.splice(index, 1);
                              setNewCollaborator({...newCollaborator, socialMedia: newSocialMedia});
                            }}
                          >
                            <Icons.trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const newSocialMedia = [...(newCollaborator.socialMedia || []), ''];
                          setNewCollaborator({...newCollaborator, socialMedia: newSocialMedia});
                        }}
                      >
                        <Icons.plus className="h-4 w-4 mr-2" />
                        Adicionar rede social
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Aba: Endereço */}
              <TabsContent value="address" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 py-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input 
                        id="zipCode" 
                        value={newCollaborator.zipCode || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, zipCode: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Endereço completo</Label>
                      <Input 
                        id="address" 
                        value={newCollaborator.address || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, address: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input 
                        id="neighborhood" 
                        value={newCollaborator.neighborhood || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, neighborhood: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input 
                        id="complement" 
                        value={newCollaborator.complement || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, complement: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade <span className="text-red-500">*</span></Label>
                      <Input 
                        id="city" 
                        value={newCollaborator.city || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, city: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input 
                        id="state" 
                        value={newCollaborator.state || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, state: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="country">País</Label>
                      <Input 
                        id="country" 
                        value={newCollaborator.country || 'Brasil'} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, country: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Aba: Documentação */}
              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 py-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="documentType">Tipo de documento</Label>
                      <Select
                        value={newCollaborator.documentType || 'cpf'}
                        onValueChange={(value) => setNewCollaborator({
                          ...newCollaborator, 
                          documentType: value as 'cpf' | 'cnpj'
                        })}
                      >
                        <SelectTrigger id="documentType" className="mt-1">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="documentNumber">{newCollaborator.documentType === 'cpf' ? 'CPF' : 'CNPJ'}</Label>
                      <Input 
                        id="documentNumber" 
                        value={newCollaborator.documentNumber || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, documentNumber: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="identityNumber">RG</Label>
                      <Input 
                        id="identityNumber" 
                        value={newCollaborator.identityNumber || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, identityNumber: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="identityIssuer">Órgão emissor</Label>
                      <Input 
                        id="identityIssuer" 
                        value={newCollaborator.identityIssuer || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, identityIssuer: e.target.value})} 
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="contractType">Tipo de contratação</Label>
                      <Select
                        value={newCollaborator.contractType || 'clt'}
                        onValueChange={(value) => setNewCollaborator({
                          ...newCollaborator, 
                          contractType: value as 'clt' | 'pj' | 'rpa' | 'other'
                        })}
                      >
                        <SelectTrigger id="contractType" className="mt-1">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clt">CLT</SelectItem>
                          <SelectItem value="pj">PJ</SelectItem>
                          <SelectItem value="rpa">RPA</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label className="mb-2 block">Upload de Documentos</Label>
                    <div className="border-2 border-dashed p-6 rounded-md text-center bg-gray-50 dark:bg-gray-800">
                      <Icons.upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Arraste e solte documentos aqui ou clique para fazer upload</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Selecionar arquivos
                      </Button>
                    </div>
                    
                    {/* Lista de documentos (quando houver) */}
                    {(newCollaborator.documents || []).length > 0 && (
                      <div className="mt-4 space-y-2">
                        {(newCollaborator.documents || []).map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            <div className="flex items-center">
                              <Icons.file className="h-4 w-4 mr-2" />
                              <span className="text-sm">{doc}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => {
                              const newDocs = [...(newCollaborator.documents || [])];
                              newDocs.splice(index, 1);
                              setNewCollaborator({...newCollaborator, documents: newDocs});
                            }}>
                              <Icons.trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Aba: Configurações */}
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 py-2">
                  {/* Seção: Dados Financeiros */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">💰 Dados Financeiros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hourlyRate">Valor/Hora (R$) <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="hoursPerDay">Horas/Dia <span className="text-red-500">*</span></Label>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="bankName">Banco</Label>
                        <Input 
                          id="bankName" 
                          value={newCollaborator.bankName || ''} 
                          onChange={(e) => setNewCollaborator({...newCollaborator, bankName: e.target.value})} 
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bankBranch">Agência</Label>
                        <Input 
                          id="bankBranch" 
                          value={newCollaborator.bankBranch || ''} 
                          onChange={(e) => setNewCollaborator({...newCollaborator, bankBranch: e.target.value})} 
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bankAccount">Conta</Label>
                        <Input 
                          id="bankAccount" 
                          value={newCollaborator.bankAccount || ''} 
                          onChange={(e) => setNewCollaborator({...newCollaborator, bankAccount: e.target.value})} 
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bankAccountType">Tipo de conta</Label>
                        <Input 
                          id="bankAccountType" 
                          value={newCollaborator.bankAccountType || ''} 
                          onChange={(e) => setNewCollaborator({...newCollaborator, bankAccountType: e.target.value})} 
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Seção: Organização Interna */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">🗃️ Organização Interna</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={newCollaborator.status || 'active'}
                          onValueChange={(value) => setNewCollaborator({
                            ...newCollaborator, 
                            status: value as 'active' | 'inactive' | 'vacation' | 'terminated'
                          })}
                        >
                          <SelectTrigger id="status" className="mt-1">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                            <SelectItem value="vacation">Em férias</SelectItem>
                            <SelectItem value="terminated">Desligado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="startDate">Data de início</Label>
                        <Input 
                          id="startDate" 
                          type="date"
                          value={newCollaborator.startDate ? new Date(newCollaborator.startDate).toISOString().split('T')[0] : ''} 
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            setNewCollaborator({...newCollaborator, startDate: date});
                          }} 
                          className="mt-1"
                        />
                      </div>
                      
                      {newCollaborator.status === 'terminated' && (
                        <div>
                          <Label htmlFor="endDate">Data de término</Label>
                          <Input 
                            id="endDate" 
                            type="date"
                            value={newCollaborator.endDate ? new Date(newCollaborator.endDate).toISOString().split('T')[0] : ''} 
                            onChange={(e) => {
                              const date = e.target.value ? new Date(e.target.value) : undefined;
                              setNewCollaborator({...newCollaborator, endDate: date});
                            }} 
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <Label htmlFor="observations">Observações</Label>
                      <Textarea 
                        id="observations" 
                        value={newCollaborator.observations || ''} 
                        onChange={(e) => setNewCollaborator({...newCollaborator, observations: e.target.value})} 
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Seção: Especialidades e Perfil Técnico */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">🧠 Especialidades e Perfil Técnico</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="mb-2 block">Softwares que domina</Label>
                        <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          {(newCollaborator.software || []).map((soft, index) => (
                            <div key={index} className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full pl-3 pr-1 py-1">
                              <span className="text-sm mr-1">{soft}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-5 w-5 rounded-full"
                                onClick={() => {
                                  const newSoftware = [...(newCollaborator.software || [])];
                                  newSoftware.splice(index, 1);
                                  setNewCollaborator({...newCollaborator, software: newSoftware});
                                }}
                              >
                                <Icons.x className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Input 
                            placeholder="Digite e pressione Enter"
                            className="w-48"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  const newSoftware = [...(newCollaborator.software || []), input.value.trim()];
                                  setNewCollaborator({...newCollaborator, software: newSoftware});
                                  input.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">Área de atuação preferida</Label>
                        <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          {(newCollaborator.preferredArea || []).map((area, index) => (
                            <div key={index} className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full pl-3 pr-1 py-1">
                              <span className="text-sm mr-1">{area}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-5 w-5 rounded-full"
                                onClick={() => {
                                  const newAreas = [...(newCollaborator.preferredArea || [])];
                                  newAreas.splice(index, 1);
                                  setNewCollaborator({...newCollaborator, preferredArea: newAreas});
                                }}
                              >
                                <Icons.x className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Input 
                            placeholder="Digite e pressione Enter"
                            className="w-48"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  const newAreas = [...(newCollaborator.preferredArea || []), input.value.trim()];
                                  setNewCollaborator({...newCollaborator, preferredArea: newAreas});
                                  input.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">Habilidades específicas</Label>
                        <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                          {(newCollaborator.skills || []).map((skill, index) => (
                            <div key={index} className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full pl-3 pr-1 py-1">
                              <span className="text-sm mr-1">{skill}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-5 w-5 rounded-full"
                                onClick={() => {
                                  const newSkills = [...(newCollaborator.skills || [])];
                                  newSkills.splice(index, 1);
                                  setNewCollaborator({...newCollaborator, skills: newSkills});
                                }}
                              >
                                <Icons.x className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Input 
                            placeholder="Digite e pressione Enter"
                            className="w-48"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  const newSkills = [...(newCollaborator.skills || []), input.value.trim()];
                                  setNewCollaborator({...newCollaborator, skills: newSkills});
                                  input.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="portfolioUrl">Link do portfólio</Label>
                        <Input 
                          id="portfolioUrl" 
                          value={newCollaborator.portfolioUrl || ''} 
                          onChange={(e) => setNewCollaborator({...newCollaborator, portfolioUrl: e.target.value})} 
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Seção: Permissões e Configurações */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">✅ Permissões e Responsabilidades</h3>
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
                      
                      <div className="mt-4">
                        <Label className="mb-2 block">Permissões no sistema</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="permission-budgets" 
                              checked={(newCollaborator.systemPermissions || []).includes('budgets')}
                              onCheckedChange={(checked) => {
                                const permissions = [...(newCollaborator.systemPermissions || [])];
                                if (checked) {
                                  if (!permissions.includes('budgets')) permissions.push('budgets');
                                } else {
                                  const index = permissions.indexOf('budgets');
                                  if (index > -1) permissions.splice(index, 1);
                                }
                                setNewCollaborator({...newCollaborator, systemPermissions: permissions});
                              }}
                            />
                            <Label htmlFor="permission-budgets">Orçamentos</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="permission-clients" 
                              checked={(newCollaborator.systemPermissions || []).includes('clients')}
                              onCheckedChange={(checked) => {
                                const permissions = [...(newCollaborator.systemPermissions || [])];
                                if (checked) {
                                  if (!permissions.includes('clients')) permissions.push('clients');
                                } else {
                                  const index = permissions.indexOf('clients');
                                  if (index > -1) permissions.splice(index, 1);
                                }
                                setNewCollaborator({...newCollaborator, systemPermissions: permissions});
                              }}
                            />
                            <Label htmlFor="permission-clients">Clientes</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="permission-projects" 
                              checked={(newCollaborator.systemPermissions || []).includes('projects')}
                              onCheckedChange={(checked) => {
                                const permissions = [...(newCollaborator.systemPermissions || [])];
                                if (checked) {
                                  if (!permissions.includes('projects')) permissions.push('projects');
                                } else {
                                  const index = permissions.indexOf('projects');
                                  if (index > -1) permissions.splice(index, 1);
                                }
                                setNewCollaborator({...newCollaborator, systemPermissions: permissions});
                              }}
                            />
                            <Label htmlFor="permission-projects">Projetos</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="permission-finance" 
                              checked={(newCollaborator.systemPermissions || []).includes('finance')}
                              onCheckedChange={(checked) => {
                                const permissions = [...(newCollaborator.systemPermissions || [])];
                                if (checked) {
                                  if (!permissions.includes('finance')) permissions.push('finance');
                                } else {
                                  const index = permissions.indexOf('finance');
                                  if (index > -1) permissions.splice(index, 1);
                                }
                                setNewCollaborator({...newCollaborator, systemPermissions: permissions});
                              }}
                            />
                            <Label htmlFor="permission-finance">Financeiro</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
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