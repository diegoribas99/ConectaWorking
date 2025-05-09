import React, { useState, useEffect } from 'react';
import { ProjectInfoType } from '@/lib/useBudgetCalculator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, Users, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/lib/AuthContext';
import { Client } from '@shared/schema';

interface ProjectInformationProps {
  projectInfo: ProjectInfoType;
  updateProjectInfo: (info: Partial<ProjectInfoType>) => void;
}

interface DeliveryLevelPricing {
  basic: number;
  executive: number;
  premium: number;
}

// Valores padrão por metro quadrado para cada tipo de projeto e nível de entrega
const defaultPricing: Record<string, DeliveryLevelPricing> = {
  residential: {
    basic: 80,
    executive: 120,
    premium: 180
  },
  commercial: {
    basic: 100,
    executive: 150,
    premium: 220
  },
  corporate: {
    basic: 120,
    executive: 180,
    premium: 250
  },
  retail: {
    basic: 110,
    executive: 160,
    premium: 230
  },
  hospitality: {
    basic: 130,
    executive: 190,
    premium: 270
  }
};

// Dados dos modelos salvos (simulação)
const savedModels = [
  { id: 1, name: 'Apartamento Padrão', type: 'residential', deliveryLevel: 'basic' },
  { id: 2, name: 'Loja Comercial', type: 'retail', deliveryLevel: 'executive' },
  { id: 3, name: 'Escritório Corporativo', type: 'corporate', deliveryLevel: 'premium' }
];

const ProjectInformation: React.FC<ProjectInformationProps> = ({ 
  projectInfo, 
  updateProjectInfo 
}) => {
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isSaveModelDialogOpen, setIsSaveModelDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  
  // Consulta de clientes
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['/api/users', user?.id, 'clients', 'search', searchTerm],
    queryFn: () => 
      user?.id 
        ? fetch(`/api/users/${user.id}/clients/search?q=${encodeURIComponent(searchTerm)}`)
            .then(res => {
              if (res.status === 401) return [] as Client[];
              if (!res.ok) throw new Error('Erro ao buscar clientes');
              return res.json() as Promise<Client[]>;
            })
        : Promise.resolve([] as Client[]),
    enabled: !!user?.id && isClientDialogOpen,
  });

  // Obtém o valor por m² baseado no tipo de projeto e nível de entrega
  const getPricePerSqMeter = (type: string, level: 'basic' | 'executive' | 'premium') => {
    return defaultPricing[type]?.[level] || 0;
  };

  // Manipulador para aplicar um modelo
  const handleApplyModel = (modelId: number) => {
    const model = savedModels.find(m => m.id === modelId);
    if (model) {
      updateProjectInfo({
        type: model.type,
        deliveryLevel: model.deliveryLevel as 'basic' | 'executive' | 'premium'
      });
      setIsModelDialogOpen(false);
    }
  };

  // Manipulador para salvar um novo modelo
  const handleSaveModel = () => {
    if (newModelName) {
      // Aqui, em uma implementação real, você salvaria o modelo no backend
      // Por enquanto, apenas mostramos um feedback visual
      alert(`Modelo "${newModelName}" salvo com sucesso!`);
      setNewModelName('');
      setIsSaveModelDialogOpen(false);
    }
  };
  
  // Manipulador para selecionar um cliente
  const handleSelectClient = (client: Client) => {
    updateProjectInfo({
      clientId: client.id,
      clientName: client.name,
    });
    setIsClientDialogOpen(false);
  };
  
  // Manipulador para pesquisar cliente
  const handleSearchClient = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Manipulador para limpar cliente selecionado
  const handleClearClient = () => {
    updateProjectInfo({
      clientId: undefined,
      clientName: '',
    });
  };

  return (
    <>
      <div className="bg-card rounded-lg shadow-sm mb-6 overflow-hidden border border-border">
        <div className="p-5 flex justify-between items-center border-b border-border">
          <h2 className="text-lg font-semibold flex items-center">
            Informações do Projeto
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClientDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Users className="h-4 w-4" /> Importar Clientes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModelDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <FolderOpen className="h-4 w-4" /> Usar Modelo
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsSaveModelDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" /> Salvar Modelo
            </Button>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cliente e Projeto - Linha 1 */}
            <div className="md:col-span-2 bg-black/5 dark:bg-white/5 p-4 rounded-md mb-2">
              <h3 className="text-sm font-medium mb-3">Dados Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente</label>
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                      placeholder="Selecione um cliente acima" 
                      value={projectInfo.clientName || ''}
                      readOnly
                    />
                    {projectInfo.clientName && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearClient}
                        className="ml-2"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Projeto</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                    placeholder="Ex: Apartamento Jardins" 
                    value={projectInfo.name} 
                    onChange={(e) => updateProjectInfo({ name: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Tipo e Características - Linha 2 */}
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Projeto</label>
              <select 
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                value={projectInfo.type}
                onChange={(e) => updateProjectInfo({ type: e.target.value })}
              >
                <option value="residential">Residencial</option>
                <option value="commercial">Comercial</option>
                <option value="corporate">Corporativo</option>
                <option value="retail">Loja/Varejo</option>
                <option value="hospitality">Hotelaria</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Área (m²)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                placeholder="Ex: 120" 
                value={projectInfo.area || ''}
                onChange={(e) => updateProjectInfo({ area: Number(e.target.value) })}
              />
            </div>

            {/* Localização - Linha 3 */}
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
                placeholder="Ex: São Paulo" 
                value={projectInfo.city}
                onChange={(e) => updateProjectInfo({ city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Urgência</label>
              <div className="flex items-center h-10 px-3 py-2 bg-background border border-border rounded-md">
                <input 
                  type="checkbox" 
                  id="urgency" 
                  className="h-4 w-4 rounded border-gray-300 text-[#FFD600] focus:ring-[#FFD600]"
                  checked={projectInfo.urgency || false}
                  onChange={(e) => updateProjectInfo({ urgency: e.target.checked })}
                />
                <label htmlFor="urgency" className="ml-2 text-sm">Projeto Urgente</label>
              </div>
            </div>
          </div>

          {/* Nível de Entrega */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Nível de Entrega</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <input 
                  type="radio" 
                  id="basic" 
                  name="deliveryLevel" 
                  className="absolute opacity-0" 
                  checked={projectInfo.deliveryLevel === 'basic'}
                  onChange={() => updateProjectInfo({ deliveryLevel: 'basic' })}
                />
                <label 
                  htmlFor="basic" 
                  className={`flex flex-col items-center justify-center p-3 bg-background border ${projectInfo.deliveryLevel === 'basic' ? 'border-[#FFD600]' : 'border-border'} rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition`}
                >
                  <span className="text-sm font-medium">Básico</span>
                  <span className="text-xs mt-1 text-muted-foreground">R$ {getPricePerSqMeter(projectInfo.type, 'basic')}/m²</span>
                </label>
              </div>
              <div className="relative">
                <input 
                  type="radio" 
                  id="executive" 
                  name="deliveryLevel" 
                  className="absolute opacity-0"
                  checked={projectInfo.deliveryLevel === 'executive'}
                  onChange={() => updateProjectInfo({ deliveryLevel: 'executive' })}
                />
                <label 
                  htmlFor="executive" 
                  className={`flex flex-col items-center justify-center p-3 bg-background border ${projectInfo.deliveryLevel === 'executive' ? 'border-[#FFD600]' : 'border-border'} rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition`}
                >
                  <span className="text-sm font-medium">Executivo</span>
                  <span className="text-xs mt-1 text-muted-foreground">R$ {getPricePerSqMeter(projectInfo.type, 'executive')}/m²</span>
                </label>
              </div>
              <div className="relative">
                <input 
                  type="radio" 
                  id="premium" 
                  name="deliveryLevel" 
                  className="absolute opacity-0"
                  checked={projectInfo.deliveryLevel === 'premium'}
                  onChange={() => updateProjectInfo({ deliveryLevel: 'premium' })}
                />
                <label 
                  htmlFor="premium" 
                  className={`flex flex-col items-center justify-center p-3 bg-background border ${projectInfo.deliveryLevel === 'premium' ? 'border-[#FFD600]' : 'border-border'} rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition`}
                >
                  <span className="text-sm font-medium">Premium</span>
                  <span className="text-xs mt-1 text-muted-foreground">R$ {getPricePerSqMeter(projectInfo.type, 'premium')}/m²</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog para escolher um modelo */}
      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Selecionar Modelo</DialogTitle>
            <DialogDescription>
              Escolha um modelo para aplicar ao projeto atual.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {savedModels.map(model => (
              <div 
                key={model.id} 
                className="p-3 border border-border rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                onClick={() => handleApplyModel(model.id)}
              >
                <div className="font-medium">{model.name}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-between">
                  <span>{model.type === 'residential' ? 'Residencial' : 
                         model.type === 'commercial' ? 'Comercial' : 
                         model.type === 'corporate' ? 'Corporativo' : 
                         model.type === 'retail' ? 'Loja/Varejo' : 'Hotelaria'}</span>
                  <span className="bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-xs">
                    {model.deliveryLevel === 'basic' ? 'Básico' : 
                     model.deliveryLevel === 'executive' ? 'Executivo' : 'Premium'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModelDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para salvar um modelo */}
      <Dialog open={isSaveModelDialogOpen} onOpenChange={setIsSaveModelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Salvar como Modelo</DialogTitle>
            <DialogDescription>
              Salve as configurações atuais como um modelo para uso futuro.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-1">Nome do Modelo</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
              placeholder="Ex: Apartamento Padrão" 
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveModelDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveModel}>Salvar Modelo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para buscar cliente */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar Cliente</DialogTitle>
            <DialogDescription>
              Busque e selecione um cliente para este projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente por nome, empresa ou cidade..."
                className="pl-9"
                value={searchTerm}
                onChange={handleSearchClient}
              />
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground">
                  Carregando clientes...
                </div>
              ) : clients && clients.length > 0 ? (
                clients.map((client: Client) => (
                  <div
                    key={client.id}
                    className="p-3 border border-border rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-between">
                      <div className="flex flex-col text-xs">
                        {client.company && <span>{client.company}</span>}
                        {client.email && <span>{client.email}</span>}
                      </div>
                      {client.city && (
                        <span className="bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-xs">
                          {client.city}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  {searchTerm 
                    ? 'Nenhum cliente encontrado para esta busca.'
                    : 'Nenhum cliente cadastrado ainda.'}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClientDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectInformation;
