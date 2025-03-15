import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonthName } from "@/lib/utils";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface CustomerGrowthChartProps {
  data: number[];
}

export default function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // If a chart already exists, destroy it
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Generate last 6 months
    const labels = Array(6)
      .fill(0)
      .map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - 5 + i);
        return getMonthName(d.getMonth());
      });

    // Create the chart
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Yeni Müşteriler",
              data,
              fill: false,
              borderColor: "#3B82F6",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
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
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Müşteri Artışı</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
