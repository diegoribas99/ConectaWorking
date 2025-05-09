import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Search, Edit, Menu, Eye, Users, Sparkles, Building, Clock, Calendar, FileText, Zap, DollarSign, BookText, Workflow } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ProjectAssistant from '@/components/ProjectAssistant';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
}

interface Project {
  id: number;
  name: string;
  clientId: number;
  client: Client;
  projectType: string;
  propertyType: string;
  address: string;
  area: number;
  detailLevel: string;
  deadline: string;
  contractValue: number;
  paymentMethod: string;
  projectStages: string[];
  technicalNotes: string;
  status: 'active' | 'completed' | 'paused' | 'canceled';
  progress?: number;
  currentStage?: string;
  completedStages?: string[];
}

// Lista de tipos de projeto disponíveis
const projectTypes = [
  'Residencial',
  'Comercial',
  'Corporativo',
  'Institucional',
  'Hotelaria',
  'Educacional',
  'Hospitalar',
  'Industrial',
  'Misto'
];

// Lista de tipos de propriedade disponíveis
const propertyTypes = [
  'Apartamento',
  'Casa',
  'Loja',
  'Escritório',
  'Consultório',
  'Restaurante',
  'Hotel',
  'Escola',
  'Hospital',
  'Galpão'
];

// Lista de níveis de detalhamento disponíveis
const detailLevels = [
  'Básico',
  'Executivo',
  'Premium'
];

// Lista de etapas de projeto disponíveis
const availableStages = [
  'Levantamento',
  'Estudo Preliminar',
  'Anteprojeto',
  'Projeto Básico',
  'Projeto Executivo',
  'Detalhamento',
  'Projeto Luminotécnico',
  'Projeto de Mobiliário',
  'Acompanhamento de Obra'
];

// Formatar valor em reais
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const ProjectsPageAI: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados para controle da interface
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isViewProjectDialogOpen, setIsViewProjectDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [useAIAssistant, setUseAIAssistant] = useState(false);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  
  // Estado para formulário de projeto
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    clientId: '',
    projectType: '',
    propertyType: '',
    address: '',
    area: '',
    detailLevel: '',
    deadline: '',
    contractValue: '',
    paymentMethod: '',
    projectStages: [] as string[],
    technicalNotes: ''
  });

  // Consulta para obter projetos
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      try {
        return await apiRequest<Project[]>('/api/users/1/projects');
      } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        return [];
      }
    }
  });

  // Consulta para obter clientes
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      try {
        return await apiRequest<Client[]>('/api/users/1/clients');
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        return [];
      }
    }
  });

  // Mutação para criar novo projeto
  const createProjectMutation = useMutation({
    mutationFn: async (newProject: any) => {
      return await apiRequest('/api/users/1/projects', {
        method: 'POST',
        data: newProject
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsNewProjectDialogOpen(false);
      resetProjectForm();
      toast({
        title: "Projeto criado",
        description: "O projeto foi cadastrado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o projeto. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutação para atualizar projeto
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/users/1/projects/${id}`, {
        method: 'PATCH',
        data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsEditMode(false);
      toast({
        title: "Projeto atualizado",
        description: "Os dados do projeto foram atualizados com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o projeto. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutação para atualizar status do projeto
  const updateProjectStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'completed' | 'paused' | 'canceled' }) => {
      return await apiRequest(`/api/users/1/projects/${id}`, {
        method: 'PATCH',
        data: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Status alterado",
        description: "O status do projeto foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao alterar status do projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do projeto. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Filtrar projetos com base na busca e aba ativa
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && project.status === 'active';
    if (activeTab === 'completed') return matchesSearch && project.status === 'completed';
    if (activeTab === 'other') return matchesSearch && (project.status === 'paused' || project.status === 'canceled');
    
    return false;
  });

  // Manipuladores de formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectFormData({
      ...projectFormData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setProjectFormData({
      ...projectFormData,
      [name]: value
    });

    if (name === 'clientId') {
      setSelectedClient(Number(value));
    }
  };

  const handleStageToggle = (stage: string) => {
    setProjectFormData(prev => {
      const updatedStages = prev.projectStages.includes(stage)
        ? prev.projectStages.filter(s => s !== stage)
        : [...prev.projectStages, stage];
      
      return {
        ...prev,
        projectStages: updatedStages
      };
    });
  };

  // Criar novo projeto
  const handleCreateProject = () => {
    const formattedProject = {
      ...projectFormData,
      clientId: Number(projectFormData.clientId),
      area: Number(projectFormData.area),
      contractValue: Number(projectFormData.contractValue),
      status: 'active' as const
    };

    createProjectMutation.mutate(formattedProject);
  };

  // Atualizar projeto existente
  const handleUpdateProject = () => {
    if (!selectedProject) return;
    
    const formattedProject = {
      ...projectFormData,
      clientId: Number(projectFormData.clientId),
      area: Number(projectFormData.area),
      contractValue: Number(projectFormData.contractValue)
    };

    updateProjectMutation.mutate({
      id: selectedProject.id,
      data: formattedProject
    });
  };

  // Atualizar partes específicas do projeto (como sugestões da IA)
  const handleUpdateProjectPartial = (partialData: any) => {
    if (!selectedProject) return;
    
    updateProjectMutation.mutate({
      id: selectedProject.id,
      data: partialData
    });
    
    // Atualizar também os dados do formulário local
    setProjectFormData(prev => ({
      ...prev,
      ...partialData
    }));
    
    toast({
      title: "Sugestões aplicadas",
      description: "As sugestões da IA foram aplicadas ao projeto.",
    });
  };

  // Alterar o status do projeto
  const updateProjectStatus = (id: number, status: 'active' | 'completed' | 'paused' | 'canceled') => {
    updateProjectStatusMutation.mutate({ id, status });
  };

  // Abrir diálogo de visualização de projeto
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setProjectFormData({
      name: project.name,
      clientId: String(project.clientId),
      projectType: project.projectType,
      propertyType: project.propertyType,
      address: project.address,
      area: String(project.area),
      detailLevel: project.detailLevel,
      deadline: project.deadline,
      contractValue: String(project.contractValue),
      paymentMethod: project.paymentMethod,
      projectStages: project.projectStages,
      technicalNotes: project.technicalNotes
    });
    setIsEditMode(false);
    setIsViewProjectDialogOpen(true);
  };

  // Limpar formulário
  const resetProjectForm = () => {
    setProjectFormData({
      name: '',
      clientId: '',
      projectType: '',
      propertyType: '',
      address: '',
      area: '',
      detailLevel: '',
      deadline: '',
      contractValue: '',
      paymentMethod: '',
      projectStages: [],
      technicalNotes: ''
    });
    setSelectedClient(null);
  };

  // Obter status do projeto para exibição visual
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Em andamento
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
            Concluído
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
            Pausado
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
            {status}
          </span>
        );
    }
  };

  // Calcular progresso do projeto com base nas etapas concluídas
  const calculateProgress = (project: Project): number => {
    if (!project.projectStages || project.projectStages.length === 0) return 0;
    if (!project.completedStages || project.completedStages.length === 0) return 0;
    
    return Math.round((project.completedStages.length / project.projectStages.length) * 100);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          Cadastro de Projetos
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar projeto..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              resetProjectForm();
              setIsNewProjectDialogOpen(true);
            }}
            className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center">
        <div className="flex items-center space-x-2 mr-6">
          <Switch
            id="ai-assistant"
            checked={useAIAssistant}
            onCheckedChange={setUseAIAssistant}
          />
          <Label htmlFor="ai-assistant" className="flex items-center">
            <Sparkles className="h-4 w-4 text-[#FFD600] mr-1" />
            Assistente de IA
          </Label>
        </div>
        
        {useAIAssistant && (
          <p className="text-xs text-muted-foreground">
            O assistente de IA fornecerá descrições, sugestões de etapas e próximos passos para seus projetos.
          </p>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Em andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
          <TabsTrigger value="other">Pausados/Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="w-full">
          <ProjectTable 
            projects={filteredProjects} 
            onViewProject={handleViewProject}
            getStatusBadge={getStatusBadge}
            calculateProgress={calculateProgress}
            isLoading={isLoadingProjects}
          />
        </TabsContent>
        <TabsContent value="active" className="w-full">
          <ProjectTable 
            projects={filteredProjects} 
            onViewProject={handleViewProject}
            getStatusBadge={getStatusBadge}
            calculateProgress={calculateProgress}
            isLoading={isLoadingProjects}
          />
        </TabsContent>
        <TabsContent value="completed" className="w-full">
          <ProjectTable 
            projects={filteredProjects}
            onViewProject={handleViewProject}
            getStatusBadge={getStatusBadge}
            calculateProgress={calculateProgress}
            isLoading={isLoadingProjects}
          />
        </TabsContent>
        <TabsContent value="other" className="w-full">
          <ProjectTable 
            projects={filteredProjects} 
            onViewProject={handleViewProject}
            getStatusBadge={getStatusBadge}
            calculateProgress={calculateProgress}
            isLoading={isLoadingProjects}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar novo projeto */}
      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent className="max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Projeto</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo com as informações do projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[calc(85vh-200px)] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome do Projeto <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={projectFormData.name}
                  onChange={handleInputChange}
                  placeholder="Nome interno do projeto"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="clientId" className="text-sm font-medium">
                  Cliente Vinculado <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={projectFormData.clientId} 
                  onValueChange={(value) => handleSelectChange('clientId', value)}
                  required
                >
                  <SelectTrigger id="clientId">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClient && (
                <div className="md:col-span-2 bg-black/5 dark:bg-white/5 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#FFD600]" />
                    <h3 className="text-sm font-medium">Dados do Cliente</h3>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    {clients.filter(c => c.id === selectedClient).map(client => (
                      <React.Fragment key={client.id}>
                        <div>
                          <span className="text-muted-foreground">Nome:</span> {client.name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span> {client.email}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Telefone:</span> {client.phone}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="projectType" className="text-sm font-medium">
                  Tipo de Projeto <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={projectFormData.projectType} 
                  onValueChange={(value) => handleSelectChange('projectType', value)}
                  required
                >
                  <SelectTrigger id="projectType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="propertyType" className="text-sm font-medium">
                  Tipo de Imóvel <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={projectFormData.propertyType} 
                  onValueChange={(value) => handleSelectChange('propertyType', value)}
                  required
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Endereço do Imóvel
                </label>
                <Input
                  id="address"
                  name="address"
                  value={projectFormData.address}
                  onChange={handleInputChange}
                  placeholder="Endereço completo do imóvel"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="area" className="text-sm font-medium">
                  Área (m²) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  value={projectFormData.area}
                  onChange={handleInputChange}
                  placeholder="Ex: 120"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="detailLevel" className="text-sm font-medium">
                  Nível de Detalhamento <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={projectFormData.detailLevel} 
                  onValueChange={(value) => handleSelectChange('detailLevel', value)}
                  required
                >
                  <SelectTrigger id="detailLevel">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {detailLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="deadline" className="text-sm font-medium">
                  Data de Entrega Prevista
                </label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={projectFormData.deadline}
                  onChange={handleInputChange}
                  placeholder="Data de entrega"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contractValue" className="text-sm font-medium">
                  Valor do Contrato (R$)
                </label>
                <Input
                  id="contractValue"
                  name="contractValue"
                  type="number"
                  value={projectFormData.contractValue}
                  onChange={handleInputChange}
                  placeholder="Ex: 15000"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="paymentMethod" className="text-sm font-medium">
                  Forma de Pagamento
                </label>
                <Textarea
                  id="paymentMethod"
                  name="paymentMethod"
                  value={projectFormData.paymentMethod}
                  onChange={handleInputChange}
                  placeholder="Ex: 50% entrada, 25% na entrega do anteprojeto, 25% na entrega final"
                  rows={2}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">
                  Etapas do Projeto
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-md">
                  {availableStages.map(stage => (
                    <div key={stage} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`stage-${stage}`}
                        checked={projectFormData.projectStages.includes(stage)}
                        onCheckedChange={() => handleStageToggle(stage)}
                      />
                      <label
                        htmlFor={`stage-${stage}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {stage}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="technicalNotes" className="text-sm font-medium">
                  Observações Técnicas
                </label>
                <Textarea
                  id="technicalNotes"
                  name="technicalNotes"
                  value={projectFormData.technicalNotes}
                  onChange={handleInputChange}
                  placeholder="Informações técnicas ou especificações especiais"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateProject}
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? 'Cadastrando...' : 'Cadastrar Projeto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar/editar projeto */}
      <Dialog open={isViewProjectDialogOpen} onOpenChange={setIsViewProjectDialogOpen}>
        {selectedProject && (
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center">
                  {selectedProject.name}
                  {useAIAssistant && <Sparkles className="h-4 w-4 text-[#FFD600] ml-2" />}
                </DialogTitle>
                <div>
                  {getStatusBadge(selectedProject.status)}
                </div>
              </div>
              <DialogDescription className="flex justify-between items-center">
                <span>ID: {selectedProject.id}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {isEditMode ? 'Cancelar Edição' : 'Editar'}
                  </Button>
                  
                  {selectedProject.status !== 'completed' && (
                    <Select 
                      defaultValue={selectedProject.status} 
                      onValueChange={(value: 'active' | 'completed' | 'paused' | 'canceled') => 
                        updateProjectStatus(selectedProject.id, value)
                      }
                    >
                      <SelectTrigger className="h-9 w-[180px]">
                        <SelectValue placeholder="Alterar status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Em andamento</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="paused">Pausado</SelectItem>
                        <SelectItem value="canceled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Modo de Visualização */}
              {!isEditMode ? (
                <div className="grid grid-cols-1 gap-6">
                  {/* Resumo do Projeto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Informações do Projeto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Tipo de Projeto</h3>
                          <p className="text-sm">{selectedProject.projectType}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Tipo de Imóvel</h3>
                          <p className="text-sm">{selectedProject.propertyType}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Área</h3>
                          <p className="text-sm">{selectedProject.area} m²</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Nível de Detalhamento</h3>
                          <p className="text-sm">{selectedProject.detailLevel}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Cliente e Endereço
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Cliente</h3>
                          <p className="text-sm">{selectedProject.client.name}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Contato</h3>
                          <p className="text-sm">{selectedProject.client.email} | {selectedProject.client.phone}</p>
                        </div>
                        {selectedProject.address && (
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground">Endereço do Imóvel</h3>
                            <p className="text-sm">{selectedProject.address}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Prazos e Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedProject.deadline && (
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground">Data de Entrega Prevista</h3>
                            <p className="text-sm">{new Date(selectedProject.deadline).toLocaleDateString('pt-BR')}</p>
                          </div>
                        )}
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Progresso</h3>
                          <div className="mt-2">
                            <Progress value={calculateProgress(selectedProject)} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {calculateProgress(selectedProject)}% concluído
                            </p>
                          </div>
                        </div>
                        {selectedProject.currentStage && (
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground">Etapa Atual</h3>
                            <Badge variant="outline" className="mt-1">
                              {selectedProject.currentStage}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Informações Financeiras
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Valor do Contrato</h3>
                          <p className="text-sm font-medium">{formatCurrency(selectedProject.contractValue)}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Forma de Pagamento</h3>
                          <p className="text-sm">{selectedProject.paymentMethod}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Etapas do Projeto */}
                    <Card className="md:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Workflow className="h-4 w-4 mr-2" />
                          Etapas do Projeto
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {selectedProject.projectStages.map((stage, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`view-stage-${index}`}
                                checked={selectedProject.completedStages?.includes(stage) || false}
                                disabled
                              />
                              <label
                                htmlFor={`view-stage-${index}`}
                                className={`text-sm leading-none ${
                                  selectedProject.completedStages?.includes(stage) 
                                    ? 'line-through text-muted-foreground' 
                                    : ''
                                }`}
                              >
                                {stage}
                              </label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Observações Técnicas */}
                    {selectedProject.technicalNotes && (
                      <Card className="md:col-span-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <BookText className="h-4 w-4 mr-2" />
                            Observações Técnicas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-line">{selectedProject.technicalNotes}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {/* Assistente IA */}
                  {useAIAssistant && (
                    <ProjectAssistant 
                      project={selectedProject} 
                      className="md:col-span-2 mt-2"
                      onUpdateProject={handleUpdateProjectPartial}
                    />
                  )}
                </div>
              ) : (
                /* Modo de Edição */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-name" className="text-sm font-medium">
                      Nome do Projeto <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={projectFormData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="edit-clientId" className="text-sm font-medium">
                      Cliente Vinculado <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={projectFormData.clientId} 
                      onValueChange={(value) => handleSelectChange('clientId', value)}
                      required
                    >
                      <SelectTrigger id="edit-clientId">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-projectType" className="text-sm font-medium">
                      Tipo de Projeto <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={projectFormData.projectType} 
                      onValueChange={(value) => handleSelectChange('projectType', value)}
                      required
                    >
                      <SelectTrigger id="edit-projectType">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-propertyType" className="text-sm font-medium">
                      Tipo de Imóvel <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={projectFormData.propertyType} 
                      onValueChange={(value) => handleSelectChange('propertyType', value)}
                      required
                    >
                      <SelectTrigger id="edit-propertyType">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="edit-address" className="text-sm font-medium">
                      Endereço do Imóvel
                    </label>
                    <Input
                      id="edit-address"
                      name="address"
                      value={projectFormData.address}
                      onChange={handleInputChange}
                      placeholder="Endereço completo do imóvel"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-area" className="text-sm font-medium">
                      Área (m²) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="edit-area"
                      name="area"
                      type="number"
                      value={projectFormData.area}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-detailLevel" className="text-sm font-medium">
                      Nível de Detalhamento <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={projectFormData.detailLevel} 
                      onValueChange={(value) => handleSelectChange('detailLevel', value)}
                      required
                    >
                      <SelectTrigger id="edit-detailLevel">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {detailLevels.map(level => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-deadline" className="text-sm font-medium">
                      Data de Entrega Prevista
                    </label>
                    <Input
                      id="edit-deadline"
                      name="deadline"
                      type="date"
                      value={projectFormData.deadline}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-contractValue" className="text-sm font-medium">
                      Valor do Contrato (R$)
                    </label>
                    <Input
                      id="edit-contractValue"
                      name="contractValue"
                      type="number"
                      value={projectFormData.contractValue}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="edit-paymentMethod" className="text-sm font-medium">
                      Forma de Pagamento
                    </label>
                    <Textarea
                      id="edit-paymentMethod"
                      name="paymentMethod"
                      value={projectFormData.paymentMethod}
                      onChange={handleInputChange}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Etapas do Projeto
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-md">
                      {availableStages.map(stage => (
                        <div key={stage} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-stage-${stage}`}
                            checked={projectFormData.projectStages.includes(stage)}
                            onCheckedChange={() => handleStageToggle(stage)}
                          />
                          <label
                            htmlFor={`edit-stage-${stage}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {stage}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="edit-technicalNotes" className="text-sm font-medium">
                      Observações Técnicas
                    </label>
                    <Textarea
                      id="edit-technicalNotes"
                      name="technicalNotes"
                      value={projectFormData.technicalNotes}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditMode(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleUpdateProject}
                      className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                      disabled={updateProjectMutation.isPending}
                    >
                      {updateProjectMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

// Componente para a Tabela de Projetos
interface ProjectTableProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  getStatusBadge: (status: string) => JSX.Element;
  calculateProgress: (project: Project) => number;
  isLoading: boolean;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ 
  projects, 
  onViewProject,
  getStatusBadge,
  calculateProgress,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="w-full space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="w-full h-16" />
        ))}
      </div>
    );
  }
  
  if (projects.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card">
        <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Não há projetos cadastrados que correspondam aos critérios de busca.
        </p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="hidden lg:table-cell">Área</TableHead>
            <TableHead className="hidden lg:table-cell">Nível</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="group">
              <TableCell className="font-medium">
                <div>
                  {project.name}
                  {project.progress !== undefined && (
                    <Progress value={calculateProgress(project)} className="h-1 mt-1.5" />
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{project.client.name}</TableCell>
              <TableCell>{project.projectType}</TableCell>
              <TableCell className="hidden lg:table-cell">{project.area} m²</TableCell>
              <TableCell className="hidden lg:table-cell">{project.detailLevel}</TableCell>
              <TableCell>{getStatusBadge(project.status)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewProject(project)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectsPageAI;