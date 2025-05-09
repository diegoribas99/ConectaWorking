import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Eye, Edit, Trash2, Plus, Loader2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

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
  observations?: string;
  active: boolean;
}

function CollaboratorsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<number | null>(null);
  const [newCollaborator, setNewCollaborator] = useState<Partial<Collaborator>>({
    name: '',
    role: '',
    hourlyRate: 0,
    hoursPerDay: 8,
    city: '',
    isFixed: true,
    isResponsible: true,
    participatesInStages: true
  });

  // Carregar colaboradores
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

  // Filtrar colaboradores pelo termo de busca
  const filteredCollaborators = collaborators.filter(
    c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutação para excluir colaborador
  const { mutate: deleteCollaborator, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Tentando excluir colaborador com ID: ${id}`);
      return await apiRequest<void>(`/api/collaborators/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Colaborador excluído',
        description: 'O colaborador foi excluído com sucesso.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
      setIsDeleteOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao excluir colaborador:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o colaborador.',
        variant: 'destructive',
      });
    }
  });

  // Mutação para adicionar colaborador
  const { mutate: addCollaborator, isPending: isAdding } = useMutation({
    mutationFn: async (data: Partial<Collaborator>) => {
      const formattedData = {
        ...data,
        userId: 1,
        hourlyRate: String(data.hourlyRate)
      };
      return await apiRequest<Collaborator>('/api/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
    },
    onSuccess: () => {
      toast({
        title: 'Colaborador adicionado',
        description: 'O colaborador foi adicionado com sucesso.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
      setIsAddOpen(false);
      setNewCollaborator({
        name: '',
        role: '',
        hourlyRate: 0,
        hoursPerDay: 8,
        city: '',
        isFixed: true,
        isResponsible: true,
        participatesInStages: true
      });
    },
    onError: (error) => {
      console.error('Erro ao adicionar colaborador:', error);
      toast({
        title: 'Erro ao adicionar',
        description: 'Não foi possível adicionar o colaborador.',
        variant: 'destructive',
      });
    }
  });

  // Mutação para atualizar colaborador
  const { mutate: updateCollaborator, isPending: isUpdating } = useMutation({
    mutationFn: async (data: { id: number, collaborator: Partial<Collaborator> }) => {
      const formattedData = {
        ...data.collaborator,
        hourlyRate: String(data.collaborator.hourlyRate)
      };
      return await apiRequest<Collaborator>(`/api/collaborators/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
    },
    onSuccess: () => {
      toast({
        title: 'Colaborador atualizado',
        description: 'O colaborador foi atualizado com sucesso.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/collaborators'] });
      setIsEditOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao atualizar colaborador:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o colaborador.',
        variant: 'destructive',
      });
    }
  });

  // Funções para manipular colaboradores
  const handleViewCollaborator = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setIsViewOpen(true);
  };

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setIsEditOpen(true);
  };

  const handleDeleteCollaborator = (id: number) => {
    setCollaboratorToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (collaboratorToDelete !== null) {
      deleteCollaborator(collaboratorToDelete);
    }
  };

  const handleAddCollaborator = () => {
    if (!newCollaborator.name || !newCollaborator.role) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e função são campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    addCollaborator(newCollaborator);
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Colaboradores</h1>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar colaborador..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Adicionar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando colaboradores...</span>
          </div>
        ) : filteredCollaborators.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Nenhum colaborador encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollaborators.map((collaborator) => (
              <Card key={collaborator.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{collaborator.name}</h3>
                      <p className="text-muted-foreground text-sm">{collaborator.role}</p>
                      <div className="mt-2">
                        <span className="text-sm font-medium">Valor hora:</span>
                        <span className="text-sm ml-1">{formatCurrency(Number(collaborator.hourlyRate))}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Tipo:</span>
                        <span className="text-sm ml-1">{collaborator.isFixed ? 'Equipe Fixa' : 'Freelancer'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
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
                        onClick={() => handleDeleteCollaborator(collaborator.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Visualização */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Colaborador</DialogTitle>
            </DialogHeader>
            {selectedCollaborator && (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <h3 className="font-semibold mb-2">{selectedCollaborator.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{selectedCollaborator.role}</p>
                  
                  <div className="space-y-2">
                    <p><span className="font-medium">Cidade:</span> {selectedCollaborator.city}</p>
                    <p><span className="font-medium">Tipo:</span> {selectedCollaborator.isFixed ? 'Equipe Fixa' : 'Freelancer'}</p>
                    <p><span className="font-medium">Responsável:</span> {selectedCollaborator.isResponsible ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Informações de Trabalho</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Valor hora:</span> {formatCurrency(Number(selectedCollaborator.hourlyRate))}</p>
                    <p><span className="font-medium">Horas por dia:</span> {selectedCollaborator.hoursPerDay}</p>
                    <p><span className="font-medium">Participa de etapas:</span> {selectedCollaborator.participatesInStages ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
                {selectedCollaborator.observations && (
                  <div className="col-span-2 mt-4">
                    <h3 className="font-semibold mb-2">Observações</h3>
                    <p className="text-sm">{selectedCollaborator.observations}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>Fechar</Button>
              <Button 
                onClick={() => {
                  setIsViewOpen(false);
                  if (selectedCollaborator) {
                    handleEditCollaborator(selectedCollaborator);
                  }
                }}
              >
                Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Colaborador</DialogTitle>
            </DialogHeader>
            {selectedCollaborator && (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input 
                      value={selectedCollaborator.name}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Função</label>
                    <Input 
                      value={selectedCollaborator.role}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, role: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cidade</label>
                    <Input 
                      value={selectedCollaborator.city}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, city: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Valor hora (R$)</label>
                    <Input 
                      type="number"
                      value={selectedCollaborator.hourlyRate}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, hourlyRate: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Horas por dia</label>
                    <Input 
                      type="number"
                      value={selectedCollaborator.hoursPerDay}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, hoursPerDay: Number(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="is-fixed"
                      checked={selectedCollaborator.isFixed}
                      onChange={(e) => setSelectedCollaborator({...selectedCollaborator, isFixed: e.target.checked})}
                    />
                    <label htmlFor="is-fixed" className="text-sm font-medium">Equipe Fixa</label>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Observações</label>
                  <textarea 
                    className="w-full h-20 p-2 border rounded-md"
                    value={selectedCollaborator.observations || ''}
                    onChange={(e) => setSelectedCollaborator({...selectedCollaborator, observations: e.target.value})}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button 
                onClick={() => {
                  if (selectedCollaborator) {
                    updateCollaborator({
                      id: selectedCollaborator.id,
                      collaborator: selectedCollaborator
                    });
                  }
                }}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Exclusão */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Tem certeza que deseja excluir este colaborador? Esta ação não pode ser desfeita.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : 'Confirmar Exclusão'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Adição */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Colaborador</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input 
                    value={newCollaborator.name || ''}
                    onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Função</label>
                  <Input 
                    value={newCollaborator.role || ''}
                    onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cidade</label>
                  <Input 
                    value={newCollaborator.city || ''}
                    onChange={(e) => setNewCollaborator({...newCollaborator, city: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Valor hora (R$)</label>
                  <Input 
                    type="number"
                    value={newCollaborator.hourlyRate || 0}
                    onChange={(e) => setNewCollaborator({...newCollaborator, hourlyRate: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Horas por dia</label>
                  <Input 
                    type="number"
                    value={newCollaborator.hoursPerDay || 8}
                    onChange={(e) => setNewCollaborator({...newCollaborator, hoursPerDay: Number(e.target.value)})}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="new-is-fixed"
                    checked={newCollaborator.isFixed}
                    onChange={(e) => setNewCollaborator({...newCollaborator, isFixed: e.target.checked})}
                  />
                  <label htmlFor="new-is-fixed" className="text-sm font-medium">Equipe Fixa</label>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Observações</label>
                <textarea 
                  className="w-full h-20 p-2 border rounded-md"
                  value={newCollaborator.observations || ''}
                  onChange={(e) => setNewCollaborator({...newCollaborator, observations: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
              <Button 
                onClick={handleAddCollaborator}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : 'Adicionar Colaborador'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

export default CollaboratorsPage;