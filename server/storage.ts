import {
  users, User, InsertUser,
  customers, Customer, InsertCustomer,
  tasks, Task, InsertTask,
  notes, Note, InsertNote,
  userCustomerPermissions, UserCustomerPermission, InsertUserCustomerPermission,
  CustomerStats, TaskStats
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByCustomer(customerId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Note methods
  getNotesByCustomer(customerId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: number): Promise<boolean>;

  // Permission methods
  getUserCustomerPermissions(userId: number): Promise<UserCustomerPermission[]>;
  createUserCustomerPermission(permission: InsertUserCustomerPermission): Promise<UserCustomerPermission>;
  deleteUserCustomerPermission(id: number): Promise<boolean>;

  // Statistics methods
  getCustomerStats(): Promise<CustomerStats>;
  getTaskStats(): Promise<TaskStats>;
  getCustomerGrowthData(): Promise<number[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private tasks: Map<number, Task>;
  private notes: Map<number, Note>;
  private userCustomerPermissions: Map<number, UserCustomerPermission>;
  
  private userId: number;
  private customerId: number;
  private taskId: number;
  private noteId: number;
  private permissionId: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.tasks = new Map();
    this.notes = new Map();
    this.userCustomerPermissions = new Map();
    
    this.userId = 1;
    this.customerId = 1;
    this.taskId = 1;
    this.noteId = 1;
    this.permissionId = 1;
    
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      fullName: "Admin User",
      role: "admin"
    });
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerId++;
    const createdAt = new Date();
    const customer: Customer = { ...insertCustomer, id, createdAt };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) return undefined;
    
    const updatedCustomer: Customer = { ...existingCustomer, ...customerData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    // Delete related tasks, notes, and permissions
    Array.from(this.tasks.values())
      .filter(task => task.customerId === id)
      .forEach(task => this.tasks.delete(task.id));
      
    Array.from(this.notes.values())
      .filter(note => note.customerId === id)
      .forEach(note => this.notes.delete(note.id));
      
    Array.from(this.userCustomerPermissions.values())
      .filter(perm => perm.customerId === id)
      .forEach(perm => this.userCustomerPermissions.delete(perm.id));
    
    return this.customers.delete(id);
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByCustomer(customerId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.customerId === customerId
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const createdAt = new Date();
    const task: Task = { ...insertTask, id, createdAt };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask: Task = { ...existingTask, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Note methods
  async getNotesByCustomer(customerId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter((note) => note.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteId++;
    const createdAt = new Date();
    const note: Note = { ...insertNote, id, createdAt };
    this.notes.set(id, note);
    return note;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Permission methods
  async getUserCustomerPermissions(userId: number): Promise<UserCustomerPermission[]> {
    return Array.from(this.userCustomerPermissions.values()).filter(
      (permission) => permission.userId === userId
    );
  }

  async createUserCustomerPermission(insertPermission: InsertUserCustomerPermission): Promise<UserCustomerPermission> {
    const id = this.permissionId++;
    const permission: UserCustomerPermission = { ...insertPermission, id };
    this.userCustomerPermissions.set(id, permission);
    return permission;
  }

  async deleteUserCustomerPermission(id: number): Promise<boolean> {
    return this.userCustomerPermissions.delete(id);
  }

  // Statistics methods
  async getCustomerStats(): Promise<CustomerStats> {
    const customers = Array.from(this.customers.values());
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === "active").length;
    const monthlyNewCustomers = customers.filter(c => {
      const createdAt = new Date(c.createdAt);
      return createdAt.getMonth() === currentMonth && 
             createdAt.getFullYear() === currentYear;
    }).length;
    
    return { totalCustomers, activeCustomers, monthlyNewCustomers };
  }

  async getTaskStats(): Promise<TaskStats> {
    const tasks = Array.from(this.tasks.values());
    
    const pendingTasks = tasks.filter(t => t.status === "pending").length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const postponedTasks = tasks.filter(t => t.status === "postponed").length;
    
    return { pendingTasks, completedTasks, postponedTasks };
  }

  async getCustomerGrowthData(): Promise<number[]> {
    const customers = Array.from(this.customers.values());
    const currentDate = new Date();
    const result: number[] = [];
    
    // Get data for last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(currentDate.getMonth() - i);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();
      
      const count = customers.filter(c => {
        const createdAt = new Date(c.createdAt);
        return createdAt.getMonth() === month && createdAt.getFullYear() === year;
      }).length;
      
      result.push(count);
    }
    
    return result;
  }
}

export const storage = new MemStorage();
