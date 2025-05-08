import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Search, Edit, Archive, Eye, Phone, Mail } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  document: string;
  secondaryDocument?: string;
  address: string;
  phone: string;
  email: string;
  legalRepresentative?: string;
  origin: string;
  notes?: string;
  projects: number;
  status: 'active' | 'archived';
}

const mockClients: Client[] = [
  {
    id: 1,
    name: 'Maria Silva',
    document: '123.456.789-00',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    phone: '(11) 98765-4321',
    email: 'maria.silva@email.com',
    origin: 'Indicação',
    notes: 'Cliente prefere contato por WhatsApp',
    projects: 2,
    status: 'active'
  },
  {
    id: 2,
    name: 'Empresa ABC Ltda',
    document: '12.345.678/0001-90',
    secondaryDocument: '987654321',
    address: 'Av. Paulista, 1000 - São Paulo/SP',
    phone: '(11) 3456-7890',
    email: 'contato@empresaabc.com',
    legalRepresentative: 'João Souza',
    origin: 'Site',
    projects: 1,
    status: 'active'
  },
  {
    id: 3,
    name: 'Pedro Santos',
    document: '987.654.321-00',
    address: 'Rua dos Pinheiros, 500 - São Paulo/SP',
    phone: '(11) 91234-5678',
    email: 'pedro.santos@email.com',
    origin: 'Instagram',
    projects: 0,
    status: 'archived'
  }
];

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isViewClientDialogOpen, setIsViewClientDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientFormData, setClientFormData] = useState({
    name: '',
    document: '',
    secondaryDocument: '',
    address: '',
    phone: '',
    email: '',
    legalRepresentative: '',
    origin: '',
    notes: ''
  });
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && client.status === 'active';
    if (activeTab === 'archived') return matchesSearch && client.status === 'archived';
    
    return false;
  });

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

  const handleCreateClient = () => {
    // Em uma implementação real, você enviaria isso para o backend
    const newClient: Client = {
      id: clients.length + 1,
      ...clientFormData,
      projects: 0,
      status: 'active'
    };

    setClients([...clients, newClient]);
    setIsNewClientDialogOpen(false);
    resetClientForm();
  };

  const resetClientForm = () => {
    setClientFormData({
      name: '',
      document: '',
      secondaryDocument: '',
      address: '',
      phone: '',
      email: '',
      legalRepresentative: '',
      origin: '',
      notes: ''
    });
  };

  const toggleClientStatus = (id: number) => {
    setClients(
      clients.map(client => 
        client.id === id ? 
          { ...client, status: client.status === 'active' ? 'archived' : 'active' } : 
          client
      )
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Cadastro de Clientes</h1>
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
            onClick={() => setIsNewClientDialogOpen(true)}
            className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
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
            onViewClient={(client) => {
              setSelectedClient(client);
              setIsViewClientDialogOpen(true);
            }}
            onToggleStatus={toggleClientStatus}
          />
        </TabsContent>
        <TabsContent value="active" className="w-full">
          <ClientTable 
            clients={filteredClients} 
            onViewClient={(client) => {
              setSelectedClient(client);
              setIsViewClientDialogOpen(true);
            }}
            onToggleStatus={toggleClientStatus}
          />
        </TabsContent>
        <TabsContent value="archived" className="w-full">
          <ClientTable 
            clients={filteredClients} 
            onViewClient={(client) => {
              setSelectedClient(client);
              setIsViewClientDialogOpen(true);
            }}
            onToggleStatus={toggleClientStatus}
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
                  Nome completo / Razão social
                </label>
                <Input
                  id="name"
                  name="name"
                  value={clientFormData.name}
                  onChange={handleInputChange}
                  placeholder="Nome do cliente ou empresa"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="document" className="text-sm font-medium">
                  CPF ou CNPJ
                </label>
                <Input
                  id="document"
                  name="document"
                  value={clientFormData.document}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
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
                  Telefone / WhatsApp
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={clientFormData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={clientFormData.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="origin" className="text-sm font-medium">
                  Origem do cliente
                </label>
                <Select 
                  value={clientFormData.origin} 
                  onValueChange={(value) => handleSelectChange('origin', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Site">Site</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Endereço completo
                </label>
                <Textarea
                  id="address"
                  name="address"
                  value={clientFormData.address}
                  onChange={handleInputChange}
                  placeholder="Rua, número, complemento, bairro, cidade/UF"
                  rows={2}
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
            >
              Cadastrar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar cliente */}
      <Dialog open={isViewClientDialogOpen} onOpenChange={setIsViewClientDialogOpen}>
        {selectedClient && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedClient.name}</DialogTitle>
              <DialogDescription>
                {selectedClient.status === 'active' ? 
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Cliente Ativo
                  </span> : 
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                    Cliente Arquivado
                  </span>
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Documento</h3>
                  <p className="text-sm">{selectedClient.document}</p>
                </div>
                {selectedClient.secondaryDocument && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">RG / IE</h3>
                    <p className="text-sm">{selectedClient.secondaryDocument}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Telefone</h3>
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {selectedClient.phone}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">E-mail</h3>
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {selectedClient.email}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>
                  <p className="text-sm">{selectedClient.address}</p>
                </div>
                {selectedClient.legalRepresentative && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Representante Legal</h3>
                    <p className="text-sm">{selectedClient.legalRepresentative}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Origem</h3>
                  <p className="text-sm">{selectedClient.origin}</p>
                </div>
                {selectedClient.notes && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
                    <p className="text-sm">{selectedClient.notes}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-medium mb-2">Projetos do Cliente</h3>
                {selectedClient.projects > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Reforma Apartamento</TableCell>
                          <TableCell>Residencial</TableCell>
                          <TableCell>Em andamento</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado para este cliente.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => toggleClientStatus(selectedClient.id)}>
                {selectedClient.status === 'active' ? 'Arquivar Cliente' : 'Ativar Cliente'}
              </Button>
              <Button 
                variant="outline"
                className="border-[#FFD600] text-[#FFD600] hover:bg-[#FFD600]/10"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Cliente
              </Button>
              <Button 
                className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                onClick={() => window.location.href = '/projects/new?client=' + selectedClient.id}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Projeto
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

interface ClientTableProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
  onToggleStatus: (id: number) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({ clients, onViewClient, onToggleStatus }) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Projetos</TableHead>
            <TableHead className="w-[150px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow 
                key={client.id}
                className={client.status === 'archived' ? 'bg-muted/50' : ''}
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.document}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {client.phone}
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {client.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{client.origin}</TableCell>
                <TableCell>{client.projects}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
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
                      onClick={() => onToggleStatus(client.id)}
                    >
                      <Archive className="h-4 w-4" />
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

export default ClientsPage;