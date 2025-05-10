import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Icons
import {
  Search,
  Plus,
  User,
  Users,
  Filter,
  Trash,
  Trash2,
  Grid,
  List,
  Download,
  Upload,
  Settings,
  MoreHorizontal,
  UserPlus,
  FilePlus,
  ArrowUpDown,
  Eye,
  Edit,
  File,
  X,
  Check,
  Calendar,
  MapPin,
  AlertCircle,
  ChevronRight,
  Loader2
} from "lucide-react";

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

const CollaboratorsPageCollapsible: React.FC = () => {
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
  const [showFullForm, setShowFullForm] = useState(false);
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
    if (activeTab === 'freelancers') return searchMatch && !collaborator.isFixed;
    if (activeTab === 'overloaded') {
      const { totalHours } = calculateCollaboratorMonthlyData(collaborator);
      return searchMatch && collaborator.assignedHours > totalHours;
    }
    return searchMatch;
  });

  // Calcular dados mensais do colaborador (horas disponíveis, custo mensal)
  const calculateCollaboratorMonthlyData = (collaborator: Collaborator) => {
    const workDaysPerMonth = 22; // Média de dias úteis em um mês
    const totalHours = collaborator.hoursPerDay * workDaysPerMonth;
    const monthlyCost = collaborator.hourlyRate * totalHours;
    
    return {
      totalHours,
      monthlyCost
    };
  };

  // Manipuladores de eventos
  const handleEditCollaborator = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator.id);
    setNewCollaborator({
      ...collaborator,
      birthDate: collaborator.birthDate ? new Date(collaborator.birthDate) : undefined,
      startDate: collaborator.startDate ? new Date(collaborator.startDate) : undefined,
      endDate: collaborator.endDate ? new Date(collaborator.endDate) : undefined
    });
    setIsEditDialogOpen(true);
  };

  const handleViewCollaborator = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator.id);
    setNewCollaborator({
      ...collaborator,
      birthDate: collaborator.birthDate ? new Date(collaborator.birthDate) : undefined,
      startDate: collaborator.startDate ? new Date(collaborator.startDate) : undefined,
      endDate: collaborator.endDate ? new Date(collaborator.endDate) : undefined
    });
    setIsViewDialogOpen(true);
  };

  const fetchCollaboratorHours = async (collaborator: Collaborator) => {
    setIsLoadingHours(true);
    setSelectedCollaborator(collaborator.id);
    
    try {
      // Simulação de uma chamada de API
      setTimeout(() => {
        const { totalHours } = calculateCollaboratorMonthlyData(collaborator);
        const inProgressHours = Math.min(Math.random() * totalHours, totalHours * 0.6);
        const inQuoteHours = Math.min(Math.random() * (totalHours - inProgressHours), totalHours * 0.3);
        const completedHours = Math.min(Math.random() * 40, totalHours * 0.2);
        const totalAssignedHours = inProgressHours + inQuoteHours;
        const availableHours = totalHours - totalAssignedHours;
        const occupancyPercentage = (totalAssignedHours / totalHours) * 100;
        
        // Gerar projetos simulados para demonstração
        const inProgressProjects = [
          {
            projectId: 1,
            projectName: "Residência Alves",
            hours: inProgressHours * 0.6,
            description: "Projeto executivo"
          },
          {
            projectId: 2,
            projectName: "Comercial Vila Nova",
            hours: inProgressHours * 0.4,
            description: "Detalhamento"
          }
        ];
        
        const inQuoteProjects = [
          {
            projectId: 3,
            projectName: "Apartamento Jardins",
            hours: inQuoteHours * 0.7,
            description: "Orçamento inicial"
          },
          {
            projectId: 4,
            projectName: "Escritório Central",
            hours: inQuoteHours * 0.3,
            description: "Revisão de proposta"
          }
        ];
        
        const completedProjects = [
          {
            projectId: 5,
            projectName: "Casa de Praia",
            hours: completedHours * 0.8,
            description: "Projeto completo"
          },
          {
            projectId: 6,
            projectName: "Loja Shopping",
            hours: completedHours * 0.2,
            description: "Consultoria"
          }
        ];
        
        const collaboratorHours: CollaboratorHours = {
          collaboratorId: collaborator.id,
          name: collaborator.name,
          role: collaborator.role,
          city: collaborator.city || null,
          hourlyRate: collaborator.hourlyRate,
          profileImageUrl: collaborator.profileImageUrl || null,
          availableHoursPerMonth: totalHours,
          inProgressHours,
          inQuoteHours,
          completedHours,
          totalAssignedHours,
          availableHours,
          occupancyPercentage,
          projects: {
            inProgress: inProgressProjects,
            inQuote: inQuoteProjects,
            completed: completedProjects
          }
        };
        
        setSelectedCollaboratorHours(collaboratorHours);
        setIsLoadingHours(false);
        setIsHoursDialogOpen(true);
      }, 500);
    } catch (error) {
      console.error("Erro ao buscar horas do colaborador:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de horas do colaborador.",
        variant: "destructive"
      });
      setIsLoadingHours(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 container py-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Colaboradores</h1>
            <p className="text-muted-foreground">
              Gerencie a equipe e os colaboradores do escritório.
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="bg-card p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.totalCollaborators}</p>
            </div>
            
            <div className="bg-card p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Equipe Fixa</p>
              <p className="text-2xl font-bold">{stats.fixedCount}</p>
              <p className="text-xs text-muted-foreground">Custo mensal: R$ {stats.totalFixedCost.toLocaleString('pt-BR', {maximumFractionDigits: 2})}</p>
            </div>
            
            <div className="bg-card p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Ocupação</p>
              <p className="text-2xl font-bold">{stats.totalAvailableHours > 0 ? Math.round((stats.assignedHours / stats.totalAvailableHours) * 100) : 0}%</p>
              <p className="text-xs text-muted-foreground">{stats.assignedHours.toFixed(1)}h / {stats.totalAvailableHours.toFixed(1)}h</p>
            </div>
            
            <div className="bg-card p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Sobrecarregados</p>
              <p className="text-2xl font-bold">{stats.overloadedCollaborators}</p>
              <p className="text-xs text-muted-foreground">Colaboradores com horas acima do limite</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="fixed">Equipe Fixa</TabsTrigger>
              <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
              <TabsTrigger value="overloaded">Sobrecarregados</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar colaborador..."
                className="pl-8 min-w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 rounded-none ${viewMode === 'table' ? 'bg-muted' : ''}`}
                onClick={() => setViewMode('table')}
                title="Visualização em tabela"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 rounded-none ${viewMode === 'cards' ? 'bg-muted' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Visualização em cards"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Carregando colaboradores...</p>
            </div>
          </div>
        ) : filteredCollaborators.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-muted/30 rounded-lg p-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">Nenhum colaborador encontrado</h3>
            <p className="text-muted-foreground text-center max-w-md mt-2">
              Não há colaboradores {activeTab !== 'all' ? `na categoria ${activeTab}` : ''} ou nenhum resultado corresponde à sua busca.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setActiveTab('all');
              }}
            >
              Limpar filtros
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Função</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Localização</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor/Hora</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Horas</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollaborators.map((collaborator) => {
                    const { totalHours } = calculateCollaboratorMonthlyData(collaborator);
                    const occupancyPercentage = totalHours > 0 ? (collaborator.assignedHours / totalHours) * 100 : 0;
                    
                    return (
                      <tr key={collaborator.id} className="border-t">
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8 border border-[#FFD600]">
                              {collaborator.profileImageUrl ? (
                                <AvatarImage src={collaborator.profileImageUrl} alt={collaborator.name} />
                              ) : (
                                <AvatarFallback>{collaborator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <div className="font-medium">{collaborator.name}</div>
                              {collaborator.displayName && (
                                <div className="text-xs text-muted-foreground">{collaborator.displayName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{collaborator.role}</td>
                        <td className="p-3">{collaborator.city}</td>
                        <td className="p-3">R$ {collaborator.hourlyRate.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="text-sm flex justify-between">
                              <span>{collaborator.assignedHours.toFixed(1)}h / {totalHours.toFixed(1)}h</span>
                              <span className={`text-xs ${
                                occupancyPercentage > 100 ? 'text-red-500' : 
                                occupancyPercentage > 85 ? 'text-yellow-500' : 
                                'text-green-500'
                              }`}>
                                {Math.round(occupancyPercentage)}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  occupancyPercentage > 100 ? 'bg-red-500' : 
                                  occupancyPercentage > 85 ? 'bg-yellow-500' : 
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={
                            collaborator.status === 'active' ? 'default' :
                            collaborator.status === 'vacation' ? 'secondary' :
                            collaborator.status === 'inactive' ? 'outline' :
                            'destructive'
                          }>
                            {collaborator.status === 'active' ? 'Ativo' :
                             collaborator.status === 'vacation' ? 'Férias' :
                             collaborator.status === 'inactive' ? 'Inativo' :
                             collaborator.status === 'terminated' ? 'Desligado' : 'Não especificado'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => fetchCollaboratorHours(collaborator)}
                              title="Visualizar horas"
                              className="h-8 w-8 rounded-full"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewCollaborator(collaborator)}
                              title="Visualizar detalhes"
                              className="h-8 w-8 rounded-full"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCollaborator(collaborator)}
                              title="Editar"
                              className="h-8 w-8 rounded-full"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedCollaborator(collaborator.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Excluir"
                              className="h-8 w-8 rounded-full text-red-500 hover:text-red-600"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCollaborators.map((collaborator) => {
              const { totalHours } = calculateCollaboratorMonthlyData(collaborator);
              const occupancyPercentage = totalHours > 0 ? (collaborator.assignedHours / totalHours) * 100 : 0;
              
              return (
                <Card key={collaborator.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border-2 border-[#FFD600]">
                          {collaborator.profileImageUrl ? (
                            <AvatarImage src={collaborator.profileImageUrl} alt={collaborator.name} />
                          ) : (
                            <AvatarFallback>{collaborator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{collaborator.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{collaborator.role}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Localização</p>
                        <p className="font-medium">{collaborator.city || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valor/Hora</p>
                        <p className="font-medium">R$ {collaborator.hourlyRate.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo</p>
                        <p className="font-medium">
                          {collaborator.isFixed ? 'Fixo' : 'Freelancer'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge variant={
                          collaborator.status === 'active' ? 'default' :
                          collaborator.status === 'vacation' ? 'secondary' :
                          collaborator.status === 'inactive' ? 'outline' :
                          'destructive'
                        } className="mt-1">
                          {collaborator.status === 'active' ? 'Ativo' :
                           collaborator.status === 'vacation' ? 'Férias' :
                           collaborator.status === 'inactive' ? 'Inativo' :
                           collaborator.status === 'terminated' ? 'Desligado' : 'Não especificado'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm flex justify-between">
                        <span className="text-xs text-muted-foreground">Ocupação</span>
                        <span className={`text-xs ${
                          occupancyPercentage > 100 ? 'text-red-500' : 
                          occupancyPercentage > 85 ? 'text-yellow-500' : 
                          'text-green-500'
                        }`}>
                          {collaborator.assignedHours.toFixed(1)}h / {totalHours.toFixed(1)}h ({Math.round(occupancyPercentage)}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            occupancyPercentage > 100 ? 'bg-red-500' : 
                            occupancyPercentage > 85 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 bg-muted/20 flex justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fetchCollaboratorHours(collaborator)}
                      title="Visualizar horas"
                      className="h-8 w-8 rounded-full"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewCollaborator(collaborator)}
                      title="Visualizar detalhes"
                      className="h-8 w-8 rounded-full"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCollaborator(collaborator)}
                      title="Editar"
                      className="h-8 w-8 rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCollaborator(collaborator.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      title="Excluir"
                      className="h-8 w-8 rounded-full text-red-500 hover:text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Dialog de edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Colaborador</DialogTitle>
              <DialogDescription>
                Atualize as informações do colaborador com todos os dados necessários.
              </DialogDescription>
            </DialogHeader>
            
            {selectedCollaborator && newCollaborator && (
              <div className="mt-4">
                <Collapsible defaultOpen={true}>
                  {/* Seção 1: Informações Básicas */}
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="mb-4 w-full flex justify-between items-center p-3 rounded-lg border-dashed">
                      <span className="flex items-center">
                        <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>🧾 Informações Básicas</span>
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-6">
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
                            <User className="w-16 h-16 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center mb-2">
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
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
                      </div>
                      
                      <div className="bg-muted/20 p-4 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Jornada de trabalho</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="monday" 
                              checked={defaultWorkSchedule.monday.works}
                              onCheckedChange={(checked) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  monday: {
                                    ...defaultWorkSchedule.monday,
                                    works: checked === true
                                  }
                                });
                              }}
                            />
                            <Label htmlFor="monday">Segunda-feira</Label>
                          </div>
                          <div className="flex items-center">
                            <Input 
                              type="number" 
                              disabled={!defaultWorkSchedule.monday.works}
                              min="0" 
                              max="24" 
                              step="0.5"
                              value={defaultWorkSchedule.monday.hours} 
                              onChange={(e) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  monday: {
                                    ...defaultWorkSchedule.monday,
                                    hours: Number(e.target.value)
                                  }
                                });
                              }}
                              className="w-16 h-8"
                            />
                            <span className="ml-2 text-sm">horas</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="tuesday" 
                              checked={defaultWorkSchedule.tuesday.works}
                              onCheckedChange={(checked) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  tuesday: {
                                    ...defaultWorkSchedule.tuesday,
                                    works: checked === true
                                  }
                                });
                              }}
                            />
                            <Label htmlFor="tuesday">Terça-feira</Label>
                          </div>
                          <div className="flex items-center">
                            <Input 
                              type="number" 
                              disabled={!defaultWorkSchedule.tuesday.works}
                              min="0" 
                              max="24" 
                              step="0.5"
                              value={defaultWorkSchedule.tuesday.hours} 
                              onChange={(e) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  tuesday: {
                                    ...defaultWorkSchedule.tuesday,
                                    hours: Number(e.target.value)
                                  }
                                });
                              }}
                              className="w-16 h-8"
                            />
                            <span className="ml-2 text-sm">horas</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="wednesday" 
                              checked={defaultWorkSchedule.wednesday.works}
                              onCheckedChange={(checked) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  wednesday: {
                                    ...defaultWorkSchedule.wednesday,
                                    works: checked === true
                                  }
                                });
                              }}
                            />
                            <Label htmlFor="wednesday">Quarta-feira</Label>
                          </div>
                          <div className="flex items-center">
                            <Input 
                              type="number" 
                              disabled={!defaultWorkSchedule.wednesday.works}
                              min="0" 
                              max="24" 
                              step="0.5"
                              value={defaultWorkSchedule.wednesday.hours} 
                              onChange={(e) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  wednesday: {
                                    ...defaultWorkSchedule.wednesday,
                                    hours: Number(e.target.value)
                                  }
                                });
                              }}
                              className="w-16 h-8"
                            />
                            <span className="ml-2 text-sm">horas</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="thursday" 
                              checked={defaultWorkSchedule.thursday.works}
                              onCheckedChange={(checked) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  thursday: {
                                    ...defaultWorkSchedule.thursday,
                                    works: checked === true
                                  }
                                });
                              }}
                            />
                            <Label htmlFor="thursday">Quinta-feira</Label>
                          </div>
                          <div className="flex items-center">
                            <Input 
                              type="number" 
                              disabled={!defaultWorkSchedule.thursday.works}
                              min="0" 
                              max="24" 
                              step="0.5"
                              value={defaultWorkSchedule.thursday.hours} 
                              onChange={(e) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  thursday: {
                                    ...defaultWorkSchedule.thursday,
                                    hours: Number(e.target.value)
                                  }
                                });
                              }}
                              className="w-16 h-8"
                            />
                            <span className="ml-2 text-sm">horas</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="friday" 
                              checked={defaultWorkSchedule.friday.works}
                              onCheckedChange={(checked) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  friday: {
                                    ...defaultWorkSchedule.friday,
                                    works: checked === true
                                  }
                                });
                              }}
                            />
                            <Label htmlFor="friday">Sexta-feira</Label>
                          </div>
                          <div className="flex items-center">
                            <Input 
                              type="number" 
                              disabled={!defaultWorkSchedule.friday.works}
                              min="0" 
                              max="24" 
                              step="0.5"
                              value={defaultWorkSchedule.friday.hours} 
                              onChange={(e) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  friday: {
                                    ...defaultWorkSchedule.friday,
                                    hours: Number(e.target.value)
                                  }
                                });
                              }}
                              className="w-16 h-8"
                            />
                            <span className="ml-2 text-sm">horas</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="saturday" 
                              checked={defaultWorkSchedule.saturday.works}
                              onCheckedChange={(checked) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  saturday: {
                                    ...defaultWorkSchedule.saturday,
                                    works: checked === true
                                  }
                                });
                                setNewCollaborator({
                                  ...newCollaborator,
                                  worksSaturday: checked === true
                                });
                              }}
                            />
                            <Label htmlFor="saturday">Sábado</Label>
                          </div>
                          <div className="flex items-center">
                            <Input 
                              type="number" 
                              disabled={!defaultWorkSchedule.saturday.works}
                              min="0" 
                              max="24" 
                              step="0.5"
                              value={defaultWorkSchedule.saturday.hours} 
                              onChange={(e) => {
                                setDefaultWorkSchedule({
                                  ...defaultWorkSchedule,
                                  saturday: {
                                    ...defaultWorkSchedule.saturday,
                                    hours: Number(e.target.value)
                                  }
                                });
                              }}
                              className="w-16 h-8"
                            />
                            <span className="ml-2 text-sm">horas</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                <Collapsible defaultOpen={true} className="mt-4">
                  {/* Seção 2: Contato */}
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="mb-4 w-full flex justify-between items-center p-3 rounded-lg border-dashed">
                      <span className="flex items-center">
                        <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>📞 Contato</span>
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-6">
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
                                <Trash className="h-4 w-4" />
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
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar rede social
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Botão para expandir o formulário completo */}
                {!showFullForm && (
                  <div className="mt-6 flex justify-center">
                    <Button 
                      variant="default" 
                      className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                      onClick={() => setShowFullForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Preencher cadastro completo
                    </Button>
                  </div>
                )}
                
                {/* Campos adicionais revelados ao clicar no botão */}
                {showFullForm && (
                  <>
                    {/* Campos adicionais ficariam aqui */}
                    <Collapsible className="mt-4">
                      {/* Seção 3: Endereço */}
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="mb-4 w-full flex justify-between items-center p-3 rounded-lg border-dashed">
                          <span className="flex items-center">
                            <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>🏠 Endereço</span>
                          </span>
                        </Button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 py-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="zipCode">CEP</Label>
                              <Input 
                                id="zipCode" 
                                value={newCollaborator.zipCode || ''} 
                                onChange={(e) => setNewCollaborator({...newCollaborator, zipCode: e.target.value})} 
                                className="mt-1"
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <Label htmlFor="address">Endereço</Label>
                              <Input 
                                id="address" 
                                value={newCollaborator.address || ''} 
                                onChange={(e) => setNewCollaborator({...newCollaborator, address: e.target.value})} 
                                className="mt-1"
                              />
                            </div>
                            
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
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <Button type="submit" className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                Salvar alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Dialog de exclusão */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Excluir colaborador</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este colaborador? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-red-500 hover:bg-red-600 text-white" 
                onClick={() => {
                  // Lógica para excluir o colaborador
                  setIsDeleteDialogOpen(false);
                }}
              >
                Excluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Dialog de visualização de horas */}
        <Dialog open={isHoursDialogOpen} onOpenChange={setIsHoursDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Horas do Colaborador</DialogTitle>
              <DialogDescription>
                Visualize as horas alocadas para diferentes projetos.
              </DialogDescription>
            </DialogHeader>
            
            {isLoadingHours ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedCollaboratorHours ? (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-muted/20 p-4 rounded-md">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border-2 border-[#FFD600]">
                      {selectedCollaboratorHours.profileImageUrl ? (
                        <AvatarImage src={selectedCollaboratorHours.profileImageUrl} alt={selectedCollaboratorHours.name} />
                      ) : (
                        <AvatarFallback>{selectedCollaboratorHours.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">{selectedCollaboratorHours.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedCollaboratorHours.role}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Valor/hora:</p>
                      <p className="font-medium">R$ {selectedCollaboratorHours.hourlyRate.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cidade:</p>
                      <p className="font-medium">{selectedCollaboratorHours.city || 'Não informada'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ocupação:</p>
                      <p className="font-medium">{selectedCollaboratorHours.occupancyPercentage.toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Horas disponíveis:</p>
                      <p className="font-medium">{selectedCollaboratorHours.availableHours.toFixed(1)}h</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                      Em andamento ({selectedCollaboratorHours.inProgressHours.toFixed(1)}h)
                    </h4>
                    {selectedCollaboratorHours.projects.inProgress.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem projetos em andamento</p>
                    ) : (
                      <ul className="space-y-2">
                        {selectedCollaboratorHours.projects.inProgress.map((project) => (
                          <li key={project.projectId} className="text-sm border rounded-md p-2">
                            <div className="font-medium">{project.projectName}</div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>{project.description}</span>
                              <span className="font-medium">{project.hours.toFixed(1)}h</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                      Em orçamento ({selectedCollaboratorHours.inQuoteHours.toFixed(1)}h)
                    </h4>
                    {selectedCollaboratorHours.projects.inQuote.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem projetos em orçamento</p>
                    ) : (
                      <ul className="space-y-2">
                        {selectedCollaboratorHours.projects.inQuote.map((project) => (
                          <li key={project.projectId} className="text-sm border rounded-md p-2">
                            <div className="font-medium">{project.projectName}</div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>{project.description}</span>
                              <span className="font-medium">{project.hours.toFixed(1)}h</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                      Concluídos ({selectedCollaboratorHours.completedHours.toFixed(1)}h)
                    </h4>
                    {selectedCollaboratorHours.projects.completed.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem projetos concluídos</p>
                    ) : (
                      <ul className="space-y-2">
                        {selectedCollaboratorHours.projects.completed.map((project) => (
                          <li key={project.projectId} className="text-sm border rounded-md p-2">
                            <div className="font-medium">{project.projectName}</div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>{project.description}</span>
                              <span className="font-medium">{project.hours.toFixed(1)}h</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="bg-muted/20 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Resumo de horas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Horas disponíveis por mês:</p>
                      <p className="font-medium">{selectedCollaboratorHours.availableHoursPerMonth.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de horas alocadas:</p>
                      <p className="font-medium">{selectedCollaboratorHours.totalAssignedHours.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Horas restantes:</p>
                      <p className="font-medium">{selectedCollaboratorHours.availableHours.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ocupação:</p>
                      <p className="font-medium">{selectedCollaboratorHours.occupancyPercentage.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-4">
                  <div 
                    className={`h-full rounded-full ${
                      selectedCollaboratorHours.occupancyPercentage > 100
                        ? 'bg-red-500'
                        : selectedCollaboratorHours.occupancyPercentage > 85
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, selectedCollaboratorHours.occupancyPercentage)}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Dialog de visualização */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Colaborador</DialogTitle>
            </DialogHeader>
            
            {selectedCollaborator && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-[#FFD600]">
                      {newCollaborator?.profileImageUrl ? (
                        <img 
                          src={newCollaborator.profileImageUrl} 
                          alt="Foto do colaborador" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold">{newCollaborator?.name}</h2>
                    <p className="text-muted-foreground">{newCollaborator?.role}</p>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                      <Badge variant="outline" className="bg-muted/20">
                        {newCollaborator?.collaboratorType === 'fixed' ? 'Fixo' : 
                         newCollaborator?.collaboratorType === 'freelancer' ? 'Freelancer' : 
                         newCollaborator?.collaboratorType === 'intern' ? 'Estagiário' : 
                         newCollaborator?.collaboratorType === 'outsourced' ? 'Terceirizado' : 'Não especificado'}
                      </Badge>
                      
                      <Badge variant="outline" className="bg-muted/20">
                        {newCollaborator?.status === 'active' ? 'Ativo' : 
                         newCollaborator?.status === 'inactive' ? 'Inativo' : 
                         newCollaborator?.status === 'vacation' ? 'Em férias' : 
                         newCollaborator?.status === 'terminated' ? 'Desligado' : 'Não especificado'}
                      </Badge>
                      
                      {newCollaborator?.isResponsible && (
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                          Responsável
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Informações Básicas</h3>
                    <dl className="space-y-2">
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">Nome completo</dt>
                        <dd className="font-medium">{newCollaborator?.name || 'Não informado'}</dd>
                      </div>
                      
                      {newCollaborator?.displayName && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">Nome de exibição</dt>
                          <dd className="font-medium">{newCollaborator.displayName}</dd>
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">Função</dt>
                        <dd className="font-medium">{newCollaborator?.role || 'Não informada'}</dd>
                      </div>
                      
                      {newCollaborator?.birthDate && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">Data de nascimento</dt>
                          <dd className="font-medium">
                            {new Date(newCollaborator.birthDate).toLocaleDateString('pt-BR')}
                          </dd>
                        </div>
                      )}
                      
                      {newCollaborator?.preferredPeriod && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">Período preferencial</dt>
                          <dd className="font-medium">
                            {newCollaborator.preferredPeriod === 'morning' ? 'Manhã' :
                             newCollaborator.preferredPeriod === 'afternoon' ? 'Tarde' :
                             newCollaborator.preferredPeriod === 'evening' ? 'Noite' : 'Flexível'}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Contato</h3>
                    <dl className="space-y-2">
                      {newCollaborator?.email && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">E-mail</dt>
                          <dd className="font-medium">{newCollaborator.email}</dd>
                        </div>
                      )}
                      
                      {newCollaborator?.phone && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">Telefone</dt>
                          <dd className="font-medium">{newCollaborator.phone}</dd>
                        </div>
                      )}
                      
                      {newCollaborator?.whatsapp && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">WhatsApp</dt>
                          <dd className="font-medium">{newCollaborator.whatsapp}</dd>
                        </div>
                      )}
                      
                      {newCollaborator?.linkedin && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">LinkedIn</dt>
                          <dd className="font-medium">
                            <a href={newCollaborator.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {newCollaborator.linkedin}
                            </a>
                          </dd>
                        </div>
                      )}
                      
                      {newCollaborator?.instagram && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">Instagram</dt>
                          <dd className="font-medium">
                            <a href={newCollaborator.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">
                              {newCollaborator.instagram}
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Endereço</h3>
                    <dl className="space-y-2">
                      {newCollaborator?.address && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">Endereço</dt>
                          <dd className="font-medium">{newCollaborator.address}</dd>
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">Cidade</dt>
                        <dd className="font-medium">{newCollaborator?.city || 'Não informada'}</dd>
                      </div>
                      
                      {newCollaborator?.state && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">Estado</dt>
                          <dd className="font-medium">{newCollaborator.state}</dd>
                        </div>
                      )}
                      
                      {newCollaborator?.country && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">País</dt>
                          <dd className="font-medium">{newCollaborator.country}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Financeiro</h3>
                    <dl className="space-y-2">
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">Valor Hora</dt>
                        <dd className="font-medium">R$ {newCollaborator?.hourlyRate?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || '0,00'}</dd>
                      </div>
                      
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">Horas/Dia</dt>
                        <dd className="font-medium">{newCollaborator?.hoursPerDay || 8}h</dd>
                      </div>
                      
                      {newCollaborator?.billableType && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">Tipo de cobrança</dt>
                          <dd className="font-medium">
                            {newCollaborator.billableType === 'hourly' ? 'Por hora' : 'Por entrega'}
                          </dd>
                        </div>
                      )}
                      
                      {newCollaborator?.monthlyRate !== undefined && newCollaborator?.monthlyRate > 0 && (
                        <div className="flex flex-col">
                          <dt className="text-sm text-muted-foreground">Valor Mensal</dt>
                          <dd className="font-medium">R$ {newCollaborator.monthlyRate.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
                
                {newCollaborator?.observations && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-2">Observações</h3>
                      <p className="text-sm whitespace-pre-wrap">{newCollaborator.observations}</p>
                    </div>
                  </>
                )}
                
                {(newCollaborator?.software && newCollaborator.software.length > 0) || 
                 (newCollaborator?.skills && newCollaborator.skills.length > 0) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-medium mb-2">Especialidades</h3>
                      
                      {newCollaborator?.software && newCollaborator.software.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Softwares</h4>
                          <div className="flex flex-wrap gap-1">
                            {newCollaborator.software.map((sw, index) => (
                              <Badge key={index} variant="secondary">{sw}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {newCollaborator?.skills && newCollaborator.skills.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">Habilidades</h4>
                          <div className="flex flex-wrap gap-1">
                            {newCollaborator.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CollaboratorsPageCollapsible;