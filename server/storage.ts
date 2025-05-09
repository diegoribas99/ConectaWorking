import { 
  users, type User, type InsertUser,
  collaborators, type Collaborator, type InsertCollaborator,
  officeCosts, type OfficeCost, type InsertOfficeCost,
  budgets, type Budget, type InsertBudget,
  budgetTasks, type BudgetTask, type InsertBudgetTask,
  budgetExtraCosts, type BudgetExtraCost, type InsertBudgetExtraCost,
  budgetAdjustments, type BudgetAdjustment, type InsertBudgetAdjustment,
  budgetResults, type BudgetResult, type InsertBudgetResult,
  clients, type Client, type InsertClient
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client operations
  getClients(userId: number): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientsBySearch(userId: number, searchTerm: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Collaborator operations
  getCollaborators(userId: number): Promise<Collaborator[]>;
  getCollaborator(id: number): Promise<Collaborator | undefined>;
  createCollaborator(collaborator: InsertCollaborator): Promise<Collaborator>;
  updateCollaborator(id: number, collaborator: Partial<InsertCollaborator>): Promise<Collaborator | undefined>;
  deleteCollaborator(id: number): Promise<boolean>;

  // Office costs operations
  getOfficeCost(userId: number): Promise<OfficeCost | undefined>;
  createOrUpdateOfficeCost(officeCost: InsertOfficeCost): Promise<OfficeCost>;

  // Budget operations
  getBudgets(userId: number): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;

  // Budget task operations
  getBudgetTasks(budgetId: number): Promise<BudgetTask[]>;
  createBudgetTask(task: InsertBudgetTask): Promise<BudgetTask>;
  updateBudgetTask(id: number, task: Partial<InsertBudgetTask>): Promise<BudgetTask | undefined>;
  deleteBudgetTask(id: number): Promise<boolean>;

  // Budget extra costs operations
  getBudgetExtraCosts(budgetId: number): Promise<BudgetExtraCost | undefined>;
  createOrUpdateBudgetExtraCosts(extraCosts: InsertBudgetExtraCost): Promise<BudgetExtraCost>;

  // Budget adjustments operations
  getBudgetAdjustments(budgetId: number): Promise<BudgetAdjustment | undefined>;
  createOrUpdateBudgetAdjustments(adjustments: InsertBudgetAdjustment): Promise<BudgetAdjustment>;

  // Budget results operations
  getBudgetResults(budgetId: number): Promise<BudgetResult | undefined>;
  createOrUpdateBudgetResults(results: InsertBudgetResult): Promise<BudgetResult>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private collaborators: Map<number, Collaborator>;
  private officeCosts: Map<number, OfficeCost>;
  private budgets: Map<number, Budget>;
  private budgetTasks: Map<number, BudgetTask>;
  private budgetExtraCosts: Map<number, BudgetExtraCost>;
  private budgetAdjustments: Map<number, BudgetAdjustment>;
  private budgetResults: Map<number, BudgetResult>;
  // Adicionando armazenamento para dados detalhados dos custos
  private officeCostDetails: Map<number, { 
    fixedCostItems: any[], 
    variableCostItems: any[],
    technicalReservePercentage: number
  }>;
  
  private currentUserId: number;
  private currentClientId: number;
  private currentCollaboratorId: number;
  private currentOfficeCostId: number;
  private currentBudgetId: number;
  private currentBudgetTaskId: number;
  private currentBudgetExtraCostId: number;
  private currentBudgetAdjustmentId: number;
  private currentBudgetResultId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.collaborators = new Map();
    this.officeCosts = new Map();
    this.budgets = new Map();
    this.budgetTasks = new Map();
    this.budgetExtraCosts = new Map();
    this.budgetAdjustments = new Map();
    this.budgetResults = new Map();
    this.officeCostDetails = new Map();
    
    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentCollaboratorId = 1;
    this.currentOfficeCostId = 1;
    this.currentBudgetId = 1;
    this.currentBudgetTaskId = 1;
    this.currentBudgetExtraCostId = 1;
    this.currentBudgetAdjustmentId = 1;
    this.currentBudgetResultId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: timestamp, 
      companyName: insertUser.companyName || null,
      position: insertUser.position || null
    };
    this.users.set(id, user);
    return user;
  }

  // Client operations
  async getClients(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(
      (client) => client.userId === userId
    );
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientsBySearch(userId: number, searchTerm: string): Promise<Client[]> {
    searchTerm = searchTerm.toLowerCase();
    return Array.from(this.clients.values()).filter(
      (client) => 
        client.userId === userId && 
        (
          client.name.toLowerCase().includes(searchTerm) || 
          (client.company && client.company.toLowerCase().includes(searchTerm)) ||
          (client.email && client.email.toLowerCase().includes(searchTerm)) ||
          (client.city && client.city.toLowerCase().includes(searchTerm))
        )
    );
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const timestamp = new Date();
    const client: Client = { 
      ...insertClient, 
      id, 
      createdAt: timestamp,
      updatedAt: timestamp,
      company: insertClient.company || null,
      email: insertClient.email || null,
      phone: insertClient.phone || null,
      address: insertClient.address || null,
      city: insertClient.city || null,
      notes: insertClient.notes || null
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const updatedClient = { 
      ...client, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Collaborator operations
  async getCollaborators(userId: number): Promise<Collaborator[]> {
    return Array.from(this.collaborators.values()).filter(
      (collaborator) => collaborator.userId === userId
    );
  }

  async getCollaborator(id: number): Promise<Collaborator | undefined> {
    return this.collaborators.get(id);
  }

  async createCollaborator(insertCollaborator: InsertCollaborator): Promise<Collaborator> {
    const id = this.currentCollaboratorId++;
    const collaborator: Collaborator = { 
      ...insertCollaborator, 
      id,
      role: insertCollaborator.role || null,
      active: insertCollaborator.active || true
    };
    this.collaborators.set(id, collaborator);
    return collaborator;
  }

  async updateCollaborator(id: number, updateData: Partial<InsertCollaborator>): Promise<Collaborator | undefined> {
    const collaborator = this.collaborators.get(id);
    if (!collaborator) return undefined;

    const updatedCollaborator = { ...collaborator, ...updateData };
    this.collaborators.set(id, updatedCollaborator);
    return updatedCollaborator;
  }

  async deleteCollaborator(id: number): Promise<boolean> {
    return this.collaborators.delete(id);
  }

  // Office costs operations
  async getOfficeCost(userId: number): Promise<OfficeCost | undefined> {
    const basicCost = Array.from(this.officeCosts.values()).find(
      (cost) => cost.userId === userId
    );
    
    if (basicCost) {
      // Recuperar os detalhes dos custos se existirem
      const details = this.officeCostDetails.get(basicCost.id);
      
      if (details) {
        // Retornar os custos com seus detalhes
        return {
          ...basicCost,
          // Adicionamos os itens detalhados como arrays
          fixedCosts: details.fixedCostItems,
          variableCosts: details.variableCostItems,
          // E a porcentagem de reserva técnica
          technicalReservePercentage: details.technicalReservePercentage
        } as any; // Casting para evitar erros de tipo temporariamente
      }
    }
    
    return basicCost;
  }

  async createOrUpdateOfficeCost(insertOfficeCost: InsertOfficeCost): Promise<OfficeCost> {
    const existingCost = await this.getOfficeCost(insertOfficeCost.userId);
    
    // Verificar se temos detalhes extras nos dados
    const hasDetails = (insertOfficeCost as any).fixedCostItems || 
                      (insertOfficeCost as any).variableCostItems || 
                      (insertOfficeCost as any).technicalReservePercentage;
    
    // Variáveis para armazenar os detalhes
    let fixedCostItems: any[] = [];
    let variableCostItems: any[] = [];
    let technicalReservePercentage = 10; // Valor padrão
    
    // Se temos dados detalhados, extraí-los para armazenar separadamente
    if (hasDetails) {
      const extendedData = insertOfficeCost as any;
      fixedCostItems = extendedData.fixedCostItems || [];
      variableCostItems = extendedData.variableCostItems || [];
      technicalReservePercentage = extendedData.technicalReservePercentage || 10;
    } else if ((insertOfficeCost as any).fixedCosts && 
               Array.isArray((insertOfficeCost as any).fixedCosts)) {
      // Se fixedCosts é um array, consideramos que são os itens detalhados
      fixedCostItems = (insertOfficeCost as any).fixedCosts;
      variableCostItems = (insertOfficeCost as any).variableCosts || [];
      technicalReservePercentage = (insertOfficeCost as any).technicalReservePercentage || 10;
    }
    
    let officeCostId: number;
    
    if (existingCost) {
      const updatedCost = { 
        ...existingCost, 
        ...insertOfficeCost, 
        updatedAt: new Date() 
      };
      
      // Trocar arrays pelos valores numéricos para o banco
      if (Array.isArray(updatedCost.fixedCosts)) {
        const fixedTotal = (updatedCost.fixedCosts as any[]).reduce((sum, cost) => 
          sum + (Number(cost.value) || 0), 0);
        updatedCost.fixedCosts = fixedTotal.toString();
      }
      
      if (Array.isArray(updatedCost.variableCosts)) {
        const variableTotal = (updatedCost.variableCosts as any[]).reduce((sum, cost) => 
          sum + (Number(cost.value) || 0), 0);
        updatedCost.variableCosts = variableTotal.toString();
      }
      
      this.officeCosts.set(existingCost.id, updatedCost);
      officeCostId = existingCost.id;
    } else {
      const id = this.currentOfficeCostId++;
      const timestamp = new Date();
      
      const officeCost: OfficeCost = { 
        ...insertOfficeCost, 
        id, 
        updatedAt: timestamp 
      };
      
      // Garantir que defaultPricePerSqMeter é string ou null
      if (officeCost.defaultPricePerSqMeter === undefined) {
        officeCost.defaultPricePerSqMeter = null;
      }
      
      this.officeCosts.set(id, officeCost);
      officeCostId = id;
    }
    
    // Salvar os detalhes separadamente
    this.officeCostDetails.set(officeCostId, {
      fixedCostItems,
      variableCostItems,
      technicalReservePercentage
    });
    
    // Retornar os custos com os detalhes
    return {
      ...this.officeCosts.get(officeCostId),
      fixedCosts: fixedCostItems,
      variableCosts: variableCostItems,
      technicalReservePercentage
    } as any; // Casting para evitar erros de tipo temporariamente
  }

  // Budget operations
  async getBudgets(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId
    );
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.currentBudgetId++;
    const timestamp = new Date();
    const budget: Budget = { 
      ...insertBudget, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp 
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: number, updateData: Partial<InsertBudget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;

    const updatedBudget = { 
      ...budget, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Budget task operations
  async getBudgetTasks(budgetId: number): Promise<BudgetTask[]> {
    return Array.from(this.budgetTasks.values()).filter(
      (task) => task.budgetId === budgetId
    );
  }

  async createBudgetTask(insertTask: InsertBudgetTask): Promise<BudgetTask> {
    const id = this.currentBudgetTaskId++;
    const task: BudgetTask = { ...insertTask, id };
    this.budgetTasks.set(id, task);
    return task;
  }

  async updateBudgetTask(id: number, updateData: Partial<InsertBudgetTask>): Promise<BudgetTask | undefined> {
    const task = this.budgetTasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updateData };
    this.budgetTasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteBudgetTask(id: number): Promise<boolean> {
    return this.budgetTasks.delete(id);
  }

  // Budget extra costs operations
  async getBudgetExtraCosts(budgetId: number): Promise<BudgetExtraCost | undefined> {
    return Array.from(this.budgetExtraCosts.values()).find(
      (cost) => cost.budgetId === budgetId
    );
  }

  async createOrUpdateBudgetExtraCosts(insertExtraCosts: InsertBudgetExtraCost): Promise<BudgetExtraCost> {
    const existingCosts = await this.getBudgetExtraCosts(insertExtraCosts.budgetId);
    
    if (existingCosts) {
      const updatedCosts = { ...existingCosts, ...insertExtraCosts };
      this.budgetExtraCosts.set(existingCosts.id, updatedCosts);
      return updatedCosts;
    }
    
    const id = this.currentBudgetExtraCostId++;
    const extraCosts: BudgetExtraCost = { ...insertExtraCosts, id };
    this.budgetExtraCosts.set(id, extraCosts);
    return extraCosts;
  }

  // Budget adjustments operations
  async getBudgetAdjustments(budgetId: number): Promise<BudgetAdjustment | undefined> {
    return Array.from(this.budgetAdjustments.values()).find(
      (adjustment) => adjustment.budgetId === budgetId
    );
  }

  async createOrUpdateBudgetAdjustments(insertAdjustments: InsertBudgetAdjustment): Promise<BudgetAdjustment> {
    const existingAdjustments = await this.getBudgetAdjustments(insertAdjustments.budgetId);
    
    if (existingAdjustments) {
      const updatedAdjustments = { ...existingAdjustments, ...insertAdjustments };
      this.budgetAdjustments.set(existingAdjustments.id, updatedAdjustments);
      return updatedAdjustments;
    }
    
    const id = this.currentBudgetAdjustmentId++;
    const adjustments: BudgetAdjustment = { ...insertAdjustments, id };
    this.budgetAdjustments.set(id, adjustments);
    return adjustments;
  }

  // Budget results operations
  async getBudgetResults(budgetId: number): Promise<BudgetResult | undefined> {
    return Array.from(this.budgetResults.values()).find(
      (result) => result.budgetId === budgetId
    );
  }

  async createOrUpdateBudgetResults(insertResults: InsertBudgetResult): Promise<BudgetResult> {
    const existingResults = await this.getBudgetResults(insertResults.budgetId);
    
    if (existingResults) {
      const updatedResults = { ...existingResults, ...insertResults };
      this.budgetResults.set(existingResults.id, updatedResults);
      return updatedResults;
    }
    
    const id = this.currentBudgetResultId++;
    const results: BudgetResult = { ...insertResults, id };
    this.budgetResults.set(id, results);
    return results;
  }
}

export const storage = new MemStorage();
