import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, CalendarPlus, Clock } from "lucide-react";
import StatsCard from "@/components/dashboard/stats-card";
import CustomerGrowthChart from "@/components/dashboard/customer-growth-chart";
import TaskStatusChart from "@/components/dashboard/task-status-chart";
import RecentCustomers from "@/components/dashboard/recent-customers";
import UpcomingTasks from "@/components/dashboard/upcoming-tasks";
import { Customer, Task, User } from "@shared/schema";
import { getCurrentMonthCustomers, getTaskStatusCounts } from "@/lib/utils";

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

  const { data: stats = { totalCustomers: 0, activeCustomers: 0, pendingTasks: 0 }, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: customerGrowth = [0, 0, 0, 0, 0, 0], isLoading: isLoadingGrowth } = useQuery({
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
    .slice(0, 3);

  const upcomingTasks = [...tasks]
    .filter(task => task.status !== "completed")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 3);

  const isLoading = isLoadingCustomers || isLoadingTasks || isLoadingUsers || isLoadingStats || isLoadingGrowth;

  if (isLoading) {
    return <div className="py-10 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Dashboard Stats */}
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Customers */}
          <StatsCard
            title="Toplam Müşteri"
            value={totalCustomers}
            icon={<Users className="h-6 w-6 text-white" />}
            color="bg-blue-500"
          />

          {/* Active Customers */}
          <StatsCard
            title="Aktif Müşteri"
            value={activeCustomers}
            icon={<UserCheck className="h-6 w-6 text-white" />}
            color="bg-green-500"
          />

          {/* Monthly Added Customers */}
          <StatsCard
            title="Bu Ay Eklenen"
            value={monthlyNewCustomers}
            icon={<CalendarPlus className="h-6 w-6 text-white" />}
            color="bg-purple-500"
          />

          {/* Pending Tasks */}
          <StatsCard
            title="Bekleyen Görevler"
            value={pendingTasks}
            icon={<Clock className="h-6 w-6 text-white" />}
            color="bg-yellow-500"
          />
        </div>

        {/* Dashboard Charts */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Customer Growth Chart */}
          <CustomerGrowthChart data={customerGrowth} />

          {/* Task Status Chart */}
          <TaskStatusChart 
            completed={taskStats.completed} 
            pending={taskStats.pending} 
            postponed={taskStats.postponed} 
          />
        </div>

        {/* Recent Customers */}
        <RecentCustomers customers={recentCustomers} />

        {/* Upcoming Tasks */}
        <UpcomingTasks tasks={upcomingTasks} users={users} customers={customers} />
      </div>
    </div>
  );
}
