import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { db } from "./db";
import { sql, eq } from "drizzle-orm";
import { 
  insertUserSchema, 
  insertCollaboratorSchema, 
  insertOfficeCostSchema,
  insertBudgetSchema,
  insertBudgetTaskSchema,
  insertBudgetExtraCostsSchema,
  insertBudgetAdjustmentsSchema,
  insertBudgetResultsSchema,
  insertClientSchema,
  insertOnboardingTaskSchema,
  insertUserTaskProgressSchema,
  insertUserAchievementSchema,
  users,
  collaborators,
  budgets,
  officeCosts,
  clients,
  budgetTasks,
  budgetExtraCosts,
  budgetAdjustments,
  budgetResults,
  onboardingTasks,
  userTaskProgress,
  userAchievements
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rota de dashboard que mostra informações do banco de dados
  app.get('/api/dashboard', async (req, res) => {
    try {
      // Contagem de colaboradores
      const collaboratorsCount = await db.select({ count: sql`COUNT(*)` }).from(collaborators);
      const totalCollaborators = collaboratorsCount[0]?.count || 0;
      
      // Lista de colaboradores
      const collaboratorsList = await db.select().from(collaborators).limit(5);
      
      // Contagem de orçamentos por tipo
      const budgetsByType = await db.select({
        type: budgets.projectType,
        count: sql`COUNT(*)`
      })
      .from(budgets)
      .groupBy(budgets.projectType);
      
      // Custos do escritório
      const officeCostData = await db.select().from(officeCosts).limit(1);
      
      // Informações sobre usuários
      const usersData = await db.select().from(users);
      
      // Formatando os dados para exibição
      const dashboard = {
        statistics: {
          collaborators: totalCollaborators,
          users: usersData.length,
          officeCosts: officeCostData[0] ? {
            fixedCosts: parseFloat(officeCostData[0].fixedCosts),
            variableCosts: parseFloat(officeCostData[0].variableCosts),
            totalCosts: parseFloat(officeCostData[0].fixedCosts) + parseFloat(officeCostData[0].variableCosts),
            productiveHoursMonth: officeCostData[0].productiveHoursMonth
          } : null
        },
        collaborators: collaboratorsList.map(c => ({
          id: c.id,
          name: c.name,
          role: c.role,
          hourlyRate: parseFloat(c.hourlyRate),
          city: c.city
        })),
        budgetTypes: budgetsByType.map(bt => ({
          name: bt.type,
          value: Number(bt.count)
        })),
        databaseStats: {
          tables: ['users', 'collaborators', 'budgets', 'office_costs', 'clients', 'budget_tasks', 'budget_extra_costs', 'budget_adjustments', 'budget_results'],
          counts: {
            users: usersData.length,
            collaborators: totalCollaborators
          }
        }
      };
      
      res.json(dashboard);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
    }
  });
  // Rota para obter os custos do escritório
  app.get('/api/office-costs', async (req: any, res) => {
    try {
      // Usar o ID do usuário da sessão (ou 1 como padrão para desenvolvimento)
      const userId = req.session?.user?.id || 1;
      const officeCost = await storage.getOfficeCost(userId);
      
      if (officeCost) {
        // Se for um objeto mais simples sem os arrays, vamos verificar
        if (!Array.isArray(officeCost.fixedCosts) && !Array.isArray(officeCost.variableCosts)) {
          console.log("Convertendo formato de dados para arrays");
          // Converter para o formato que o frontend espera
          const formattedResult = {
            ...officeCost,
            fixedCosts: [{ 
              id: 1, 
              name: 'Custos Fixos Totais', 
              value: typeof officeCost.fixedCosts === 'string' 
                ? parseFloat(officeCost.fixedCosts) 
                : Number(officeCost.fixedCosts),
              description: null 
            }],
            variableCosts: [{ 
              id: 1, 
              name: 'Custos Variáveis Totais', 
              value: typeof officeCost.variableCosts === 'string' 
                ? parseFloat(officeCost.variableCosts) 
                : Number(officeCost.variableCosts),
              description: null 
            }],
            technicalReservePercentage: 15, // Padrão 
            productiveHoursPerMonth: officeCost.productiveHoursMonth // Mapear campo equivalente
          };
          
          console.log("Dados formatados para o frontend:", JSON.stringify(formattedResult));
          return res.json(formattedResult);
        }
        
        // Adicionar log para debug
        console.log("Dados enviados para o frontend:", JSON.stringify(officeCost));
        res.json(officeCost);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error('Erro ao buscar custos do escritório:', error);
      res.status(500).json({ error: 'Erro ao buscar custos do escritório' });
    }
  });

  // Rota para salvar os custos do escritório
  app.post('/api/office-costs', async (req: any, res) => {
    try {
      // Usar o ID do usuário da sessão (ou 1 como padrão para desenvolvimento)
      const userId = req.session?.user?.id || 1;
      
      const { fixedCosts, variableCosts, technicalReservePercentage, productiveHoursPerMonth } = req.body;
      
      // Verificação para garantir que estamos recebendo os detalhes corretamente
      if (!Array.isArray(fixedCosts) || !Array.isArray(variableCosts)) {
        return res.status(400).json({ error: 'Formato de dados inválido. fixedCosts e variableCosts devem ser arrays.' });
      }
      
      // Calcular o valor total dos custos fixos
      const fixedCostsTotal = fixedCosts.reduce((sum, cost) => sum + Number(cost.value), 0);
      
      // Calcular o valor total dos custos variáveis
      const variableCostsTotal = variableCosts.reduce((sum, cost) => sum + Number(cost.value), 0);
        
      // Criar o objeto de dados formatado para o schema
      const officeCostData = {
        userId,
        fixedCosts: fixedCostsTotal.toString(), // decimal no DB precisa ser string
        variableCosts: variableCostsTotal.toString(), // decimal no DB precisa ser string
        productiveHoursMonth: productiveHoursPerMonth,
        // Valor padrão para preço por m²
        defaultPricePerSqMeter: "0" // decimal no DB precisa ser string
      };
      
      console.log('Salvando dados de custos:', JSON.stringify({
        ...officeCostData,
        fixedCostItems: fixedCosts,
        variableCostItems: variableCosts,
        technicalReservePercentage
      }));
      
      // Enviar os dados completos incluindo os detalhes para o storage
      const savedOfficeCost = await storage.createOrUpdateOfficeCost({
        ...officeCostData,
        fixedCostItems: fixedCosts,
        variableCostItems: variableCosts,
        technicalReservePercentage
      } as any); // 'as any' devido aos campos extras
      
      // O método createOrUpdateOfficeCost já deve retornar o objeto completo com os detalhes
      // vamos usar diretamente o valor retornado em vez de buscar novamente
      const result = savedOfficeCost;
      
      // Log para verificar se os dados estão completos
      console.log('Dados a serem enviados ao cliente:', JSON.stringify(result));
      
      // Verificação adicional para garantir que os detalhes estão presentes
      if (!Array.isArray(result.fixedCosts) || !Array.isArray(result.variableCosts)) {
        console.error('ALERTA: Os arrays de custos não estão presentes no objeto retornado');
        
        // Buscar novamente os dados completos para verificar
        const refreshedData = await storage.getOfficeCost(userId);
        console.log('Dados atualizados do getOfficeCost:', JSON.stringify(refreshedData));
        
        // Retornar os dados completos confirmados
        return res.json(refreshedData);
      }
      
      // Retornamos os dados com detalhes completos
      res.json(result);
    } catch (error) {
      console.error('Erro ao salvar custos do escritório:', error);
      res.status(500).json({ error: 'Erro ao salvar custos do escritório' });
    }
  });
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });
  
  // Resetar o progresso de onboarding do usuário (apenas para testes)
  app.post("/api/users/:id/reset-onboarding", async (req, res) => {
    try {
      // Define o content-type explicitamente para evitar problemas com HTML sendo retornado
      res.setHeader('Content-Type', 'application/json');
      
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Resetar o progresso
      const updatedUser = await storage.updateUserOnboardingProgress(userId, {
        onboardingProgress: 0,
        onboardingCompleted: false,
        onboardingStepsDone: 0,
        totalPoints: 0,
        level: 1
      });
      
      // Remover todos os progressos de tarefas
      // Observação: Isso seria melhor implementado com um método dedicado no storage,
      // mas para fins de teste, estamos usando uma abordagem mais simples
      const userProgress = await storage.getUserTaskProgress(userId);
      
      // Se tivermos progressos, vamos excluí-los um por um
      if (userProgress.length > 0) {
        for (const progress of userProgress) {
          await db.delete(userTaskProgress).where(eq(userTaskProgress.id, progress.id));
        }
        console.log(`Removidos ${userProgress.length} registros de progresso para o usuário ${userId}`);
      }
      
      res.json({ 
        message: "Progresso de onboarding resetado com sucesso",
        user: updatedUser,
        tasksDeleted: userProgress.length
      });
    } catch (error) {
      console.error("Erro ao resetar progresso:", error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  // Collaborator routes
  app.get("/api/users/:userId/collaborators", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const collaborators = await storage.getCollaborators(userId);
    res.json(collaborators);
  });
  
  // Rota para obter um colaborador específico
  app.get("/api/users/:userId/collaborators/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const collaboratorId = parseInt(req.params.id);
      
      const collaborator = await storage.getCollaborator(collaboratorId);
      if (!collaborator || collaborator.userId !== userId) {
        return res.status(404).json({ message: "Colaborador não encontrado" });
      }
      
      res.json(collaborator);
    } catch (error) {
      console.error('Erro ao buscar colaborador:', error);
      res.status(500).json({ error: 'Erro ao buscar dados do colaborador' });
    }
  });
  
  // Rota para atualizar um colaborador
  app.put("/api/users/:userId/collaborators/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const collaboratorId = parseInt(req.params.id);
      
      // Verificar se o colaborador existe
      const existingCollaborator = await storage.getCollaborator(collaboratorId);
      if (!existingCollaborator || existingCollaborator.userId !== userId) {
        return res.status(404).json({ message: "Colaborador não encontrado" });
      }
      
      // Dados enviados no corpo da requisição
      const collaboratorData = req.body;
      
      // Garantir que o userId não seja alterado
      collaboratorData.userId = userId;
      collaboratorData.id = collaboratorId;
      
      // Atualizar o colaborador
      const updatedCollaborator = await storage.updateCollaborator(collaboratorId, collaboratorData);
      
      res.json(updatedCollaborator);
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      res.status(500).json({ error: 'Erro ao atualizar dados do colaborador' });
    }
  });
  
  // Rota para deletar um colaborador
  app.delete("/api/users/:userId/collaborators/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const collaboratorId = parseInt(req.params.id);
      
      // Verificar se o colaborador existe
      const existingCollaborator = await storage.getCollaborator(collaboratorId);
      if (!existingCollaborator || existingCollaborator.userId !== userId) {
        return res.status(404).json({ message: "Colaborador não encontrado" });
      }
      
      // Deletar o colaborador
      await storage.deleteCollaborator(collaboratorId);
      
      res.json({ success: true, message: "Colaborador excluído com sucesso" });
    } catch (error) {
      console.error('Erro ao excluir colaborador:', error);
      res.status(500).json({ error: 'Erro ao excluir colaborador' });
    }
  });
  
  // Rota para obter as horas de trabalho de um colaborador por categoria de projeto
  app.get("/api/users/:userId/collaborators/:id/hours", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const collaboratorId = parseInt(req.params.id);
      
      // Verificar se o colaborador existe
      const collaborator = await storage.getCollaborator(collaboratorId);
      if (!collaborator || collaborator.userId !== userId) {
        return res.status(404).json({ message: "Collaborator not found" });
      }
      
      // Buscar os projetos em execução (aprovados)
      const inProgressTasks = await db
        .select({
          task: budgetTasks,
          budget: budgets
        })
        .from(budgetTasks)
        .innerJoin(budgets, eq(budgetTasks.budgetId, budgets.id))
        .where(
          sql`${budgetTasks.collaboratorId} = ${collaboratorId} AND ${budgets.status} = 'approved'`
        );
      
      // Buscar os projetos em fase de orçamento
      const inQuoteTasks = await db
        .select({
          task: budgetTasks,
          budget: budgets
        })
        .from(budgetTasks)
        .innerJoin(budgets, eq(budgetTasks.budgetId, budgets.id))
        .where(
          sql`${budgetTasks.collaboratorId} = ${collaboratorId} AND ${budgets.status} = 'draft'`
        );
      
      // Buscar os projetos finalizados
      const completedTasks = await db
        .select({
          task: budgetTasks,
          budget: budgets
        })
        .from(budgetTasks)
        .innerJoin(budgets, eq(budgetTasks.budgetId, budgets.id))
        .where(
          sql`${budgetTasks.collaboratorId} = ${collaboratorId} AND ${budgets.status} = 'completed'`
        );
      
      // Calcular horas totais por categoria
      const inProgressHours = inProgressTasks.reduce((total: number, item: any) => total + parseFloat(item.task.hours), 0);
      const inQuoteHours = inQuoteTasks.reduce((total: number, item: any) => total + parseFloat(item.task.hours), 0);
      const completedHours = completedTasks.reduce((total: number, item: any) => total + parseFloat(item.task.hours), 0);
      
      // Calcular horas totais disponíveis por mês (22 dias úteis * horas por dia)
      const availableHoursPerMonth = 22 * (collaborator.hoursPerDay || 8); // Default para 8 horas se não definido
      
      // Calcular percentual de ocupação
      const totalAssignedHours = inProgressHours + inQuoteHours;
      const occupancyPercentage = Math.min(100, Math.round((totalAssignedHours / availableHoursPerMonth) * 100));
      
      // Calcular horas disponíveis (total mensal - horas designadas)
      const availableHours = Math.max(0, availableHoursPerMonth - totalAssignedHours);
      
      const result = {
        collaboratorId,
        name: collaborator.name,
        availableHoursPerMonth,
        inProgressHours,
        inQuoteHours,
        completedHours,
        totalAssignedHours,
        availableHours,
        occupancyPercentage,
        projects: {
          inProgress: inProgressTasks.map((item: any) => ({
            projectId: item.budget.id,
            projectName: item.budget.name,
            hours: parseFloat(item.task.hours),
            description: item.task.description
          })),
          inQuote: inQuoteTasks.map((item: any) => ({
            projectId: item.budget.id,
            projectName: item.budget.name,
            hours: parseFloat(item.task.hours),
            description: item.task.description
          })),
          completed: completedTasks.map((item: any) => ({
            projectId: item.budget.id,
            projectName: item.budget.name,
            hours: parseFloat(item.task.hours),
            description: item.task.description
          }))
        }
      };
      
      res.json(result);
    } catch (error) {
      console.error('Erro ao buscar horas do colaborador:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/collaborators", async (req, res) => {
    try {
      const collaboratorData = insertCollaboratorSchema.parse(req.body);
      const collaborator = await storage.createCollaborator(collaboratorData);
      res.status(201).json(collaborator);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put("/api/collaborators/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const updateData = insertCollaboratorSchema.partial().parse(req.body);
      const collaborator = await storage.updateCollaborator(id, updateData);
      
      if (!collaborator) {
        return res.status(404).json({ message: "Collaborator not found" });
      }
      
      res.json(collaborator);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/collaborators/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteCollaborator(id);
    
    if (!success) {
      return res.status(404).json({ message: "Collaborator not found" });
    }
    
    res.status(204).end();
  });
  
  // Rota para salvar todos os colaboradores
  app.post("/api/collaborators/save-all", async (req, res) => {
    try {
      // Esta rota é apenas para confirmar que todas as alterações foram salvas
      // Em uma implementação real com banco de dados persistente, poderíamos fazer um commit ou salvar em batch
      res.status(200).json({ message: "Todos os colaboradores foram salvos com sucesso" });
    } catch (error) {
      console.error("Erro ao salvar todos os colaboradores:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Office costs routes
  app.get("/api/users/:userId/office-costs", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const officeCost = await storage.getOfficeCost(userId);
    
    if (!officeCost) {
      return res.status(404).json({ message: "Office costs not found" });
    }
    
    res.json(officeCost);
  });

  app.post("/api/office-costs", async (req, res) => {
    try {
      const officeCostData = insertOfficeCostSchema.parse(req.body);
      const officeCost = await storage.createOrUpdateOfficeCost(officeCostData);
      res.status(201).json(officeCost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Budget routes
  app.get("/api/users/:userId/budgets", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const budgets = await storage.getBudgets(userId);
    res.json(budgets);
  });

  app.get("/api/budgets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const budget = await storage.getBudget(id);
    
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    res.json(budget);
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const budgetData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(budgetData);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put("/api/budgets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const updateData = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(id, updateData);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteBudget(id);
    
    if (!success) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    res.status(204).end();
  });

  // Budget tasks routes
  app.get("/api/budgets/:budgetId/tasks", async (req, res) => {
    const budgetId = parseInt(req.params.budgetId);
    const tasks = await storage.getBudgetTasks(budgetId);
    res.json(tasks);
  });

  app.post("/api/budget-tasks", async (req, res) => {
    try {
      const taskData = insertBudgetTaskSchema.parse(req.body);
      const task = await storage.createBudgetTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put("/api/budget-tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const updateData = insertBudgetTaskSchema.partial().parse(req.body);
      const task = await storage.updateBudgetTask(id, updateData);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/budget-tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteBudgetTask(id);
    
    if (!success) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(204).end();
  });

  // Budget extra costs routes
  app.get("/api/budgets/:budgetId/extra-costs", async (req, res) => {
    const budgetId = parseInt(req.params.budgetId);
    const extraCosts = await storage.getBudgetExtraCosts(budgetId);
    
    if (!extraCosts) {
      return res.status(404).json({ message: "Extra costs not found" });
    }
    
    res.json(extraCosts);
  });

  app.post("/api/budget-extra-costs", async (req, res) => {
    try {
      const extraCostsData = insertBudgetExtraCostsSchema.parse(req.body);
      const extraCosts = await storage.createOrUpdateBudgetExtraCosts(extraCostsData);
      res.status(201).json(extraCosts);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Budget adjustments routes
  app.get("/api/budgets/:budgetId/adjustments", async (req, res) => {
    const budgetId = parseInt(req.params.budgetId);
    const adjustments = await storage.getBudgetAdjustments(budgetId);
    
    if (!adjustments) {
      return res.status(404).json({ message: "Adjustments not found" });
    }
    
    res.json(adjustments);
  });

  app.post("/api/budget-adjustments", async (req, res) => {
    try {
      const adjustmentsData = insertBudgetAdjustmentsSchema.parse(req.body);
      const adjustments = await storage.createOrUpdateBudgetAdjustments(adjustmentsData);
      res.status(201).json(adjustments);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Budget results routes
  app.get("/api/budgets/:budgetId/results", async (req, res) => {
    const budgetId = parseInt(req.params.budgetId);
    const results = await storage.getBudgetResults(budgetId);
    
    if (!results) {
      return res.status(404).json({ message: "Results not found" });
    }
    
    res.json(results);
  });

  app.post("/api/budget-results", async (req, res) => {
    try {
      const resultsData = insertBudgetResultsSchema.parse(req.body);
      const results = await storage.createOrUpdateBudgetResults(resultsData);
      res.status(201).json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Client routes
  app.get("/api/users/:userId/clients", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const clients = await storage.getClients(userId);
    res.json(clients);
  });

  app.get("/api/clients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const client = await storage.getClient(id);
    
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    res.json(client);
  });

  app.get("/api/users/:userId/clients/search", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const searchTerm = req.query.q as string || "";
    const clients = await storage.getClientsBySearch(userId, searchTerm);
    res.json(clients);
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const updateData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, updateData);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteClient(id);
    
    if (!success) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    res.status(204).end();
  });

  // Create full budget with all related data in one request
  app.post("/api/full-budget", async (req, res) => {
    try {
      // Parse and validate main budget data
      const budgetData = insertBudgetSchema.parse(req.body.budget);
      const tasks = req.body.tasks?.map((task: any) => insertBudgetTaskSchema.parse({
        ...task,
        budgetId: 0 // Will be set after budget creation
      }));
      const extraCosts = insertBudgetExtraCostsSchema.parse({
        ...req.body.extraCosts,
        budgetId: 0 // Will be set after budget creation
      });
      const adjustments = insertBudgetAdjustmentsSchema.parse({
        ...req.body.adjustments,
        budgetId: 0 // Will be set after budget creation
      });
      const results = insertBudgetResultsSchema.parse({
        ...req.body.results,
        budgetId: 0 // Will be set after budget creation
      });

      // Create budget
      const budget = await storage.createBudget(budgetData);

      // Create related data with the budget ID
      const createdTasks = [];
      for (const task of tasks) {
        task.budgetId = budget.id;
        const createdTask = await storage.createBudgetTask(task);
        createdTasks.push(createdTask);
      }

      extraCosts.budgetId = budget.id;
      const createdExtraCosts = await storage.createOrUpdateBudgetExtraCosts(extraCosts);

      adjustments.budgetId = budget.id;
      const createdAdjustments = await storage.createOrUpdateBudgetAdjustments(adjustments);

      results.budgetId = budget.id;
      const createdResults = await storage.createOrUpdateBudgetResults(results);

      res.status(201).json({
        budget,
        tasks: createdTasks,
        extraCosts: createdExtraCosts,
        adjustments: createdAdjustments,
        results: createdResults
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get full budget with all related data
  app.get("/api/full-budget/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const budget = await storage.getBudget(id);
    
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    
    const tasks = await storage.getBudgetTasks(id);
    const extraCosts = await storage.getBudgetExtraCosts(id);
    const adjustments = await storage.getBudgetAdjustments(id);
    const results = await storage.getBudgetResults(id);
    
    res.json({
      budget,
      tasks,
      extraCosts,
      adjustments,
      results
    });
  });

  // Rotas para o sistema de gamificação
  
  // Atualizar o progresso de onboarding do usuário
  app.patch("/api/users/:id/onboarding-progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const progressData = req.body;
      
      const user = await storage.updateUserOnboardingProgress(userId, progressData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Erro ao atualizar progresso de onboarding:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Obter todas as tarefas de onboarding
  app.get("/api/onboarding-tasks", async (req, res) => {
    try {
      const tasks = await storage.getOnboardingTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Erro ao buscar tarefas de onboarding:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Obter uma tarefa específica de onboarding
  app.get("/api/onboarding-tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getOnboardingTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Onboarding task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Erro ao buscar tarefa de onboarding:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Criar uma nova tarefa de onboarding
  app.post("/api/onboarding-tasks", async (req, res) => {
    try {
      const taskData = insertOnboardingTaskSchema.parse(req.body);
      const task = await storage.createOnboardingTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        console.error("Erro ao criar tarefa de onboarding:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  // Atualizar uma tarefa de onboarding
  app.put("/api/onboarding-tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updateData = insertOnboardingTaskSchema.partial().parse(req.body);
      const task = await storage.updateOnboardingTask(taskId, updateData);
      
      if (!task) {
        return res.status(404).json({ message: "Onboarding task not found" });
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        console.error("Erro ao atualizar tarefa de onboarding:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  // Excluir uma tarefa de onboarding
  app.delete("/api/onboarding-tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const success = await storage.deleteOnboardingTask(taskId);
      
      if (!success) {
        return res.status(404).json({ message: "Onboarding task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao excluir tarefa de onboarding:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Obter o progresso do usuário em todas as tarefas
  app.get("/api/users/:userId/task-progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserTaskProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Erro ao buscar progresso das tarefas:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Obter o progresso do usuário em uma tarefa específica
  app.get("/api/users/:userId/task-progress/:taskId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const taskId = parseInt(req.params.taskId);
      const progress = await storage.getUserTaskProgressByTask(userId, taskId);
      
      if (!progress) {
        return res.status(404).json({ message: "Task progress not found" });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Erro ao buscar progresso da tarefa:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Atualizar o progresso do usuário em uma tarefa
  app.post("/api/user-task-progress", async (req, res) => {
    try {
      const progressData = insertUserTaskProgressSchema.parse(req.body);
      const progress = await storage.createOrUpdateUserTaskProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        console.error("Erro ao criar/atualizar progresso de tarefa:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  // Marcar uma tarefa como concluída
  app.post("/api/users/:userId/tasks/:taskId/complete", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const taskId = parseInt(req.params.taskId);
      const { pointsEarned } = req.body;
      
      if (typeof pointsEarned !== 'number') {
        return res.status(400).json({ message: "pointsEarned must be a number" });
      }
      
      console.log(`Marcando tarefa ${taskId} como concluída para o usuário ${userId} com ${pointsEarned} pontos`);
      
      // Buscar informações do usuário antes do update
      const userBefore = await storage.getUser(userId);
      console.log("Usuário antes:", JSON.stringify(userBefore));
      
      const progress = await storage.markTaskAsCompleted(userId, taskId, pointsEarned);
      
      if (!progress) {
        return res.status(404).json({ message: "User or task not found" });
      }
      
      // Buscar informações do usuário depois do update
      const userAfter = await storage.getUser(userId);
      console.log("Usuário depois:", JSON.stringify(userAfter));
      
      // Verificar se o progresso do usuário foi atualizado
      if (userBefore && userAfter && 
          (userBefore.onboardingProgress === userAfter.onboardingProgress) &&
          (userBefore.totalPoints === userAfter.totalPoints)) {
        console.warn("AVISO: O progresso e pontos do usuário não foram atualizados!");
        
        // Forçar a atualização do progresso do usuário
        console.log("Forçando atualização do progresso do usuário...");
        
        // Buscar todas as tarefas e calcular o progresso
        const allTasks = await storage.getOnboardingTasks();
        const userProgress = await storage.getUserTaskProgress(userId);
        const completedTasks = userProgress.filter(p => p.completed);
        
        console.log(`Total de ${allTasks.length} tarefas, ${completedTasks.length} concluídas`);
        
        // Calcular novo progresso
        const progressPercentage = Math.round((completedTasks.length / allTasks.length) * 100);
        const totalPoints = userProgress.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);
        
        // Calcular novo nível (1 nível a cada 100 pontos)
        const newLevel = Math.max(1, Math.floor(totalPoints / 100) + 1);
        
        console.log(`Calculado - Progresso: ${progressPercentage}%, Pontos: ${totalPoints}, Nível: ${newLevel}`);
        
        // Forçar a atualização
        const updatedUser = await storage.updateUserOnboardingProgress(userId, {
          onboardingProgress: progressPercentage,
          onboardingStepsDone: completedTasks.length,
          onboardingCompleted: progressPercentage >= 100,
          totalPoints,
          level: newLevel
        });
        
        if (updatedUser) {
          console.log("Usuário atualizado com sucesso:", JSON.stringify(updatedUser));
          
          // Atualizar userAfter com os dados atualizados
          const userAfterUpdate = await storage.getUser(userId);
          if (userAfterUpdate) {
            console.log("Usuário após atualização forçada:", JSON.stringify(userAfterUpdate));
            return res.json({
              progress,
              userProgress: {
                before: {
                  onboardingProgress: userBefore?.onboardingProgress,
                  onboardingStepsDone: userBefore?.onboardingStepsDone,
                  totalPoints: userBefore?.totalPoints,
                  level: userBefore?.level
                },
                after: {
                  onboardingProgress: userAfterUpdate?.onboardingProgress,
                  onboardingStepsDone: userAfterUpdate?.onboardingStepsDone,
                  totalPoints: userAfterUpdate?.totalPoints,
                  level: userAfterUpdate?.level
                }
              }
            });
          }
        }
      }
      
      res.json({
        progress,
        userProgress: {
          before: {
            onboardingProgress: userBefore?.onboardingProgress,
            onboardingStepsDone: userBefore?.onboardingStepsDone,
            totalPoints: userBefore?.totalPoints,
            level: userBefore?.level
          },
          after: {
            onboardingProgress: userAfter?.onboardingProgress,
            onboardingStepsDone: userAfter?.onboardingStepsDone,
            totalPoints: userAfter?.totalPoints,
            level: userAfter?.level
          }
        }
      });
    } catch (error) {
      console.error("Erro ao marcar tarefa como concluída:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Obter todas as conquistas do usuário
  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Erro ao buscar conquistas do usuário:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Criar uma nova conquista para o usuário
  app.post("/api/user-achievements", async (req, res) => {
    try {
      const achievementData = insertUserAchievementSchema.parse(req.body);
      const achievement = await storage.createUserAchievement(achievementData);
      res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        console.error("Erro ao criar conquista:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
