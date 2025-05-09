import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal, real } from "drizzle-orm/pg-core";
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

// Definindo as relações entre as tabelas
export const usersRelations = relations(users, ({ many }) => ({
  collaborators: many(collaborators),
  clients: many(clients),
  budgets: many(budgets),
  officeCosts: many(officeCosts)
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
