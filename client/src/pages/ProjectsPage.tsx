import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Search, Edit, FileCog, FileText, Calendar, Building, DollarSign, SquareUser, Eye } from 'lucide-react';

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
}

// Lista de clientes existentes para selecionar
const mockClients: Client[] = [
  {
    id: 1,
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 98765-4321',
    city: 'São Paulo/SP'
  },
  {
    id: 2,
    name: 'Empresa ABC Ltda',
    email: 'contato@empresaabc.com',
    phone: '(11) 3456-7890',
    city: 'São Paulo/SP'
  },
  {
    id: 3,
    name: 'Pedro Santos',
    email: 'pedro.santos@email.com',
    phone: '(11) 91234-5678',
    city: 'São Paulo/SP'
  }
];

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Reforma Apartamento Jardins',
    clientId: 1,
    client: mockClients[0],
    projectType: 'Residencial',
    propertyType: 'Apartamento',
    address: 'Rua das Flores, 123 - Jardins, São Paulo/SP',
    area: 120,
    detailLevel: 'Executivo',
    deadline: '2023-10-15',
    contractValue: 15000,
    paymentMethod: '50% entrada, 25% na entrega do anteprojeto, 25% na entrega final',
    projectStages: ['Levantamento', 'Estudo Preliminar', 'Anteprojeto', 'Projeto Executivo', 'Detalhamento'],
    technicalNotes: 'Cliente solicita atenção especial à iluminação da sala de estar.',
    status: 'active'
  },
  {
    id: 2,
    name: 'Loja Comercial Shopping',
    clientId: 2,
    client: mockClients[1],
    projectType: 'Comercial',
    propertyType: 'Loja',
    address: 'Shopping Center Plaza, Loja 42 - São Paulo/SP',
    area: 85,
    detailLevel: 'Executivo',
    deadline: '2023-08-30',
    contractValue: 22000,
    paymentMethod: '30% entrada, 40% na aprovação do projeto, 30% na entrega final',
    projectStages: ['Briefing', 'Layout', 'Projeto Luminotécnico', 'Projeto de Mobiliário', 'Detalhamento Técnico'],
    technicalNotes: 'Necessário adequar o projeto às normas do shopping.',
    status: 'completed'
  },
  {
    id: 3,
    name: 'Casa de Praia',
    clientId: 3,
    client: mockClients[2],
    projectType: 'Residencial',
    propertyType: 'Casa',
    address: 'Rua da Praia, 78 - Guarujá/SP',
    area: 180,
    detailLevel: 'Básico',
    deadline: '2023-12-20',
    contractValue: 18000,
    paymentMethod: '40% entrada, 30% na entrega do anteprojeto, 30% na entrega final',
    projectStages: ['Estudo Preliminar', 'Anteprojeto', 'Projeto Básico'],
    technicalNotes: 'Cliente deseja estilo rústico com elementos de madeira.',
    status: 'paused'
  }
];

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isViewProjectDialogOpen, setIsViewProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
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

  const handleCreateProject = () => {
    // Em uma implementação real, você enviaria isso para o backend
    const client = mockClients.find(c => c.id === Number(projectFormData.clientId));
    
    if (!client) return;
    
    const newProject: Project = {
      id: projects.length + 1,
      name: projectFormData.name,
      clientId: Number(projectFormData.clientId),
      client,
      projectType: projectFormData.projectType,
      propertyType: projectFormData.propertyType,
      address: projectFormData.address,
      area: Number(projectFormData.area),
      detailLevel: projectFormData.detailLevel,
      deadline: projectFormData.deadline,
      contractValue: Number(projectFormData.contractValue),
      paymentMethod: projectFormData.paymentMethod,
      projectStages: projectFormData.projectStages,
      technicalNotes: projectFormData.technicalNotes,
      status: 'active'
    };

    setProjects([...projects, newProject]);
    setIsNewProjectDialogOpen(false);
    resetProjectForm();
  };

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

  const updateProjectStatus = (id: number, status: 'active' | 'completed' | 'paused' | 'canceled') => {
    setProjects(
      projects.map(project => 
        project.id === id ? 
          { ...project, status } : 
          project
      )
    );
  };

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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Cadastro de Projetos</h1>
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
            onClick={() => setIsNewProjectDialogOpen(true)}
            className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>
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
            onViewProject={(project) => {
              setSelectedProject(project);
              setIsViewProjectDialogOpen(true);
            }}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
        <TabsContent value="active" className="w-full">
          <ProjectTable 
            projects={filteredProjects} 
            onViewProject={(project) => {
              setSelectedProject(project);
              setIsViewProjectDialogOpen(true);
            }}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
        <TabsContent value="completed" className="w-full">
          <ProjectTable 
            projects={filteredProjects} 
            onViewProject={(project) => {
              setSelectedProject(project);
              setIsViewProjectDialogOpen(true);
            }}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
        <TabsContent value="other" className="w-full">
          <ProjectTable 
            projects={filteredProjects} 
            onViewProject={(project) => {
              setSelectedProject(project);
              setIsViewProjectDialogOpen(true);
            }}
            getStatusBadge={getStatusBadge}
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
                  Nome do Projeto
                </label>
                <Input
                  id="name"
                  name="name"
                  value={projectFormData.name}
                  onChange={handleInputChange}
                  placeholder="Nome interno do projeto"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="clientId" className="text-sm font-medium">
                  Cliente Vinculado
                </label>
                <Select 
                  value={projectFormData.clientId} 
                  onValueChange={(value) => handleSelectChange('clientId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map(client => (
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
                    <SquareUser className="h-4 w-4 text-[#FFD600]" />
                    <h3 className="text-sm font-medium">Dados do Cliente</h3>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    {mockClients.filter(c => c.id === selectedClient).map(client => (
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
                  Tipo de Projeto
                </label>
                <Select 
                  value={projectFormData.projectType} 
                  onValueChange={(value) => handleSelectChange('projectType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residencial">Residencial</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Corporativo">Corporativo</SelectItem>
                    <SelectItem value="Institucional">Institucional</SelectItem>
                    <SelectItem value="Hotelaria">Hotelaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="propertyType" className="text-sm font-medium">
                  Tipo de Imóvel
                </label>
                <Select 
                  value={projectFormData.propertyType} 
                  onValueChange={(value) => handleSelectChange('propertyType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o imóvel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartamento">Apartamento</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Loja">Loja</SelectItem>
                    <SelectItem value="Escritório">Escritório</SelectItem>
                    <SelectItem value="Hotel">Hotel</SelectItem>
                    <SelectItem value="Restaurante">Restaurante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Endereço da Obra
                </label>
                <Textarea
                  id="address"
                  name="address"
                  value={projectFormData.address}
                  onChange={handleInputChange}
                  placeholder="Endereço completo do local da obra"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="area" className="text-sm font-medium">
                  Metragem Aproximada (m²)
                </label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  value={projectFormData.area}
                  onChange={handleInputChange}
                  placeholder="Ex: 120"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="detailLevel" className="text-sm font-medium">
                  Nível de Detalhamento
                </label>
                <Select 
                  value={projectFormData.detailLevel} 
                  onValueChange={(value) => handleSelectChange('detailLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Básico">Básico</SelectItem>
                    <SelectItem value="Executivo">Executivo</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="deadline" className="text-sm font-medium">
                  Prazo Estimado de Entrega
                </label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={projectFormData.deadline}
                  onChange={handleInputChange}
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
                <Input
                  id="paymentMethod"
                  name="paymentMethod"
                  value={projectFormData.paymentMethod}
                  onChange={handleInputChange}
                  placeholder="Ex: 40% entrada, 30% na aprovação, 30% na entrega"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium block mb-2">
                  Etapas do Projeto
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableStages.map(stage => (
                    <div key={stage} className="flex items-center gap-2">
                      <Checkbox 
                        id={`stage-${stage}`}
                        checked={projectFormData.projectStages.includes(stage)}
                        onCheckedChange={() => handleStageToggle(stage)}
                      />
                      <label 
                        htmlFor={`stage-${stage}`}
                        className="text-sm cursor-pointer"
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
                  placeholder="Informações técnicas adicionais sobre o projeto"
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
              disabled={!projectFormData.name || !projectFormData.clientId}
            >
              Cadastrar Projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar projeto */}
      <Dialog open={isViewProjectDialogOpen} onOpenChange={setIsViewProjectDialogOpen}>
        {selectedProject && (
          <DialogContent className="max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{selectedProject.name}</DialogTitle>
              <DialogDescription>
                {getStatusBadge(selectedProject.status)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[calc(85vh-200px)] overflow-y-auto pr-2">
              <div className="bg-black/5 dark:bg-white/5 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <SquareUser className="h-4 w-4 text-[#FFD600]" />
                  <h3 className="text-sm font-medium">Cliente</h3>
                </div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span> {selectedProject.client.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span> {selectedProject.client.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefone:</span> {selectedProject.client.phone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Building className="h-4 w-4 text-[#FFD600]" /> Informações do Imóvel
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Tipo de Projeto:</span> {selectedProject.projectType}</p>
                    <p><span className="text-muted-foreground">Tipo de Imóvel:</span> {selectedProject.propertyType}</p>
                    <p><span className="text-muted-foreground">Endereço:</span> {selectedProject.address}</p>
                    <p><span className="text-muted-foreground">Área:</span> {selectedProject.area} m²</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <FileCog className="h-4 w-4 text-[#FFD600]" /> Especificações do Projeto
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Nível de Detalhamento:</span> {selectedProject.detailLevel}</p>
                    <p>
                      <span className="text-muted-foreground">Prazo Estimado:</span> {
                        new Date(selectedProject.deadline).toLocaleDateString('pt-BR')
                      }
                    </p>
                    <div className="pt-1">
                      <span className="text-muted-foreground block mb-1">Etapas:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedProject.projectStages.map(stage => (
                          <span key={stage} className="inline-flex items-center rounded-full bg-black/5 dark:bg-white/5 px-2 py-0.5 text-xs">
                            {stage}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#FFD600]" /> Informações Financeiras
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Valor do Contrato:</span> {
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProject.contractValue)
                      }
                    </p>
                    <p><span className="text-muted-foreground">Forma de Pagamento:</span> {selectedProject.paymentMethod}</p>
                  </div>
                </div>

                {selectedProject.technicalNotes && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#FFD600]" /> Observações Técnicas
                    </h3>
                    <div className="mt-2 text-sm p-3 bg-black/5 dark:bg-white/5 rounded-md">
                      {selectedProject.technicalNotes}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#FFD600]" /> Histórico do Projeto
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>Este projeto ainda não possui registro de atividades.</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              {selectedProject.status === 'active' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => updateProjectStatus(selectedProject.id, 'paused')}
                  >
                    Pausar Projeto
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => updateProjectStatus(selectedProject.id, 'completed')}
                    className="border-green-500 text-green-500 hover:bg-green-500/10"
                  >
                    Marcar como Concluído
                  </Button>
                </>
              )}
              {selectedProject.status === 'paused' && (
                <Button 
                  variant="outline"
                  onClick={() => updateProjectStatus(selectedProject.id, 'active')}
                  className="border-green-500 text-green-500 hover:bg-green-500/10"
                >
                  Reativar Projeto
                </Button>
              )}
              <Button 
                variant="outline"
                className="border-[#FFD600] text-[#FFD600] hover:bg-[#FFD600]/10"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Projeto
              </Button>
              <Button 
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                onClick={() => window.location.href = '/budget/new?project=' + selectedProject.id}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Orçamento
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

interface ProjectTableProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onViewProject, getStatusBadge }) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Projeto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                Nenhum projeto encontrado.
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow 
                key={project.id}
                className={project.status === 'paused' || project.status === 'canceled' ? 'bg-muted/50' : ''}
              >
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.client.name}</TableCell>
                <TableCell>{project.projectType}</TableCell>
                <TableCell>{project.area} m²</TableCell>
                <TableCell>{getStatusBadge(project.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewProject(project)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectsPage;