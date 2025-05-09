import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import PageWrapper from '@/components/layout/PageWrapper';
import { AlertCircle, Award, CheckCircle, Clock, Trophy, Star } from 'lucide-react';

interface OnboardingTask {
  id: number;
  taskName: string;
  description: string;
  category: string;
  points: number;
  order: number;
  iconName: string | null;
  routePath: string | null;
  isRequired: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

interface TaskProgress {
  id: number;
  userId: number;
  taskId: number;
  completed: boolean;
  completedAt: string | null;
  pointsEarned: number | null;
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementName: string;
  description: string;
  pointsAwarded: number;
  earnedAt: string | null;
  badgeIcon: string | null;
}

interface User {
  id: number;
  username: string;
  name: string;
  onboardingProgress: number;
  onboardingCompleted: boolean;
  onboardingStepsDone: number;
  totalPoints: number;
  level: number;
}

const GamificationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const userId = 1; // Usar o ID do usuário logado (ou 1 como padrão para desenvolvimento)

  // Buscar todas as tarefas de onboarding
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<OnboardingTask[]>({
    queryKey: ['/api/onboarding-tasks'],
    queryFn: async () => {
      const response = await fetch('/api/onboarding-tasks');
      if (!response.ok) throw new Error('Erro ao buscar tarefas');
      return response.json();
    }
  });

  // Buscar o progresso do usuário nas tarefas
  const { data: progress = [], isLoading: progressLoading } = useQuery<TaskProgress[]>({
    queryKey: ['/api/users', userId, 'task-progress'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/task-progress`);
      if (!response.ok) throw new Error('Erro ao buscar progresso');
      return response.json();
    }
  });

  // Buscar as conquistas do usuário
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<UserAchievement[]>({
    queryKey: ['/api/users', userId, 'achievements'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/achievements`);
      if (!response.ok) throw new Error('Erro ao buscar conquistas');
      return response.json();
    }
  });

  // Buscar informações do usuário
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Erro ao buscar usuário');
      return response.json();
    }
  });

  // Mutação para completar uma tarefa
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest(`/api/users/${userId}/complete-task/${taskId}`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'task-progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
    }
  });

  // Mutação para resetar o progresso (apenas para testes)
  const resetProgressMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/users/${userId}/reset-onboarding`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'task-progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
    }
  });

  // Verificar se uma tarefa já foi completada
  const isTaskCompleted = (taskId: number) => {
    return progress.some(p => p.taskId === taskId && p.completed);
  };

  // Obter os pontos ganhos em uma tarefa
  const getTaskPoints = (taskId: number) => {
    const progressItem = progress.find(p => p.taskId === taskId);
    return progressItem?.pointsEarned || 0;
  };

  // Completar uma tarefa
  const handleCompleteTask = (taskId: number) => {
    if (!isTaskCompleted(taskId)) {
      completeTaskMutation.mutate(taskId);
    }
  };

  // Resetar progresso (apenas para testes)
  const handleResetProgress = () => {
    if (window.confirm('Isso vai resetar todo o seu progresso de onboarding. Tem certeza?')) {
      resetProgressMutation.mutate();
    }
  };

  // Calcular o próximo nível
  const getNextLevelPoints = (currentLevel: number) => {
    switch (currentLevel) {
      case 1: return 101; // Nível 2 começa em 101 pontos
      case 2: return 251; // Nível 3 começa em 251 pontos
      case 3: return 501; // Nível 4 começa em 501 pontos
      case 4: return 1001; // Nível 5 começa em 1001 pontos
      default: return 10000; // Depois é muito pontos
    }
  };

  // Agrupar tarefas por categoria
  const getTasksByCategory = () => {
    const categorized: Record<string, OnboardingTask[]> = {};
    
    tasks.forEach(task => {
      if (!categorized[task.category]) {
        categorized[task.category] = [];
      }
      categorized[task.category].push(task);
    });
    
    // Ordenar tarefas dentro de cada categoria
    Object.keys(categorized).forEach(category => {
      categorized[category].sort((a, b) => a.order - b.order);
    });
    
    return categorized;
  };

  // Filtrar conquistas para evitar duplicatas
  const getUniqueAchievements = () => {
    const uniqueAchievements: Record<string, UserAchievement> = {};
    
    achievements.forEach(achievement => {
      // Se já existe uma conquista com o mesmo nome, manter apenas a mais recente
      if (!uniqueAchievements[achievement.achievementName] || 
          new Date(achievement.earnedAt || '') > new Date(uniqueAchievements[achievement.achievementName].earnedAt || '')) {
        uniqueAchievements[achievement.achievementName] = achievement;
      }
    });
    
    return Object.values(uniqueAchievements);
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (tasks.length > 0 && !selectedTask) {
      setSelectedTask(tasks[0].id);
    }
  }, [tasks]);

  const isLoading = tasksLoading || progressLoading || achievementsLoading || userLoading;
  const categorizedTasks = getTasksByCategory();
  const uniqueAchievements = getUniqueAchievements();
  const nextLevelPoints = user ? getNextLevelPoints(user.level) : 0;
  const pointsToNextLevel = user ? Math.max(0, nextLevelPoints - user.totalPoints) : 0;
  const levelProgress = user ? ((user.totalPoints - (getNextLevelPoints(user.level - 1) || 0)) / (nextLevelPoints - (getNextLevelPoints(user.level - 1) || 0))) * 100 : 0;

  // Renderizar ícone com base no nome (apenas alguns exemplos básicos)
  const renderTaskIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'award': return <Award className="h-5 w-5" />;
      case 'check': return <CheckCircle className="h-5 w-5" />;
      case 'clock': return <Clock className="h-5 w-5" />;
      case 'alert': return <AlertCircle className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  return (
    <PageWrapper
      title="Gamificação"
      subtitle="Complete tarefas e ganhe pontos para evoluir na plataforma"
    >
      {isLoading ? (
        <div className="flex justify-center p-8">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Perfil e Níveis */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl flex items-center">
                  <Award className="h-6 w-6 mr-2 text-yellow-500" />
                  Perfil de Gamificação
                </CardTitle>
                <CardDescription>
                  Evolua seu perfil completando tarefas na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium mb-2">Nível</h3>
                    <p className="text-3xl font-bold text-yellow-500">{user?.level || 1}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium mb-2">Pontos</h3>
                    <p className="text-3xl font-bold">{user?.totalPoints || 0}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium mb-2">Progresso</h3>
                    <p className="text-3xl font-bold">{user?.onboardingProgress || 0}%</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium mb-2">Tarefas</h3>
                    <p className="text-3xl font-bold">{user?.onboardingStepsDone || 0}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Próximo nível: {(user?.level || 1) + 1}</span>
                    <span className="text-sm">{pointsToNextLevel} pontos restantes</span>
                  </div>
                  <Progress value={levelProgress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleResetProgress}
                  disabled={resetProgressMutation.isPending}
                >
                  {resetProgressMutation.isPending ? "Resetando..." : "Resetar Progresso (para testes)"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Lista de Tarefas */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Tarefas de Onboarding</CardTitle>
                <CardDescription>
                  Complete as tarefas para ganhar pontos e avançar de nível
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(categorizedTasks).map(([category, categoryTasks]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="font-semibold text-md border-b pb-2">{category}</h3>
                      <div className="space-y-2">
                        {categoryTasks.map(task => (
                          <div
                            key={task.id}
                            className={`p-3 border rounded-md transition-colors cursor-pointer ${
                              isTaskCompleted(task.id) 
                                ? 'bg-green-50 border-green-200' 
                                : 'hover:bg-muted/50'
                            } ${selectedTask === task.id ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setSelectedTask(task.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`mr-3 text-${isTaskCompleted(task.id) ? 'green' : 'gray'}-500`}>
                                  {renderTaskIcon(task.iconName)}
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{task.taskName}</h4>
                                  <p className="text-xs text-muted-foreground">{task.description.substring(0, 60)}...</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={isTaskCompleted(task.id) ? "secondary" : "outline"} className={isTaskCompleted(task.id) ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                                  {isTaskCompleted(task.id) ? `+${getTaskPoints(task.id)}` : `+${task.points}`}
                                </Badge>
                                {task.isRequired && (
                                  <Badge variant="secondary" className="text-xs">Obrigatório</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes da Tarefa e Conquistas */}
          <div className="space-y-6">
            {/* Detalhes da Tarefa */}
            {selectedTask && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Tarefa</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const task = tasks.find(t => t.id === selectedTask);
                    if (!task) return <p>Tarefa não encontrada</p>;
                    
                    const completed = isTaskCompleted(task.id);
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold">{task.taskName}</h3>
                          <Badge variant={completed ? "secondary" : "default"} className={completed ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                            {completed ? "Concluída" : "Pendente"}
                          </Badge>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Descrição:</h4>
                          <p className="text-sm">{task.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Categoria:</h4>
                            <p className="text-sm">{task.category}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Pontos:</h4>
                            <p className="text-sm">{task.points}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Ordem:</h4>
                            <p className="text-sm">{task.order}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Obrigatório:</h4>
                            <p className="text-sm">{task.isRequired ? "Sim" : "Não"}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
                <CardFooter>
                  {(() => {
                    const task = tasks.find(t => t.id === selectedTask);
                    if (!task) return null;
                    
                    const completed = isTaskCompleted(task.id);
                    const isPending = completeTaskMutation.isPending;
                    
                    if (task.routePath) {
                      return (
                        <Button 
                          variant="default" 
                          className="w-full"
                          disabled={completed}
                          onClick={() => window.location.href = task.routePath || ''}
                        >
                          {completed ? "Já Concluída" : "Ir para a Página"}
                        </Button>
                      );
                    }
                    
                    return (
                      <Button 
                        variant="default" 
                        className="w-full"
                        disabled={completed || isPending}
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        {completed 
                          ? "Já Concluída" 
                          : (isPending ? "Processando..." : "Marcar como Concluída")}
                      </Button>
                    );
                  })()}
                </CardFooter>
              </Card>
            )}

            {/* Conquistas */}
            <Card>
              <CardHeader>
                <CardTitle>Conquistas</CardTitle>
                <CardDescription>
                  Suas conquistas desbloqueadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uniqueAchievements.length === 0 ? (
                  <div className="text-center p-6">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Complete tarefas para desbloquear conquistas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {uniqueAchievements.map(achievement => (
                      <div key={achievement.id} className="p-3 border rounded-md bg-muted/30">
                        <div className="flex items-center">
                          <div className="mr-3 text-yellow-500">
                            {achievement.badgeIcon ? renderTaskIcon(achievement.badgeIcon) : <Star className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{achievement.achievementName}</h4>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                          <Badge variant="default">+{achievement.pointsAwarded}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default GamificationPage;