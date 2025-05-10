import { 
  users, type User, type InsertUser,
  collaborators, type Collaborator, type InsertCollaborator,
  officeCosts, type OfficeCost, type InsertOfficeCost,
  budgets, type Budget, type InsertBudget,
  budgetTasks, type BudgetTask, type InsertBudgetTask,
  budgetExtraCosts, type BudgetExtraCost, type InsertBudgetExtraCost,
  budgetAdjustments, type BudgetAdjustment, type InsertBudgetAdjustment,
  budgetResults, type BudgetResult, type InsertBudgetResult,
  clients, type Client, type InsertClient,
  onboardingTasks, type OnboardingTask, type InsertOnboardingTask,
  userTaskProgress, type UserTaskProgress, type InsertUserTaskProgress,
  userAchievements, type UserAchievement, type InsertUserAchievement,
  blogPosts, type BlogPost, type InsertBlogPost,
  blogCategories, type BlogCategory, type InsertBlogCategory,
  blogTags, type BlogTag, type InsertBlogTag,
  blogPostTags, type BlogPostTag, type InsertBlogPostTag,
  blogComments, type BlogComment, type InsertBlogComment,
  blogInsights, type BlogInsight, type InsertBlogInsight
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnboardingProgress(id: number, data: { 
    onboardingProgress?: number;
    onboardingCompleted?: boolean; 
    onboardingStepsDone?: number;
    totalPoints?: number;
    level?: number;
  }): Promise<User | undefined>;

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

  // Onboarding task operations
  getOnboardingTasks(): Promise<OnboardingTask[]>;
  getOnboardingTask(id: number): Promise<OnboardingTask | undefined>;
  createOnboardingTask(task: InsertOnboardingTask): Promise<OnboardingTask>;
  updateOnboardingTask(id: number, task: Partial<InsertOnboardingTask>): Promise<OnboardingTask | undefined>;
  deleteOnboardingTask(id: number): Promise<boolean>;

  // User task progress operations
  getUserTaskProgress(userId: number): Promise<UserTaskProgress[]>;
  getUserTaskProgressByTask(userId: number, taskId: number): Promise<UserTaskProgress | undefined>;
  createOrUpdateUserTaskProgress(progress: InsertUserTaskProgress): Promise<UserTaskProgress>;
  markTaskAsCompleted(userId: number, taskId: number, pointsEarned: number): Promise<UserTaskProgress | undefined>;

  // User achievements operations
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Blog posts operations
  getBlogPosts(options?: {
    limit?: number,
    offset?: number,
    userId?: number,
    categoryId?: number,
    tag?: string,
    status?: string,
    featured?: boolean,
    searchTerm?: string
  }): Promise<BlogPost[]>;
  getBlogPostCount(options?: {
    userId?: number,
    categoryId?: number,
    tag?: string,
    status?: string,
    searchTerm?: string
  }): Promise<number>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  incrementBlogPostViewCount(id: number): Promise<boolean>;
  
  // Blog categories operations
  getBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(id: number): Promise<BlogCategory | undefined>;
  getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  updateBlogCategory(id: number, category: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined>;
  deleteBlogCategory(id: number): Promise<boolean>;
  
  // Blog tags operations
  getBlogTags(): Promise<BlogTag[]>;
  getBlogTag(id: number): Promise<BlogTag | undefined>;
  getBlogTagBySlug(slug: string): Promise<BlogTag | undefined>;
  createBlogTag(tag: InsertBlogTag): Promise<BlogTag>;
  updateBlogTag(id: number, tag: Partial<InsertBlogTag>): Promise<BlogTag | undefined>;
  deleteBlogTag(id: number): Promise<boolean>;
  
  // Blog post tags operations
  getBlogPostTags(postId: number): Promise<BlogTag[]>;
  addTagToPost(postId: number, tagId: number): Promise<BlogPostTag>;
  removeTagFromPost(postId: number, tagId: number): Promise<boolean>;
  
  // Blog comments operations
  getBlogComments(postId: number, status?: string): Promise<BlogComment[]>;
  getBlogComment(id: number): Promise<BlogComment | undefined>;
  createBlogComment(comment: InsertBlogComment): Promise<BlogComment>;
  updateBlogCommentStatus(id: number, status: string): Promise<BlogComment | undefined>;
  deleteBlogComment(id: number): Promise<boolean>;
  
  // Blog insights operations
  getBlogInsight(postId: number): Promise<BlogInsight | undefined>;
  createOrUpdateBlogInsight(insight: InsertBlogInsight): Promise<BlogInsight>;
  updateBlogInsightMetrics(postId: number, metrics: {
    viewCount?: number,
    visitorsCount?: number,
    engagementTime?: number,
    clickThroughRate?: number,
    shareCount?: number,
    referrers?: Record<string, number>,
    searchTerms?: Record<string, number>
  }): Promise<BlogInsight | undefined>;
}

export class MemStorage implements IStorage {
  // Coleção de usuários
  private users = new Map<number, User>();
  private currentUserId = 1;
  
  // Coleções de blog 
  private blogPosts = new Map<number, BlogPost>();
  private blogCategories = new Map<number, BlogCategory>();  
  private blogTags = new Map<number, BlogTag>();
  private blogPostTags = new Map<number, BlogPostTag>();
  private blogComments = new Map<number, BlogComment>();
  private blogInsights = new Map<number, BlogInsight>();
  
  // Contadores para IDs do blog
  private currentBlogPostId = 1;
  private currentBlogCategoryId = 1;
  private currentBlogTagId = 1;
  private currentBlogPostTagId = 1;
  private currentBlogCommentId = 1;
  private currentBlogInsightId = 1;
  
  // Projetos e orçamentos
  private projects = new Map<number, Project>();
  private currentProjectId = 1;
  
  private budgets = new Map<number, Budget>();
  private budgetTasks = new Map<number, BudgetTask>();
  private budgetExternalCosts = new Map<number, BudgetExternalCost>();
  private budgetAdjustments = new Map<number, BudgetAdjustment>();
  private budgetCalculation = new Map<number, BudgetCalculation>();
  private currentBudgetId = 1;
  private currentBudgetTaskId = 1;
  private currentBudgetExternalCostId = 1;
  private currentBudgetAdjustmentId = 1;
  private currentBudgetCalculationId = 1;
  
  // Gamificação
  private gamificationTasks = new Map<number, GamificationTask>();
  private userProgress = new Map<number, UserProgress>();
  private userAchievements = new Map<number, UserAchievement>();
  private currentGamificationTaskId = 1;
  private currentUserProgressId = 1;
  private currentUserAchievementId = 1;
  // Blog posts operations
  async getBlogPosts(options?: {
    limit?: number,
    offset?: number,
    userId?: number,
    categoryId?: number,
    tag?: string,
    status?: string,
    featured?: boolean,
    searchTerm?: string
  }): Promise<BlogPost[]> {
    let posts = Array.from(this.blogPosts.values());
    
    // Aplicar filtros conforme opções
    if (options?.userId) {
      posts = posts.filter(post => post.userId === options.userId);
    }
    
    if (options?.categoryId) {
      posts = posts.filter(post => post.categoryId === options.categoryId);
    }
    
    if (options?.tag) {
      // Buscar posts com a tag específica
      const tagObj = Array.from(this.blogTags.values()).find(t => t.slug === options.tag);
      if (tagObj) {
        const postTags = Array.from(this.blogPostTags.values())
          .filter(pt => pt.tagId === tagObj.id)
          .map(pt => pt.postId);
        posts = posts.filter(post => postTags.includes(post.id));
      } else {
        return [];
      }
    }
    
    if (options?.status) {
      posts = posts.filter(post => post.status === options.status);
    } else {
      // Se não especificado, retornar apenas publicados
      posts = posts.filter(post => post.status === 'published');
    }
    
    if (options?.featured !== undefined) {
      posts = posts.filter(post => post.featured === options.featured);
    }
    
    if (options?.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchLower) || 
        post.content.toLowerCase().includes(searchLower) ||
        post.summary.toLowerCase().includes(searchLower)
      );
    }
    
    // Ordenação: mais recentes primeiro
    posts.sort((a, b) => 
      new Date(b.publishedAt || b.createdAt).getTime() - 
      new Date(a.publishedAt || a.createdAt).getTime()
    );
    
    // Paginação
    if (options?.offset !== undefined && options?.limit) {
      const start = options.offset;
      const end = options.offset + options.limit;
      posts = posts.slice(start, end);
    } else if (options?.limit) {
      posts = posts.slice(0, options.limit);
    }
    
    return posts;
  }
  
  async getBlogPostCount(options?: {
    userId?: number,
    categoryId?: number,
    tag?: string,
    status?: string,
    searchTerm?: string
  }): Promise<number> {
    // Reutiliza a lógica de filtragem do getBlogPosts, mas retorna apenas a contagem
    const posts = await this.getBlogPosts(options);
    return posts.length;
  }
  
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(post => post.slug === slug);
  }
  
  async createBlogPost(post: InsertBlogPost & { tags?: number[] }): Promise<BlogPost> {
    const id = this.currentBlogPostId++;
    const timestamp = new Date();
    
    // Extrair tags do objeto post antes de criar o registro do blog
    const { tags, ...postData } = post as any;
    
    const newPost: BlogPost = {
      ...postData,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      viewCount: 0,
      featuredImage: postData.featuredImage || null,
      imageAlt: postData.imageAlt || null,
      metaTitle: postData.metaTitle || null,
      metaDescription: postData.metaDescription || null,
      publishedAt: postData.status === 'published' ? timestamp : null,
      featured: postData.featured || false
    };
    
    this.blogPosts.set(id, newPost);
    
    // Adicionar tags se fornecidas
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        await this.addTagToPost(id, tagId);
      }
    }
    
    return newPost;
  }
  
  async updateBlogPost(id: number, updateData: Partial<InsertBlogPost> & { tags?: number[] }): Promise<BlogPost | undefined> {
    const post = this.blogPosts.get(id);
    if (!post) return undefined;
    
    // Extrair tags do objeto updateData antes de atualizar o post
    const { tags, ...postUpdateData } = updateData as any;
    
    // Se alterando status para publicado e não tinha data de publicação anterior
    if (postUpdateData.status === 'published' && !post.publishedAt) {
      postUpdateData.publishedAt = new Date();
    }
    
    const updatedPost = { 
      ...post, 
      ...postUpdateData,
      updatedAt: new Date()
    };
    
    this.blogPosts.set(id, updatedPost);
    
    // Atualizar tags se fornecidas
    if (tags && Array.isArray(tags)) {
      // Obter tags atuais
      const currentTags = Array.from(this.blogPostTags.values())
        .filter(pt => pt.postId === id)
        .map(pt => pt.tagId);
      
      // Remover tags que não estão mais na lista
      for (const tagId of currentTags) {
        if (!tags.includes(tagId)) {
          await this.removeTagFromPost(id, tagId);
        }
      }
      
      // Adicionar novas tags
      for (const tagId of tags) {
        if (!currentTags.includes(tagId)) {
          await this.addTagToPost(id, tagId);
        }
      }
    }
    
    return updatedPost;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    // Remover todas as tags associadas
    const postTags = Array.from(this.blogPostTags.values())
      .filter(pt => pt.postId === id);
    
    for (const pt of postTags) {
      this.blogPostTags.delete(pt.id);
    }
    
    // Remover comentários associados
    const postComments = Array.from(this.blogComments.values())
      .filter(c => c.postId === id);
    
    for (const comment of postComments) {
      this.blogComments.delete(comment.id);
    }
    
    // Remover insights associados
    const insight = Array.from(this.blogInsights.values())
      .find(i => i.postId === id);
    
    if (insight) {
      this.blogInsights.delete(insight.id);
    }
    
    return this.blogPosts.delete(id);
  }
  
  async incrementBlogPostViewCount(id: number): Promise<boolean> {
    const post = this.blogPosts.get(id);
    if (!post) return false;
    
    post.viewCount += 1;
    this.blogPosts.set(id, post);
    
    return true;
  }
  
  // Blog categories operations
  async getBlogCategories(): Promise<BlogCategory[]> {
    return Array.from(this.blogCategories.values());
  }
  
  async getBlogCategory(id: number): Promise<BlogCategory | undefined> {
    return this.blogCategories.get(id);
  }
  
  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
    return Array.from(this.blogCategories.values()).find(cat => cat.slug === slug);
  }
  
  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const id = this.currentBlogCategoryId++;
    const timestamp = new Date();
    
    const newCategory: BlogCategory = {
      ...category,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      description: category.description || null,
      metaTitle: category.metaTitle || null,
      metaDescription: category.metaDescription || null,
      featuredImage: category.featuredImage || null
    };
    
    this.blogCategories.set(id, newCategory);
    return newCategory;
  }
  
  async updateBlogCategory(id: number, updateData: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined> {
    const category = this.blogCategories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { 
      ...category, 
      ...updateData,
      updatedAt: new Date()
    };
    
    this.blogCategories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteBlogCategory(id: number): Promise<boolean> {
    // Verificar se há posts com essa categoria
    const postsWithCategory = Array.from(this.blogPosts.values())
      .filter(post => post.categoryId === id);
    
    // Se houver posts, atualizar para categoria padrão (id = 1) ou null
    for (const post of postsWithCategory) {
      post.categoryId = 1; // Usando ID 1 como categoria padrão
      this.blogPosts.set(post.id, post);
    }
    
    return this.blogCategories.delete(id);
  }
  
  // Blog tags operations
  async getBlogTags(): Promise<BlogTag[]> {
    return Array.from(this.blogTags.values());
  }
  
  async getBlogTag(id: number): Promise<BlogTag | undefined> {
    return this.blogTags.get(id);
  }
  
  async getBlogTagBySlug(slug: string): Promise<BlogTag | undefined> {
    return Array.from(this.blogTags.values()).find(tag => tag.slug === slug);
  }
  
  async createBlogTag(tag: InsertBlogTag): Promise<BlogTag> {
    const id = this.currentBlogTagId++;
    const timestamp = new Date();
    
    const newTag: BlogTag = {
      ...tag,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      description: tag.description || null
    };
    
    this.blogTags.set(id, newTag);
    return newTag;
  }
  
  async updateBlogTag(id: number, updateData: Partial<InsertBlogTag>): Promise<BlogTag | undefined> {
    const tag = this.blogTags.get(id);
    if (!tag) return undefined;
    
    const updatedTag = { 
      ...tag, 
      ...updateData,
      updatedAt: new Date()
    };
    
    this.blogTags.set(id, updatedTag);
    return updatedTag;
  }
  
  async deleteBlogTag(id: number): Promise<boolean> {
    // Remover todas as associações de post com esta tag
    const tagAssociations = Array.from(this.blogPostTags.values())
      .filter(pt => pt.tagId === id);
    
    for (const pt of tagAssociations) {
      this.blogPostTags.delete(pt.id);
    }
    
    return this.blogTags.delete(id);
  }
  
  // Blog post tags operations
  async getBlogPostTags(postId: number): Promise<BlogTag[]> {
    // Obter IDs de todas as tags associadas ao post
    const tagIds = Array.from(this.blogPostTags.values())
      .filter(pt => pt.postId === postId)
      .map(pt => pt.tagId);
    
    // Obter objetos de tag completos
    const tags = tagIds.map(id => this.blogTags.get(id)).filter(Boolean) as BlogTag[];
    
    return tags;
  }
  
  async addTagToPost(postId: number, tagId: number): Promise<BlogPostTag> {
    // Verificar se já existe essa associação
    const existing = Array.from(this.blogPostTags.values())
      .find(pt => pt.postId === postId && pt.tagId === tagId);
    
    if (existing) return existing;
    
    const id = this.currentBlogPostTagId++;
    const postTag: BlogPostTag = {
      id,
      postId,
      tagId,
      createdAt: new Date()
    };
    
    this.blogPostTags.set(id, postTag);
    return postTag;
  }
  
  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    const postTag = Array.from(this.blogPostTags.values())
      .find(pt => pt.postId === postId && pt.tagId === tagId);
    
    if (!postTag) return false;
    
    return this.blogPostTags.delete(postTag.id);
  }
  
  // Blog comments operations
  async getBlogComments(postId: number, status?: string): Promise<BlogComment[]> {
    let comments = Array.from(this.blogComments.values())
      .filter(comment => comment.postId === postId);
    
    if (status) {
      comments = comments.filter(comment => comment.status === status);
    }
    
    // Ordenar por data (mais recentes primeiro)
    comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return comments;
  }
  
  async getBlogComment(id: number): Promise<BlogComment | undefined> {
    return this.blogComments.get(id);
  }
  
  async createBlogComment(comment: InsertBlogComment): Promise<BlogComment> {
    const id = this.currentBlogCommentId++;
    const timestamp = new Date();
    
    const newComment: BlogComment = {
      ...comment,
      id,
      createdAt: timestamp,
      status: comment.status || 'pending' // por padrão, comentários aguardam aprovação
    };
    
    this.blogComments.set(id, newComment);
    return newComment;
  }
  
  async updateBlogCommentStatus(id: number, status: string): Promise<BlogComment | undefined> {
    const comment = this.blogComments.get(id);
    if (!comment) return undefined;
    
    comment.status = status;
    this.blogComments.set(id, comment);
    
    return comment;
  }
  
  async deleteBlogComment(id: number): Promise<boolean> {
    return this.blogComments.delete(id);
  }
  
  // Blog insights operations
  async getBlogInsight(postId: number): Promise<BlogInsight | undefined> {
    return Array.from(this.blogInsights.values())
      .find(insight => insight.postId === postId);
  }
  
  async createOrUpdateBlogInsight(insight: InsertBlogInsight): Promise<BlogInsight> {
    // Verificar se já existe insight para esse post
    const existing = await this.getBlogInsight(insight.postId);
    
    if (existing) {
      const updatedInsight = {
        ...existing,
        ...insight,
        updatedAt: new Date()
      };
      
      this.blogInsights.set(existing.id, updatedInsight);
      return updatedInsight;
    }
    
    // Caso não exista, criar novo
    const id = this.currentBlogInsightId++;
    const timestamp = new Date();
    
    const newInsight: BlogInsight = {
      ...insight,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      viewCount: insight.viewCount || 0,
      visitorsCount: insight.visitorsCount || 0,
      engagementTime: insight.engagementTime || 0,
      clickThroughRate: insight.clickThroughRate || 0,
      shareCount: insight.shareCount || 0,
      referrers: insight.referrers || {},
      searchTerms: insight.searchTerms || {}
    };
    
    this.blogInsights.set(id, newInsight);
    return newInsight;
  }
  
  async updateBlogInsightMetrics(postId: number, metrics: {
    viewCount?: number,
    visitorsCount?: number,
    engagementTime?: number,
    clickThroughRate?: number,
    shareCount?: number,
    referrers?: Record<string, number>,
    searchTerms?: Record<string, number>
  }): Promise<BlogInsight | undefined> {
    const insight = await this.getBlogInsight(postId);
    if (!insight) return undefined;
    
    const updatedInsight = {
      ...insight,
      ...metrics,
      updatedAt: new Date()
    };
    
    // Mesclar objetos referrers e searchTerms
    if (metrics.referrers) {
      updatedInsight.referrers = {
        ...insight.referrers,
        ...metrics.referrers
      };
    }
    
    if (metrics.searchTerms) {
      updatedInsight.searchTerms = {
        ...insight.searchTerms,
        ...metrics.searchTerms
      };
    }
    
    this.blogInsights.set(insight.id, updatedInsight);
    return updatedInsight;
  }
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
  
  // Armazenamento para gamificação
  private onboardingTasks: Map<number, OnboardingTask>;
  private userTaskProgress: Map<number, UserTaskProgress>;
  private userAchievements: Map<number, UserAchievement>;
  
  // Blog storage
  private blogPosts: Map<number, BlogPost>;
  private blogCategories: Map<number, BlogCategory>;
  private blogTags: Map<number, BlogTag>;
  private blogPostTags: Map<number, BlogPostTag>;
  private blogComments: Map<number, BlogComment>;
  private blogInsights: Map<number, BlogInsight>;
  
  private currentUserId: number;
  private currentClientId: number;
  private currentCollaboratorId: number;
  private currentOfficeCostId: number;
  private currentBudgetId: number;
  private currentBudgetTaskId: number;
  private currentBudgetExtraCostId: number;
  private currentBudgetAdjustmentId: number;
  private currentBudgetResultId: number;
  private currentOnboardingTaskId: number;
  private currentUserTaskProgressId: number;
  private currentUserAchievementId: number;
  private currentBlogPostId: number;
  private currentBlogCategoryId: number;
  private currentBlogTagId: number;
  private currentBlogPostTagId: number;
  private currentBlogCommentId: number;
  private currentBlogInsightId: number;

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
    this.onboardingTasks = new Map();
    this.userTaskProgress = new Map();
    this.userAchievements = new Map();
    this.blogPosts = new Map();
    this.blogCategories = new Map();
    this.blogTags = new Map();
    this.blogPostTags = new Map();
    this.blogComments = new Map();
    this.blogInsights = new Map();
    
    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentCollaboratorId = 1;
    this.currentOfficeCostId = 1;
    this.currentBudgetId = 1;
    this.currentBudgetTaskId = 1;
    this.currentBudgetExtraCostId = 1;
    this.currentBudgetAdjustmentId = 1;
    this.currentBudgetResultId = 1;
    this.currentOnboardingTaskId = 1;
    this.currentUserTaskProgressId = 1;
    this.currentUserAchievementId = 1;
    this.currentBlogPostId = 1;
    this.currentBlogCategoryId = 1;
    this.currentBlogTagId = 1;
    this.currentBlogPostTagId = 1;
    this.currentBlogCommentId = 1;
    this.currentBlogInsightId = 1;
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
      position: insertUser.position || null,
      onboardingProgress: 0,
      onboardingCompleted: false,
      onboardingStepsDone: 0,
      totalPoints: 0,
      level: 1
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserOnboardingProgress(id: number, data: { 
    onboardingProgress?: number;
    onboardingCompleted?: boolean; 
    onboardingStepsDone?: number;
    totalPoints?: number;
    level?: number;
  }): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...data
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
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
    // Buscar o objeto básico do custo
    const basicCost = Array.from(this.officeCosts.values()).find(
      (cost) => cost.userId === userId
    );
    
    if (basicCost) {
      try {
        // Log para debug
        console.log("Objeto de custos básico encontrado:", JSON.stringify(basicCost));
        
        // Recuperar os detalhes dos custos que estão armazenados separadamente
        const details = this.officeCostDetails.get(basicCost.id);
        
        // Se houver detalhes salvos, retorná-los; caso contrário, criar o formato padrão
        if (details) {
          console.log("Detalhes encontrados para o custo:", JSON.stringify(details));
          
          // Verificar se os itens são arrays válidos
          let fixedItems = Array.isArray(details.fixedCostItems) ? details.fixedCostItems : [];
          let variableItems = Array.isArray(details.variableCostItems) ? details.variableCostItems : [];
          
          // Se não houver itens nos arrays, usar os valores padrão baseados nos totais
          if (fixedItems.length === 0) {
            fixedItems = [{ 
              id: 1, 
              name: 'Custos Fixos Totais', 
              value: parseFloat(basicCost.fixedCosts), 
              description: null 
            }];
          }
          
          if (variableItems.length === 0) {
            variableItems = [{ 
              id: 1, 
              name: 'Custos Variáveis Totais', 
              value: parseFloat(basicCost.variableCosts), 
              description: null 
            }];
          }
          
          // Criar o objeto completo com detalhes 
          const result = {
            ...basicCost,
            fixedCosts: fixedItems,
            variableCosts: variableItems,
            technicalReservePercentage: details.technicalReservePercentage || 15,
            productiveHoursPerMonth: basicCost.productiveHoursMonth // Mapear campo para compatibilidade
          };
          
          console.log("Retornando objeto com detalhes completos:", JSON.stringify(result));
          return result as any; // Casting para evitar erros de tipo
        } else {
          // Se não houver detalhes, usar valores padrão
          console.log("Nenhum detalhe encontrado, criando objeto padrão com base nos totais");
          
          // Criar arrays de itens únicos com os totais
          const result = {
            ...basicCost,
            fixedCosts: [
              { id: 1, name: 'Custos Fixos Totais', value: parseFloat(basicCost.fixedCosts), description: null }
            ],
            variableCosts: [
              { id: 1, name: 'Custos Variáveis Totais', value: parseFloat(basicCost.variableCosts), description: null }
            ],
            technicalReservePercentage: 15, // Valor padrão para reserva técnica
            productiveHoursPerMonth: basicCost.productiveHoursMonth // Mapear campo para compatibilidade
          };
          
          console.log("Retornando objeto padrão:", JSON.stringify(result));
          return result as any;
        }
      } catch (error) {
        console.error("Erro ao processar detalhes dos custos:", error);
        
        // Em caso de erro, retornamos um objeto básico com formato adequado
        const fallbackResult = {
          ...basicCost,
          fixedCosts: [
            { id: 1, name: 'Custos Fixos Totais', value: parseFloat(basicCost.fixedCosts), description: null }
          ],
          variableCosts: [
            { id: 1, name: 'Custos Variáveis Totais', value: parseFloat(basicCost.variableCosts), description: null }
          ],
          technicalReservePercentage: 15,
          productiveHoursPerMonth: basicCost.productiveHoursMonth
        };
        
        console.log("Retornando objeto de fallback devido a erro:", JSON.stringify(fallbackResult));
        return fallbackResult as any;
      }
    } else {
      console.log("Nenhum custo encontrado para o usuário:", userId);
      // Se não encontramos o objeto básico, retornamos undefined
      return undefined;
    }
  }

  async createOrUpdateOfficeCost(insertOfficeCost: InsertOfficeCost): Promise<OfficeCost> {
    const existingCost = await this.getOfficeCost(insertOfficeCost.userId);
    
    // Variáveis para armazenar os detalhes
    let fixedCostItems: any[] = [];
    let variableCostItems: any[] = [];
    let technicalReservePercentage = 15; // Valor padrão
    
    // Verificar o formato dos dados de entrada e obter os detalhes
    if ((insertOfficeCost as any).fixedCostItems !== undefined) {
      // Se os detalhes são enviados como propriedades específicas fixedCostItems/variableCostItems
      const extendedData = insertOfficeCost as any;
      fixedCostItems = Array.isArray(extendedData.fixedCostItems) ? extendedData.fixedCostItems : [];
      variableCostItems = Array.isArray(extendedData.variableCostItems) ? extendedData.variableCostItems : [];
      technicalReservePercentage = extendedData.technicalReservePercentage || 15;
      
      console.log('Usando fixedCostItems explícitos:', JSON.stringify(fixedCostItems));
    } else if (Array.isArray((insertOfficeCost as any).fixedCosts)) {
      // Se os custos são enviados diretamente como arrays nas propriedades fixedCosts/variableCosts
      fixedCostItems = (insertOfficeCost as any).fixedCosts;
      variableCostItems = Array.isArray((insertOfficeCost as any).variableCosts) 
        ? (insertOfficeCost as any).variableCosts 
        : [];
      technicalReservePercentage = (insertOfficeCost as any).technicalReservePercentage || 15;
      
      console.log('Usando fixedCosts como arrays:', JSON.stringify(fixedCostItems));
    }
    
    // Log para debug
    console.log('fixedCostItems a serem salvos:', JSON.stringify(fixedCostItems));
    console.log('variableCostItems a serem salvos:', JSON.stringify(variableCostItems));
    
    // Calcular os totais dos custos a partir dos itens detalhados (apenas para fins de armazenamento)
    const fixedCostsTotal = fixedCostItems.reduce((sum, cost) => 
      sum + (Number(cost.value) || 0), 0);
    
    const variableCostsTotal = variableCostItems.reduce((sum, cost) => 
      sum + (Number(cost.value) || 0), 0);
    
    let officeCostId: number;
    
    if (existingCost) {
      // Atualizar um custo existente
      let updatedCost: any = { 
        ...existingCost,
        fixedCosts: fixedCostsTotal.toString(),
        variableCosts: variableCostsTotal.toString(),
        productiveHoursMonth: (insertOfficeCost as any).productiveHoursPerMonth || 
                              (insertOfficeCost as any).productiveHoursMonth || 
                              existingCost.productiveHoursMonth,
        defaultPricePerSqMeter: insertOfficeCost.defaultPricePerSqMeter || existingCost.defaultPricePerSqMeter,
        updatedAt: new Date() 
      };
      
      // Se estivermos atualizando um custo que veio do formato estendido, remover quaisquer propriedades fixedCosts/variableCosts que sejam arrays
      if (Array.isArray(updatedCost.fixedCosts) && typeof updatedCost.fixedCosts !== 'string') {
        updatedCost.fixedCosts = fixedCostsTotal.toString();
      }
      
      if (Array.isArray(updatedCost.variableCosts) && typeof updatedCost.variableCosts !== 'string') {
        updatedCost.variableCosts = variableCostsTotal.toString();
      }
      
      this.officeCosts.set(existingCost.id, updatedCost);
      officeCostId = existingCost.id;
    } else {
      // Criar um novo custo
      const id = this.currentOfficeCostId++;
      const timestamp = new Date();
      
      const officeCost: OfficeCost = { 
        userId: insertOfficeCost.userId,
        fixedCosts: fixedCostsTotal.toString(),
        variableCosts: variableCostsTotal.toString(),
        productiveHoursMonth: (insertOfficeCost as any).productiveHoursPerMonth || 
                              insertOfficeCost.productiveHoursMonth || 
                              168, // Valor padrão (21 dias * 8 horas)
        defaultPricePerSqMeter: insertOfficeCost.defaultPricePerSqMeter || "0",
        id, 
        updatedAt: timestamp 
      };
      
      this.officeCosts.set(id, officeCost);
      officeCostId = id;
    }
    
    // IMPORTANTE: Salvar os detalhes separadamente com os itens individuais
    this.officeCostDetails.set(officeCostId, {
      fixedCostItems: [...fixedCostItems], // Clonar o array para garantir independência
      variableCostItems: [...variableCostItems], // Clonar o array para garantir independência
      technicalReservePercentage
    });
    
    // Log para ajudar a depurar
    console.log('Detalhes salvos em officeCostDetails:', JSON.stringify({
      fixedCostItems, 
      variableCostItems, 
      technicalReservePercentage
    }));
    
    // Neste ponto, devemos retornar um objeto que já contém os itens individuais
    // Para isso, vamos montar manualmente em vez de chamar getOfficeCost
    const basicCost = this.officeCosts.get(officeCostId);
    if (!basicCost) {
      throw new Error(`Não foi possível encontrar o custo após salvar. ID: ${officeCostId}`);
    }
    
    // Montar o objeto completo para retorno
    const completeResult = {
      ...basicCost,
      // Aqui está a diferença crucial: retornamos os arrays de itens, não os valores totais
      fixedCosts: fixedCostItems,
      variableCosts: variableCostItems,
      technicalReservePercentage,
      productiveHoursPerMonth: basicCost.productiveHoursMonth // Mapear campo para compatibilidade
    };
    
    console.log('Objeto completo retornado:', JSON.stringify(completeResult));
    
    return completeResult as any; // Casting para evitar erros de tipo
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

  // Onboarding task operations
  async getOnboardingTasks(): Promise<OnboardingTask[]> {
    return Array.from(this.onboardingTasks.values()).sort((a, b) => a.order - b.order);
  }

  async getOnboardingTask(id: number): Promise<OnboardingTask | undefined> {
    return this.onboardingTasks.get(id);
  }

  async createOnboardingTask(task: InsertOnboardingTask): Promise<OnboardingTask> {
    const id = this.currentOnboardingTaskId++;
    const timestamp = new Date();
    const onboardingTask: OnboardingTask = { 
      ...task, 
      id, 
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.onboardingTasks.set(id, onboardingTask);
    return onboardingTask;
  }

  async updateOnboardingTask(id: number, updateData: Partial<InsertOnboardingTask>): Promise<OnboardingTask | undefined> {
    const task = this.onboardingTasks.get(id);
    if (!task) return undefined;

    const updatedTask = { 
      ...task, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.onboardingTasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteOnboardingTask(id: number): Promise<boolean> {
    return this.onboardingTasks.delete(id);
  }

  // User task progress operations
  async getUserTaskProgress(userId: number): Promise<UserTaskProgress[]> {
    return Array.from(this.userTaskProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }

  async getUserTaskProgressByTask(userId: number, taskId: number): Promise<UserTaskProgress | undefined> {
    return Array.from(this.userTaskProgress.values()).find(
      (progress) => progress.userId === userId && progress.taskId === taskId
    );
  }

  async createOrUpdateUserTaskProgress(progressData: InsertUserTaskProgress): Promise<UserTaskProgress> {
    const existingProgress = await this.getUserTaskProgressByTask(
      progressData.userId, 
      progressData.taskId
    );
    
    if (existingProgress) {
      const updatedProgress = { 
        ...existingProgress, 
        ...progressData,
        updatedAt: new Date()
      };
      this.userTaskProgress.set(existingProgress.id, updatedProgress);
      return updatedProgress;
    }
    
    const id = this.currentUserTaskProgressId++;
    const timestamp = new Date();
    const progress: UserTaskProgress = { 
      ...progressData, 
      id,
      completed: progressData.completed || false,
      pointsEarned: progressData.pointsEarned || 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: progressData.completed ? timestamp : null
    };
    this.userTaskProgress.set(id, progress);
    return progress;
  }

  async markTaskAsCompleted(userId: number, taskId: number, pointsEarned: number): Promise<UserTaskProgress | undefined> {
    const existingProgress = await this.getUserTaskProgressByTask(userId, taskId);
    const timestamp = new Date();
    
    if (existingProgress) {
      const updatedProgress = { 
        ...existingProgress, 
        completed: true,
        completedAt: timestamp,
        pointsEarned,
        updatedAt: timestamp
      };
      this.userTaskProgress.set(existingProgress.id, updatedProgress);
      
      // Atualizar pontos e progresso do usuário
      const user = await this.getUser(userId);
      if (user) {
        const tasks = await this.getOnboardingTasks();
        const userProgress = await this.getUserTaskProgress(userId);
        const completedTasks = userProgress.filter(p => p.completed);
        
        // Calcular novo progresso
        const progressPercentage = Math.round((completedTasks.length / tasks.length) * 100);
        const totalPoints = userProgress.reduce((sum, p) => sum + p.pointsEarned, 0);
        
        // Calcular novo nível (1 nível a cada 100 pontos)
        const newLevel = Math.max(1, Math.floor(totalPoints / 100) + 1);
        
        await this.updateUserOnboardingProgress(userId, {
          onboardingProgress: progressPercentage,
          onboardingStepsDone: completedTasks.length,
          onboardingCompleted: progressPercentage >= 100,
          totalPoints,
          level: newLevel
        });
      }
      
      return updatedProgress;
    }
    
    // Se não existe progresso anterior, criar um novo
    return this.createOrUpdateUserTaskProgress({
      userId,
      taskId,
      completed: true,
      pointsEarned,
      completedAt: timestamp
    });
  }

  // User achievements operations
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(
      (achievement) => achievement.userId === userId
    );
  }

  async createUserAchievement(achievementData: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.currentUserAchievementId++;
    const timestamp = new Date();
    const achievement: UserAchievement = { 
      ...achievementData, 
      id,
      earnedAt: timestamp,
      createdAt: timestamp
    };
    this.userAchievements.set(id, achievement);
    
    // Atualizar pontos do usuário
    const user = await this.getUser(achievementData.userId);
    if (user) {
      const newTotalPoints = user.totalPoints + achievementData.pointsAwarded;
      const newLevel = Math.max(1, Math.floor(newTotalPoints / 100) + 1);
      
      await this.updateUserOnboardingProgress(achievementData.userId, {
        totalPoints: newTotalPoints,
        level: newLevel
      });
    }
    
    return achievement;
  }
}

// Implementação do armazenamento de dados usando o banco de dados
import { db } from "./db";
import { eq, and, like, asc, desc, count, inArray, or } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // Blog posts operations
  async getBlogPosts(options?: {
    limit?: number,
    offset?: number,
    userId?: number,
    categoryId?: number,
    tag?: string,
    status?: string,
    featured?: boolean,
    searchTerm?: string
  }): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    
    // Aplicar filtros conforme opções
    if (options?.userId) {
      query = query.where(eq(blogPosts.userId, options.userId));
    }
    
    if (options?.categoryId) {
      query = query.where(eq(blogPosts.categoryId, options.categoryId));
    }
    
    if (options?.tag) {
      // Buscar posts com a tag específica
      const tag = await db.select().from(blogTags).where(eq(blogTags.slug, options.tag)).limit(1);
      if (tag.length > 0) {
        const tagId = tag[0].id;
        const postTags = await db.select().from(blogPostTags).where(eq(blogPostTags.tagId, tagId));
        const postIds = postTags.map(pt => pt.postId);
        
        if (postIds.length > 0) {
          query = query.where(inArray(blogPosts.id, postIds));
        } else {
          return [];
        }
      } else {
        return [];
      }
    }
    
    if (options?.status) {
      query = query.where(eq(blogPosts.status, options.status));
    } else {
      // Se não especificado, retornar apenas publicados
      query = query.where(eq(blogPosts.status, 'published'));
    }
    
    if (options?.featured !== undefined) {
      query = query.where(eq(blogPosts.featured, options.featured));
    }
    
    if (options?.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      // Busca por like em vários campos
      query = query.where(
        or(
          like(blogPosts.title, `%${searchLower}%`),
          like(blogPosts.content, `%${searchLower}%`),
          like(blogPosts.summary, `%${searchLower}%`)
        )
      );
    }
    
    // Ordenação: mais recentes primeiro
    query = query.orderBy(desc(blogPosts.publishedAt));
    
    // Paginação
    if (options?.limit) {
      query = query.limit(options.limit);
      
      if (options?.offset !== undefined) {
        query = query.offset(options.offset);
      }
    }
    
    const posts = await query;
    return posts;
  }
  
  async getBlogPostCount(options?: {
    userId?: number,
    categoryId?: number,
    tag?: string,
    status?: string,
    searchTerm?: string
  }): Promise<number> {
    let query = db.select({ count: count() }).from(blogPosts);
    
    // Aplicar filtros conforme opções
    if (options?.userId) {
      query = query.where(eq(blogPosts.userId, options.userId));
    }
    
    if (options?.categoryId) {
      query = query.where(eq(blogPosts.categoryId, options.categoryId));
    }
    
    if (options?.tag) {
      // Buscar posts com a tag específica
      const tag = await db.select().from(blogTags).where(eq(blogTags.slug, options.tag)).limit(1);
      if (tag.length > 0) {
        const tagId = tag[0].id;
        const postTags = await db.select().from(blogPostTags).where(eq(blogPostTags.tagId, tagId));
        const postIds = postTags.map(pt => pt.postId);
        
        if (postIds.length > 0) {
          query = query.where(inArray(blogPosts.id, postIds));
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    }
    
    if (options?.status) {
      query = query.where(eq(blogPosts.status, options.status));
    } else {
      // Se não especificado, contar apenas publicados
      query = query.where(eq(blogPosts.status, 'published'));
    }
    
    if (options?.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      // Busca por like em vários campos
      query = query.where(
        or(
          like(blogPosts.title, `%${searchLower}%`),
          like(blogPosts.content, `%${searchLower}%`),
          like(blogPosts.summary, `%${searchLower}%`)
        )
      );
    }
    
    const result = await query;
    return Number(result[0]?.count || 0);
  }
  
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }
  
  async createBlogPost(post: InsertBlogPost & { tags?: number[] }): Promise<BlogPost> {
    const timestamp = new Date();
    
    // Extrair tags do objeto post antes de criar o registro do blog
    const { tags, ...postData } = post as any;
    
    const [newPost] = await db.insert(blogPosts).values({
      ...postData,
      createdAt: timestamp,
      updatedAt: timestamp,
      viewCount: 0,
      featuredImage: postData.featuredImage || null,
      imageAlt: postData.imageAlt || null,
      metaTitle: postData.metaTitle || null,
      metaDescription: postData.metaDescription || null,
      publishedAt: postData.status === 'published' ? timestamp : null,
      featured: postData.featured || false
    }).returning();
    
    // Adicionar tags se fornecidas
    if (tags && Array.isArray(tags)) {
      for (const tagId of tags) {
        await this.addTagToPost(newPost.id, tagId);
      }
    }
    
    return newPost;
  }
  
  async updateBlogPost(id: number, updateData: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const post = await this.getBlogPost(id);
    if (!post) return undefined;
    
    // Se alterando status para publicado e não tinha data de publicação anterior
    if (updateData.status === 'published' && !post.publishedAt) {
      updateData.publishedAt = new Date();
    }
    
    const [updatedPost] = await db.update(blogPosts)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, id))
      .returning();
    
    // Atualizar tags se fornecidas
    if (updateData.tags && Array.isArray(updateData.tags)) {
      // Obter tags atuais
      const postTags = await db.select().from(blogPostTags).where(eq(blogPostTags.postId, id));
      const currentTagIds = postTags.map(pt => pt.tagId);
      
      // Remover tags que não estão mais na lista
      for (const tagId of currentTagIds) {
        if (!updateData.tags.includes(tagId)) {
          await this.removeTagFromPost(id, tagId);
        }
      }
      
      // Adicionar novas tags
      for (const tagId of updateData.tags) {
        if (!currentTagIds.includes(tagId)) {
          await this.addTagToPost(id, tagId);
        }
      }
    }
    
    return updatedPost;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    // Remover todas as tags associadas
    await db.delete(blogPostTags).where(eq(blogPostTags.postId, id));
    
    // Remover comentários associados
    await db.delete(blogComments).where(eq(blogComments.postId, id));
    
    // Remover insights associados
    await db.delete(blogInsights).where(eq(blogInsights.postId, id));
    
    // Remover o post
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return !!result;
  }
  
  async incrementBlogPostViewCount(id: number): Promise<boolean> {
    const post = await this.getBlogPost(id);
    if (!post) return false;
    
    await db.update(blogPosts)
      .set({ viewCount: post.viewCount + 1 })
      .where(eq(blogPosts.id, id));
    
    return true;
  }
  
  // Blog categories operations
  async getBlogCategories(): Promise<BlogCategory[]> {
    return db.select().from(blogCategories);
  }
  
  async getBlogCategory(id: number): Promise<BlogCategory | undefined> {
    const [category] = await db.select().from(blogCategories).where(eq(blogCategories.id, id));
    return category;
  }
  
  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
    const [category] = await db.select().from(blogCategories).where(eq(blogCategories.slug, slug));
    return category;
  }
  
  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const timestamp = new Date();
    
    const [newCategory] = await db.insert(blogCategories).values({
      ...category,
      createdAt: timestamp,
      updatedAt: timestamp,
      description: category.description || null,
      metaTitle: category.metaTitle || null,
      metaDescription: category.metaDescription || null,
      featuredImage: category.featuredImage || null
    }).returning();
    
    return newCategory;
  }
  
  async updateBlogCategory(id: number, updateData: Partial<InsertBlogCategory>): Promise<BlogCategory | undefined> {
    const category = await this.getBlogCategory(id);
    if (!category) return undefined;
    
    const [updatedCategory] = await db.update(blogCategories)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(blogCategories.id, id))
      .returning();
    
    return updatedCategory;
  }
  
  async deleteBlogCategory(id: number): Promise<boolean> {
    // Atualizar posts com essa categoria para a categoria padrão (id = 1)
    await db.update(blogPosts)
      .set({ categoryId: 1 })
      .where(eq(blogPosts.categoryId, id));
    
    // Remover a categoria
    const result = await db.delete(blogCategories).where(eq(blogCategories.id, id));
    return !!result;
  }
  
  // Blog tags operations
  async getBlogTags(): Promise<BlogTag[]> {
    return db.select().from(blogTags);
  }
  
  async getBlogTag(id: number): Promise<BlogTag | undefined> {
    const [tag] = await db.select().from(blogTags).where(eq(blogTags.id, id));
    return tag;
  }
  
  async getBlogTagBySlug(slug: string): Promise<BlogTag | undefined> {
    const [tag] = await db.select().from(blogTags).where(eq(blogTags.slug, slug));
    return tag;
  }
  
  async createBlogTag(tag: InsertBlogTag): Promise<BlogTag> {
    const timestamp = new Date();
    
    const [newTag] = await db.insert(blogTags).values({
      ...tag,
      createdAt: timestamp,
      updatedAt: timestamp,
      description: tag.description || null
    }).returning();
    
    return newTag;
  }
  
  async updateBlogTag(id: number, updateData: Partial<InsertBlogTag>): Promise<BlogTag | undefined> {
    const tag = await this.getBlogTag(id);
    if (!tag) return undefined;
    
    const [updatedTag] = await db.update(blogTags)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(blogTags.id, id))
      .returning();
    
    return updatedTag;
  }
  
  async deleteBlogTag(id: number): Promise<boolean> {
    // Remover todas as associações de post com esta tag
    await db.delete(blogPostTags).where(eq(blogPostTags.tagId, id));
    
    // Remover a tag
    const result = await db.delete(blogTags).where(eq(blogTags.id, id));
    return !!result;
  }
  
  // Blog post tags operations
  async getBlogPostTags(postId: number): Promise<BlogTag[]> {
    // Buscar tags relacionadas a este post usando join
    const tags = await db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
        description: blogTags.description,
        createdAt: blogTags.createdAt,
        updatedAt: blogTags.updatedAt
      })
      .from(blogTags)
      .innerJoin(blogPostTags, eq(blogTags.id, blogPostTags.tagId))
      .where(eq(blogPostTags.postId, postId));
    
    return tags;
  }
  
  async addTagToPost(postId: number, tagId: number): Promise<BlogPostTag> {
    // Verificar se já existe essa associação
    const [existing] = await db
      .select()
      .from(blogPostTags)
      .where(and(
        eq(blogPostTags.postId, postId),
        eq(blogPostTags.tagId, tagId)
      ));
    
    if (existing) return existing;
    
    // Criar nova associação
    const [postTag] = await db
      .insert(blogPostTags)
      .values({
        postId,
        tagId,
        createdAt: new Date()
      })
      .returning();
    
    return postTag;
  }
  
  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    const result = await db
      .delete(blogPostTags)
      .where(and(
        eq(blogPostTags.postId, postId),
        eq(blogPostTags.tagId, tagId)
      ));
    
    return !!result;
  }
  
  // Blog comments operations
  async getBlogComments(postId: number, status?: string): Promise<BlogComment[]> {
    let query = db.select().from(blogComments).where(eq(blogComments.postId, postId));
    
    if (status) {
      query = query.where(eq(blogComments.status, status));
    }
    
    // Ordenar por data (mais recentes primeiro)
    query = query.orderBy(desc(blogComments.createdAt));
    
    return query;
  }
  
  async getBlogComment(id: number): Promise<BlogComment | undefined> {
    const [comment] = await db.select().from(blogComments).where(eq(blogComments.id, id));
    return comment;
  }
  
  async createBlogComment(comment: InsertBlogComment): Promise<BlogComment> {
    const [newComment] = await db
      .insert(blogComments)
      .values({
        ...comment,
        createdAt: new Date(),
        status: comment.status || 'pending' // por padrão, comentários aguardam aprovação
      })
      .returning();
    
    return newComment;
  }
  
  async updateBlogCommentStatus(id: number, status: string): Promise<BlogComment | undefined> {
    const [updatedComment] = await db
      .update(blogComments)
      .set({ status })
      .where(eq(blogComments.id, id))
      .returning();
    
    return updatedComment;
  }
  
  async deleteBlogComment(id: number): Promise<boolean> {
    const result = await db.delete(blogComments).where(eq(blogComments.id, id));
    return !!result;
  }
  
  // Blog insights operations
  async getBlogInsight(postId: number): Promise<BlogInsight | undefined> {
    const [insight] = await db
      .select()
      .from(blogInsights)
      .where(eq(blogInsights.postId, postId));
    
    return insight;
  }
  
  async createOrUpdateBlogInsight(insight: InsertBlogInsight): Promise<BlogInsight> {
    // Verificar se já existe insight para esse post
    const existing = await this.getBlogInsight(insight.postId);
    
    if (existing) {
      // Atualizar insight existente
      const [updatedInsight] = await db
        .update(blogInsights)
        .set({
          ...insight,
          updatedAt: new Date()
        })
        .where(eq(blogInsights.id, existing.id))
        .returning();
      
      return updatedInsight;
    }
    
    // Criar novo insight
    const timestamp = new Date();
    
    const [newInsight] = await db
      .insert(blogInsights)
      .values({
        ...insight,
        createdAt: timestamp,
        updatedAt: timestamp,
        viewCount: insight.viewCount || 0,
        visitorsCount: insight.visitorsCount || 0,
        engagementTime: insight.engagementTime || 0,
        clickThroughRate: insight.clickThroughRate || 0,
        shareCount: insight.shareCount || 0,
        referrers: insight.referrers || {},
        searchTerms: insight.searchTerms || {}
      })
      .returning();
    
    return newInsight;
  }
  
  async updateBlogInsightMetrics(postId: number, metrics: {
    viewCount?: number,
    visitorsCount?: number,
    engagementTime?: number,
    clickThroughRate?: number,
    shareCount?: number,
    referrers?: Record<string, number>,
    searchTerms?: Record<string, number>
  }): Promise<BlogInsight | undefined> {
    const insight = await this.getBlogInsight(postId);
    if (!insight) return undefined;
    
    let updatedReferrers = insight.referrers || {};
    let updatedSearchTerms = insight.searchTerms || {};
    
    // Mesclar objetos referrers e searchTerms
    if (metrics.referrers) {
      updatedReferrers = {
        ...updatedReferrers,
        ...metrics.referrers
      };
    }
    
    if (metrics.searchTerms) {
      updatedSearchTerms = {
        ...updatedSearchTerms,
        ...metrics.searchTerms
      };
    }
    
    const [updatedInsight] = await db
      .update(blogInsights)
      .set({
        ...metrics,
        referrers: updatedReferrers,
        searchTerms: updatedSearchTerms,
        updatedAt: new Date()
      })
      .where(eq(blogInsights.id, insight.id))
      .returning();
    
    return updatedInsight;
  }
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUserOnboardingProgress(id: number, data: { 
    onboardingProgress?: number;
    onboardingCompleted?: boolean; 
    onboardingStepsDone?: number;
    totalPoints?: number;
    level?: number;
  }): Promise<User | undefined> {
    console.log(`Atualizando progresso do usuário ${id} com:`, data);
    
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    console.log("Usuário após atualização:", user);
    return user || undefined;
  }

  // Client operations
  async getClients(userId: number): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(asc(clients.name));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientsBySearch(userId: number, searchTerm: string): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.userId, userId),
          like(clients.name, `%${searchTerm}%`)
        )
      )
      .orderBy(asc(clients.name));
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db
      .delete(clients)
      .where(eq(clients.id, id));
    return true;
  }

  // Collaborator operations
  async getCollaborators(userId: number): Promise<Collaborator[]> {
    return await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.userId, userId))
      .orderBy(asc(collaborators.name));
  }

  async getCollaborator(id: number): Promise<Collaborator | undefined> {
    const [collaborator] = await db.select().from(collaborators).where(eq(collaborators.id, id));
    return collaborator || undefined;
  }

  async createCollaborator(insertCollaborator: InsertCollaborator): Promise<Collaborator> {
    const [collaborator] = await db
      .insert(collaborators)
      .values(insertCollaborator)
      .returning();
    return collaborator;
  }

  async updateCollaborator(id: number, updateData: Partial<InsertCollaborator>): Promise<Collaborator | undefined> {
    const [collaborator] = await db
      .update(collaborators)
      .set(updateData)
      .where(eq(collaborators.id, id))
      .returning();
    return collaborator || undefined;
  }

  async deleteCollaborator(id: number): Promise<boolean> {
    await db
      .delete(collaborators)
      .where(eq(collaborators.id, id));
    return true;
  }

  // Office costs operations
  async getOfficeCost(userId: number): Promise<OfficeCost | undefined> {
    const [officeCost] = await db
      .select()
      .from(officeCosts)
      .where(eq(officeCosts.userId, userId));
    return officeCost || undefined;
  }

  async createOrUpdateOfficeCost(insertOfficeCost: InsertOfficeCost): Promise<OfficeCost> {
    const existingOfficeCost = await this.getOfficeCost(insertOfficeCost.userId);
    
    if (existingOfficeCost) {
      const [officeCost] = await db
        .update(officeCosts)
        .set({
          ...insertOfficeCost,
          updatedAt: new Date()
        })
        .where(eq(officeCosts.id, existingOfficeCost.id))
        .returning();
      return officeCost;
    }
    
    const [officeCost] = await db
      .insert(officeCosts)
      .values(insertOfficeCost)
      .returning();
    return officeCost;
  }

  // Budget operations
  async getBudgets(userId: number): Promise<Budget[]> {
    return await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId))
      .orderBy(asc(budgets.name));
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget || undefined;
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db
      .insert(budgets)
      .values(insertBudget)
      .returning();
    return budget;
  }

  async updateBudget(id: number, updateData: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [budget] = await db
      .update(budgets)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(budgets.id, id))
      .returning();
    return budget || undefined;
  }

  async deleteBudget(id: number): Promise<boolean> {
    await db
      .delete(budgets)
      .where(eq(budgets.id, id));
    return true;
  }
  
  // Este é um comentário para manter o espaçamento

  // Budget task operations
  async getBudgetTasks(budgetId: number): Promise<BudgetTask[]> {
    return await db
      .select()
      .from(budgetTasks)
      .where(eq(budgetTasks.budgetId, budgetId));
  }

  async createBudgetTask(insertTask: InsertBudgetTask): Promise<BudgetTask> {
    const [task] = await db
      .insert(budgetTasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateBudgetTask(id: number, updateData: Partial<InsertBudgetTask>): Promise<BudgetTask | undefined> {
    const [task] = await db
      .update(budgetTasks)
      .set(updateData)
      .where(eq(budgetTasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteBudgetTask(id: number): Promise<boolean> {
    await db
      .delete(budgetTasks)
      .where(eq(budgetTasks.id, id));
    return true;
  }

  // Budget extra costs operations
  async getBudgetExtraCosts(budgetId: number): Promise<BudgetExtraCost | undefined> {
    const [extraCosts] = await db
      .select()
      .from(budgetExtraCosts)
      .where(eq(budgetExtraCosts.budgetId, budgetId));
    return extraCosts || undefined;
  }

  async createOrUpdateBudgetExtraCosts(insertExtraCosts: InsertBudgetExtraCost): Promise<BudgetExtraCost> {
    const existingExtraCosts = await this.getBudgetExtraCosts(insertExtraCosts.budgetId);
    
    if (existingExtraCosts) {
      const [extraCosts] = await db
        .update(budgetExtraCosts)
        .set(insertExtraCosts)
        .where(eq(budgetExtraCosts.id, existingExtraCosts.id))
        .returning();
      return extraCosts;
    }
    
    const [extraCosts] = await db
      .insert(budgetExtraCosts)
      .values(insertExtraCosts)
      .returning();
    return extraCosts;
  }

  // Budget adjustments operations
  async getBudgetAdjustments(budgetId: number): Promise<BudgetAdjustment | undefined> {
    const [adjustments] = await db
      .select()
      .from(budgetAdjustments)
      .where(eq(budgetAdjustments.budgetId, budgetId));
    return adjustments || undefined;
  }

  async createOrUpdateBudgetAdjustments(insertAdjustments: InsertBudgetAdjustment): Promise<BudgetAdjustment> {
    const existingAdjustments = await this.getBudgetAdjustments(insertAdjustments.budgetId);
    
    if (existingAdjustments) {
      const [adjustments] = await db
        .update(budgetAdjustments)
        .set(insertAdjustments)
        .where(eq(budgetAdjustments.id, existingAdjustments.id))
        .returning();
      return adjustments;
    }
    
    const [adjustments] = await db
      .insert(budgetAdjustments)
      .values(insertAdjustments)
      .returning();
    return adjustments;
  }

  // Budget results operations
  async getBudgetResults(budgetId: number): Promise<BudgetResult | undefined> {
    const [results] = await db
      .select()
      .from(budgetResults)
      .where(eq(budgetResults.budgetId, budgetId));
    return results || undefined;
  }

  async createOrUpdateBudgetResults(insertResults: InsertBudgetResult): Promise<BudgetResult> {
    const existingResults = await this.getBudgetResults(insertResults.budgetId);
    
    if (existingResults) {
      const [results] = await db
        .update(budgetResults)
        .set(insertResults)
        .where(eq(budgetResults.id, existingResults.id))
        .returning();
      return results;
    }
    
    const [results] = await db
      .insert(budgetResults)
      .values(insertResults)
      .returning();
    return results;
  }
  
  // Onboarding task operations
  async getOnboardingTasks(): Promise<OnboardingTask[]> {
    return await db
      .select()
      .from(onboardingTasks)
      .orderBy(asc(onboardingTasks.order));
  }

  async getOnboardingTask(id: number): Promise<OnboardingTask | undefined> {
    const [task] = await db
      .select()
      .from(onboardingTasks)
      .where(eq(onboardingTasks.id, id));
    return task || undefined;
  }

  async createOnboardingTask(task: InsertOnboardingTask): Promise<OnboardingTask> {
    const [newTask] = await db
      .insert(onboardingTasks)
      .values({
        ...task,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newTask;
  }

  async updateOnboardingTask(id: number, updateData: Partial<InsertOnboardingTask>): Promise<OnboardingTask | undefined> {
    const [updatedTask] = await db
      .update(onboardingTasks)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(onboardingTasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async deleteOnboardingTask(id: number): Promise<boolean> {
    await db
      .delete(onboardingTasks)
      .where(eq(onboardingTasks.id, id));
    return true;
  }

  // User task progress operations
  async getUserTaskProgress(userId: number): Promise<UserTaskProgress[]> {
    return await db
      .select()
      .from(userTaskProgress)
      .where(eq(userTaskProgress.userId, userId));
  }

  async getUserTaskProgressByTask(userId: number, taskId: number): Promise<UserTaskProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userTaskProgress)
      .where(
        and(
          eq(userTaskProgress.userId, userId),
          eq(userTaskProgress.taskId, taskId)
        )
      );
    return progress || undefined;
  }

  async createOrUpdateUserTaskProgress(progressData: InsertUserTaskProgress): Promise<UserTaskProgress> {
    const existingProgress = await this.getUserTaskProgressByTask(
      progressData.userId, 
      progressData.taskId
    );
    
    if (existingProgress) {
      const [progress] = await db
        .update(userTaskProgress)
        .set({
          ...progressData,
          updatedAt: new Date()
        })
        .where(eq(userTaskProgress.id, existingProgress.id))
        .returning();
      return progress;
    }
    
    const [progress] = await db
      .insert(userTaskProgress)
      .values({
        ...progressData,
        completed: progressData.completed || false,
        pointsEarned: progressData.pointsEarned || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: progressData.completed ? new Date() : null
      })
      .returning();
    return progress;
  }

  async markTaskAsCompleted(userId: number, taskId: number, pointsEarned: number): Promise<UserTaskProgress | undefined> {
    const existingProgress = await this.getUserTaskProgressByTask(userId, taskId);
    const timestamp = new Date();
    
    if (existingProgress) {
      const [updatedProgress] = await db
        .update(userTaskProgress)
        .set({
          completed: true,
          completedAt: timestamp,
          pointsEarned,
          updatedAt: timestamp
        })
        .where(eq(userTaskProgress.id, existingProgress.id))
        .returning();
      
      // Atualizar pontos e progresso do usuário
      const user = await this.getUser(userId);
      if (user) {
        const allTasks = await this.getOnboardingTasks();
        const userProgress = await this.getUserTaskProgress(userId);
        const completedTasks = userProgress.filter(p => p.completed);
        
        // Calcular novo progresso
        const progressPercentage = Math.round((completedTasks.length / allTasks.length) * 100);
        const totalPoints = userProgress.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);
        
        // Calcular novo nível (1 nível a cada 100 pontos)
        const newLevel = Math.max(1, Math.floor(totalPoints / 100) + 1);
        
        await this.updateUserOnboardingProgress(userId, {
          onboardingProgress: progressPercentage,
          onboardingStepsDone: completedTasks.length,
          onboardingCompleted: progressPercentage >= 100,
          totalPoints,
          level: newLevel
        });
      }
      
      return updatedProgress;
    }
    
    // Se não existe progresso anterior, criar um novo
    return this.createOrUpdateUserTaskProgress({
      userId,
      taskId,
      completed: true,
      pointsEarned,
      completedAt: timestamp
    });
  }

  // User achievements operations
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
  }

  async createUserAchievement(achievementData: InsertUserAchievement): Promise<UserAchievement> {
    const timestamp = new Date();
    const [achievement] = await db
      .insert(userAchievements)
      .values({
        ...achievementData,
        earnedAt: timestamp,
        createdAt: timestamp
      })
      .returning();
    
    // Atualizar pontos do usuário
    const user = await this.getUser(achievementData.userId);
    if (user) {
      const newTotalPoints = user.totalPoints + achievementData.pointsAwarded;
      const newLevel = Math.max(1, Math.floor(newTotalPoints / 100) + 1);
      
      await this.updateUserOnboardingProgress(achievementData.userId, {
        totalPoints: newTotalPoints,
        level: newLevel
      });
    }
    
    return achievement;
  }
}

// Usar a implementação do banco de dados
export const storage = new DatabaseStorage();
