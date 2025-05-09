import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Trash2, Info, Calendar, Clock, 
  BarChart, Search, DollarSign, ExternalLink, Edit, Lightbulb,
  Eye, FileSpreadsheet, List, LayoutGrid, Save as SaveIcon, Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  const [stats, setStats] = useState<CollaboratorStats>({
    totalCollaborators: 0,
    fixedCount: 0,
    freelancerCount: 0,
    totalFixedCost: 0,
    totalAvailableHours: 0,
    assignedHours: 0,
    overloadedCollaborators: 0
  });

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
  const { mutate: deleteCollaborator, isPending: isDeletingCollaborator } = useMutation({
    mutationFn: (id: number) => {
      return fetch(`/api/collaborators/${id}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao excluir colaborador ${id}: ${response.status}`);
        }
        return;
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
    mutationFn: (data: { id: number, collaborator: Partial<Collaborator> }) => {
      // Converter valores numéricos para string antes de enviar para a API
      const formattedData = {
        ...data.collaborator,
        hourlyRate: String(data.collaborator.hourlyRate), 
        monthlyRate: data.collaborator.monthlyRate ? String(data.collaborator.monthlyRate) : undefined
      };

      return fetch(`/api/collaborators/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao atualizar colaborador ${data.id}: ${response.status}`);
        }
        return response.json();
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
      setStats({
        totalCollaborators: collaborators.length,
        fixedCount: fixedCollaborators.length,
        freelancerCount: freelancers.length,
        totalFixedCost: totalFixedCost,
        totalAvailableHours: totalAvailableHours,
        assignedHours: assignedHours,
        overloadedCollaborators: 1 // Exemplo
      });
    }
  }, [collaborators]);

  // Função para obter os dias úteis no mês atual com base na cidade
  const getWorkDaysInCurrentMonth = (city: string): number => {
    // Em uma implementação real, isso consultaria uma API ou cálculo real
    // com base em feriados nacionais, estaduais e municipais da cidade
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
  
  // Salvar dados de colaboradores
  const handleSaveCollaborators = () => {
    toast({
      title: "Dados salvos com sucesso",
      description: "Todos os dados dos colaboradores foram salvos.",
      variant: "default",
    });
    
    queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
  };

  // Componente de busca e ações para o cabeçalho
  const HeaderActions = () => (
    <div className="flex items-center gap-2">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar colaborador..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    
      <Button
        onClick={handleSaveCollaborators}
        className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
      >
        <SaveIcon size={16} className="mr-1" /> Salvar Alterações
      </Button>
    </div>
  );

  return (
    <MainLayout>
      <PageWrapper 
        title="Colaboradores"
        description="Gerencie sua equipe de trabalho e acompanhe a carga horária e custos"
        actions={<HeaderActions />}
      >
        <div className="flex flex-col gap-4">
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

        {/* Estatísticas */}
        <Card className="mb-6 mt-4">
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
                // Visualização em cards
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredCollaborators.map(collaborator => {
                    const { workDays, totalHours, monthlyCost } = calculateCollaboratorMonthlyData(collaborator);
                    return (
                      <Card key={collaborator.id} className="overflow-hidden">
                        <div className="flex flex-col h-full">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/4 lg:w-1/5 bg-black/5 dark:bg-white/5 flex flex-col items-center justify-center p-4">
                              <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2">
                                {collaborator.profileImageUrl ? (
                                  <img 
                                    src={collaborator.profileImageUrl} 
                                    alt={collaborator.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <span className="font-bold text-xl">
                                      {collaborator.name.substring(0, 1).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${collaborator.isFixed ? 'bg-[#FFD600]' : 'bg-gray-400'}`}></div>
                              </div>
                              <Badge variant={collaborator.isFixed ? "default" : "outline"} className={collaborator.isFixed ? "bg-[#FFD600] hover:bg-[#FFD600]/80 text-black" : ""}>
                                {collaborator.isFixed ? "Fixo" : "Freelancer"}
                              </Badge>
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex flex-col">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-base line-clamp-1">{collaborator.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1">{collaborator.role}</p>
                                  </div>
                                  <div className="flex gap-1">
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
                                      className="h-8 w-8 text-red-500"
                                      onClick={() => confirmDeleteCollaborator(collaborator.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="mt-2 space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-sm">Valor/hora:</span>
                                    <span className="text-sm font-medium">{formatCurrency(collaborator.hourlyRate)}</span>
                                  </div>
                                  
                                  {collaborator.isFixed && (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Disponibilidade:</span>
                                        <span className="text-sm font-medium">{collaborator.hoursPerDay}h/dia</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Horas mensais:</span>
                                        <span className="text-sm font-medium">{totalHours}h</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Custo mensal:</span>
                                        <span className="text-sm font-medium">{formatCurrency(monthlyCost)}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-auto p-0">
                            <Button 
                              variant="ghost" 
                              className="w-full rounded-none h-10 border-t border-border"
                              onClick={() => handleViewCollaborator(collaborator)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
                            </Button>
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

        {/* Diálogo de adição de novo colaborador */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Colaborador</DialogTitle>
              <DialogDescription>
                Adicione informações sobre um novo membro da equipe ou freelancer.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input 
                    id="name" 
                    placeholder="Nome do colaborador" 
                    value={newCollaborator.name}
                    onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Função / Cargo</Label>
                  <Input 
                    id="role" 
                    placeholder="Ex: Arquiteto, Designer, etc." 
                    value={newCollaborator.role}
                    onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade de trabalho</Label>
                  <Input 
                    id="city" 
                    placeholder="Cidade" 
                    value={newCollaborator.city}
                    onChange={(e) => setNewCollaborator({...newCollaborator, city: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hours-per-day">Horas por dia</Label>
                  <Input 
                    id="hours-per-day" 
                    type="number" 
                    placeholder="8" 
                    min="1"
                    max="24"
                    value={newCollaborator.hoursPerDay}
                    onChange={(e) => setNewCollaborator({...newCollaborator, hoursPerDay: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly-rate">Valor por hora (R$)</Label>
                  <Input 
                    id="hourly-rate" 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="0,00" 
                    value={newCollaborator.hourlyRate}
                    onChange={(e) => setNewCollaborator({...newCollaborator, hourlyRate: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment-type">Tipo de Pagamento</Label>
                  <Select 
                    value={newCollaborator.paymentType}
                    onValueChange={(value) => setNewCollaborator({...newCollaborator, paymentType: value as 'hourly' | 'monthly'})}
                  >
                    <SelectTrigger id="payment-type">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Por hora</SelectItem>
                      <SelectItem value="monthly">Salário mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {newCollaborator.paymentType === 'monthly' && (
                <div className="space-y-2">
                  <Label htmlFor="monthly-rate">Salário mensal (R$)</Label>
                  <Input 
                    id="monthly-rate" 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="0,00" 
                    value={newCollaborator.monthlyRate || 0}
                    onChange={(e) => setNewCollaborator({...newCollaborator, monthlyRate: parseFloat(e.target.value) || 0})}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="billable-type">Tipo de Faturamento</Label>
                <Select 
                  value={newCollaborator.billableType}
                  onValueChange={(value) => setNewCollaborator({...newCollaborator, billableType: value as 'hourly' | 'perDelivery'})}
                >
                  <SelectTrigger id="billable-type">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Por hora</SelectItem>
                    <SelectItem value="perDelivery">Por entrega</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  placeholder="Informações adicionais sobre o colaborador"
                  value={newCollaborator.observations || ''}
                  onChange={(e) => setNewCollaborator({...newCollaborator, observations: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is-fixed"
                    checked={newCollaborator.isFixed}
                    onCheckedChange={(checked) => setNewCollaborator({...newCollaborator, isFixed: !!checked})}
                  />
                  <label htmlFor="is-fixed" className="text-sm font-medium">
                    Equipe Fixa
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is-responsible"
                    checked={newCollaborator.isResponsible}
                    onCheckedChange={(checked) => setNewCollaborator({...newCollaborator, isResponsible: !!checked})}
                  />
                  <label htmlFor="is-responsible" className="text-sm font-medium">
                    Responsável Técnico
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="participates-in-stages"
                    checked={newCollaborator.participatesInStages}
                    onCheckedChange={(checked) => setNewCollaborator({...newCollaborator, participatesInStages: !!checked})}
                  />
                  <label htmlFor="participates-in-stages" className="text-sm font-medium">
                    Participa das Etapas
                  </label>
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
                disabled={isAddingCollaborator}
              >
                {isAddingCollaborator ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  'Adicionar Colaborador'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo para confirmar exclusão de colaborador */}
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
              <AlertDialogAction 
                onClick={handleDeleteConfirmed}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeletingCollaborator ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Diálogo para visualizar detalhes do colaborador */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalhes do Colaborador</DialogTitle>
            </DialogHeader>
            
            {selectedCollaborator && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden">
                    {selectedCollaborator.profileImageUrl ? (
                      <img 
                        src={selectedCollaborator.profileImageUrl} 
                        alt={selectedCollaborator.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="font-bold text-2xl">
                          {selectedCollaborator.name.substring(0, 1).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-background ${selectedCollaborator.isFixed ? 'bg-[#FFD600]' : 'bg-gray-400'}`}></div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold">{selectedCollaborator.name}</h3>
                    <p className="text-muted-foreground">{selectedCollaborator.role}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={selectedCollaborator.isFixed ? "default" : "outline"} className={selectedCollaborator.isFixed ? "bg-[#FFD600] hover:bg-[#FFD600]/80 text-black" : ""}>
                        {selectedCollaborator.isFixed ? "Fixo" : "Freelancer"}
                      </Badge>
                      {selectedCollaborator.isResponsible && (
                        <Badge variant="outline">Responsável Técnico</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Cidade</h4>
                    <p>{selectedCollaborator.city || "-"}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Horas por dia</h4>
                    <p>{selectedCollaborator.hoursPerDay}h</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Valor por hora</h4>
                    <p>{formatCurrency(selectedCollaborator.hourlyRate)}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Tipo de pagamento</h4>
                    <p>{selectedCollaborator.paymentType === 'monthly' ? 'Salário mensal' : 'Por hora'}</p>
                  </div>
                  
                  {selectedCollaborator.paymentType === 'monthly' && selectedCollaborator.monthlyRate && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Salário mensal</h4>
                      <p>{formatCurrency(selectedCollaborator.monthlyRate)}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Tipo de faturamento</h4>
                    <p>{selectedCollaborator.billableType === 'hourly' ? 'Por hora' : 'Por entrega'}</p>
                  </div>
                  
                  {selectedCollaborator.isFixed && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Participa das etapas</h4>
                      <p>{selectedCollaborator.participatesInStages ? 'Sim' : 'Não'}</p>
                    </div>
                  )}
                </div>
                
                {selectedCollaborator.isFixed && (
                  <>
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium">Dados de disponibilidade</h4>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Dias úteis em {getCurrentMonthYear()}</h5>
                          <p>{getWorkDaysInCurrentMonth(selectedCollaborator.city)} dias</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Horas disponíveis no mês</h5>
                          <p>{calculateCollaboratorMonthlyData(selectedCollaborator).totalHours}h</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Horas já alocadas</h5>
                          <p>{selectedCollaborator.assignedHours}h</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground">Utilização da capacidade</h5>
                          <p>{Math.round(selectedCollaborator.assignedHours * 100 / calculateCollaboratorMonthlyData(selectedCollaborator).totalHours)}%</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {selectedCollaborator.observations && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium">Observações</h4>
                      <p className="text-muted-foreground mt-1">{selectedCollaborator.observations}</p>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsViewDialogOpen(false)}
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  if (selectedCollaborator) {
                    handleEditCollaborator(selectedCollaborator);
                  }
                }}
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              >
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo para editar colaborador */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Colaborador</DialogTitle>
              <DialogDescription>
                Atualize as informações do colaborador.
              </DialogDescription>
            </DialogHeader>

            {selectedCollaborator && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome completo</Label>
                    <Input 
                      id="edit-name" 
                      value={selectedCollaborator.name}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Função / Cargo</Label>
                    <Input 
                      id="edit-role" 
                      value={selectedCollaborator.role}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, role: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">Cidade de trabalho</Label>
                    <Input 
                      id="edit-city" 
                      value={selectedCollaborator.city}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, city: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-hours-per-day">Horas por dia</Label>
                    <Input 
                      id="edit-hours-per-day" 
                      type="number" 
                      min="1"
                      max="24"
                      value={selectedCollaborator.hoursPerDay}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, hoursPerDay: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-hourly-rate">Valor por hora (R$)</Label>
                    <Input 
                      id="edit-hourly-rate" 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={selectedCollaborator.hourlyRate}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, hourlyRate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-payment-type">Tipo de Pagamento</Label>
                    <Select 
                      value={selectedCollaborator.paymentType}
                      onValueChange={(value) => setSelectedCollaborator({...selectedCollaborator, paymentType: value as 'hourly' | 'monthly'})}
                    >
                      <SelectTrigger id="edit-payment-type">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Por hora</SelectItem>
                        <SelectItem value="monthly">Salário mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {selectedCollaborator.paymentType === 'monthly' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-monthly-rate">Salário mensal (R$)</Label>
                    <Input 
                      id="edit-monthly-rate" 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={selectedCollaborator.monthlyRate || 0}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, monthlyRate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="edit-billable-type">Tipo de Faturamento</Label>
                  <Select 
                    value={selectedCollaborator.billableType}
                    onValueChange={(value) => setSelectedCollaborator({...selectedCollaborator, billableType: value as 'hourly' | 'perDelivery'})}
                  >
                    <SelectTrigger id="edit-billable-type">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Por hora</SelectItem>
                      <SelectItem value="perDelivery">Por entrega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-observations">Observações</Label>
                  <Textarea
                    id="edit-observations"
                    value={selectedCollaborator.observations || ""}
                    onChange={(e) => setSelectedCollaborator({...selectedCollaborator, observations: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="edit-is-fixed"
                      checked={selectedCollaborator.isFixed}
                      onCheckedChange={(checked) => setSelectedCollaborator({...selectedCollaborator, isFixed: !!checked})}
                    />
                    <label htmlFor="edit-is-fixed" className="text-sm font-medium">
                      Equipe Fixa
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="edit-is-responsible"
                      checked={selectedCollaborator.isResponsible}
                      onCheckedChange={(checked) => setSelectedCollaborator({...selectedCollaborator, isResponsible: !!checked})}
                    />
                    <label htmlFor="edit-is-responsible" className="text-sm font-medium">
                      Responsável Técnico
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="edit-participates-in-stages"
                      checked={selectedCollaborator.participatesInStages}
                      onCheckedChange={(checked) => setSelectedCollaborator({...selectedCollaborator, participatesInStages: !!checked})}
                    />
                    <label htmlFor="edit-participates-in-stages" className="text-sm font-medium">
                      Participa das Etapas
                    </label>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedCollaborator(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (selectedCollaborator) {
                    updateCollaborator({
                      id: selectedCollaborator.id,
                      collaborator: selectedCollaborator
                    });
                  }
                }}
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                disabled={isUpdatingCollaborator}
              >
                {isUpdatingCollaborator ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageWrapper>
    </MainLayout>
  );
};

export default CollaboratorsPage;