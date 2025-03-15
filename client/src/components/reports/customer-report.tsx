import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Customer } from "@shared/schema";
import { getMonthName, exportToExcel } from "@/lib/utils";
import { Chart, registerables } from "chart.js";
import { Download } from "lucide-react";

Chart.register(...registerables);

export default function CustomerReport() {
  const [timeframe, setTimeframe] = useState("monthly");
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  useEffect(() => {
    if (!chartRef.current || customers.length === 0) return;

    // If a chart already exists, destroy it
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare data based on selected timeframe
    let labels: string[] = [];
    let data: number[] = [];

    if (timeframe === "monthly") {
      // Last 12 months
      labels = Array(12)
        .fill(0)
        .map((_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - 11 + i);
          return getMonthName(d.getMonth());
        });

      const today = new Date();
      const months = Array(12)
        .fill(0)
        .map((_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - 11 + i);
          return {
            month: d.getMonth(),
            year: d.getFullYear(),
          };
        });

      data = months.map(({ month, year }) => {
        return customers.filter((customer) => {
          const createdAt = new Date(customer.createdAt);
          return (
            createdAt.getMonth() === month && createdAt.getFullYear() === year
          );
        }).length;
      });
    } else if (timeframe === "yearly") {
      // Last 5 years
      const currentYear = new Date().getFullYear();
      labels = Array(5)
        .fill(0)
        .map((_, i) => (currentYear - 4 + i).toString());

      data = labels.map((year) => {
        return customers.filter((customer) => {
          const createdAt = new Date(customer.createdAt);
          return createdAt.getFullYear().toString() === year;
        }).length;
      });
    } else if (timeframe === "status") {
      // By status
      labels = ["Aktif", "Pasif"];
      const activeCount = customers.filter(
        (customer) => customer.status === "active"
      ).length;
      const inactiveCount = customers.filter(
        (customer) => customer.status === "inactive"
      ).length;
      data = [activeCount, inactiveCount];
    } else if (timeframe === "sector") {
      // By sector
      const sectors = [...new Set(customers.map((c) => c.sector || "Tanımlanmamış"))];
      labels = sectors;
      data = sectors.map(
        (sector) =>
          customers.filter((c) => (c.sector || "Tanımlanmamış") === sector).length
      );
    }

    // Create the chart
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: timeframe === "status" || timeframe === "sector" ? "pie" : "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Müşteri Sayısı",
              data,
              backgroundColor: [
                "rgba(59, 130, 246, 0.7)",
                "rgba(16, 185, 129, 0.7)",
                "rgba(245, 158, 11, 0.7)",
                "rgba(239, 68, 68, 0.7)",
                "rgba(139, 92, 246, 0.7)",
                "rgba(249, 115, 22, 0.7)",
                "rgba(236, 72, 153, 0.7)",
                "rgba(14, 165, 233, 0.7)",
                "rgba(168, 85, 247, 0.7)",
                "rgba(234, 179, 8, 0.7)",
                "rgba(6, 182, 212, 0.7)",
                "rgba(72, 199, 142, 0.7)",
              ],
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
              position: timeframe === "status" || timeframe === "sector" ? "right" : "top",
            },
          },
          scales: timeframe === "status" || timeframe === "sector" ? undefined : {
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
  }, [customers, timeframe]);

  const handleExportToExcel = () => {
    if (customers.length === 0) return;

    // Map customers to a format suitable for Excel
    const data = customers.map((customer) => ({
      "Firma Adı": customer.companyName,
      "İletişim Kişisi": customer.contactName,
      "Telefon": customer.phone || "",
      "E-posta": customer.email || "",
      "Adres": customer.address || "",
      "Sektör": customer.sector || "",
      "Durum": customer.status === "active" ? "Aktif" : "Pasif",
      "Oluşturulma Tarihi": new Date(customer.createdAt).toLocaleDateString("tr-TR"),
    }));

    exportToExcel(data, "musteri-raporu");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Müşteri Raporu</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zaman Aralığı" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Aylık</SelectItem>
              <SelectItem value="yearly">Yıllık</SelectItem>
              <SelectItem value="status">Durum</SelectItem>
              <SelectItem value="sector">Sektör</SelectItem>
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
