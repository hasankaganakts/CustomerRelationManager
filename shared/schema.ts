import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'standard']);
export const customerStatusEnum = pgEnum('customer_status', ['active', 'inactive']);
export const taskStatusEnum = pgEnum('task_status', ['completed', 'pending', 'postponed']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default('standard'),
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  sector: text("sector"),
  status: customerStatusEnum("status").notNull().default('active'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default('pending'),
  dueDate: timestamp("due_date"),
  customerId: integer("customer_id").references(() => customers.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
});

// Notes table
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
});

// User-Customer permissions
export const userCustomerPermissions = pgTable("user_customer_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true });
export const insertUserCustomerPermissionSchema = createInsertSchema(userCustomerPermissions).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type InsertUserCustomerPermission = z.infer<typeof insertUserCustomerPermissionSchema>;
export type UserCustomerPermission = typeof userCustomerPermissions.$inferSelect;

// Additional types for statistics
export type CustomerStats = {
  totalCustomers: number;
  activeCustomers: number;
  monthlyNewCustomers: number;
};

export type TaskStats = {
  pendingTasks: number;
  completedTasks: number;
  postponedTasks: number;
};

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

export type LoginData = z.infer<typeof loginSchema>;
