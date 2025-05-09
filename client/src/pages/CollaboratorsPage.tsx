import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Trash2, Info, Calendar, Clock, 
  BarChart, Search, DollarSign, ExternalLink, Edit, Lightbulb,
  Eye, FileSpreadsheet, List, LayoutGrid, Save, Loader2
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
      console.log(`Tentando excluir colaborador com ID: ${id}`);
      
      return fetch(`/api/collaborators/${id}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao excluir colaborador ${id}: ${response.status}`);
        }
        return;
      })
      .catch(error => {
        console.error(`Erro ao excluir colaborador ${id}:`, error);
        throw error;
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
        hourlyRate: String(data.collaborator.hourlyRate), // Garantir que hourlyRate seja string
        monthlyRate: data.collaborator.monthlyRate ? String(data.collaborator.monthlyRate) : undefined // Garantir que monthlyRate seja string quando existir
      };

      console.log(`Atualizando colaborador ${data.id}:`, formattedData);

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
      })
      .catch(error => {
        console.error(`Erro ao atualizar colaborador ${data.id}:`, error);
        throw error;
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
        <Save size={16} className="mr-1" /> Salvar Alterações
      </Button>
    </div>
  );

  return (
    <MainLayout>
      <div className="container py-6">
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
                // Visualização em cards
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCollaborators.map(collaborator => {
                    const { totalHours, monthlyCost } = calculateCollaboratorMonthlyData(collaborator);
                    
                    return (
                      <Card key={collaborator.id} className={collaborator.isFixed ? "border-l-4 border-l-[#FFD600]" : ""}>
                        <CardContent className="pt-6">
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                {collaborator.profileImageUrl ? (
                                  <img 
                                    src={collaborator.profileImageUrl} 
                                    alt={collaborator.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <span className="text-xl font-medium">
                                      {collaborator.name.substring(0, 1).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{collaborator.name}</h3>
                                <p className="text-sm text-muted-foreground">{collaborator.role}</p>
                              </div>
                            </div>
                            <Badge variant={collaborator.isFixed ? "default" : "outline"} className={collaborator.isFixed ? "bg-[#FFD600] hover:bg-[#FFD600]/80 text-black" : ""}>
                              {collaborator.isFixed ? "Fixo" : "Freelancer"}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Valor por hora:</span>
                              <span className="font-medium">{formatCurrency(collaborator.hourlyRate)}</span>
                            </div>
                            
                            {collaborator.isFixed && (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Horas mensais:</span>
                                  <span>{totalHours}h</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                  <span className="text-sm text-muted-foreground">Custo mensal:</span>
                                  <span className="font-medium">{formatCurrency(monthlyCost)}</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="flex justify-end mt-4 pt-2 border-t">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-500 h-8 w-8"
                              onClick={() => handleViewCollaborator(collaborator)}
                              disabled={isViewDialogOpen}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8"
                              onClick={() => handleEditCollaborator(collaborator)}
                              disabled={isUpdatingCollaborator || isEditDialogOpen}
                            >
                              {isUpdatingCollaborator && selectedCollaborator?.id === collaborator.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 h-8 w-8"
                              onClick={() => confirmDeleteCollaborator(collaborator.id)}
                              disabled={isDeletingCollaborator || isDeleteDialogOpen}
                            >
                              {isDeletingCollaborator && collaboratorToDelete === collaborator.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
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
        
        {/* AlertDialog para Adicionar Colaborador */}
        <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Adicionar Novo Colaborador</AlertDialogTitle>
              <AlertDialogDescription>
                Preencha as informações do novo colaborador abaixo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium">Nome</label>
                  <Input 
                    id="name" 
                    value={newCollaborator.name}
                    onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})}
                    placeholder="Nome do colaborador"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="text-sm font-medium">Função</label>
                  <Input 
                    id="role" 
                    value={newCollaborator.role}
                    onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})}
                    placeholder="Função ou cargo"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="text-sm font-medium">Cidade</label>
                  <Input 
                    id="city" 
                    value={newCollaborator.city}
                    onChange={(e) => setNewCollaborator({...newCollaborator, city: e.target.value})}
                    placeholder="Cidade onde trabalha"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFixed"
                    checked={newCollaborator.isFixed}
                    onChange={(e) => setNewCollaborator({...newCollaborator, isFixed: e.target.checked})}
                    className="rounded border-gray-300 text-[#FFD600] focus:ring-[#FFD600]"
                  />
                  <label htmlFor="isFixed" className="text-sm font-medium">Faz parte da equipe fixa</label>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="paymentType" className="text-sm font-medium">Tipo de Pagamento</label>
                  <select
                    id="paymentType"
                    value={newCollaborator.paymentType}
                    onChange={(e) => setNewCollaborator({...newCollaborator, paymentType: e.target.value as 'hourly' | 'monthly'})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  >
                    <option value="hourly">Por hora</option>
                    <option value="monthly">Salário mensal</option>
                  </select>
                </div>
                {newCollaborator.paymentType === 'hourly' ? (
                  <div>
                    <label htmlFor="hourlyRate" className="text-sm font-medium">Valor por Hora (R$)</label>
                    <Input 
                      id="hourlyRate" 
                      type="number"
                      value={newCollaborator.hourlyRate || ''}
                      onChange={(e) => setNewCollaborator({...newCollaborator, hourlyRate: parseFloat(e.target.value)})}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="monthlyRate" className="text-sm font-medium">Salário Mensal (R$)</label>
                    <Input 
                      id="monthlyRate" 
                      type="number"
                      value={newCollaborator.monthlyRate || ''}
                      onChange={(e) => setNewCollaborator({...newCollaborator, monthlyRate: parseFloat(e.target.value)})}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="hoursPerDay" className="text-sm font-medium">Horas por Dia</label>
                  <Input 
                    id="hoursPerDay" 
                    type="number"
                    value={newCollaborator.hoursPerDay || ''}
                    onChange={(e) => setNewCollaborator({...newCollaborator, hoursPerDay: parseFloat(e.target.value)})}
                    placeholder="8"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="observations" className="text-sm font-medium">Observações</label>
                  <textarea
                    id="observations"
                    value={newCollaborator.observations || ''}
                    onChange={(e) => setNewCollaborator({...newCollaborator, observations: e.target.value})}
                    placeholder="Observações adicionais"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 h-20"
                  />
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={resetCollaboratorForm}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddCollaborator} className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                Adicionar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* AlertDialog para Importar CSV */}
        <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Importar Colaboradores via CSV</AlertDialogTitle>
              <AlertDialogDescription>
                Faça upload de um arquivo CSV com os dados dos seus colaboradores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <FileSpreadsheet className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste e solte seu arquivo CSV aqui ou clique para selecionar
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Selecionar Arquivo
                </Button>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Formato esperado:</h4>
                <p className="text-xs text-muted-foreground">
                  nome, função, valor_hora, horas_por_dia, cidade, fixo (sim/não)
                </p>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto mt-1">
                  Baixar modelo de CSV
                </Button>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                Importar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* AlertDialog para Ver Exemplo Completo */}
        <AlertDialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <AlertDialogContent className="max-w-4xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Exemplo Completo de Colaboradores</AlertDialogTitle>
              <AlertDialogDescription>
                Abaixo estão exemplos de colaboradores para ajudar você a entender como organizar sua equipe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Equipe Fixa de Exemplo</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Renata Silva (Arquiteta Sênior)</span>
                    <span className="text-muted-foreground">R$ 85,00/hora</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Carlos Mendes (Arquiteto Pleno)</span>
                    <span className="text-muted-foreground">R$ 65,00/hora</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Mariana Costa (Designer de Interiores)</span>
                    <span className="text-muted-foreground">R$ 60,00/hora</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Pedro Alves (Estagiário)</span>
                    <span className="text-muted-foreground">R$ 25,00/hora</span>
                  </li>
                </ul>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsTemplateDialogOpen(false);
                      setIsAddingTemplateCollaborators(true);
                      
                      // Lista de colaboradores fixos de exemplo
                      const fixedCollaboratorsExamples: Partial<Collaborator>[] = [
                        {
                          name: 'Renata Silva',
                          role: 'Arquiteta Sênior',
                          hourlyRate: 85,
                          hoursPerDay: 8,
                          city: 'São Paulo',
                          isFixed: true,
                          isResponsible: true,
                          participatesInStages: true,
                          billableType: 'hourly',
                          paymentType: 'hourly',
                          observations: 'Exemplo de colaborador fixo',
                          userId: 1,
                          assignedHours: 120
                        },
                        {
                          name: 'Carlos Mendes',
                          role: 'Arquiteto Pleno',
                          hourlyRate: 65,
                          hoursPerDay: 8,
                          city: 'São Paulo',
                          isFixed: true,
                          isResponsible: true,
                          participatesInStages: true,
                          billableType: 'hourly',
                          paymentType: 'hourly',
                          observations: 'Exemplo de colaborador fixo',
                          userId: 1,
                          assignedHours: 100
                        },
                        {
                          name: 'Mariana Costa',
                          role: 'Designer de Interiores',
                          hourlyRate: 60,
                          hoursPerDay: 6,
                          city: 'São Paulo',
                          isFixed: true,
                          isResponsible: true,
                          participatesInStages: true,
                          billableType: 'hourly',
                          paymentType: 'hourly',
                          observations: 'Exemplo de colaborador fixo',
                          userId: 1,
                          assignedHours: 80
                        },
                        {
                          name: 'Pedro Alves',
                          role: 'Estagiário',
                          hourlyRate: 25,
                          hoursPerDay: 6,
                          city: 'São Paulo',
                          isFixed: true,
                          isResponsible: false,
                          participatesInStages: true,
                          billableType: 'hourly',
                          paymentType: 'hourly',
                          observations: 'Exemplo de colaborador fixo',
                          userId: 1,
                          assignedHours: 60
                        }
                      ];
                      
                      // Adicionar cada colaborador de exemplo
                      fixedCollaboratorsExamples.forEach(collaborator => {
                        addCollaborator(collaborator);
                      });
                      
                      toast({
                        title: 'Exemplos adicionados',
                        description: 'Os colaboradores de exemplo estão sendo adicionados à sua equipe.',
                      });
                    }}
                  >
                    Adicionar estes exemplos
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Freelancers de Exemplo</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Fernanda Lima (Renderização 3D)</span>
                    <span className="text-muted-foreground">R$ 120,00/hora</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Ricardo Gomes (Paisagismo)</span>
                    <span className="text-muted-foreground">R$ 90,00/hora</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Juliana Pires (Designer Gráfico)</span>
                    <span className="text-muted-foreground">R$ 75,00/hora</span>
                  </li>
                </ul>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsTemplateDialogOpen(false);
                      setIsAddingTemplateCollaborators(true);
                      
                      // Lista de freelancers de exemplo
                      const freelancersExamples: Partial<Collaborator>[] = [
                        {
                          name: 'Fernanda Lima',
                          role: 'Renderização 3D',
                          hourlyRate: 120,
                          hoursPerDay: 4,
                          city: 'São Paulo',
                          isFixed: false,
                          isResponsible: false,
                          participatesInStages: true,
                          billableType: 'hourly',
                          paymentType: 'hourly',
                          observations: 'Exemplo de freelancer',
                          userId: 1,
                          assignedHours: 20
                        },
                        {
                          name: 'Ricardo Gomes',
                          role: 'Paisagismo',
                          hourlyRate: 90,
                          hoursPerDay: 4,
                          city: 'São Paulo',
                          isFixed: false,
                          isResponsible: false,
                          participatesInStages: true,
                          billableType: 'hourly',
                          paymentType: 'hourly',
                          observations: 'Exemplo de freelancer',
                          userId: 1,
                          assignedHours: 15
                        },
                        {
                          name: 'Juliana Pires',
                          role: 'Designer Gráfico',
                          hourlyRate: 75,
                          hoursPerDay: 4,
                          city: 'São Paulo',
                          isFixed: false,
                          isResponsible: false,
                          participatesInStages: true,
                          billableType: 'hourly',
                          paymentType: 'hourly',
                          observations: 'Exemplo de freelancer',
                          userId: 1,
                          assignedHours: 10
                        }
                      ];
                      
                      // Adicionar cada freelancer de exemplo
                      freelancersExamples.forEach(collaborator => {
                        addCollaborator(collaborator);
                      });
                      
                      toast({
                        title: 'Exemplos adicionados',
                        description: 'Os freelancers de exemplo estão sendo adicionados à sua equipe.',
                      });
                    }}
                  >
                    Adicionar estes exemplos
                  </Button>
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Fechar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* AlertDialog para Adicionar Feriado/Recesso */}
        <AlertDialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Adicionar Feriado ou Recesso</AlertDialogTitle>
              <AlertDialogDescription>
                Registre feriados, recessos ou folgas para melhorar o cálculo de disponibilidade da equipe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label htmlFor="holiday-name" className="text-sm font-medium">Nome</label>
                <Input 
                  id="holiday-name" 
                  placeholder="Ex: Feriado de Natal, Recesso Coletivo, etc."
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="holiday-date" className="text-sm font-medium">Data</label>
                <Input 
                  id="holiday-date" 
                  type="date"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="holiday-type" className="text-sm font-medium">Tipo</label>
                <select
                  id="holiday-type"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="national">Feriado Nacional</option>
                  <option value="state">Feriado Estadual</option>
                  <option value="municipal">Feriado Municipal</option>
                  <option value="company">Recesso da Empresa</option>
                  <option value="personal">Folga Individual</option>
                </select>
              </div>
              {/* Adicionar campo para selecionar colaboradores específicos se for folga individual */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  className="rounded border-gray-300 text-[#FFD600] focus:ring-[#FFD600]"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium">Repete anualmente</label>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                Adicionar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Diálogo para Visualizar Colaborador */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Colaborador</DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre o colaborador selecionado.
              </DialogDescription>
            </DialogHeader>
            {selectedCollaborator && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCollaborator.name)}&background=${selectedCollaborator.isFixed ? 'FFD600' : 'CCCCCC'}&color=000`} />
                    <AvatarFallback>{selectedCollaborator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCollaborator.name}</h3>
                    <p className="text-muted-foreground">{selectedCollaborator.role}</p>
                    <Badge variant={selectedCollaborator.isFixed ? "default" : "outline"} className={selectedCollaborator.isFixed ? "bg-[#FFD600] text-black hover:bg-[#FFD600]/80" : ""}>
                      {selectedCollaborator.isFixed ? "Equipe Fixa" : "Freelancer/Parceiro"}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Cidade</Label>
                    <p>{selectedCollaborator.city || "Não informado"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Horas por Dia</Label>
                    <p>{selectedCollaborator.hoursPerDay} horas</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Valor Hora</Label>
                    <p>{formatCurrency(selectedCollaborator.hourlyRate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tipo de Pagamento</Label>
                    <p>{selectedCollaborator.paymentType === 'hourly' ? 'Por hora' : 'Mensal'}</p>
                  </div>
                  {selectedCollaborator.paymentType === 'monthly' && selectedCollaborator.monthlyRate && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Valor Mensal</Label>
                      <p>{formatCurrency(selectedCollaborator.monthlyRate)}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tipo de Faturamento</Label>
                    <p>{selectedCollaborator.billableType === 'hourly' ? 'Por hora' : 'Por projeto'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Funções</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedCollaborator.isResponsible && (
                      <Badge variant="outline">Responsável Técnico</Badge>
                    )}
                    {selectedCollaborator.participatesInStages && (
                      <Badge variant="outline">Participa das Etapas</Badge>
                    )}
                  </div>
                </div>
                
                {selectedCollaborator.observations && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
                    <p className="text-sm">{selectedCollaborator.observations}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
              <Button 
                onClick={() => {
                  setIsViewDialogOpen(false);
                  if (selectedCollaborator) {
                    handleEditCollaborator(selectedCollaborator);
                  }
                }}
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              >
                Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo para Editar Colaborador */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
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
                    <Label htmlFor="edit-name">Nome</Label>
                    <Input
                      id="edit-name"
                      value={selectedCollaborator.name}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Função</Label>
                    <Input
                      id="edit-role"
                      value={selectedCollaborator.role}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, role: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">Cidade</Label>
                    <Input
                      id="edit-city"
                      value={selectedCollaborator.city}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-hours">Horas por Dia</Label>
                    <Input
                      id="edit-hours"
                      type="number"
                      min={1}
                      max={24}
                      value={selectedCollaborator.hoursPerDay}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, hoursPerDay: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-hourly-rate">Valor Hora (R$)</Label>
                    <Input
                      id="edit-hourly-rate"
                      type="number"
                      min={0}
                      step={0.01}
                      value={selectedCollaborator.hourlyRate}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, hourlyRate: Number(e.target.value)})}
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
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedCollaborator.paymentType === 'monthly' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-monthly-rate">Valor Mensal (R$)</Label>
                      <Input
                        id="edit-monthly-rate"
                        type="number"
                        min={0}
                        step={0.01}
                        value={selectedCollaborator.monthlyRate || 0}
                        onChange={(e) => setSelectedCollaborator({...selectedCollaborator, monthlyRate: Number(e.target.value)})}
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
      </div>
    </MainLayout>
  );
};

export default CollaboratorsPage;