import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, CalendarPlus, Clock, LayoutDashboard } from "lucide-react";
import StatsCard from "@/components/dashboard/stats-card";
import CustomerGrowthChart from "@/components/dashboard/customer-growth-chart";
import TaskStatusChart from "@/components/dashboard/task-status-chart";
import RecentCustomers from "@/components/dashboard/recent-customers";
import UpcomingTasks from "@/components/dashboard/upcoming-tasks";
import { Customer, Task, User, CustomerStats } from "@shared/schema";
import { getCurrentMonthCustomers, getTaskStatusCounts } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  // Fetch data for dashboard
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  type Stats = {
    totalCustomers: number;
    activeCustomers: number;
    pendingTasks: number;
  };

  const { data: stats = { totalCustomers: 0, activeCustomers: 0, pendingTasks: 0 } as Stats, isLoading: isLoadingStats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: customerGrowth = [0, 0, 0, 0, 0, 0] as number[], isLoading: isLoadingGrowth } = useQuery<number[]>({
    queryKey: ["/api/stats/customer-growth"],
  });

  // Calculate metrics if API doesn't provide them
  const totalCustomers = stats.totalCustomers || customers.length;
  const activeCustomers = stats.activeCustomers || customers.filter(c => c.status === "active").length;
  const monthlyNewCustomers = getCurrentMonthCustomers(customers);
  
  const taskStats = getTaskStatusCounts(tasks);
  const pendingTasks = stats.pendingTasks || taskStats.pending;

  // Get recent data for lists
  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const upcomingTasks = [...tasks]
    .filter(task => task.status !== "completed")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  const isLoading = isLoadingCustomers || isLoadingTasks || isLoadingUsers || isLoadingStats || isLoadingGrowth;

  // Loading skeleton UI
  if (isLoading) {
    return (
      <div className="py-8 container">
        <div className="flex items-center space-x-2 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-1/4" />
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
        
        <Skeleton className="h-64 rounded-lg mb-8" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <motion.div 
      className="py-8 container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="flex items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 shadow-sm border border-primary/20">
          <LayoutDashboard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Güncel istatistikler ve aktivite özetleri</p>
        </div>
      </motion.div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Customers */}
        <StatsCard
          title="Toplam Müşteri"
          value={totalCustomers}
          icon={<Users className="h-6 w-6" />}
          color="bg-primary"
        />

        {/* Active Customers */}
        <StatsCard
          title="Aktif Müşteri"
          value={activeCustomers}
          icon={<UserCheck className="h-6 w-6" />}
          color="bg-green-500"
        />

        {/* Monthly Added Customers */}
        <StatsCard
          title="Bu Ay Eklenen"
          value={monthlyNewCustomers}
          icon={<CalendarPlus className="h-6 w-6" />}
          color="bg-purple-500"
        />

        {/* Pending Tasks */}
        <StatsCard
          title="Bekleyen Görevler"
          value={pendingTasks}
          icon={<Clock className="h-6 w-6" />}
          color="bg-amber-500"
        />
      </div>

      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
        {/* Customer Growth Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-0 shadow-md h-full">
            <CardContent className="p-6 h-full">
              <CustomerGrowthChart data={customerGrowth} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Status Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-0 shadow-md h-full">
            <CardContent className="p-6 h-full">
              <TaskStatusChart 
                completed={taskStats.completed} 
                pending={taskStats.pending} 
                postponed={taskStats.postponed} 
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Customers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <RecentCustomers customers={recentCustomers} />
      </motion.div>

      {/* Upcoming Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <UpcomingTasks tasks={upcomingTasks} users={users} customers={customers} />
      </motion.div>
    </motion.div>
  );
}
