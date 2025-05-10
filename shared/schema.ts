import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, real, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  companyName: text("company_name"),
  position: text("position"),
  onboardingProgress: integer("onboarding_progress").default(0).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  onboardingStepsDone: integer("onboarding_steps_done").default(0).notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  companyName: true,
  position: true,
});

// Collaborator model
export const collaborators = pgTable("collaborators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  hoursPerDay: integer("hours_per_day").default(8),
  city: text("city").default("São Paulo"),
  isFixed: boolean("is_fixed").default(true),
  isResponsible: boolean("is_responsible").default(false),
  participatesInStages: boolean("participates_in_stages").default(true),
  billableType: text("billable_type").default("hourly"),
  paymentType: text("payment_type").default("hourly"), // Novo campo: 'hourly' ou 'monthly'
  monthlyRate: decimal("monthly_rate", { precision: 10, scale: 2 }),  // Novo campo: valor mensal fixo
  observations: text("observations"),
  profileImageUrl: text("profile_image_url"),
  assignedHours: integer("assigned_hours").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  active: boolean("active").default(true),
});

export const insertCollaboratorSchema = createInsertSchema(collaborators).pick({
  userId: true,
  name: true,
  role: true,
  hourlyRate: true,
  hoursPerDay: true,
  city: true,
  isFixed: true,
  isResponsible: true,
  participatesInStages: true,
  billableType: true,
  paymentType: true,
  monthlyRate: true,
  observations: true,
  profileImageUrl: true,
  assignedHours: true,
  active: true,
});

// Office costs model
export const officeCosts = pgTable("office_costs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fixedCosts: decimal("fixed_costs", { precision: 10, scale: 2 }).notNull(),
  variableCosts: decimal("variable_costs", { precision: 10, scale: 2 }).notNull(),
  productiveHoursMonth: integer("productive_hours_month").notNull(),
  defaultPricePerSqMeter: decimal("default_price_per_sq_meter", { precision: 10, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOfficeCostSchema = createInsertSchema(officeCosts).pick({
  userId: true,
  fixedCosts: true,
  variableCosts: true,
  productiveHoursMonth: true,
  defaultPricePerSqMeter: true,
});

// Budget model
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  projectType: text("project_type").notNull(),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  city: text("city"),
  deliveryLevel: text("delivery_level").notNull(),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  userId: true,
  name: true,
  projectType: true,
  area: true,
  city: true,
  deliveryLevel: true,
  status: true,
});

// Budget tasks
export const budgetTasks = pgTable("budget_tasks", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull(),
  description: text("description").notNull(),
  collaboratorId: integer("collaborator_id"),
  hours: decimal("hours", { precision: 10, scale: 2 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
});

export const insertBudgetTaskSchema = createInsertSchema(budgetTasks).pick({
  budgetId: true,
  description: true,
  collaboratorId: true,
  hours: true,
  hourlyRate: true,
});

// Budget extra costs
export const budgetExtraCosts = pgTable("budget_extra_costs", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull(),
  technicalVisit: decimal("technical_visit", { precision: 10, scale: 2 }).default("0"),
  transport: decimal("transport", { precision: 10, scale: 2 }).default("0"),
  printing: decimal("printing", { precision: 10, scale: 2 }).default("0"),
  fees: decimal("fees", { precision: 10, scale: 2 }).default("0"),
  otherServices: decimal("other_services", { precision: 10, scale: 2 }).default("0"),
});

export const insertBudgetExtraCostsSchema = createInsertSchema(budgetExtraCosts).pick({
  budgetId: true,
  technicalVisit: true,
  transport: true,
  printing: true,
  fees: true,
  otherServices: true,
});

// Budget adjustments
export const budgetAdjustments = pgTable("budget_adjustments", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull(),
  // Technical adjustments
  complexity: integer("complexity").default(0),
  technicalReserve: integer("technical_reserve").default(0),
  clientDifficulty: integer("client_difficulty").default(0),
  extras: integer("extras").default(0),
  // Final adjustments
  profit: integer("profit").default(30),
  taxes: integer("taxes").default(0),
  cardFee: integer("card_fee").default(0),
  // Discount
  discount: integer("discount").default(0),
});

export const insertBudgetAdjustmentsSchema = createInsertSchema(budgetAdjustments).pick({
  budgetId: true,
  complexity: true,
  technicalReserve: true,
  clientDifficulty: true,
  extras: true,
  profit: true,
  taxes: true,
  cardFee: true,
  discount: true,
});

// Budget calculation results
export const budgetResults = pgTable("budget_results", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull(),
  baseValue: decimal("base_value", { precision: 10, scale: 2 }).notNull(),
  technicalAdjustmentsValue: decimal("technical_adjustments_value", { precision: 10, scale: 2 }).notNull(),
  profitValue: decimal("profit_value", { precision: 10, scale: 2 }).notNull(),
  taxesAndFeesValue: decimal("taxes_and_fees_value", { precision: 10, scale: 2 }).notNull(),
  finalValue: decimal("final_value", { precision: 10, scale: 2 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  sqMeterRate: decimal("sq_meter_rate", { precision: 10, scale: 2 }).notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).default("0"),
  finalValueWithDiscount: decimal("final_value_with_discount", { precision: 10, scale: 2 }),
  profitMarginPercentage: decimal("profit_margin_percentage", { precision: 10, scale: 2 }),
});

export const insertBudgetResultsSchema = createInsertSchema(budgetResults).pick({
  budgetId: true,
  baseValue: true,
  technicalAdjustmentsValue: true,
  profitValue: true,
  taxesAndFeesValue: true,
  finalValue: true,
  hourlyRate: true,
  sqMeterRate: true,
  discountValue: true,
  finalValueWithDiscount: true,
  profitMarginPercentage: true,
});

// Clients model
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  userId: true,
  name: true,
  company: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  notes: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Collaborator = typeof collaborators.$inferSelect;
export type InsertCollaborator = z.infer<typeof insertCollaboratorSchema>;

export type OfficeCost = typeof officeCosts.$inferSelect;
export type InsertOfficeCost = z.infer<typeof insertOfficeCostSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type BudgetTask = typeof budgetTasks.$inferSelect;
export type InsertBudgetTask = z.infer<typeof insertBudgetTaskSchema>;

export type BudgetExtraCost = typeof budgetExtraCosts.$inferSelect;
export type InsertBudgetExtraCost = z.infer<typeof insertBudgetExtraCostsSchema>;

export type BudgetAdjustment = typeof budgetAdjustments.$inferSelect;
export type InsertBudgetAdjustment = z.infer<typeof insertBudgetAdjustmentsSchema>;

export type BudgetResult = typeof budgetResults.$inferSelect;
export type InsertBudgetResult = z.infer<typeof insertBudgetResultsSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

// Onboarding Tasks Table
export const onboardingTasks = pgTable("onboarding_tasks", {
  id: serial("id").primaryKey(),
  taskName: text("task_name").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  points: integer("points").default(10).notNull(),
  category: text("category").notNull(), // 'setup', 'pricing', 'clients', 'projects', etc.
  routePath: text("route_path"), // Rota para redirecionar o usuário para completar a tarefa
  iconName: text("icon_name"), // Nome do ícone do Lucide para exibir
  isRequired: boolean("is_required").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOnboardingTaskSchema = createInsertSchema(onboardingTasks).pick({
  taskName: true,
  description: true,
  order: true,
  points: true,
  category: true,
  routePath: true,
  iconName: true,
  isRequired: true,
});

// User Task Progress Table - Rastreia o progresso individual de cada usuário em cada tarefa
export const userTaskProgress = pgTable("user_task_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserTaskProgressSchema = createInsertSchema(userTaskProgress).pick({
  userId: true,
  taskId: true,
  completed: true,
  completedAt: true,
  pointsEarned: true,
});

// User Achievements Table - Rastreia conquistas específicas do usuário
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementName: text("achievement_name").notNull(),
  description: text("description").notNull(),
  pointsAwarded: integer("points_awarded").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  badgeIcon: text("badge_icon"), // Nome do ícone do Lucide para exibir como prêmio
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementName: true,
  description: true,
  pointsAwarded: true,
  badgeIcon: true,
});

// Tipos para as novas tabelas
export type OnboardingTask = typeof onboardingTasks.$inferSelect;
export type InsertOnboardingTask = z.infer<typeof insertOnboardingTaskSchema>;

export type UserTaskProgress = typeof userTaskProgress.$inferSelect;
export type InsertUserTaskProgress = z.infer<typeof insertUserTaskProgressSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Blog Posts Table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Autor do post
  title: text("title").notNull(), // Título do post
  slug: text("slug").notNull().unique(), // URL amigável para SEO
  summary: text("summary").notNull(), // Resumo/descrição curta para SEO e listagens
  content: text("content").notNull(), // Conteúdo em HTML
  featuredImage: text("featured_image"), // URL da imagem de destaque
  metaTitle: text("meta_title"), // Título específico para SEO
  metaDescription: text("meta_description"), // Descrição específica para SEO
  imageAlt: text("image_alt"), // Texto alternativo da imagem destaque para acessibilidade e SEO
  status: text("status").default("draft").notNull(), // 'draft', 'published', 'archived'
  publishedAt: timestamp("published_at"), // Data de publicação
  categoryId: integer("category_id").notNull(), // Categoria do post
  viewCount: integer("view_count").default(0), // Contagem de visualizações
  readTime: integer("read_time").default(0), // Tempo estimado de leitura em minutos
  featured: boolean("featured").default(false), // Destaque na homepage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog Categories Table
export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  featuredImage: text("featured_image"),
  parentId: integer("parent_id"), // Para categorias aninhadas
  order: integer("order").default(0), // Para ordenação personalizada
  metaTitle: text("meta_title"), // Título específico para SEO
  metaDescription: text("meta_description"), // Descrição específica para SEO
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog Tags Table
export const blogTags = pgTable("blog_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Junction table for posts <-> tags (many-to-many)
export const blogPostTags = pgTable("blog_post_tags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  tagId: integer("tag_id").notNull(),
});

// Blog Comments Table
export const blogComments = pgTable("blog_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id"), // Pode ser nulo para comentários de visitantes
  authorName: text("author_name").notNull(), // Nome do visitante ou do usuário
  authorEmail: text("author_email").notNull(), // Email do visitante ou do usuário
  content: text("content").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'approved', 'spam'
  parentId: integer("parent_id"), // Para respostas a comentários
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog Insights Table (para análises e métricas)
export const blogInsights = pgTable("blog_insights", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  viewCount: integer("view_count").default(0),
  visitorsCount: integer("visitors_count").default(0), // Visitantes únicos
  referrers: jsonb("referrers").default({}), // De onde vieram os visitantes
  searchTerms: jsonb("search_terms").default({}), // Termos de busca que levaram ao post
  engagementTime: integer("engagement_time").default(0), // Tempo médio de leitura em segundos
  clickThroughRate: real("click_through_rate").default(0), // Taxa de cliques em links
  shareCount: integer("share_count").default(0), // Total de compartilhamentos
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schemas de inserção para o blog
export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  userId: true,
  title: true,
  slug: true,
  summary: true,
  content: true,
  featuredImage: true,
  metaTitle: true,
  metaDescription: true,
  imageAlt: true,
  status: true,
  publishedAt: true,
  categoryId: true,
  readTime: true,
  featured: true,
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).pick({
  name: true,
  slug: true,
  description: true,
  featuredImage: true,
  parentId: true,
  order: true,
  metaTitle: true,
  metaDescription: true,
});

export const insertBlogTagSchema = createInsertSchema(blogTags).pick({
  name: true,
  slug: true,
  description: true,
});

export const insertBlogPostTagSchema = createInsertSchema(blogPostTags).pick({
  postId: true,
  tagId: true,
});

export const insertBlogCommentSchema = createInsertSchema(blogComments).pick({
  postId: true,
  userId: true,
  authorName: true,
  authorEmail: true,
  content: true,
  status: true,
  parentId: true,
});

export const insertBlogInsightSchema = createInsertSchema(blogInsights).pick({
  postId: true,
  viewCount: true,
  visitorsCount: true,
  referrers: true,
  searchTerms: true,
  engagementTime: true,
  clickThroughRate: true,
  shareCount: true,
});

// Tipos para Blog
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;

export type BlogTag = typeof blogTags.$inferSelect;
export type InsertBlogTag = z.infer<typeof insertBlogTagSchema>;

export type BlogPostTag = typeof blogPostTags.$inferSelect;
export type InsertBlogPostTag = z.infer<typeof insertBlogPostTagSchema>;

export type BlogComment = typeof blogComments.$inferSelect;
export type InsertBlogComment = z.infer<typeof insertBlogCommentSchema>;

export type BlogInsight = typeof blogInsights.$inferSelect;
export type InsertBlogInsight = z.infer<typeof insertBlogInsightSchema>;

// Definindo as relações entre as tabelas
export const usersRelations = relations(users, ({ many }) => ({
  collaborators: many(collaborators),
  clients: many(clients),
  budgets: many(budgets),
  officeCosts: many(officeCosts),
  taskProgress: many(userTaskProgress),
  achievements: many(userAchievements),
  blogPosts: many(blogPosts),
  blogComments: many(blogComments),
  videoMeetings: many(videoMeetings)
}));

export const collaboratorsRelations = relations(collaborators, ({ one, many }) => ({
  user: one(users, {
    fields: [collaborators.userId],
    references: [users.id]
  }),
  budgetTasks: many(budgetTasks)
}));

export const clientsRelations = relations(clients, ({ one }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id]
  })
}));

export const officeCostsRelations = relations(officeCosts, ({ one }) => ({
  user: one(users, {
    fields: [officeCosts.userId],
    references: [users.id]
  })
}));

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id]
  }),
  tasks: many(budgetTasks),
  extraCosts: many(budgetExtraCosts),
  adjustments: many(budgetAdjustments),
  results: many(budgetResults)
}));

export const budgetTasksRelations = relations(budgetTasks, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetTasks.budgetId],
    references: [budgets.id]
  }),
  collaborator: one(collaborators, {
    fields: [budgetTasks.collaboratorId],
    references: [collaborators.id]
  })
}));

export const budgetExtraCostsRelations = relations(budgetExtraCosts, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetExtraCosts.budgetId],
    references: [budgets.id]
  })
}));

export const budgetAdjustmentsRelations = relations(budgetAdjustments, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetAdjustments.budgetId],
    references: [budgets.id]
  })
}));

export const budgetResultsRelations = relations(budgetResults, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetResults.budgetId],
    references: [budgets.id]
  })
}));

// Onboarding tasks relations
export const onboardingTasksRelations = relations(onboardingTasks, ({ many }) => ({
  userProgress: many(userTaskProgress)
}));

// User task progress relations
export const userTaskProgressRelations = relations(userTaskProgress, ({ one }) => ({
  user: one(users, {
    fields: [userTaskProgress.userId],
    references: [users.id]
  }),
  task: one(onboardingTasks, {
    fields: [userTaskProgress.taskId],
    references: [onboardingTasks.id]
  })
}));

// User achievements relations
export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  })
}));

// Blog relations
export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [blogPosts.userId],
    references: [users.id]
  }),
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id]
  }),
  tags: many(blogPostTags),
  comments: many(blogComments),
  insights: many(blogInsights)
}));

export const blogCategoriesRelations = relations(blogCategories, ({ one, many }) => ({
  parent: one(blogCategories, {
    fields: [blogCategories.parentId],
    references: [blogCategories.id]
  }),
  posts: many(blogPosts)
}));

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  postTags: many(blogPostTags)
}));

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostTags.postId],
    references: [blogPosts.id]
  }),
  tag: one(blogTags, {
    fields: [blogPostTags.tagId],
    references: [blogTags.id]
  })
}));

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogComments.postId],
    references: [blogPosts.id]
  }),
  user: one(users, {
    fields: [blogComments.userId],
    references: [users.id]
  }),
  parent: one(blogComments, {
    fields: [blogComments.parentId],
    references: [blogComments.id]
  })
}));

export const blogInsightsRelations = relations(blogInsights, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogInsights.postId],
    references: [blogPosts.id]
  })
}));

// Videoconferência model
export const videoMeetings = pgTable("video_meetings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  roomId: text("room_id").notNull().unique(),
  status: text("status").default("scheduled").notNull(), // scheduled, in-progress, completed, cancelled
  participants: text("participants"), // Lista de participantes separados por vírgula (opcional)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

// Gravações de reuniões
export const meetingRecordings = pgTable("meeting_recordings", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  userId: integer("user_id").notNull(), // Usuário que iniciou a gravação
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  duration: integer("duration"), // Duração em segundos
  fileSize: integer("file_size"), // Tamanho em bytes
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  status: text("status").default("processing").notNull(), // processing, available, error
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Participantes das reuniões
export const meetingParticipants = pgTable("meeting_participants", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  userId: integer("user_id"), // Pode ser nulo para participantes externos
  name: text("name").notNull(), // Nome do participante
  role: text("role").default("participant").notNull(), // host, participant, observer
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
});

// Análises e resumos IA de reuniões
export const meetingAnalytics = pgTable("meeting_analytics", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  transcript: text("transcript"), // Texto completo da transcrição
  summary: text("summary"), // Resumo gerado pela IA
  keyPoints: jsonb("key_points").default([]), // Pontos principais identificados
  actionItems: jsonb("action_items").default([]), // Itens de ação identificados
  sentimentScore: real("sentiment_score"), // Pontuação numérica de sentimento (0-1)
  topicsCovered: jsonb("topics_covered").default([]), // Tópicos abordados
  speakingDistribution: jsonb("speaking_distribution").default([]), // Distribuição de fala
  duration: integer("duration"), // Duração da reunião em segundos
  participantsCount: integer("participants_count"), // Contagem de participantes
  aiProcessed: boolean("ai_processed").default(false),
  processingStatus: text("processing_status").default("pending"), // pending, processing, completed, failed
  processingError: text("processing_error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relação de videoMeetings com participantes
export const videoMeetingsRelations = relations(videoMeetings, ({ many, one }) => ({
  user: one(users, { fields: [videoMeetings.userId], references: [users.id] }),
  participants: many(meetingParticipants),
  recordings: many(meetingRecordings),
  analytics: one(meetingAnalytics, { fields: [videoMeetings.id], references: [meetingAnalytics.meetingId] }),
}));

// Relação de participantes com videoMeetings
export const meetingParticipantsRelations = relations(meetingParticipants, ({ one }) => ({
  meeting: one(videoMeetings, { fields: [meetingParticipants.meetingId], references: [videoMeetings.id] }),
  user: one(users, { fields: [meetingParticipants.userId], references: [users.id] }),
}));

// Relação de analytics com videoMeetings
export const meetingAnalyticsRelations = relations(meetingAnalytics, ({ one }) => ({
  meeting: one(videoMeetings, { fields: [meetingAnalytics.meetingId], references: [videoMeetings.id] }),
}));

// Relação de gravações com videoMeetings
export const meetingRecordingsRelations = relations(meetingRecordings, ({ one }) => ({
  meeting: one(videoMeetings, { fields: [meetingRecordings.meetingId], references: [videoMeetings.id] }),
  user: one(users, { fields: [meetingRecordings.userId], references: [users.id] }),
}));

// Schemas para inserção
export const insertVideoMeetingSchema = createInsertSchema(videoMeetings).pick({ 
  title: true, 
  description: true,
  roomId: true, 
  password: true,
  userId: true,
  meetingType: true,
  startTime: true,
  endTime: true,
  status: true
});

export const insertMeetingParticipantSchema = createInsertSchema(meetingParticipants).pick({ 
  meetingId: true, 
  userId: true,
  name: true,
  email: true,
  role: true
});

export const insertMeetingRecordingSchema = createInsertSchema(meetingRecordings).pick({
  meetingId: true,
  userId: true,
  fileName: true,
  fileUrl: true,
  duration: true,
  fileSize: true,
  status: true
});

export const insertMeetingAnalyticsSchema = createInsertSchema(meetingAnalytics).pick({ 
  meetingId: true, 
  transcript: true,
  summary: true,
  keyPoints: true,
  actionItems: true,
  sentimentScore: true,
  topicsCovered: true,
  speakingDistribution: true,
  duration: true,
  participantsCount: true,
  processingStatus: true
});

// Types para inserção
export type InsertVideoMeeting = z.infer<typeof insertVideoMeetingSchema>;
export type InsertMeetingParticipant = z.infer<typeof insertMeetingParticipantSchema>;
export type InsertMeetingRecording = z.infer<typeof insertMeetingRecordingSchema>;
export type InsertMeetingAnalytics = z.infer<typeof insertMeetingAnalyticsSchema>;

// Types de seleção
export type VideoMeeting = typeof videoMeetings.$inferSelect;
export type MeetingParticipant = typeof meetingParticipants.$inferSelect;
export type MeetingRecording = typeof meetingRecordings.$inferSelect;
export type MeetingAnalytic = typeof meetingAnalytics.$inferSelect;
