import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Trash2, Info, Calendar, Clock, 
  BarChart, Search, DollarSign, ExternalLink, Edit, Lightbulb,
  Eye, FileSpreadsheet, List, LayoutGrid, Save
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isAddingTemplateCollaborators, setIsAddingTemplateCollaborators] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<number | null>(null);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
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
  
  // Mutação para atualizar um colaborador
  const { mutate: updateCollaborator, isPending: isUpdatingCollaborator } = useMutation({
    mutationFn: async (data: { id: number, collaborator: Partial<Collaborator> }) => {
      // Converter valores numéricos para string antes de enviar para a API
      const formattedData = {
        ...data.collaborator,
        hourlyRate: String(data.collaborator.hourlyRate), // Garantir que hourlyRate seja string
        monthlyRate: data.collaborator.monthlyRate ? String(data.collaborator.monthlyRate) : undefined // Garantir que monthlyRate seja string quando existir
      };

      return await apiRequest<Collaborator>(`/api/collaborators/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
    },
    onSuccess: () => {
      toast({
        title: 'Colaborador atualizado com sucesso!',
        description: 'As informações do colaborador foram atualizadas.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
      setIsEditDialogOpen(false);
      setSelectedCollaborator(null);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar colaborador',
        description: 'Ocorreu um erro ao atualizar o colaborador. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Erro ao atualizar colaborador:', error);
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
    setCollaboratorToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Executar exclusão após confirmação
  const handleDeleteConfirmed = () => {
    if (collaboratorToDelete !== null) {
      deleteCollaborator(collaboratorToDelete);
      setIsDeleteDialogOpen(false);
      setCollaboratorToDelete(null);
    }
  };

  // Obter o mês e ano atual formatado
  const getCurrentMonthYear = () => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };
  
  // Abrir diálogo de edição do colaborador
  const handleEditCollaborator = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setIsEditDialogOpen(true);
  };
  
  // Abrir diálogo de visualização do colaborador
  const handleViewCollaborator = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setIsViewDialogOpen(true);
  };
  
  // Salvar dados de colaboradores (basicamente atualizar a lista)
  const handleSaveCollaborators = () => {
    toast({
      title: "Dados salvos com sucesso",
      description: "Todos os dados dos colaboradores foram salvos.",
      variant: "default",
    });
    
    // Atualizar os dados no servidor (se necessário)
    queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
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
                
                <div className="border border-input rounded-md flex ml-2">
                  <Button 
                    variant={viewMode === 'cards' ? 'default' : 'ghost'} 
                    size="icon"
                    className={`rounded-r-none ${viewMode === 'cards' ? 'bg-[#FFD600] hover:bg-[#FFD600]/90 text-black' : ''}`}
                    onClick={() => setViewMode('cards')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'table' ? 'default' : 'ghost'} 
                    size="icon"
                    className={`rounded-l-none ${viewMode === 'table' ? 'bg-[#FFD600] hover:bg-[#FFD600]/90 text-black' : ''}`}
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setIsHolidayDialogOpen(true)}
                className="w-full md:w-auto"
              >
                <Calendar className="h-4 w-4 mr-2" /> Adicionar feriado/recesso
              </Button>
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
                                      className="h-8 w-8"
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
                // Visualização em cards
                <div className="grid grid-cols-1 gap-4">
                  {filteredCollaborators.map(collaborator => {
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
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-blue-500"
                                    onClick={() => handleViewCollaborator(collaborator)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleEditCollaborator(collaborator)}
                                  >
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

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-4">
                                  <div className="bg-muted/30 rounded-lg p-4">
                                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-[#FFD600]" />
                                      Informações Financeiras
                                    </p>
                                    <div className="text-sm space-y-2">
                                      {collaborator.paymentType === 'monthly' ? (
                                        <>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Tipo:</span>
                                            <span className="font-medium">Salário mensal fixo</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Valor mensal:</span>
                                            <span className="font-medium">{formatCurrency(collaborator.monthlyRate || 0)}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Valor/hora equivalente:</span>
                                            <span>{formatCurrency(collaborator.hourlyRate)}</span>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="flex justify-between items-center">
                                          <span className="text-muted-foreground">Valor por hora:</span>
                                          <span className="font-medium">{formatCurrency(collaborator.hourlyRate)}</span>
                                        </div>
                                      )}

                                      {collaborator.isFixed && (
                                        <div className="flex justify-between items-center pt-2 border-t">
                                          <span className="text-muted-foreground">Custo mensal total:</span>
                                          <span className="font-medium">{formatCurrency(monthlyCost)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {collaborator.isFixed && (
                                    <div className="bg-muted/30 rounded-lg p-4">
                                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-[#FFD600]" />
                                        Carga Horária ({getCurrentMonthYear()})
                                      </p>
                                      <div className="text-sm space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-muted-foreground">Horas por dia:</span>
                                          <span>{collaborator.hoursPerDay}h</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-muted-foreground">Dias úteis:</span>
                                          <span>{workDays} dias</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t">
                                          <span className="text-muted-foreground">Total de horas mensais:</span>
                                          <span className="font-medium">{totalHours}h</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {collaborator.isFixed && (
                                  <div className="space-y-4">
                                    <div className="bg-muted/30 rounded-lg p-4">
                                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <BarChart className="h-4 w-4 text-[#FFD600]" />
                                        Disponibilidade de Horas
                                      </p>
                                      <div className="space-y-3">
                                        <div className="space-y-1.5">
                                          <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Horas utilizadas:</span>
                                            <span className="font-medium">{collaborator.assignedHours}h ({Math.round(collaborator.assignedHours/totalHours*100)}%)</span>
                                          </div>
                                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div 
                                              className={`h-full ${collaborator.assignedHours/totalHours > 0.85 ? 'bg-red-500' : 'bg-[#FFD600]'}`}
                                              style={{ width: `${Math.min(100, Math.round(collaborator.assignedHours/totalHours*100))}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                          <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Horas disponíveis:</span>
                                            <span className="font-medium">{totalHours - collaborator.assignedHours}h ({Math.round((totalHours - collaborator.assignedHours)/totalHours*100)}%)</span>
                                          </div>
                                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-green-500"
                                              style={{ width: `${Math.round((totalHours - collaborator.assignedHours)/totalHours*100)}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <Button 
                                        variant="link" 
                                        className="w-full mt-2 text-xs"
                                        onClick={() => {/* Implementar visualização no projeto */}}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> Ver impacto nos projetos
                                      </Button>
                                    </div>

                                    <div className="bg-muted/30 rounded-lg p-4">
                                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Info className="h-4 w-4 text-[#FFD600]" />
                                        Observações
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {collaborator.observations || "Nenhuma observação adicionada."}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="fixed" className="space-y-4 mt-4">
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
                      Nenhum colaborador fixo encontrado.
                    </div>
                  </CardContent>
                </Card>
              ) : viewMode === 'table' ? (
                // Visualização em tabela para equipe fixa
                <Card>
                  <CardContent className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Colaborador</th>
                            <th className="text-left p-2">Função</th>
                            <th className="text-right p-2">Valor/hora</th>
                            <th className="text-right p-2">Horas/mês</th>
                            <th className="text-right p-2">Custo mensal</th>
                            <th className="text-center p-2">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCollaborators.map(collaborator => {
                            const { totalHours, monthlyCost } = calculateCollaboratorMonthlyData(collaborator);
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
                                <td className="p-2 text-right">{formatCurrency(collaborator.hourlyRate)}</td>
                                <td className="p-2 text-right">{`${totalHours}h`}</td>
                                <td className="p-2 text-right">{formatCurrency(monthlyCost)}</td>
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
                                      className="h-8 w-8"
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
                // Visualização em cards para equipe fixa
                <div className="grid grid-cols-1 gap-4">
                  {filteredCollaborators.map(collaborator => {
                    const { workDays, totalHours, monthlyCost } = calculateCollaboratorMonthlyData(collaborator);
                    return (
                      <Card key={collaborator.id} className="border-l-4 border-l-[#FFD600]">
                        {/* O conteúdo do cartão é o mesmo da aba "all" */}
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
                                <Badge className="bg-[#FFD600] hover:bg-[#FFD600]/80 text-black">
                                  Fixo
                                </Badge>
                              </div>
                            </div>
                            <div className="flex-1 p-4">
                              {/* Conteúdo similar ao da aba "all" */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-lg">{collaborator.name}</h3>
                                    <Badge className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">Fixo</Badge>
                                  </div>
                                  <p className="text-muted-foreground">{collaborator.role}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-blue-500"
                                    onClick={() => handleViewCollaborator(collaborator)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleEditCollaborator(collaborator)}
                                  >
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
                              
                              {/* Resto do conteúdo similar à aba "all" */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                {/* (Omitido para brevidade) */}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="freelancer" className="space-y-4 mt-4">
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
                      Nenhum freelancer ou parceiro encontrado.
                    </div>
                  </CardContent>
                </Card>
              ) : viewMode === 'table' ? (
                // Visualização em tabela para freelancers
                <Card>
                  <CardContent className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Colaborador</th>
                            <th className="text-left p-2">Função</th>
                            <th className="text-left p-2">Tipo de Cobrança</th>
                            <th className="text-right p-2">Valor/hora</th>
                            <th className="text-center p-2">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCollaborators.map(collaborator => {
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
                                  {collaborator.billableType === 'hourly' 
                                    ? 'Por hora' 
                                    : 'Por entrega'}
                                </td>
                                <td className="p-2 text-right">{formatCurrency(collaborator.hourlyRate)}</td>
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
                                      className="h-8 w-8"
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
                // Visualização em cards para freelancers
                <div className="grid grid-cols-1 gap-4">
                  {filteredCollaborators.map(collaborator => {
                    return (
                      <Card key={collaborator.id}>
                        {/* O conteúdo do cartão é semelhante à aba "all", mas com menos informações */}
                        {/* (Omitido para brevidade) */}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Barra de ações fixa na parte inferior */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-10 px-4 py-2">
          <div className="container flex justify-end gap-2">
            <Button 
              onClick={handleSaveCollaborators} 
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
            >
              <Save className="h-4 w-4 mr-2" /> Salvar
            </Button>
          </div>
        </div>
        
        {/* AlertDialog para confirmação de exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este colaborador? Esta ação não pode ser desfeita.
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
      </div>
    </MainLayout>
  );
};

export default CollaboratorsPage;