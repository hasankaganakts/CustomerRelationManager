import express, { Request, Response } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertCustomerSchema,
  insertTaskSchema,
  insertNoteSchema,
  loginSchema
} from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";

// Configure JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "crm_secret_key";

// Middleware to authenticate JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  // Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
    
    // Add user data to request
    (req as any).user = user;
    next();
  });
};

// Check if user is admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { username, password } = validatedData;
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create token without password
      const { password: _, ...userWithoutPassword } = user;
      const token = jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: '1d' });
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  });
  
  app.get("/api/auth/me", authenticateToken, (req: Request, res: Response) => {
    res.json((req as any).user);
  });
  
  // User Routes (protected by admin role)
  app.get("/api/users", authenticateToken, async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.get("/api/users/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  app.post("/api/users", authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(validatedData);
      // Remove password from response
      const { password, ...safeUser } = newUser;
      
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.patch("/api/users/:id", authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Only include allowed fields
      const userData: Partial<{
        username: string;
        fullName: string;
        password: string;
        role: "admin" | "standard";
      }> = {};
      
      if (req.body.username) userData.username = req.body.username;
      if (req.body.fullName) userData.fullName = req.body.fullName;
      if (req.body.password) userData.password = req.body.password;
      if (req.body.role) userData.role = req.body.role;
      
      // Check if username already exists
      if (userData.username) {
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.delete("/api/users/:id", authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Prevent deleting the logged-in user
      if ((req as any).user.id === id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Customer Routes
  app.get("/api/customers", authenticateToken, async (req: Request, res: Response) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  
  app.get("/api/customers/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });
  
  app.post("/api/customers", authenticateToken, async (req: Request, res: Response) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      
      // Add the current user as creator
      validatedData.createdBy = (req as any).user.id;
      
      const newCustomer = await storage.createCustomer(validatedData);
      res.status(201).json(newCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });
  
  app.post("/api/customers/import", authenticateToken, async (req: Request, res: Response) => {
    try {
      // Accept partial data for import
      const customerData = req.body;
      
      // Add required fields if missing
      if (!customerData.status) customerData.status = "active";
      
      // Add the current user as creator
      customerData.createdBy = (req as any).user.id;
      
      // Validate with more lenient schema
      const validatedData = insertCustomerSchema.parse(customerData);
      
      const newCustomer = await storage.createCustomer(validatedData);
      res.status(201).json(newCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to import customer" });
    }
  });
  
  app.patch("/api/customers/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Only include allowed fields
      const customerData: Partial<{
        companyName: string;
        contactName: string;
        phone: string;
        email: string;
        address: string;
        sector: string;
        status: "active" | "inactive";
      }> = {};
      
      if (req.body.companyName) customerData.companyName = req.body.companyName;
      if (req.body.contactName) customerData.contactName = req.body.contactName;
      if (req.body.phone) customerData.phone = req.body.phone;
      if (req.body.email) customerData.email = req.body.email;
      if (req.body.address) customerData.address = req.body.address;
      if (req.body.sector) customerData.sector = req.body.sector;
      if (req.body.status) customerData.status = req.body.status;
      
      const updatedCustomer = await storage.updateCustomer(id, customerData);
      
      if (!updatedCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  
  app.delete("/api/customers/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCustomer(id);
      
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });
  
  // Note Routes
  app.get("/api/customers/:id/notes", authenticateToken, async (req: Request, res: Response) => {
    try {
      const customerId = parseInt(req.params.id);
      const notes = await storage.getNotesByCustomer(customerId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });
  
  app.post("/api/customers/:id/notes", authenticateToken, async (req: Request, res: Response) => {
    try {
      const customerId = parseInt(req.params.id);
      
      // Check if customer exists
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const noteData = { ...req.body, customerId };
      
      // Add the current user as creator
      noteData.createdBy = (req as any).user.id;
      
      const validatedData = insertNoteSchema.parse(noteData);
      const newNote = await storage.createNote(validatedData);
      
      res.status(201).json(newNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });
  
  // Task Routes
  app.get("/api/tasks", authenticateToken, async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  app.get("/api/tasks/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });
  
  app.get("/api/customers/:id/tasks", authenticateToken, async (req: Request, res: Response) => {
    try {
      const customerId = parseInt(req.params.id);
      const tasks = await storage.getTasksByCustomer(customerId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  app.post("/api/tasks", authenticateToken, async (req: Request, res: Response) => {
    try {
      const taskData = { ...req.body };
      
      // Add the current user as creator
      taskData.createdBy = (req as any).user.id;
      
      const validatedData = insertTaskSchema.parse(taskData);
      const newTask = await storage.createTask(validatedData);
      
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  app.patch("/api/tasks/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Only include allowed fields
      const taskData: Partial<{
        title: string;
        description: string;
        status: "completed" | "pending" | "postponed";
        dueDate: Date;
        customerId: number;
        assignedTo: number;
      }> = {};
      
      if (req.body.title) taskData.title = req.body.title;
      if (req.body.description !== undefined) taskData.description = req.body.description;
      if (req.body.status) taskData.status = req.body.status;
      if (req.body.dueDate) taskData.dueDate = new Date(req.body.dueDate);
      if (req.body.customerId) taskData.customerId = parseInt(req.body.customerId);
      if (req.body.assignedTo) taskData.assignedTo = parseInt(req.body.assignedTo);
      
      const updatedTask = await storage.updateTask(id, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  app.delete("/api/tasks/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  
  // Statistics Routes
  app.get("/api/stats", authenticateToken, async (req: Request, res: Response) => {
    try {
      const customerStats = await storage.getCustomerStats();
      const taskStats = await storage.getTaskStats();
      
      res.json({
        totalCustomers: customerStats.totalCustomers,
        activeCustomers: customerStats.activeCustomers,
        monthlyNewCustomers: customerStats.monthlyNewCustomers,
        pendingTasks: taskStats.pendingTasks,
        completedTasks: taskStats.completedTasks,
        postponedTasks: taskStats.postponedTasks
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  
  app.get("/api/stats/customer-growth", authenticateToken, async (req: Request, res: Response) => {
    try {
      const growthData = await storage.getCustomerGrowthData();
      res.json(growthData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer growth data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
