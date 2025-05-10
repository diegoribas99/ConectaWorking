import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";

// Componentes
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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Ícones
import {
  Search,
  Plus,
  User,
  Users,
  Filter,
  Trash,
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
  MapPin
} from "lucide-react";

// Interface para os tipos de colaboradores
interface Collaborator {
  id: number;
  userId: number;
  name: string;
  role: string;
  city: string;
  hourlyRate: number;
  hoursPerDay: number;
  isResponsible: boolean;
  participatesInStages: boolean;
  isFixed: boolean;
  assignedHours: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const CollaboratorsPageNew: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados básicos para controle da interface
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [selectedCollaborator, setSelectedCollaborator] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Estado para novo colaborador
  const [newCollaborator, setNewCollaborator] = useState<Partial<Collaborator>>({
    name: '',
    role: '',
    city: '',
    hourlyRate: 0,
    hoursPerDay: 8,
    isResponsible: false,
    participatesInStages: true,
    isFixed: true,
    assignedHours: 0
  });
  
  // Consulta para buscar colaboradores
  const { data: collaborators = [], isLoading } = useQuery<Collaborator[]>({
    queryKey: ['/api/users/1/collaborators'],
    retry: 1,
  });

  // Filtrar colaboradores com base na busca e na aba ativa
  const filteredCollaborators = collaborators.filter(collaborator => {
    const searchMatch = searchTerm === '' || 
      collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collaborator.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return searchMatch;
    if (activeTab === 'fixed') return searchMatch && collaborator.isFixed;
    if (activeTab === 'freelancers') return searchMatch && !collaborator.isFixed;
    
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
            <h1 className="text-2xl font-bold tracking-tight">Colaboradores (Nova Versão)</h1>
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
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="fixed">Equipe Fixa</TabsTrigger>
              <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
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
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollaborators.map((collaborator) => {
                    return (
                      <tr key={collaborator.id} className="border-t">
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{collaborator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{collaborator.name}</div>
                          </div>
                        </td>
                        <td className="p-3">{collaborator.role}</td>
                        <td className="p-3">{collaborator.city}</td>
                        <td className="p-3">R$ {collaborator.hourlyRate.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Lógica para visualizar colaborador
                            }}
                            title="Visualizar detalhes"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Lógica para editar colaborador
                            }}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
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
              const { totalHours, monthlyCost } = calculateCollaboratorMonthlyData(collaborator);
              
              return (
                <div key={collaborator.id} className="bg-card border rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{collaborator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{collaborator.name}</div>
                        <div className="text-sm text-muted-foreground">{collaborator.role}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Localização:</span>
                        <span className="text-sm">{collaborator.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Valor/Hora:</span>
                        <span className="text-sm">R$ {collaborator.hourlyRate.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Horas Mensais:</span>
                        <span className="text-sm">{totalHours}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Custo Mensal:</span>
                        <span className="text-sm">R$ {monthlyCost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t p-2 bg-muted/20 flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Lógica para visualizar colaborador
                      }}
                      title="Visualizar detalhes"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Lógica para editar colaborador
                      }}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Dialog para adicionar colaborador */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Colaborador</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo colaborador.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
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
                <Label htmlFor="role">Função/Cargo <span className="text-red-500">*</span></Label>
                <Input
                  id="role"
                  value={newCollaborator.role || ''}
                  onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})}
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
                <Label htmlFor="hourlyRate">Valor/hora (R$) <span className="text-red-500">*</span></Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  value={newCollaborator.hourlyRate || 0}
                  onChange={(e) => setNewCollaborator({...newCollaborator, hourlyRate: Number(e.target.value)})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="isFixed">Tipo de colaborador</Label>
                <Select
                  value={newCollaborator.isFixed ? 'fixed' : 'freelancer'}
                  onValueChange={(value) => setNewCollaborator({...newCollaborator, isFixed: value === 'fixed'})}
                >
                  <SelectTrigger id="isFixed" className="mt-1">
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
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)} 
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button onClick={handleAddCollaborator}>
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CollaboratorsPageNew;