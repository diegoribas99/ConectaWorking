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
import { PlusCircle, Search, Edit, Archive, Eye, Phone, Mail, Users, Sparkles, MapPin, Scroll, MessageSquare, Workflow, Building } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ClientInsights from '@/components/ClientInsights';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: number;
  name: string;
  document: string;
  secondaryDocument?: string;
  address: string;
  city?: string;
  phone: string;
  email: string;
  legalRepresentative?: string;
  origin: string;
  notes?: string;
  projects: number;
  status: 'active' | 'archived';
}

interface ClientHistory {
  projects: {
    id: number;
    name: string;
    type: string;
    status: string;
    deliveryDate?: string;
    value?: number;
  }[];
  interactions: {
    date: string;
    type: string;
    notes: string;
  }[];
  preferences?: {
    style?: string;
    colors?: string[];
    materials?: string[];
    communication?: string;
    paymentMethod?: string;
  };
}

// Lista de possíveis origens de clientes para o select
const originOptions = [
  'Indicação',
  'Site',
  'Instagram',
  'Facebook',
  'Google',
  'Email Marketing',
  'Evento',
  'Anúncio',
  'Antigo Cliente',
  'Outro'
];

// Formatar valor em reais
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const ClientsPageAI: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados para controle da interface
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isViewClientDialogOpen, setIsViewClientDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [useAIAssistant, setUseAIAssistant] = useState(false);
  const [selectedClientHistory, setSelectedClientHistory] = useState<ClientHistory | null>(null);
  
  // Estado para formulário de cliente
  const [clientFormData, setClientFormData] = useState({
    name: '',
    document: '',
    secondaryDocument: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    legalRepresentative: '',
    origin: '',
    notes: ''
  });

  // Consulta para obter clientes
  const { data: clients = [], isLoading } = useQuery({
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

  // Mutação para criar novo cliente
  const createClientMutation = useMutation({
    mutationFn: async (newClient: any) => {
      return await apiRequest('/api/users/1/clients', {
        method: 'POST',
        data: newClient
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsNewClientDialogOpen(false);
      resetClientForm();
      toast({
        title: "Cliente criado",
        description: "O cliente foi cadastrado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutação para atualizar cliente
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/users/1/clients/${id}`, {
        method: 'PATCH',
        data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsEditMode(false);
      toast({
        title: "Cliente atualizado",
        description: "Os dados do cliente foram atualizados com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cliente. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutação para alternar status do cliente (ativar/arquivar)
  const toggleClientStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'active' | 'archived' }) => {
      return await apiRequest(`/api/users/1/clients/${id}`, {
        method: 'PATCH',
        data: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Status alterado",
        description: "O status do cliente foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao alterar status do cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do cliente. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Filtrar clientes com base na busca e aba ativa
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.includes(searchTerm));
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && client.status === 'active';
    if (activeTab === 'archived') return matchesSearch && client.status === 'archived';
    
    return false;
  });

  // Manipuladores de formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientFormData({
      ...clientFormData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setClientFormData({
      ...clientFormData,
      [name]: value
    });
  };

  // Criar novo cliente
  const handleCreateClient = () => {
    const newClient = {
      ...clientFormData,
      status: 'active'
    };

    createClientMutation.mutate(newClient);
  };

  // Atualizar cliente existente
  const handleUpdateClient = () => {
    if (!selectedClient) return;
    
    updateClientMutation.mutate({
      id: selectedClient.id,
      data: clientFormData
    });
  };

  // Alternar entre ativo/arquivado
  const toggleClientStatus = (id: number, currentStatus: 'active' | 'archived') => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    toggleClientStatusMutation.mutate({ id, status: newStatus });
  };

  // Abrir diálogo de visualização de cliente
  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setClientFormData({
      name: client.name,
      document: client.document,
      secondaryDocument: client.secondaryDocument || '',
      address: client.address,
      city: client.city || '',
      phone: client.phone,
      email: client.email,
      legalRepresentative: client.legalRepresentative || '',
      origin: client.origin,
      notes: client.notes || ''
    });
    setIsEditMode(false);
    setIsViewClientDialogOpen(true);
    
    // Obter histórico do cliente (simulado para demo)
    // Em uma implementação real, buscaria do backend
    fetchClientHistory(client.id);
  };

  // Limpar formulário
  const resetClientForm = () => {
    setClientFormData({
      name: '',
      document: '',
      secondaryDocument: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      legalRepresentative: '',
      origin: '',
      notes: ''
    });
  };

  // Buscar histórico do cliente (simulado)
  const fetchClientHistory = (clientId: number) => {
    // Em uma implementação real, faria uma chamada à API aqui
    // Para fins de demonstração, criamos um histórico fictício baseado no ID
    
    // Histórico fictício para o primeiro cliente
    if (clientId === 1) {
      setSelectedClientHistory({
        projects: [
          { id: 1, name: 'Reforma Apartamento', type: 'Residencial', status: 'Concluído', deliveryDate: '2023-06-15', value: 15000 },
          { id: 2, name: 'Projeto de Interiores', type: 'Residencial', status: 'Em andamento', value: 8500 }
        ],
        interactions: [
          { date: '2023-04-10', type: 'Reunião', notes: 'Primeira reunião para entender necessidades do cliente' },
          { date: '2023-05-05', type: 'E-mail', notes: 'Envio de proposta comercial' },
          { date: '2023-05-10', type: 'Telefone', notes: 'Cliente aceitou a proposta e iniciamos o projeto' }
        ],
        preferences: {
          style: 'Contemporâneo',
          colors: ['Branco', 'Cinza', 'Azul'],
          materials: ['Madeira', 'Vidro'],
          communication: 'Prefere WhatsApp',
          paymentMethod: 'Cartão de crédito parcelado'
        }
      });
    } 
    // Histórico fictício para o segundo cliente
    else if (clientId === 2) {
      setSelectedClientHistory({
        projects: [
          { id: 3, name: 'Reforma Loja Shopping', type: 'Comercial', status: 'Concluído', deliveryDate: '2023-03-20', value: 35000 }
        ],
        interactions: [
          { date: '2022-12-15', type: 'Reunião', notes: 'Apresentação de portfólio e discussão inicial' },
          { date: '2023-01-10', type: 'E-mail', notes: 'Envio de proposta e contrato' },
          { date: '2023-01-15', type: 'Reunião', notes: 'Assinatura de contrato e início do projeto' },
          { date: '2023-03-25', type: 'Telefone', notes: 'Feedback positivo após conclusão' }
        ],
        preferences: {
          style: 'Moderno',
          colors: ['Preto', 'Branco', 'Vermelho'],
          materials: ['Metal', 'Vidro', 'Concreto'],
          communication: 'Prefere e-mail para documentação',
          paymentMethod: 'Transferência bancária'
        }
      });
    } 
    // Histórico padrão para outros clientes
    else {
      setSelectedClientHistory({
        projects: [],
        interactions: [],
        preferences: {}
      });
    }
  };

  // Obter status do cliente para exibição visual
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Ativo
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
            Arquivado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Cadastro de Clientes
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cliente..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              resetClientForm();
              setIsNewClientDialogOpen(true);
            }}
            className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Cliente
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
            O assistente de IA fornecerá insights e recomendações personalizadas para seus clientes.
          </p>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="archived">Arquivados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="w-full">
          <ClientTable 
            clients={filteredClients} 
            onViewClient={handleViewClient}
            onToggleStatus={toggleClientStatus}
            getStatusBadge={getStatusBadge}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="active" className="w-full">
          <ClientTable 
            clients={filteredClients} 
            onViewClient={handleViewClient}
            onToggleStatus={toggleClientStatus}
            getStatusBadge={getStatusBadge}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="archived" className="w-full">
          <ClientTable 
            clients={filteredClients} 
            onViewClient={handleViewClient}
            onToggleStatus={toggleClientStatus}
            getStatusBadge={getStatusBadge}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar novo cliente */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo com as informações do cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome completo / Razão social <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={clientFormData.name}
                  onChange={handleInputChange}
                  placeholder="Nome do cliente ou empresa"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="document" className="text-sm font-medium">
                  CPF ou CNPJ <span className="text-red-500">*</span>
                </label>
                <Input
                  id="document"
                  name="document"
                  value={clientFormData.document}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="secondaryDocument" className="text-sm font-medium">
                  RG / IE (opcional)
                </label>
                <Input
                  id="secondaryDocument"
                  name="secondaryDocument"
                  value={clientFormData.secondaryDocument}
                  onChange={handleInputChange}
                  placeholder="Documento secundário"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={clientFormData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={clientFormData.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="origin" className="text-sm font-medium">
                  Origem do cliente <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={clientFormData.origin} 
                  onValueChange={(value) => handleSelectChange('origin', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {originOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Endereço completo <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="address"
                  name="address"
                  value={clientFormData.address}
                  onChange={handleInputChange}
                  placeholder="Rua, número, complemento, bairro, cidade/UF"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium">
                  Cidade / UF <span className="text-red-500">*</span>
                </label>
                <Input
                  id="city"
                  name="city"
                  value={clientFormData.city}
                  onChange={handleInputChange}
                  placeholder="São Paulo/SP"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="legalRepresentative" className="text-sm font-medium">
                  Representante legal (se PJ)
                </label>
                <Input
                  id="legalRepresentative"
                  name="legalRepresentative"
                  value={clientFormData.legalRepresentative}
                  onChange={handleInputChange}
                  placeholder="Nome do responsável"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Observações internas
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={clientFormData.notes}
                  onChange={handleInputChange}
                  placeholder="Informações adicionais sobre o cliente"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewClientDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateClient}
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              disabled={createClientMutation.isPending}
            >
              {createClientMutation.isPending ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar/editar cliente */}
      <Dialog open={isViewClientDialogOpen} onOpenChange={setIsViewClientDialogOpen}>
        {selectedClient && (
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center">
                  {selectedClient.name}
                  {useAIAssistant && <Sparkles className="h-4 w-4 text-[#FFD600] ml-2" />}
                </DialogTitle>
                <div>
                  {getStatusBadge(selectedClient.status)}
                </div>
              </div>
              <DialogDescription className="flex justify-between items-center">
                <span>ID: {selectedClient.id}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {isEditMode ? 'Cancelar Edição' : 'Editar'}
                  </Button>
                  <Button
                    variant={selectedClient.status === 'active' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => toggleClientStatus(selectedClient.id, selectedClient.status)}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    {selectedClient.status === 'active' ? 'Arquivar' : 'Ativar'}
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Modo de Visualização */}
              {!isEditMode ? (
                <div className="grid grid-cols-1 gap-6">
                  {/* Informações do Cliente */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Informações Pessoais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Documento</h3>
                          <p className="text-sm">{selectedClient.document}</p>
                        </div>
                        {selectedClient.secondaryDocument && (
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground">RG / IE</h3>
                            <p className="text-sm">{selectedClient.secondaryDocument}</p>
                          </div>
                        )}
                        {selectedClient.legalRepresentative && (
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground">Representante Legal</h3>
                            <p className="text-sm">{selectedClient.legalRepresentative}</p>
                          </div>
                        )}
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Origem</h3>
                          <p className="text-sm">{selectedClient.origin}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Contato
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Telefone</h3>
                          <p className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {selectedClient.phone}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">E-mail</h3>
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {selectedClient.email}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Endereço</h3>
                          <p className="text-sm">{selectedClient.address}</p>
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-muted-foreground">Cidade/UF</h3>
                          <p className="text-sm">{selectedClient.city || 'Não informado'}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {selectedClient.notes && (
                      <div className="md:col-span-2">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center">
                              <Scroll className="h-4 w-4 mr-2" />
                              Observações
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm whitespace-pre-line">{selectedClient.notes}</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                  
                  {/* Assistente IA */}
                  {useAIAssistant && (
                    <ClientInsights 
                      client={selectedClient} 
                      clientHistory={selectedClientHistory} 
                      className="md:col-span-2 mt-2"
                    />
                  )}
                  
                  {/* Projetos do Cliente */}
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Projetos do Cliente
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedClientHistory && selectedClientHistory.projects.length > 0 ? (
                          <div className="border rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nome</TableHead>
                                  <TableHead>Tipo</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Valor</TableHead>
                                  <TableHead className="w-[100px]">Ações</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedClientHistory.projects.map(project => (
                                  <TableRow key={project.id}>
                                    <TableCell>{project.name}</TableCell>
                                    <TableCell>{project.type}</TableCell>
                                    <TableCell>{project.status}</TableCell>
                                    <TableCell className="text-right">
                                      {project.value ? formatCurrency(project.value) : '-'}
                                    </TableCell>
                                    <TableCell>
                                      <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado para este cliente.</p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full flex items-center justify-center"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Criar Novo Projeto
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                  
                  {/* Interações */}
                  {selectedClientHistory && selectedClientHistory.interactions.length > 0 && (
                    <div className="md:col-span-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Histórico de Interações
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedClientHistory.interactions.map((interaction, index) => (
                              <div key={index} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{interaction.type}</Badge>
                                    <span className="text-xs text-muted-foreground">{interaction.date}</span>
                                  </div>
                                </div>
                                <p className="text-sm">{interaction.notes}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full flex items-center justify-center"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Registrar Nova Interação
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                </div>
              ) : (
                /* Modo de Edição */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="edit-name" className="text-sm font-medium">
                      Nome completo / Razão social <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={clientFormData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="edit-document" className="text-sm font-medium">
                      CPF ou CNPJ <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="edit-document"
                      name="document"
                      value={clientFormData.document}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-secondaryDocument" className="text-sm font-medium">
                      RG / IE (opcional)
                    </label>
                    <Input
                      id="edit-secondaryDocument"
                      name="secondaryDocument"
                      value={clientFormData.secondaryDocument}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-phone" className="text-sm font-medium">
                      Telefone / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      value={clientFormData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-email" className="text-sm font-medium">
                      E-mail <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={clientFormData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-origin" className="text-sm font-medium">
                      Origem do cliente <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      value={clientFormData.origin} 
                      onValueChange={(value) => handleSelectChange('origin', value)}
                      required
                    >
                      <SelectTrigger id="edit-origin">
                        <SelectValue placeholder="Selecione uma origem" />
                      </SelectTrigger>
                      <SelectContent>
                        {originOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="edit-address" className="text-sm font-medium">
                      Endereço completo <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="edit-address"
                      name="address"
                      value={clientFormData.address}
                      onChange={handleInputChange}
                      rows={2}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="edit-city" className="text-sm font-medium">
                      Cidade / UF <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="edit-city"
                      name="city"
                      value={clientFormData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-legalRepresentative" className="text-sm font-medium">
                      Representante legal (se PJ)
                    </label>
                    <Input
                      id="edit-legalRepresentative"
                      name="legalRepresentative"
                      value={clientFormData.legalRepresentative}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="edit-notes" className="text-sm font-medium">
                      Observações internas
                    </label>
                    <Textarea
                      id="edit-notes"
                      name="notes"
                      value={clientFormData.notes}
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
                      onClick={handleUpdateClient}
                      className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                      disabled={updateClientMutation.isPending}
                    >
                      {updateClientMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
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

// Componente para a Tabela de Clientes
interface ClientTableProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
  onToggleStatus: (id: number, status: 'active' | 'archived') => void;
  getStatusBadge: (status: string) => JSX.Element;
  isLoading: boolean;
}

const ClientTable: React.FC<ClientTableProps> = ({ 
  clients, 
  onViewClient, 
  onToggleStatus,
  getStatusBadge,
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
  
  if (clients.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card">
        <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Não há clientes cadastrados que correspondam aos critérios de busca.
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
            <TableHead className="hidden md:table-cell">Documento</TableHead>
            <TableHead className="hidden md:table-cell">Contato</TableHead>
            <TableHead className="hidden lg:table-cell">Origem</TableHead>
            <TableHead>Projetos</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="group">
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell className="hidden md:table-cell">{client.document}</TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-col">
                  <span className="text-xs flex items-center">
                    <Phone className="h-3 w-3 mr-1" /> {client.phone}
                  </span>
                  <span className="text-xs flex items-center text-muted-foreground">
                    <Mail className="h-3 w-3 mr-1" /> {client.email}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">{client.origin}</TableCell>
              <TableCell>
                <Badge variant="outline">{client.projects}</Badge>
              </TableCell>
              <TableCell>{getStatusBadge(client.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewClient(client)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleStatus(client.id, client.status)}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientsPageAI;