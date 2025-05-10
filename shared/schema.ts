import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, real, uuid, pgEnum } from "drizzle-orm/pg-core";
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
  meetingType: text("meeting_type").default("team").notNull(), // team, client, other
  roomId: text("room_id").notNull().unique(),
  password: text("password"), // Senha para reunião protegida (opcional)
  platform: text("platform").default("internal").notNull(), // internal, zoom, google_meet
  externalLink: text("external_link"), // Link para reunião externa (Zoom/Google Meet)
  status: text("status").default("scheduled").notNull(), // scheduled, in-progress, completed, cancelled
  participants: text("participants"), // Lista de participantes separados por vírgula (opcional)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  startTime: timestamp("start_time"),  // Horário agendado para início
  endTime: timestamp("end_time"),      // Horário agendado para término
  startedAt: timestamp("started_at"),  // Horário real de início
  endedAt: timestamp("ended_at"),      // Horário real de término
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
  email: text("email"), // Email do participante para convites
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
  platform: true,
  externalLink: true,
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

// ================== Sistema de Cursos Estilo Netflix ==================

// Enum para tipos de conteúdo de curso
export const courseContentTypeEnum = pgEnum('course_content_type', ['video', 'text', 'quiz', 'download']);

// Enum para dificuldade do curso
export const courseDifficultyEnum = pgEnum('course_difficulty', ['beginner', 'intermediate', 'advanced', 'all-levels']);

// Enum para status do curso
export const courseStatusEnum = pgEnum('course_status', ['draft', 'published', 'archived']);

// Categorias dos cursos
export const courseCategories = pgTable("course_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  featuredImage: text("featured_image"),
  iconName: text("icon_name"),
  order: integer("order").default(0),
  parentId: integer("parent_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de cursos
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  thumbnailUrl: text("thumbnail_url").notNull(),
  bannerUrl: text("banner_url"),
  trailerUrl: text("trailer_url"),
  difficulty: courseDifficultyEnum("difficulty").default('all-levels'),
  duration: integer("duration").default(0), // Duração total em minutos
  totalLessons: integer("total_lessons").default(0),
  categoryId: integer("category_id").notNull(),
  instructorId: integer("instructor_id").notNull(), // Referência à tabela de instrutores
  price: real("price").default(0),
  isPromoted: boolean("is_promoted").default(false),
  promotionalPrice: real("promotional_price"),
  isFeatured: boolean("is_featured").default(false),
  status: courseStatusEnum("status").default('draft'),
  publishedAt: timestamp("published_at"),
  requirements: text("requirements"),
  goals: text("goals"),
  tags: text("tags").array(),
  averageRating: real("average_rating"),
  totalEnrollments: integer("total_enrollments").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Módulos do curso
export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lições dentro dos módulos
export const courseLessons = pgTable("course_lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  contentType: courseContentTypeEnum("content_type").default('video'),
  contentUrl: text("content_url"), // URL do vídeo ou outro recurso
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration").default(0), // Duração em minutos
  order: integer("order").notNull(),
  isFree: boolean("is_free").default(false),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Instrutores
export const courseInstructors = pgTable("course_instructors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Pode ser relacionado a um usuário do sistema (opcional)
  name: text("name").notNull(),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  speciality: text("speciality"),
  socialLinks: jsonb("social_links").default({}), // Links para redes sociais
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Matrículas dos usuários
export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0), // Progresso em porcentagem
  lastAccessedAt: timestamp("last_accessed_at"),
  certificateIssued: boolean("certificate_issued").default(false),
  certificateUrl: text("certificate_url"),
  paymentStatus: text("payment_status").default("completed"), // "pending", "completed", "refunded"
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Progresso do usuário nas lições
export const courseLessonProgress = pgTable("course_lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completed: boolean("completed").default(false),
  progressPercentage: integer("progress_percentage").default(0),
  watchedSeconds: integer("watched_seconds").default(0),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Avaliações dos cursos
export const courseReviews = pgTable("course_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  isPublished: boolean("is_published").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Playlists/Coleções personalizadas de cursos
export const coursePlaylists = pgTable("course_playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Junction table para playlists <-> cursos
export const coursePlaylistItems = pgTable("course_playlist_items", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  courseId: integer("course_id").notNull(),
  order: integer("order").default(0),
  addedAt: timestamp("added_at").defaultNow(),
});

// Certificates emitidos
export const courseCertificates = pgTable("course_certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  certificateUrl: text("certificate_url").notNull(),
  issuedAt: timestamp("issued_at").defaultNow(),
  validUntil: timestamp("valid_until"),
  certificateId: text("certificate_id").notNull().unique(), // ID único para verificação
  templateId: text("template_id"), // Template de certificado usado
});

// Definição de relações entre tabelas
export const courseCategoriesRelations = relations(courseCategories, ({ one, many }) => ({
  parentCategory: one(courseCategories, { 
    fields: [courseCategories.parentId], 
    references: [courseCategories.id] 
  }),
  childCategories: many(courseCategories),
  courses: many(courses)
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(courseCategories, { 
    fields: [courses.categoryId], 
    references: [courseCategories.id] 
  }),
  instructor: one(courseInstructors, { 
    fields: [courses.instructorId], 
    references: [courseInstructors.id] 
  }),
  modules: many(courseModules),
  enrollments: many(courseEnrollments),
  reviews: many(courseReviews),
  playlistItems: many(coursePlaylistItems)
}));

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, { 
    fields: [courseModules.courseId], 
    references: [courses.id] 
  }),
  lessons: many(courseLessons)
}));

export const courseLessonsRelations = relations(courseLessons, ({ one, many }) => ({
  module: one(courseModules, { 
    fields: [courseLessons.moduleId], 
    references: [courseModules.id] 
  }),
  progress: many(courseLessonProgress)
}));

export const courseInstructorsRelations = relations(courseInstructors, ({ one, many }) => ({
  user: one(users, { 
    fields: [courseInstructors.userId], 
    references: [users.id] 
  }),
  courses: many(courses)
}));

export const courseEnrollmentsRelations = relations(courseEnrollments, ({ one, many }) => ({
  user: one(users, { 
    fields: [courseEnrollments.userId], 
    references: [users.id] 
  }),
  course: one(courses, { 
    fields: [courseEnrollments.courseId], 
    references: [courses.id] 
  }),
  certificate: one(courseCertificates)
}));

export const courseLessonProgressRelations = relations(courseLessonProgress, ({ one }) => ({
  user: one(users, { 
    fields: [courseLessonProgress.userId], 
    references: [users.id] 
  }),
  lesson: one(courseLessons, { 
    fields: [courseLessonProgress.lessonId], 
    references: [courseLessons.id] 
  })
}));

export const courseReviewsRelations = relations(courseReviews, ({ one }) => ({
  user: one(users, { 
    fields: [courseReviews.userId], 
    references: [users.id] 
  }),
  course: one(courses, { 
    fields: [courseReviews.courseId], 
    references: [courses.id] 
  })
}));

export const coursePlaylistsRelations = relations(coursePlaylists, ({ one, many }) => ({
  user: one(users, { 
    fields: [coursePlaylists.userId], 
    references: [users.id] 
  }),
  items: many(coursePlaylistItems)
}));

export const coursePlaylistItemsRelations = relations(coursePlaylistItems, ({ one }) => ({
  playlist: one(coursePlaylists, { 
    fields: [coursePlaylistItems.playlistId], 
    references: [coursePlaylists.id] 
  }),
  course: one(courses, { 
    fields: [coursePlaylistItems.courseId], 
    references: [courses.id] 
  })
}));

export const courseCertificatesRelations = relations(courseCertificates, ({ one }) => ({
  user: one(users, { 
    fields: [courseCertificates.userId], 
    references: [users.id] 
  }),
  course: one(courses, { 
    fields: [courseCertificates.courseId], 
    references: [courses.id] 
  })
}));

// Schemas de inserção
export const insertCourseCategorySchema = createInsertSchema(courseCategories).pick({
  name: true,
  slug: true,
  description: true,
  featuredImage: true,
  iconName: true,
  order: true,
  parentId: true,
  isActive: true
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  slug: true,
  description: true,
  shortDescription: true,
  thumbnailUrl: true,
  bannerUrl: true,
  trailerUrl: true,
  difficulty: true,
  categoryId: true,
  instructorId: true,
  price: true,
  isPromoted: true,
  promotionalPrice: true,
  isFeatured: true,
  status: true,
  publishedAt: true,
  requirements: true,
  goals: true,
  tags: true
});

export const insertCourseModuleSchema = createInsertSchema(courseModules).pick({
  courseId: true,
  title: true,
  description: true,
  order: true,
  isPublished: true
});

export const insertCourseLessonSchema = createInsertSchema(courseLessons).pick({
  moduleId: true,
  title: true,
  description: true,
  contentType: true,
  contentUrl: true,
  thumbnailUrl: true,
  duration: true,
  order: true,
  isFree: true,
  isPublished: true
});

export const insertCourseInstructorSchema = createInsertSchema(courseInstructors).pick({
  userId: true,
  name: true,
  bio: true,
  profileImageUrl: true,
  speciality: true,
  socialLinks: true,
  isVerified: true
});

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments).pick({
  userId: true,
  courseId: true,
  paymentStatus: true,
  paymentId: true
});

export const insertCourseLessonProgressSchema = createInsertSchema(courseLessonProgress).pick({
  userId: true,
  lessonId: true,
  completed: true,
  progressPercentage: true,
  watchedSeconds: true,
  notes: true
});

export const insertCourseReviewSchema = createInsertSchema(courseReviews).pick({
  userId: true,
  courseId: true,
  rating: true,
  comment: true,
  isPublished: true,
  isFeatured: true
});

export const insertCoursePlaylistSchema = createInsertSchema(coursePlaylists).pick({
  userId: true,
  title: true,
  description: true,
  isPublic: true
});

export const insertCoursePlaylistItemSchema = createInsertSchema(coursePlaylistItems).pick({
  playlistId: true,
  courseId: true,
  order: true
});

export const insertCourseCertificateSchema = createInsertSchema(courseCertificates).pick({
  userId: true,
  courseId: true,
  certificateUrl: true,
  validUntil: true,
  certificateId: true,
  templateId: true
});

// Types para o sistema de cursos
export type CourseCategory = typeof courseCategories.$inferSelect;
export type InsertCourseCategory = z.infer<typeof insertCourseCategorySchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;

export type CourseLesson = typeof courseLessons.$inferSelect;
export type InsertCourseLesson = z.infer<typeof insertCourseLessonSchema>;

export type CourseInstructor = typeof courseInstructors.$inferSelect;
export type InsertCourseInstructor = z.infer<typeof insertCourseInstructorSchema>;

export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;

export type CourseLessonProgress = typeof courseLessonProgress.$inferSelect;
export type InsertCourseLessonProgress = z.infer<typeof insertCourseLessonProgressSchema>;

export type CourseReview = typeof courseReviews.$inferSelect;
export type InsertCourseReview = z.infer<typeof insertCourseReviewSchema>;

export type CoursePlaylist = typeof coursePlaylists.$inferSelect;
export type InsertCoursePlaylist = z.infer<typeof insertCoursePlaylistSchema>;

export type CoursePlaylistItem = typeof coursePlaylistItems.$inferSelect;
export type InsertCoursePlaylistItem = z.infer<typeof insertCoursePlaylistItemSchema>;

export type CourseCertificate = typeof courseCertificates.$inferSelect;
export type InsertCourseCertificate = z.infer<typeof insertCourseCertificateSchema>;
