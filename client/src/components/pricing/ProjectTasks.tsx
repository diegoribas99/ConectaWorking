import React, { useState } from 'react';
import { TaskType, CollaboratorType } from '@/lib/useBudgetCalculator';

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

  return (
    <div className="bg-background rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center">
          <i className="fa-solid fa-list-check text-primary mr-2"></i>
          Etapas do Projeto
        </h2>
      </div>
      <div className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm border-b border-border">
                <th className="pb-2 font-medium">Descrição da Etapa</th>
                <th className="pb-2 font-medium">Colaborador</th>
                <th className="pb-2 font-medium">Horas</th>
                <th className="pb-2 font-medium">Valor/h</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    Nenhuma etapa adicionada. Clique no botão abaixo para adicionar.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="border-b border-border">
                    <td className="py-3">
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-md"
                        value={task.description}
                        onChange={(e) => updateTask(task.id, { description: e.target.value })}
                        placeholder="Descrição da etapa"
                      />
                    </td>
                    <td className="py-3">
                      <select 
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-md"
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
                        className="w-20 px-3 py-2 bg-secondary border border-border rounded-md text-center"
                        value={task.hours}
                        onChange={(e) => updateTask(task.id, { hours: Number(e.target.value) })}
                        min="0"
                        step="0.5"
                      />
                    </td>
                    <td className="py-3">
                      <div className="w-24 px-3 py-2 bg-secondary border border-border rounded-md text-center">
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
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
              <tr>
                <td className="pt-4" colSpan={6}>
                  <button 
                    className="px-4 py-2 bg-muted text-sm rounded-md flex items-center hover:bg-muted/80 transition"
                    onClick={handleAddTask}
                  >
                    <i className="fa-solid fa-plus mr-2"></i> Adicionar Etapa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="px-5 py-3 bg-secondary flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          <strong>{totalHours}</strong> horas estimadas no total
        </div>
        <div className="font-semibold">
          Total: <span className="text-primary">{formatCurrency(totalCost)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectTasks;
