import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerReport from "@/components/reports/customer-report";
import TaskReport from "@/components/reports/task-report";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("customers");

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Raporlar</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="customers">Müşteri Raporları</TabsTrigger>
            <TabsTrigger value="tasks">Görev Raporları</TabsTrigger>
          </TabsList>
          <TabsContent value="customers" className="mt-6">
            <CustomerReport />
          </TabsContent>
          <TabsContent value="tasks" className="mt-6">
            <TaskReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
