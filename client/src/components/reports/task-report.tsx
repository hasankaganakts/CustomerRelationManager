import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Task, Customer, User } from "@shared/schema";
import { getMonthName, exportToExcel } from "@/lib/utils";
import { Chart, registerables } from "chart.js";
import { Download } from "lucide-react";

Chart.register(...registerables);

export default function TaskReport() {
  const [timeframe, setTimeframe] = useState("status");
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  useEffect(() => {
    if (!chartRef.current || tasks.length === 0) return;

    // If a chart already exists, destroy it
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare data based on selected timeframe
    let labels: string[] = [];
    let data: number[] = [];
    let chartType: "bar" | "pie" | "line" = "bar";
    let colors: string[] = [
      "rgba(59, 130, 246, 0.7)",
      "rgba(16, 185, 129, 0.7)",
      "rgba(245, 158, 11, 0.7)",
    ];

    if (timeframe === "status") {
      labels = ["Tamamlandı", "Bekliyor", "Ertelendi"];
      const completedCount = tasks.filter(task => task.status === "completed").length;
      const pendingCount = tasks.filter(task => task.status === "pending").length;
      const postponedCount = tasks.filter(task => task.status === "postponed").length;
      data = [completedCount, pendingCount, postponedCount];
      chartType = "pie";
    } else if (timeframe === "monthly") {
      chartType = "line";
      // Last 6 months
      labels = Array(6)
        .fill(0)
        .map((_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - 5 + i);
          return getMonthName(d.getMonth());
        });

      const today = new Date();
      const months = Array(6)
        .fill(0)
        .map((_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - 5 + i);
          return {
            month: d.getMonth(),
            year: d.getFullYear(),
          };
        });

      data = months.map(({ month, year }) => {
        return tasks.filter((task) => {
          const createdAt = new Date(task.createdAt);
          return (
            createdAt.getMonth() === month && createdAt.getFullYear() === year
          );
        }).length;
      });
    } else if (timeframe === "user") {
      chartType = "bar";
      const tasksByUser = new Map<number, number>();
      
      tasks.forEach(task => {
        if (task.assignedTo) {
          tasksByUser.set(
            task.assignedTo, 
            (tasksByUser.get(task.assignedTo) || 0) + 1
          );
        }
      });
      
      const sortedUsers = Array.from(tasksByUser.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 users
      
      labels = sortedUsers.map(([userId]) => {
        const user = users.find(u => u.id === userId);
        return user ? user.fullName : `Kullanıcı ${userId}`;
      });
      
      data = sortedUsers.map(([_, count]) => count);
      
      colors = Array(sortedUsers.length).fill(0).map((_, i) => 
        `rgba(${59 + i * 20}, ${130 - i * 10}, ${246 - i * 20}, 0.7)`
      );
    } else if (timeframe === "customer") {
      chartType = "bar";
      const tasksByCustomer = new Map<number, number>();
      
      tasks.forEach(task => {
        if (task.customerId) {
          tasksByCustomer.set(
            task.customerId, 
            (tasksByCustomer.get(task.customerId) || 0) + 1
          );
        }
      });
      
      const sortedCustomers = Array.from(tasksByCustomer.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 customers
      
      labels = sortedCustomers.map(([customerId]) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.companyName : `Müşteri ${customerId}`;
      });
      
      data = sortedCustomers.map(([_, count]) => count);
      
      colors = Array(sortedCustomers.length).fill(0).map((_, i) => 
        `rgba(${16 + i * 20}, ${185 - i * 10}, ${129 - i * 10}, 0.7)`
      );
    }

    // Create the chart
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: chartType,
        data: {
          labels,
          datasets: [
            {
              label: "Görev Sayısı",
              data,
              backgroundColor: colors,
              borderColor: "#fff",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: chartType === "pie" ? "right" : "top",
            },
          },
          scales: chartType === "pie" ? undefined : {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [tasks, customers, users, timeframe]);

  const handleExportToExcel = () => {
    if (tasks.length === 0) return;

    // Map tasks to a format suitable for Excel
    const data = tasks.map((task) => {
      const customer = customers.find(c => c.id === task.customerId);
      const user = users.find(u => u.id === task.assignedTo);
      
      return {
        "Görev": task.title,
        "Açıklama": task.description || "",
        "Müşteri": customer ? customer.companyName : "",
        "Atanan Kişi": user ? user.fullName : "",
        "Durum": task.status === "completed" ? "Tamamlandı" : 
                 task.status === "pending" ? "Bekliyor" : "Ertelendi",
        "Tamamlanma Tarihi": task.dueDate ? new Date(task.dueDate).toLocaleDateString("tr-TR") : "",
        "Oluşturulma Tarihi": new Date(task.createdAt).toLocaleDateString("tr-TR"),
      };
    });

    exportToExcel(data, "gorev-raporu");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Görev Raporu</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rapor Türü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Durum Dağılımı</SelectItem>
              <SelectItem value="monthly">Aylık Görev Oluşturma</SelectItem>
              <SelectItem value="user">Kişi Bazlı Performans</SelectItem>
              <SelectItem value="customer">Müşteri Bazlı Dağılım</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
