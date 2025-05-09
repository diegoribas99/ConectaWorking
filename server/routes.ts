import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertCollaboratorSchema, 
  insertOfficeCostSchema,
  insertBudgetSchema,
  insertBudgetTaskSchema,
  insertBudgetExtraCostsSchema,
  insertBudgetAdjustmentsSchema,
  insertBudgetResultsSchema,
  insertClientSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rota para obter os custos do escritório
  app.get('/api/office-costs', async (req, res) => {
    try {
      // Usar o ID do usuário da sessão (ou 1 como padrão para desenvolvimento)
      const userId = (req.session as any)?.user?.id || 1;
      const officeCost = await storage.getOfficeCost(userId);
      res.json(officeCost);
    } catch (error) {
      console.error('Erro ao buscar custos do escritório:', error);
      res.status(500).json({ error: 'Erro ao buscar custos do escritório' });
    }
  });

  // Rota para salvar os custos do escritório
  app.post('/api/office-costs', async (req, res) => {
    try {
      // Usar o ID do usuário da sessão (ou 1 como padrão para desenvolvimento)
      const userId = (req.session as any)?.user?.id || 1;
      
      const { fixedCosts, variableCosts, technicalReservePercentage, productiveHoursPerMonth } = req.body;
      
      // Calcular o valor total dos custos fixos
      const fixedCostsTotal = Array.isArray(fixedCosts) 
        ? fixedCosts.reduce((sum, cost) => sum + Number(cost.value), 0) 
        : 0;
      
      // Calcular o valor total dos custos variáveis
      const variableCostsTotal = Array.isArray(variableCosts) 
        ? variableCosts.reduce((sum, cost) => sum + Number(cost.value), 0) 
        : 0;
        
      // Criar o objeto de dados formatado para o schema
      const officeCostData = {
        userId,
        fixedCosts: fixedCostsTotal.toString(), // decimal no DB precisa ser string
        variableCosts: variableCostsTotal.toString(), // decimal no DB precisa ser string
        productiveHoursMonth: productiveHoursPerMonth,
        // Valor padrão para preço por m²
        defaultPricePerSqMeter: "0" // decimal no DB precisa ser string
      };
      
      // Armazenar os detalhes dos custos no armazenamento em memória para uso futuro
      const detailedData = {
        ...officeCostData,
        fixedCostItems: fixedCosts,
        variableCostItems: variableCosts,
        technicalReservePercentage: technicalReservePercentage,
      };
      
      console.log('Salvando dados de custos:', JSON.stringify(officeCostData));
      
      const savedOfficeCost = await storage.createOrUpdateOfficeCost(officeCostData);
      
      // Incluir os detalhes dos custos na resposta
      res.json({
        ...savedOfficeCost,
        fixedCosts: fixedCosts,
        variableCosts: variableCosts,
        technicalReservePercentage: technicalReservePercentage,
      });
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

  // Collaborator routes
  app.get("/api/users/:userId/collaborators", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const collaborators = await storage.getCollaborators(userId);
    res.json(collaborators);
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

  const httpServer = createServer(app);
  return httpServer;
}
