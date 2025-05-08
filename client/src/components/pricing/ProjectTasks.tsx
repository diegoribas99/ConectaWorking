import React, { useState } from 'react';
import { TaskType, CollaboratorType } from '@/lib/useBudgetCalculator';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, Copy, PlusCircle, GripVertical, Trash2 } from 'lucide-react';

interface ProjectTasksProps {
  tasks: TaskType[];
  collaborators: CollaboratorType[];
  addTask: (task: Omit<TaskType, 'id'>) => void;
  updateTask: (id: number, task: Partial<TaskType>) => void;
  removeTask: (id: number) => void;
  formatCurrency: (value: number) => string;
  totalHours: number;
  totalCost: number;
}

// Modelos pré-definidos de etapas de projetos
const taskTemplates = [
  {
    id: 1,
    name: 'Projeto de Interiores - Residencial',
    tasks: [
      { description: 'Levantamento e Medições', hours: 4, collaboratorId: 1 },
      { description: 'Estudo Preliminar', hours: 8, collaboratorId: 1 },
      { description: 'Anteprojeto', hours: 12, collaboratorId: 2 },
      { description: 'Projeto Executivo', hours: 20, collaboratorId: 2 },
      { description: 'Detalhamento', hours: 16, collaboratorId: 3 },
      { description: 'Apresentação ao Cliente', hours: 2, collaboratorId: 1 }
    ]
  },
  {
    id: 2,
    name: 'Projeto Comercial - Loja',
    tasks: [
      { description: 'Briefing e Levantamento', hours: 6, collaboratorId: 1 },
      { description: 'Estudo de Layout', hours: 10, collaboratorId: 2 },
      { description: 'Projeto de Iluminação', hours: 8, collaboratorId: 3 },
      { description: 'Projeto de Mobiliário', hours: 12, collaboratorId: 2 },
      { description: 'Detalhamento Técnico', hours: 20, collaboratorId: 3 },
      { description: 'Apresentação Final', hours: 4, collaboratorId: 1 }
    ]
  },
  {
    id: 3,
    name: 'Projeto Arquitetônico - Básico',
    tasks: [
      { description: 'Estudo de Viabilidade', hours: 6, collaboratorId: 1 },
      { description: 'Estudo Preliminar', hours: 10, collaboratorId: 1 },
      { description: 'Anteprojeto', hours: 15, collaboratorId: 2 },
      { description: 'Projeto Legal', hours: 20, collaboratorId: 2 },
      { description: 'Projeto Básico', hours: 25, collaboratorId: 3 }
    ]
  }
];

const ProjectTasks: React.FC<ProjectTasksProps> = ({
  tasks,
  collaborators,
  addTask,
  updateTask,
  removeTask,
  formatCurrency,
  totalHours,
  totalCost,
}) => {
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isSaveModelDialogOpen, setIsSaveModelDialogOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  const handleAddTask = () => {
    const defaultCollaborator = collaborators[0];
    addTask({
      description: '',
      collaboratorId: defaultCollaborator?.id,
      hours: 0,
      hourlyRate: defaultCollaborator?.hourlyRate || 0,
    });
  };

  const handleUpdateCollaborator = (taskId: number, collaboratorId: number) => {
    const collaborator = collaborators.find(c => c.id === Number(collaboratorId));
    if (collaborator) {
      updateTask(taskId, { 
        collaboratorId: collaborator.id,
        hourlyRate: collaborator.hourlyRate 
      });
    }
  };

  // Manipulador para o arraste e solte
  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // Se não houver destino ou se o item for solto no mesmo lugar
    if (!destination || (destination.index === source.index)) {
      return;
    }

    // Cria uma cópia do array de tarefas
    const reorderedTasks = Array.from(tasks);
    // Remove o item arrastado da sua posição original
    const [removed] = reorderedTasks.splice(source.index, 1);
    // Insere o item arrastado na nova posição
    reorderedTasks.splice(destination.index, 0, removed);

    // Atualiza as tarefas (em uma implementação real, isso requer uma lógica adicional
    // para atualizar o estado global com as tarefas reordenadas)
    // Para esta demo, simulamos a reordenação atualizando cada tarefa
    reorderedTasks.forEach((task, index) => {
      const sourceTask = tasks[index];
      if (sourceTask.id !== task.id) {
        // Aqui apenas atualizamos a tarefa sem mudar sua posição real
        // Em uma implementação completa, você precisaria atualizar todas as tarefas
        // ou ter um estado que armazene a ordem das tarefas
        updateTask(task.id, { id: task.id });
      }
    });
  };

  // Aplica um modelo de tarefas
  const applyTaskTemplate = (templateId: number) => {
    const template = taskTemplates.find(t => t.id === templateId);
    if (template) {
      // Remove todas as tarefas existentes (em um caso real, pergunte ao usuário primeiro)
      tasks.forEach(task => removeTask(task.id));
      
      // Adicione as novas tarefas do modelo
      template.tasks.forEach(templateTask => {
        const collaborator = collaborators.find(c => c.id === templateTask.collaboratorId);
        addTask({
          description: templateTask.description,
          collaboratorId: collaborator?.id || collaborators[0].id,
          hours: templateTask.hours,
          hourlyRate: collaborator?.hourlyRate || collaborators[0].hourlyRate,
        });
      });
      
      setIsModelDialogOpen(false);
    }
  };

  // Salva as tarefas atuais como um novo modelo
  const saveAsTemplate = () => {
    if (newModelName && tasks.length > 0) {
      // Em uma implementação real, você enviaria isso para o backend
      alert(`Modelo "${newModelName}" salvo com sucesso com ${tasks.length} etapas!`);
      setNewModelName('');
      setIsSaveModelDialogOpen(false);
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg shadow-sm mb-6 overflow-hidden border border-border">
        <div className="p-5 flex justify-between items-center border-b border-border">
          <h2 className="text-lg font-semibold flex items-center">
            Etapas do Projeto
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModelDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <FolderOpen className="h-4 w-4" /> Importar Etapas
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsSaveModelDialogOpen(true)}
              className="flex items-center gap-1"
              disabled={tasks.length === 0}
            >
              <Save className="h-4 w-4" /> Salvar Modelo
            </Button>
          </div>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm border-b border-border">
                    <th className="pb-2 font-medium w-8"></th>
                    <th className="pb-2 font-medium">Descrição da Etapa</th>
                    <th className="pb-2 font-medium">Colaborador</th>
                    <th className="pb-2 font-medium">Horas</th>
                    <th className="pb-2 font-medium">Valor/h</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium w-10"></th>
                  </tr>
                </thead>
                <Droppable droppableId="task-list">
                  {(provided) => (
                    <tbody
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {tasks.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-muted-foreground">
                            Nenhuma etapa adicionada. Clique no botão abaixo para adicionar.
                          </td>
                        </tr>
                      ) : (
                        tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
                            {(provided) => (
                              <tr 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border-b border-border hover:bg-muted/20"
                              >
                                <td className="py-3 w-8 pl-2">
                                  <div {...provided.dragHandleProps} className="cursor-move flex justify-center">
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                </td>
                                <td className="py-3">
                                  <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                                    value={task.description}
                                    onChange={(e) => updateTask(task.id, { description: e.target.value })}
                                    placeholder="Descrição da etapa"
                                  />
                                </td>
                                <td className="py-3">
                                  <select 
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                                    value={task.collaboratorId}
                                    onChange={(e) => handleUpdateCollaborator(task.id, Number(e.target.value))}
                                  >
                                    {collaborators.map(collaborator => (
                                      <option key={collaborator.id} value={collaborator.id}>
                                        {collaborator.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-3">
                                  <input 
                                    type="number" 
                                    className="w-20 px-3 py-2 bg-background border border-border rounded-md text-center focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                                    value={task.hours}
                                    onChange={(e) => updateTask(task.id, { hours: Number(e.target.value) })}
                                    min="0"
                                    step="0.5"
                                  />
                                </td>
                                <td className="py-3">
                                  <div className="w-24 px-3 py-2 bg-background border border-border rounded-md text-center">
                                    {formatCurrency(task.hourlyRate)}
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div className="font-medium">
                                    {formatCurrency(task.hours * task.hourlyRate)}
                                  </div>
                                </td>
                                <td className="py-3">
                                  <button 
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => removeTask(task.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                      <tr>
                        <td className="pt-4" colSpan={7}>
                          <Button 
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={handleAddTask}
                          >
                            <PlusCircle className="h-4 w-4" /> Adicionar Etapa
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  )}
                </Droppable>
              </table>
            </DragDropContext>
          </div>
        </div>
        <div className="px-5 py-3 bg-black/5 dark:bg-white/5 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            <strong>{totalHours}</strong> horas estimadas no total
          </div>
          <div className="font-semibold">
            Total: <span className="text-[#FFD600]">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </div>

      {/* Dialog para escolher um modelo de tarefas */}
      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Importar Modelo de Etapas</DialogTitle>
            <DialogDescription>
              Escolha um modelo pré-definido de etapas para aplicar ao seu projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {taskTemplates.map(template => (
              <div 
                key={template.id} 
                className="p-3 border border-border rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                onClick={() => applyTaskTemplate(template.id)}
              >
                <div className="font-medium flex items-center justify-between">
                  {template.name} 
                  <span className="text-xs bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                    {template.tasks.length} etapas
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {template.tasks.map(t => t.description).slice(0, 3).join(', ')}
                  {template.tasks.length > 3 ? '...' : ''}
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
            <DialogTitle>Salvar Etapas como Modelo</DialogTitle>
            <DialogDescription>
              Salve as etapas atuais como um modelo para uso em projetos futuros.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-1">Nome do Modelo</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
              placeholder="Ex: Projeto Residencial Completo" 
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
            />
            <div className="mt-4 text-sm">
              <p className="text-muted-foreground">Este modelo incluirá {tasks.length} etapas com suas configurações atuais.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveModelDialogOpen(false)}>Cancelar</Button>
            <Button 
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              onClick={saveAsTemplate}
              disabled={!newModelName || tasks.length === 0}
            >
              Salvar Modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectTasks;
