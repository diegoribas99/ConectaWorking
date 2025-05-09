import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Trash2, Info, Calendar, Clock, AlertTriangle,
  User, Users, FileSpreadsheet, Save, Search, Tag, BriefcaseBusiness, Award,
  DollarSign, FileText, HelpCircle, ExternalLink, Edit, Link, Lightbulb,
  Link2, Sparkles, UserCircle, Upload, MoreVertical, CalendarDays
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

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
  createdAt: Date | null;
  updatedAt: Date | null;
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

// Interface para os feriados e dias não úteis
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

// Componente principal da página
const CollaboratorsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isAddingTemplateCollaborators, setIsAddingTemplateCollaborators] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState<Partial<Collaborator>>({
    name: '',
    role: '',
    hourlyRate: 0,
    hoursPerDay: 8,
    city: '',
    isFixed: true,
    isResponsible: true,
    participatesInStages: true,
    billableType: 'hourly',
    paymentType: 'hourly',
    monthlyRate: 0,
    observations: ''
  });
  const [customHoliday, setCustomHoliday] = useState({
    name: '',
    date: new Date(),
    collaboratorId: undefined,
    isRecurring: false
  });

  // Estatísticas dos colaboradores
  const stats: CollaboratorStats = {
    totalCollaborators: 0,
    fixedCount: 0,
    freelancerCount: 0,
    totalFixedCost: 0,
    totalAvailableHours: 0,
    assignedHours: 0,
    overloadedCollaborators: 0
  };

  // Buscar colaboradores da API
  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ['/api/users/1/collaborators'],
    queryFn: async () => {
      try {
        return await apiRequest<Collaborator[]>('/api/users/1/collaborators');
      } catch (error) {
        console.error('Erro ao buscar colaboradores:', error);
        return [];
      }
    }
  });

  // Mutação para adicionar um novo colaborador
  const { mutate: addCollaborator, isPending: isAddingCollaborator } = useMutation({
    mutationFn: async (data: Partial<Collaborator>) => {
      // Converter valores numéricos para string antes de enviar para a API
      const formattedData = {
        ...data,
        hourlyRate: String(data.hourlyRate), // Garantir que hourlyRate seja string
        monthlyRate: data.monthlyRate ? String(data.monthlyRate) : undefined // Garantir que monthlyRate seja string quando existir
      };
      
      return await apiRequest<Collaborator>('/api/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
    },
    onSuccess: () => {
      toast({
        title: 'Colaborador adicionado com sucesso!',
        description: 'O novo colaborador foi cadastrado no sistema.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
      setIsAddDialogOpen(false);
      resetCollaboratorForm();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao adicionar colaborador',
        description: 'Ocorreu um erro ao adicionar o colaborador. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Erro ao adicionar colaborador:', error);
    }
  });

  // Mutação para excluir um colaborador
  const { mutate: deleteCollaborator } = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest<void>(`/api/collaborators/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Colaborador removido',
        description: 'O colaborador foi removido com sucesso.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover colaborador',
        description: 'Ocorreu um erro ao remover o colaborador. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Erro ao remover colaborador:', error);
    }
  });

  // Atualizar estatísticas com base nos colaboradores disponíveis
  useEffect(() => {
    if (collaborators.length > 0) {
      const fixedCollaborators = collaborators.filter(c => c.isFixed);
      const freelancers = collaborators.filter(c => !c.isFixed);
      
      const totalFixedCost = fixedCollaborators.reduce((sum, c) => {
        const workDays = getWorkDaysInCurrentMonth(c.city);
        return sum + (c.hourlyRate * c.hoursPerDay * workDays);
      }, 0);
      
      const totalAvailableHours = fixedCollaborators.reduce((sum, c) => {
        const workDays = getWorkDaysInCurrentMonth(c.city);
        return sum + (c.hoursPerDay * workDays);
      }, 0);
      
      // Aqui seria calculado com base em dados reais, usaremos um valor fictício para demonstração
      const assignedHours = totalAvailableHours * 0.9;
      
      // Estatísticas dos colaboradores
      stats.totalCollaborators = collaborators.length;
      stats.fixedCount = fixedCollaborators.length;
      stats.freelancerCount = freelancers.length;
      stats.totalFixedCost = totalFixedCost;
      stats.totalAvailableHours = totalAvailableHours;
      stats.assignedHours = assignedHours;
      stats.overloadedCollaborators = 1; // Exemplo
    }
  }, [collaborators]);

  // Função para obter os dias úteis no mês atual com base na cidade
  const getWorkDaysInCurrentMonth = (city: string): number => {
    // Em uma implementação real, isso consultaria uma API ou cálculo real
    // com base em feriados nacionais, estaduais e municipais da cidade
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Simplificadamente, retornamos uma média de dias úteis
    return 21;
  };

  // Resetar formulário de novo colaborador
  const resetCollaboratorForm = () => {
    setNewCollaborator({
      name: '',
      role: '',
      hourlyRate: 0,
      hoursPerDay: 8,
      city: '',
      isFixed: true,
      isResponsible: true,
      participatesInStages: true,
      billableType: 'hourly',
      paymentType: 'hourly',
      monthlyRate: 0,
      observations: ''
    });
  };

  // Filtrar colaboradores com base na busca e na aba ativa
  const filteredCollaborators = collaborators.filter(collaborator => {
    // Filtrar por termo de busca
    const matchesSearch = 
      collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por tipo (fixo ou freelancer)
    const matchesType = 
      activeTab === 'all' || 
      (activeTab === 'fixed' && collaborator.isFixed) || 
      (activeTab === 'freelancer' && !collaborator.isFixed);
    
    return matchesSearch && matchesType;
  });

  // Calcular horas e custos para um colaborador fixo
  const calculateCollaboratorMonthlyData = (collaborator: Collaborator) => {
    const workDays = getWorkDaysInCurrentMonth(collaborator.city);
    const totalHours = workDays * collaborator.hoursPerDay;
    
    // Se tiver valor mensal fixo, usar ele. Senão, calcular com base nas horas
    const monthlyCost = collaborator.isFixed 
      ? (collaborator.paymentType === 'monthly' && collaborator.monthlyRate 
          ? collaborator.monthlyRate 
          : totalHours * collaborator.hourlyRate)
      : 0;
    
    return {
      workDays,
      totalHours,
      monthlyCost
    };
  };

  // Lidar com a adição de um novo colaborador
  const handleAddCollaborator = () => {
    if (!newCollaborator.name || !newCollaborator.role) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha pelo menos o nome e a função do colaborador.',
        variant: 'destructive',
      });
      return;
    }

    // Adicionar usuário atual (1 para desenvolvimento)
    const collaboratorData = {
      ...newCollaborator,
      userId: 1
    };
    
    addCollaborator(collaboratorData);
  };

  // Confirmar exclusão de colaborador
  const confirmDeleteCollaborator = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      deleteCollaborator(id);
    }
  };

  // Obter o mês e ano atual formatado
  const getCurrentMonthYear = () => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };
  
  // Templates de colaboradores comuns
  const collaboratorTemplates = [
    {
      name: "Arquiteto Sênior (CLT)",
      role: "Arquiteto Sênior",
      hourlyRate: 120,
      hoursPerDay: 8,
      city: "São Paulo",
      isFixed: true,
      isResponsible: true,
      participatesInStages: true,
      billableType: "hourly",
      paymentType: "hourly",
      profileImageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&auto=format&fit=crop",
      assignedHours: 70
    },
    {
      name: "Arquiteto Júnior (CLT)",
      role: "Arquiteto Júnior",
      hourlyRate: 60,
      hoursPerDay: 8,
      city: "São Paulo",
      isFixed: true,
      isResponsible: false,
      participatesInStages: true,
      billableType: "hourly",
      paymentType: "monthly",
      monthlyRate: 7500,
      profileImageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&h=200&auto=format&fit=crop",
      assignedHours: 130
    },
    {
      name: "Designer de Interiores (CLT)",
      role: "Designer de Interiores",
      hourlyRate: 80,
      hoursPerDay: 8,
      city: "São Paulo",
      isFixed: true,
      isResponsible: true,
      participatesInStages: true,
      billableType: "hourly",
      paymentType: "hourly",
      profileImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop",
      assignedHours: 100
    },
    {
      name: "Estagiário (CLT)",
      role: "Estagiário",
      hourlyRate: 30,
      hoursPerDay: 6,
      city: "São Paulo",
      isFixed: true,
      isResponsible: false,
      participatesInStages: true,
      billableType: "hourly",
      paymentType: "monthly",
      monthlyRate: 1800,
      profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
      assignedHours: 95
    },
    {
      name: "Renderizador (Freelancer)",
      role: "Renderizador",
      hourlyRate: 150,
      hoursPerDay: 0,
      city: "Remoto",
      isFixed: false,
      isResponsible: false,
      participatesInStages: true,
      billableType: "perDelivery",
      paymentType: "hourly",
      profileImageUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=200&h=200&auto=format&fit=crop",
      assignedHours: 0
    },
    {
      name: "Orçamentista (Freelancer)",
      role: "Orçamentista",
      hourlyRate: 100,
      hoursPerDay: 0,
      city: "Remoto",
      isFixed: false,
      isResponsible: false,
      participatesInStages: true,
      billableType: "perDelivery",
      paymentType: "hourly",
      profileImageUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=200&h=200&auto=format&fit=crop", 
      assignedHours: 0
    }
  ];
  
  // Aplicar template de colaborador
  const applyCollaboratorTemplate = (template: any) => {
    setNewCollaborator({
      ...template,
      name: "",
      hourlyRate: template.hourlyRate, // Mantém o valor numérico para a edição
      paymentType: template.paymentType || 'hourly',
      monthlyRate: template.monthlyRate || 0,
      observations: ""
    });
    setIsTemplateDialogOpen(false);
    toast({
      title: "Modelo aplicado",
      description: `O modelo de ${template.role} foi aplicado. Complete as informações específicas.`,
      variant: "default",
    });
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex flex-col gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Colaboradores</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie sua equipe de trabalho e acompanhe a carga horária e custos
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative w-full md:w-64 self-end">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar colaborador..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 justify-end">
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => setIsImportDialogOpen(true)}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Importar CSV
              </Button>
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => setIsTemplateDialogOpen(true)}
              >
                <Lightbulb className="h-4 w-4 mr-2" /> Ver Exemplo Completo
              </Button>
              <Button
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black w-full md:w-auto"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Colaborador
              </Button>
            </div>
          </div>
        </div>

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

        {/* Tipos de colaboradores */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-medium text-lg mb-3">Confira como cada tipo de colaborador pode impactar nos custos e nas etapas dos projetos</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2">Tipo de colaborador</th>
                    <th className="text-left p-2">Custo fixo do escritório</th>
                    <th className="text-left p-2">Responsável por etapa</th>
                    <th className="text-left p-2">Usado nos cálculos da etapa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-2">
                      <div className="flex items-center">
                        <span className="h-3 w-3 rounded-full bg-[#FFD600] mr-2"></span>
                        <span className="font-medium">Fixo (equipe interna)</span>
                      </div>
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex items-start gap-1">
                        <span className="text-green-600 dark:text-green-400 font-medium">✅ Sim.</span>
                        Esse colaborador tem carga horária mensal definida e faz parte do custo fixo do escritório.
                      </div>
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex items-start gap-1">
                        <span className="text-green-600 dark:text-green-400 font-medium">✅ Sim.</span>
                        Pode ser escolhido como responsável por qualquer etapa ou projeto.
                      </div>
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex items-start gap-1">
                        <span className="text-green-600 dark:text-green-400 font-medium">✅ Sim.</span>
                        O valor por hora é automaticamente usado nas etapas em que ele for selecionado.
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">
                      <div className="flex items-center">
                        <span className="h-3 w-3 rounded-full bg-gray-800 dark:bg-gray-400 mr-2"></span>
                        <span className="font-medium">Freelancer ou parceiro</span>
                      </div>
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex items-start gap-1">
                        <span className="text-red-600 dark:text-red-400 font-medium">❌ Não.</span>
                        Como não tem vínculo mensal fixo, o freela não entra no custo fixo do escritório.
                      </div>
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex items-start gap-1">
                        <span className="text-green-600 dark:text-green-400 font-medium">✅ Sim.</span>
                        Também pode ser escolhido como responsável por etapas ou projetos, da mesma forma que os fixos.
                      </div>
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex items-start gap-1">
                        <span className="text-green-600 dark:text-green-400 font-medium">✅ Sim, se for vinculado.</span>
                        O valor/hora só será usado se o freela for escolhido como responsável por aquela etapa.
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tabs e lista de colaboradores */}
        <div className="space-y-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
              <Button
                variant="outline"
                onClick={() => setIsHolidayDialogOpen(true)}
                className="w-full md:w-auto"
              >
                <Calendar className="h-4 w-4 mr-2" /> Adicionar feriado/recesso
              </Button>
            </div>

            <TabsContent value="all" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
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
                ) : (
                  filteredCollaborators.map(collaborator => {
                    const { workDays, totalHours, monthlyCost } = calculateCollaboratorMonthlyData(collaborator);
                    
                    return (
                      <Card key={collaborator.id} className={collaborator.isFixed ? "border-l-4 border-l-[#FFD600]" : ""}>
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/4 lg:w-1/5 bg-black/5 dark:bg-white/5 flex flex-col items-center justify-center p-4">
                              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#FFD600] relative flex items-center justify-center">
                                {collaborator.profileImageUrl ? (
                                  <img 
                                    src={collaborator.profileImageUrl} 
                                    alt={collaborator.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                    <span className="text-4xl font-bold text-gray-400">
                                      {collaborator.name.substring(0, 1).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 text-center">
                                <Badge variant={collaborator.isFixed ? "default" : "outline"} className={collaborator.isFixed ? "bg-[#FFD600] hover:bg-[#FFD600]/80 text-black" : ""}>
                                  {collaborator.isFixed ? "Fixo" : "Freelancer"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-lg">{collaborator.name}</h3>
                                    {collaborator.isFixed ? (
                                      <Badge className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">Fixo</Badge>
                                    ) : (
                                      <Badge variant="outline">Freelancer ou parceiro</Badge>
                                    )}
                                  </div>
                                  <p className="text-muted-foreground">{collaborator.role}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => {/* Implementar edição */}}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-500"
                                    onClick={() => confirmDeleteCollaborator(collaborator.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                  <p className="text-sm font-medium">Valores</p>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {collaborator.paymentType === 'monthly' ? (
                                      <>
                                        <div className="flex justify-between">
                                          <span>Tipo:</span>
                                          <span className="font-medium">Salário mensal fixo</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Valor mensal:</span>
                                          <span className="font-medium">{formatCurrency(collaborator.monthlyRate || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Valor/hora equivalente:</span>
                                          <span>{formatCurrency(collaborator.hourlyRate)}</span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="flex justify-between">
                                        <span>Valor por hora:</span>
                                        <span className="font-medium">{formatCurrency(collaborator.hourlyRate)}</span>
                                      </div>
                                    )}
                                    
                                    {collaborator.isFixed && (
                                      <>
                                        <div className="flex justify-between">
                                          <span>Custo mensal:</span>
                                          <span className="font-medium">{formatCurrency(monthlyCost)}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                {collaborator.isFixed && (
                                  <div>
                                    <p className="text-sm font-medium">Carga horária ({getCurrentMonthYear()})</p>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      <div className="flex justify-between">
                                        <span>Horas por dia:</span>
                                        <span>{collaborator.hoursPerDay}h</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Dias úteis:</span>
                                        <span>{workDays} dias</span>
                                      </div>
                                      <div className="flex justify-between font-medium">
                                        <span>Total de horas:</span>
                                        <span>{totalHours}h</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <p className="text-sm font-medium">Configurações</p>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3.5 w-3.5" />
                                      <span>{collaborator.isResponsible ? "Pode ser responsável por projetos" : "Não aparece como responsável"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Tag className="h-3.5 w-3.5" />
                                      <span>{collaborator.participatesInStages ? "Participa das etapas de projetos" : "Não participa das etapas"}</span>
                                    </div>
                                    {collaborator.isFixed && (
                                      <div className="flex items-center gap-1">
                                        <BriefcaseBusiness className="h-3.5 w-3.5" />
                                        <span>Incluído no custo fixo do escritório</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {collaborator.observations && (
                                <div className="mt-3 p-2 bg-muted rounded-md text-sm">
                                  <p className="font-medium">Observações:</p>
                                  <p className="text-muted-foreground">{collaborator.observations}</p>
                                </div>
                              )}
                            </div>
                            
                            {collaborator.isFixed && (
                              <div className="md:w-64 p-4 md:border-l border-border bg-[#FFD600]/5 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Disponibilidade</span>
                                    <span className="text-sm text-muted-foreground">{getCurrentMonthYear()}</span>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-[#FFD600]" 
                                        style={{ 
                                          width: `${Math.min(100, (collaborator.assignedHours / totalHours) * 100)}%` 
                                        }}
                                      />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>{collaborator.assignedHours}h alocadas</span>
                                      <span>{totalHours}h disponíveis</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-xs"
                                    onClick={() => {/* Implementar vincular a projeto */}}
                                  >
                                    <Link className="h-3.5 w-3.5 mr-1" /> Vincular a projeto
                                  </Button>
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="w-full mt-2 text-xs"
                                    onClick={() => {/* Implementar visualização no projeto */}}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Ver impacto nos projetos
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="fixed" className="space-y-4 mt-4">
              {/* Este conteúdo será o mesmo que o "all", mas filtrado - a filtragem já está sendo feita acima */}
            </TabsContent>
            
            <TabsContent value="freelancer" className="space-y-4 mt-4">
              {/* Este conteúdo será o mesmo que o "all", mas filtrado - a filtragem já está sendo feita acima */}
            </TabsContent>
          </Tabs>
        </div>

        {/* Resumo e estatísticas */}
        {collaborators.length > 0 && (
          <Card className="mt-8 bg-[#FFD600]/5 border-[#FFD600]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={18} className="text-[#FFD600]" /> 
                Resumo da Equipe
              </CardTitle>
              <CardDescription>
                Resumo mensal atual ({getCurrentMonthYear()})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total de colaboradores cadastrados:</span>
                    <span className="font-medium">{stats.totalCollaborators}</span>
                  </div>
                  <div className="flex justify-between pl-4">
                    <span className="text-sm">Fixos:</span>
                    <span className="font-medium">{stats.fixedCount} ({formatCurrency(stats.totalFixedCost)} em custo fixo)</span>
                  </div>
                  <div className="flex justify-between pl-4">
                    <span className="text-sm">Freelancers:</span>
                    <span className="font-medium">{stats.freelancerCount}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total de horas disponíveis (fixos):</span>
                    <span className="font-medium">{stats.totalAvailableHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Horas já atribuídas a projetos:</span>
                    <span className="font-medium">{Math.floor(stats.assignedHours)}h</span>
                  </div>
                </div>
                
                <div>
                  {stats.overloadedCollaborators > 0 && (
                    <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">{stats.overloadedCollaborators} colaborador ultrapassando a carga horária disponível</p>
                        <p className="text-muted-foreground">Verifique a distribuição de tarefas para evitar sobrecarga.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog para adicionar colaborador */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Colaborador</DialogTitle>
              <DialogDescription>
                Cadastre um novo membro da equipe ou freelancer.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-1/4 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-2 overflow-hidden mb-2 relative bg-muted flex items-center justify-center">
                    {newCollaborator.profileImageUrl ? (
                      <img 
                        src={newCollaborator.profileImageUrl}
                        alt="Foto do colaborador"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl font-bold text-gray-400">
                        {newCollaborator.name ? newCollaborator.name.substring(0, 1).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-xs"
                      onClick={() => {
                        // Simular seleção de foto - em um caso real, aqui abriria o seletor de arquivos
                        const randomImageIndex = Math.floor(Math.random() * 5) + 1;
                        const randomImageUrls = [
                          "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&auto=format&fit=crop",
                          "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=200&h=200&auto=format&fit=crop",
                          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop",
                          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
                          "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=200&h=200&auto=format&fit=crop"
                        ];
                        setNewCollaborator({
                          ...newCollaborator,
                          profileImageUrl: randomImageUrls[randomImageIndex - 1]
                        });
                      }}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" /> Adicionar foto
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Recomendado: 200x200px</p>
                  </div>
                </div>
            
                <div className="w-full md:w-3/4 flex justify-center gap-4">
                  <div 
                    className={`flex flex-col items-center p-4 rounded-md cursor-pointer w-1/2 border ${
                      newCollaborator.isFixed 
                        ? 'border-[#FFD600] bg-[#FFD600]/10' 
                        : 'border-border'
                    }`}
                    onClick={() => setNewCollaborator({...newCollaborator, isFixed: true})}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      newCollaborator.isFixed ? 'bg-[#FFD600] text-black' : 'bg-muted text-muted-foreground'
                    }`}>
                      <BriefcaseBusiness className="h-5 w-5" />
                    </div>
                    <p className="mt-2 font-medium">Fixo (equipe interna)</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      Entra no custo fixo do escritório
                    </p>
                  </div>
                  
                  <div 
                    className={`flex flex-col items-center p-4 rounded-md cursor-pointer w-1/2 border ${
                      !newCollaborator.isFixed 
                        ? 'border-gray-800 dark:border-gray-400 bg-gray-800/5 dark:bg-gray-400/5' 
                        : 'border-border'
                    }`}
                    onClick={() => setNewCollaborator({...newCollaborator, isFixed: false})}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      !newCollaborator.isFixed ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Award className="h-5 w-5" />
                    </div>
                    <p className="mt-2 font-medium">Freelancer / Parceiro</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      Contratado por demanda específica
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Separator />
                <h3 className="font-medium my-4">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nome completo <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Ex: Maria Silva"
                      value={newCollaborator.name}
                      onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Função <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Ex: Arquiteto(a) Sênior"
                      value={newCollaborator.role}
                      onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">
                        Forma de remuneração
                      </label>
                      <div className="flex gap-4">
                        <div 
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border w-1/2 ${
                            newCollaborator.paymentType !== 'monthly' 
                              ? 'border-[#FFD600] bg-[#FFD600]/5' 
                              : 'border-border'
                          }`}
                          onClick={() => setNewCollaborator({
                            ...newCollaborator, 
                            paymentType: 'hourly'
                          })}
                        >
                          <div className={`h-4 w-4 rounded-full border ${
                            newCollaborator.paymentType !== 'monthly' 
                              ? 'border-[#FFD600] bg-[#FFD600]' 
                              : 'border-gray-400'
                          }`}/>
                          <span className="text-sm">Por hora</span>
                        </div>
                        
                        <div 
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border w-1/2 ${
                            newCollaborator.paymentType === 'monthly' 
                              ? 'border-[#FFD600] bg-[#FFD600]/5' 
                              : 'border-border'
                          }`}
                          onClick={() => setNewCollaborator({
                            ...newCollaborator, 
                            paymentType: 'monthly'
                          })}
                        >
                          <div className={`h-4 w-4 rounded-full border ${
                            newCollaborator.paymentType === 'monthly' 
                              ? 'border-[#FFD600] bg-[#FFD600]' 
                              : 'border-gray-400'
                          }`}/>
                          <span className="text-sm">Valor mensal fixo</span>
                        </div>
                      </div>
                    </div>
                  
                    {newCollaborator.paymentType !== 'monthly' ? (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Valor da hora (R$) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="0,00"
                          value={newCollaborator.hourlyRate || ''}
                          onChange={(e) => setNewCollaborator({
                            ...newCollaborator, 
                            hourlyRate: parseFloat(e.target.value) || 0
                          })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          O custo mensal será calculado automaticamente com base nas horas úteis.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Valor mensal (R$) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="0,00"
                          value={newCollaborator.monthlyRate || ''}
                          onChange={(e) => {
                            const monthlyValue = parseFloat(e.target.value) || 0;
                            // Calcular o valor por hora com base no valor mensal
                            const workDays = 21; // Média de dias úteis por mês
                            const totalHours = workDays * (newCollaborator.hoursPerDay || 8);
                            const hourlyRate = totalHours > 0 ? monthlyValue / totalHours : 0;
                            
                            setNewCollaborator({
                              ...newCollaborator, 
                              monthlyRate: monthlyValue,
                              hourlyRate: Number(hourlyRate.toFixed(2))
                            });
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          O valor por hora será calculado automaticamente para uso em projetos.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {!newCollaborator.isFixed && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Forma de cobrança
                      </label>
                      <Select
                        value={newCollaborator.billableType}
                        onValueChange={(value) => setNewCollaborator({
                          ...newCollaborator, 
                          billableType: value as 'hourly' | 'perDelivery'
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma de cobrança" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Por hora</SelectItem>
                          <SelectItem value="perDelivery">Por entrega</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {newCollaborator.isFixed && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Horas por dia <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="8"
                          value={newCollaborator.hoursPerDay || ''}
                          onChange={(e) => setNewCollaborator({
                            ...newCollaborator, 
                            hoursPerDay: parseFloat(e.target.value) || 8
                          })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Cidade <span className="text-red-500">*</span>
                          <span className="text-xs text-muted-foreground ml-1">(para calcular feriados locais)</span>
                        </label>
                        <Input
                          placeholder="Ex: São Paulo"
                          value={newCollaborator.city}
                          onChange={(e) => setNewCollaborator({...newCollaborator, city: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className={newCollaborator.isFixed ? "md:col-span-2" : ""}>
                    <label className="block text-sm font-medium mb-1">
                      Observações
                    </label>
                    <Input
                      placeholder="Informações adicionais sobre este colaborador"
                      value={newCollaborator.observations || ''}
                      onChange={(e) => setNewCollaborator({...newCollaborator, observations: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Separator />
                <h3 className="font-medium my-4">Configurações</h3>
                
                <div className="space-y-3">
                  {newCollaborator.isFixed && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="participatesCost" 
                        checked={true}
                        disabled
                      />
                      <label
                        htmlFor="participatesCost"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Entra no custo fixo do escritório
                      </label>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isResponsible" 
                      checked={newCollaborator.isResponsible}
                      onCheckedChange={(checked) => 
                        setNewCollaborator({...newCollaborator, isResponsible: checked === true})
                      }
                    />
                    <label
                      htmlFor="isResponsible"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Pode ser responsável por projetos
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="participatesStages" 
                      checked={newCollaborator.participatesInStages}
                      onCheckedChange={(checked) => 
                        setNewCollaborator({...newCollaborator, participatesInStages: checked === true})
                      }
                    />
                    <label
                      htmlFor="participatesStages"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Participa nas etapas de projeto (usado para cálculos de orçamento)
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2 justify-end">
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
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                onClick={handleAddCollaborator}
                disabled={isAddingCollaborator}
              >
                {isAddingCollaborator && (
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                )}
                Adicionar Colaborador
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog para adicionar feriado/recesso */}
        <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Feriado ou Recesso</DialogTitle>
              <DialogDescription>
                Cadastre feriados ou recessos para ajustar o cálculo de dias úteis.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do feriado/recesso</label>
                <Input
                  placeholder="Ex: Recesso de final de ano"
                  value={customHoliday.name}
                  onChange={(e) => setCustomHoliday({...customHoliday, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <Input
                  type="date"
                  value={customHoliday.date.toISOString().split('T')[0]}
                  onChange={(e) => setCustomHoliday({
                    ...customHoliday, 
                    date: new Date(e.target.value)
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Aplicar para</label>
                <Select
                  value="all"
                  onValueChange={(value) => {
                    // Em uma implementação real, isso definiria o collaboratorId
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione quem será afetado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os colaboradores</SelectItem>
                    {collaborators.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isRecurring" 
                  checked={customHoliday.isRecurring}
                  onCheckedChange={(checked) => 
                    setCustomHoliday({...customHoliday, isRecurring: checked === true})
                  }
                />
                <label
                  htmlFor="isRecurring"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Repetir anualmente
                </label>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsHolidayDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                onClick={() => {
                  // Implementar lógica para salvar feriado
                  toast({
                    title: 'Feriado adicionado',
                    description: 'O feriado foi adicionado com sucesso.',
                    variant: 'default',
                  });
                  setIsHolidayDialogOpen(false);
                }}
              >
                Adicionar Feriado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog para exemplo completo */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0">
            <div className="sticky top-0 z-10 p-6 pb-4 bg-background/80 backdrop-blur-sm border-b">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#FFD600]" /> 
                  <span>Equipe Completa de Exemplo</span>
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Veja como seria a estrutura de uma equipe completa de arquitetura, com os perfis profissionais
                  mais comuns e suas respectivas funções no fluxo de trabalho.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Equipe Interna (Custo Fixo)</h3>
                <Badge className="bg-[#FFD600] text-black">4 membros</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Arquiteto Sênior (Titular) */}
                <Card className="border-l-4 border-l-[#FFD600] overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 bg-black/5 dark:bg-white/5">
                      <div className="aspect-square relative flex items-center justify-center overflow-hidden">
                        <UserCircle className="w-24 h-24 text-gray-400" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 dark:to-black/40"></div>
                      </div>
                    </div>
                    <div className="p-4 sm:w-2/3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-base">Marina Oliveira</h4>
                          <p className="text-sm text-muted-foreground">Arquiteta Sênior (Titular)</p>
                        </div>
                        <Badge className="bg-[#FFD600] text-black">Fixo</Badge>
                      </div>
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Valor/hora:</span>
                          <span className="font-medium">{formatCurrency(180)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Horas/dia:</span>
                          <span className="font-medium">8h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Custo mensal:</span>
                          <span className="font-medium">{formatCurrency(180 * 8 * 22)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                          <Sparkles className="h-4 w-4 text-[#FFD600]" />
                          <span className="text-xs">
                            Responsável por aprovações e coordenação geral dos projetos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Arquiteto Pleno */}
                <Card className="border-l-4 border-l-[#FFD600] overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 bg-black/5 dark:bg-white/5">
                      <div className="aspect-square relative flex items-center justify-center overflow-hidden">
                        <UserCircle className="w-24 h-24 text-gray-400" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 dark:to-black/40"></div>
                      </div>
                    </div>
                    <div className="p-4 sm:w-2/3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-base">Carlos Santos</h4>
                          <p className="text-sm text-muted-foreground">Arquiteto Pleno</p>
                        </div>
                        <Badge className="bg-[#FFD600] text-black">Fixo</Badge>
                      </div>
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Valor/hora:</span>
                          <span className="font-medium">{formatCurrency(120)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Horas/dia:</span>
                          <span className="font-medium">8h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Custo mensal:</span>
                          <span className="font-medium">{formatCurrency(120 * 8 * 22)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                          <Sparkles className="h-4 w-4 text-[#FFD600]" />
                          <span className="text-xs">
                            Desenvolvimento e detalhamento de projetos executivos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Arquiteto Júnior */}
                <Card className="border-l-4 border-l-[#FFD600] overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 bg-black/5 dark:bg-white/5">
                      <div className="aspect-square relative flex items-center justify-center overflow-hidden">
                        <UserCircle className="w-24 h-24 text-gray-400" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 dark:to-black/40"></div>
                      </div>
                    </div>
                    <div className="p-4 sm:w-2/3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-base">Ana Luz</h4>
                          <p className="text-sm text-muted-foreground">Arquiteta Júnior</p>
                        </div>
                        <Badge className="bg-[#FFD600] text-black">Fixo</Badge>
                      </div>
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Valor/hora:</span>
                          <span className="font-medium">{formatCurrency(60)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Horas/dia:</span>
                          <span className="font-medium">8h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Custo mensal:</span>
                          <span className="font-medium">{formatCurrency(60 * 8 * 22)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                          <Sparkles className="h-4 w-4 text-[#FFD600]" />
                          <span className="text-xs">
                            Desenhos técnicos e apoio no desenvolvimento de projetos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Estagiário */}
                <Card className="border-l-4 border-l-[#FFD600] overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 bg-black/5 dark:bg-white/5">
                      <div className="aspect-square relative flex items-center justify-center overflow-hidden">
                        <UserCircle className="w-24 h-24 text-gray-400" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 dark:to-black/40"></div>
                      </div>
                    </div>
                    <div className="p-4 sm:w-2/3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-base">Lucas Silva</h4>
                          <p className="text-sm text-muted-foreground">Estagiário</p>
                        </div>
                        <Badge className="bg-[#FFD600] text-black">Fixo</Badge>
                      </div>
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Valor/hora:</span>
                          <span className="font-medium">{formatCurrency(30)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Horas/dia:</span>
                          <span className="font-medium">6h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Custo mensal:</span>
                          <span className="font-medium">{formatCurrency(30 * 6 * 22)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                          <Sparkles className="h-4 w-4 text-[#FFD600]" />
                          <span className="text-xs">
                            Apoio geral, levantamentos e ajustes em desenhos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="flex items-center justify-between mb-4 mt-8">
                <h3 className="text-lg font-medium">Freelancers & Parceiros</h3>
                <Badge variant="outline">2 membros</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Renderizador */}
                <Card className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 bg-black/5 dark:bg-white/5">
                      <div className="aspect-square relative flex items-center justify-center overflow-hidden">
                        <UserCircle className="w-24 h-24 text-gray-400" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 dark:to-black/40"></div>
                      </div>
                    </div>
                    <div className="p-4 sm:w-2/3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-base">Felipe Costa</h4>
                          <p className="text-sm text-muted-foreground">Renderizador 3D</p>
                        </div>
                        <Badge variant="outline">Freelancer</Badge>
                      </div>
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Valor/hora:</span>
                          <span className="font-medium">{formatCurrency(150)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tipo de cobrança:</span>
                          <span className="font-medium">Por hora</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                          <Link2 className="h-4 w-4 text-gray-500" />
                          <span className="text-xs">
                            Desenvolve imagens realistas para apresentação aos clientes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Designer de Interiores */}
                <Card className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3 bg-black/5 dark:bg-white/5">
                      <div className="aspect-square relative flex items-center justify-center overflow-hidden">
                        <UserCircle className="w-24 h-24 text-gray-400" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 dark:to-black/40"></div>
                      </div>
                    </div>
                    <div className="p-4 sm:w-2/3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-base">Juliana Martins</h4>
                          <p className="text-sm text-muted-foreground">Designer de Interiores</p>
                        </div>
                        <Badge variant="outline">Freelancer</Badge>
                      </div>
                      <div className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Valor/hora:</span>
                          <span className="font-medium">{formatCurrency(90)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tipo de cobrança:</span>
                          <span className="font-medium">Por projeto</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                          <Link2 className="h-4 w-4 text-gray-500" />
                          <span className="text-xs">
                            Responsável pelos projetos de interiores e especificações
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="bg-[#FFD600]/10 rounded-md p-4 mt-8">
                <h3 className="text-base font-medium mb-2">Resultados da Equipe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Total membros fixos:</span>
                      <span className="font-medium">4 pessoas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total freelancers:</span>
                      <span className="font-medium">2 pessoas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Custo mensal da equipe fixa:</span>
                      <span className="font-medium">{formatCurrency((180*8*22) + (120*8*22) + (60*8*22) + (30*6*22))}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Horas produtivas/mês:</span>
                      <span className="font-medium">176 + 176 + 176 + 132 = 660 horas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Custo médio por hora:</span>
                      <span className="font-medium">{formatCurrency(((180*8*22) + (120*8*22) + (60*8*22) + (30*6*22)) / 660)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dias úteis considerados:</span>
                      <span className="font-medium">22 dias</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsTemplateDialogOpen(false)}
              >
                Fechar
              </Button>
              <Button
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                disabled={isAddingTemplateCollaborators}
                onClick={() => {
                  // Aplicar exemplo completo
                  const newCollaborators = [
                    {
                      name: "Marina Oliveira",
                      role: "Arquiteta Sênior (Titular)",
                      hourlyRate: 180,
                      hoursPerDay: 8,
                      city: "São Paulo",
                      isFixed: true,
                      isResponsible: true,
                      participatesInStages: true,
                      billableType: "hourly"
                    },
                    {
                      name: "Carlos Santos",
                      role: "Arquiteto Pleno",
                      hourlyRate: 120,
                      hoursPerDay: 8,
                      city: "São Paulo",
                      isFixed: true,
                      isResponsible: true,
                      participatesInStages: true,
                      billableType: "hourly"
                    },
                    {
                      name: "Ana Luz",
                      role: "Arquiteta Júnior",
                      hourlyRate: 60,
                      hoursPerDay: 8,
                      city: "São Paulo",
                      isFixed: true,
                      isResponsible: false,
                      participatesInStages: true,
                      billableType: "hourly"
                    },
                    {
                      name: "Lucas Silva",
                      role: "Estagiário",
                      hourlyRate: 30,
                      hoursPerDay: 6,
                      city: "São Paulo",
                      isFixed: true,
                      isResponsible: false,
                      participatesInStages: true,
                      billableType: "hourly"
                    },
                    {
                      name: "Felipe Costa",
                      role: "Renderizador 3D",
                      hourlyRate: 150,
                      hoursPerDay: 0,
                      city: "Rio de Janeiro",
                      isFixed: false,
                      isResponsible: false,
                      participatesInStages: true,
                      billableType: "hourly"
                    },
                    {
                      name: "Juliana Martins",
                      role: "Designer de Interiores",
                      hourlyRate: 90,
                      hoursPerDay: 0,
                      city: "São Paulo",
                      isFixed: false,
                      isResponsible: true,
                      participatesInStages: true,
                      billableType: "project"
                    }
                  ];
                  
                  // Adicionar userId a cada colaborador e converter hourlyRate para string
                  const collaboratorsWithUserId = newCollaborators.map(collab => ({
                    ...collab,
                    userId: 1,
                    hourlyRate: String(collab.hourlyRate), // Converter para string conforme esperado pelo schema
                    hoursPerDay: collab.hoursPerDay || 0,
                    observations: collab.role.includes('Sênior') ? 
                      "Responsável por aprovações e coordenação geral dos projetos" :
                      collab.role.includes('Pleno') ?
                      "Desenvolvimento e detalhamento de projetos executivos" :
                      collab.role.includes('Júnior') ?
                      "Desenhos técnicos e apoio no desenvolvimento de projetos" :
                      collab.role.includes('Estagiário') ?
                      "Apoio geral, levantamentos e ajustes em desenhos" :
                      collab.role.includes('Renderizador') ?
                      "Criação de imagens realistas e vídeos de apresentação" :
                      "Profissional especializado em sua área de atuação"
                  }));
                  
                  // Criar cada colaborador sequencialmente para evitar problemas
                  const addCollaboratorsSequentially = async () => {
                    try {
                      setIsAddingTemplateCollaborators(true);
                      
                      for (const collab of collaboratorsWithUserId) {
                        await apiRequest('/api/collaborators', { 
                          method: 'POST', 
                          body: JSON.stringify(collab),
                          headers: { 'Content-Type': 'application/json' }
                        });
                        // Pequeno delay para garantir ordem
                        await new Promise(resolve => setTimeout(resolve, 100));
                      }
                      
                      // Recarregar os dados
                      queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
                      setIsTemplateDialogOpen(false);
                      toast({
                        title: 'Exemplo aplicado com sucesso',
                        description: 'Todos os colaboradores foram adicionados à sua plataforma.',
                        variant: 'default',
                      });
                    } catch (err) {
                      console.error('Erro ao aplicar exemplo:', err);
                      toast({
                        title: 'Erro ao aplicar exemplo',
                        description: 'Não foi possível adicionar os colaboradores de exemplo.',
                        variant: 'destructive',
                      });
                    } finally {
                      setIsAddingTemplateCollaborators(false);
                    }
                  };
                  
                  addCollaboratorsSequentially();
                }}
              >
                {isAddingTemplateCollaborators ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Aplicando...
                  </>
                ) : "Aplicar Exemplo Completo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog para importar CSV */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importar Colaboradores</DialogTitle>
              <DialogDescription>
                Importe seus colaboradores a partir de um arquivo CSV.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                <FileSpreadsheet className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2">Arraste e solte seu arquivo CSV aqui, ou clique para selecionar</p>
                <p className="text-sm text-muted-foreground mt-1">Formato esperado: Nome, Função, Valor/hora, Tipo (Fixo/Freelancer)</p>
                <Button variant="outline" className="mt-4">
                  Selecionar Arquivo
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p className="font-medium">Modelo de CSV:</p>
                <pre className="p-2 bg-muted rounded-md mt-1 overflow-x-auto">
                  Nome,Função,Valor/hora,Horas/dia,Cidade,Tipo<br />
                  João Silva,Arquiteto,120,8,São Paulo,Fixo<br />
                  Maria Oliveira,Designer,90,8,São Paulo,Fixo<br />
                  Carlos Santos,Renderizador,150,0,Rio de Janeiro,Freelancer
                </pre>
                <p className="mt-2">
                  <a href="#" className="text-[#FFD600] underline">
                    Baixar template de exemplo
                  </a>
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsImportDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                disabled={true}
              >
                Importar Colaboradores
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CollaboratorsPage;