# Sistema de Gamificação do ConectaWorking

## Visão Geral

O sistema de gamificação implementado no ConectaWorking tem como objetivo engajar os usuários durante o processo de onboarding, recompensando-os por completar tarefas essenciais na plataforma. Este documento explica a arquitetura e implementação do sistema.

## Modelagem de Dados

### Tabelas Principais

O sistema utiliza três tabelas principais:

1. **onboarding_tasks**: Armazena as tarefas disponíveis para os usuários
   - Campos: id, taskName, description, category, points, order, iconName, routePath, isRequired

2. **user_task_progress**: Registra o progresso do usuário em cada tarefa
   - Campos: id, userId, taskId, completed, completedAt, pointsEarned

3. **user_achievements**: Armazena as conquistas desbloqueadas pelos usuários
   - Campos: id, userId, achievementName, description, pointsAwarded, earnedAt, badgeIcon

### Campos de Gamificação na Tabela de Usuários

A tabela `users` foi estendida com os seguintes campos:

- **onboardingProgress**: Porcentagem de conclusão do onboarding (0-100)
- **onboardingCompleted**: Flag que indica se o onboarding foi concluído
- **onboardingStepsDone**: Número de tarefas concluídas
- **totalPoints**: Total de pontos acumulados
- **level**: Nível atual do usuário

## API e Pontos de Integração

### Endpoints

- `GET /api/onboarding-tasks`: Lista todas as tarefas de onboarding
- `GET /api/users/:userId/task-progress`: Obtém o progresso do usuário
- `POST /api/users/:userId/complete-task/:taskId`: Marca uma tarefa como concluída
- `GET /api/users/:userId/achievements`: Lista conquistas do usuário
- `POST /api/users/:id/reset-onboarding`: Reseta o progresso de onboarding (apenas para testes)

### Funções no Backend

- `markTaskAsCompleted`: Marca uma tarefa como concluída e atualiza pontos/progresso
- `createUserAchievement`: Registra uma nova conquista para o usuário
- `updateUserOnboardingProgress`: Atualiza o progresso geral do usuário

## Mecânicas de Jogo

### Sistema de Pontos

- Cada tarefa possui uma pontuação específica (campo `points`)
- Os pontos são acumulados no perfil do usuário ao completar tarefas
- O campo `totalPoints` do usuário é atualizado automaticamente

### Sistema de Níveis

O sistema implementa os seguintes níveis:

- **Nível 1**: 0-100 pontos
- **Nível 2**: 101-250 pontos
- **Nível 3**: 251-500 pontos
- **Nível 4**: 501-1000 pontos
- **Nível 5**: 1001+ pontos

### Tracking de Progresso

- O progresso geral do onboarding é calculado com base nas tarefas obrigatórias
- A porcentagem é armazenada no campo `onboardingProgress` (0-100)
- O sistema rastreia quantas tarefas foram concluídas no campo `onboardingStepsDone`

## Implementação Técnica

### Suporte no Storage

Tanto a `MemStorage` quanto `DatabaseStorage` implementam todos os métodos necessários:

```typescript
// Interface de armazenamento (simplificada)
interface IStorage {
  // Métodos de onboarding e gamificação
  getOnboardingTasks(): Promise<OnboardingTask[]>;
  getUserTaskProgress(userId: number): Promise<UserTaskProgress[]>;
  createOrUpdateUserTaskProgress(progress: InsertUserTaskProgress): Promise<UserTaskProgress>;
  markTaskAsCompleted(userId: number, taskId: number, pointsEarned: number): Promise<UserTaskProgress | undefined>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserOnboardingProgress(id: number, data: {
    onboardingProgress?: number;
    onboardingCompleted?: boolean;
    onboardingStepsDone?: number;
    totalPoints?: number;
    level?: number;
  }): Promise<User | undefined>;
}
```

### Cálculo de Pontuação e Nível

Quando uma tarefa é concluída, o sistema:

1. Registra a conclusão na tabela `user_task_progress`
2. Adiciona os pontos ganhos ao total do usuário
3. Recalcula o nível com base no total de pontos
4. Atualiza a porcentagem de progresso geral
5. Verifica se todas as tarefas obrigatórias foram concluídas

### Ferramenta de Reset (para testes)

Implementamos um script e uma rota API para resetar o progresso de um usuário:

- **Script**: `scripts/reset_user_onboarding.js` - Pode ser executado via linha de comando
- **API**: `POST /api/users/:id/reset-onboarding` - Endpoint para resetar o progresso

## Uso Futuro e Expansões

O sistema de gamificação foi projetado para ser facilmente expansível, permitindo:

1. Adicionar novas tarefas e categorias
2. Implementar conquistas especiais
3. Adicionar recompensas por atingir determinados níveis
4. Integrar elementos visuais como badges e barras de progresso
5. Expandir para outras áreas da plataforma além do onboarding