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
  Loader2,
  MapPin,
  AlertCircle
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

const CollaboratorsPageSimple: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados básicos para controle da interface
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [selectedCollaborator, setSelectedCollaborator] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isHoursDialogOpen, setIsHoursDialogOpen] = useState(false);
  const [selectedCollaboratorHours, setSelectedCollaboratorHours] = useState<CollaboratorHours | null>(null);
  const [isLoadingHours, setIsLoadingHours] = useState(false);
  
  // Estado para novo colaborador
  const [newCollaborator, setNewCollaborator] = useState<Partial<Collaborator>>({
    name: '',
    role: '',
    collaboratorType: 'fixed',
    city: '',
    hourlyRate: 0,
    hoursPerDay: 8,
    isResponsible: false,
    participatesInStages: true,
    isFixed: true,
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
  
  // Adicionar novo colaborador
  const handleAddCollaborator = () => {
    // Simulação de uma chamada de API para adicionar colaborador
    toast({
      title: "Colaborador adicionado",
      description: "O colaborador foi adicionado com sucesso.",
    });
    setIsAddDialogOpen(false);
    resetCollaboratorForm();
  };
  
  // Resetar formulário do colaborador
  const resetCollaboratorForm = () => {
    setNewCollaborator({
      name: '',
      role: '',
      collaboratorType: 'fixed',
      city: '',
      hourlyRate: 0,
      hoursPerDay: 8,
      isResponsible: false,
      participatesInStages: true,
      isFixed: true,
      assignedHours: 0
    });
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
        
        {/* Dialog para adicionar colaborador */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Colaborador</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo colaborador.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="name">Nome completo <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={newCollaborator.name || ''}
                  onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="role">Função/Cargo <span className="text-red-500">*</span></Label>
                <Input
                  id="role"
                  value={newCollaborator.role || ''}
                  onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="city">Cidade <span className="text-red-500">*</span></Label>
                <Input
                  id="city"
                  value={newCollaborator.city || ''}
                  onChange={(e) => setNewCollaborator({...newCollaborator, city: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="hourlyRate">Valor/hora (R$) <span className="text-red-500">*</span></Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  value={newCollaborator.hourlyRate || 0}
                  onChange={(e) => setNewCollaborator({...newCollaborator, hourlyRate: Number(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="isFixed">Tipo de colaborador</Label>
                <Select
                  value={newCollaborator.isFixed ? 'fixed' : 'freelancer'}
                  onValueChange={(value) => setNewCollaborator({...newCollaborator, isFixed: value === 'fixed'})}
                >
                  <SelectTrigger id="isFixed">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixo</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={handleAddCollaborator}>
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Dialog para editar colaborador */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Colaborador</DialogTitle>
              <DialogDescription>
                Atualize as informações do colaborador.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="edit-name">Nome completo <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-name"
                  value={newCollaborator.name || ''}
                  onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="edit-role">Função/Cargo <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-role"
                  value={newCollaborator.role || ''}
                  onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="edit-city">Cidade <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-city"
                  value={newCollaborator.city || ''}
                  onChange={(e) => setNewCollaborator({...newCollaborator, city: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="edit-hourlyRate">Valor/hora (R$) <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-hourlyRate"
                  type="number"
                  min="0"
                  value={newCollaborator.hourlyRate || 0}
                  onChange={(e) => setNewCollaborator({...newCollaborator, hourlyRate: Number(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="edit-isFixed">Tipo de colaborador</Label>
                <Select
                  value={newCollaborator.isFixed ? 'fixed' : 'freelancer'}
                  onValueChange={(value) => setNewCollaborator({...newCollaborator, isFixed: value === 'fixed'})}
                >
                  <SelectTrigger id="edit-isFixed">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixo</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="button"
                onClick={() => {
                  // Simulação de uma chamada de API para atualizar colaborador
                  toast({
                    title: "Colaborador atualizado",
                    description: "As informações do colaborador foram atualizadas com sucesso.",
                  });
                  setIsEditDialogOpen(false);
                }}
              >
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
                  toast({
                    title: "Colaborador excluído",
                    description: "O colaborador foi excluído com sucesso.",
                  });
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
                      
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">Função</dt>
                        <dd className="font-medium">{newCollaborator?.role || 'Não informada'}</dd>
                      </div>
                      
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">Cidade</dt>
                        <dd className="font-medium">{newCollaborator?.city || 'Não informada'}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Detalhes Financeiros</h3>
                    <dl className="space-y-2">
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">Valor Hora</dt>
                        <dd className="font-medium">R$ {newCollaborator?.hourlyRate?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || '0,00'}</dd>
                      </div>
                      
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">Horas/Dia</dt>
                        <dd className="font-medium">{newCollaborator?.hoursPerDay || 8}h</dd>
                      </div>
                      
                      <div className="flex flex-col">
                        <dt className="text-sm text-muted-foreground">Tipo</dt>
                        <dd className="font-medium">
                          {newCollaborator?.isFixed ? 'Colaborador fixo' : 'Freelancer'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CollaboratorsPageSimple;