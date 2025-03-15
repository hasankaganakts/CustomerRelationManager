import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface TaskStatusChartProps {
  completed: number;
  pending: number;
  postponed: number;
}

export default function TaskStatusChart({ completed, pending, postponed }: TaskStatusChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // If a chart already exists, destroy it
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create the chart
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Tamamlandı", "Bekliyor", "Ertelendi"],
          datasets: [
            {
              data: [completed, pending, postponed],
              backgroundColor: ["#10B981", "#F59E0B", "#3B82F6"],
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
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
  }, [completed, pending, postponed]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Görev Durumları</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
