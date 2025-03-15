import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  // Convert color class (like bg-blue-500) to text color (text-blue-500)
  const textColor = color.replace("bg-", "text-");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
        <div className="px-6 py-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${color} bg-opacity-10 rounded-xl p-3 border border-${color.split('-')[1]}-200`}>
              <div className={textColor}>
                {icon}
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="text-sm font-medium text-gray-500 mb-1">
                {title}
              </div>
              <div className="flex items-end">
                <div className="text-2xl font-bold text-gray-900">
                  {value}
                </div>
                <div className="text-xs font-medium ml-1 mb-1 text-gray-500">
                  {typeof value === 'number' ? 'toplam' : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`h-1 w-full ${color}`}></div>
      </Card>
    </motion.div>
  );
}
