import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from "@/components/tasks/task-list";
import TaskDetail from "@/components/tasks/task-detail";
import ExcelExport from "@/components/excel/excel-export";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useLocation } from "wouter";
import TaskForm from "@/components/tasks/task-form";

interface TasksProps {
  id?: string;
}

export default function Tasks({ id }: TasksProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  // Get the customerId from URL if it's a new task with pre-selected customer
  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get("customerId");
  
  useEffect(() => {
    if (id) {
      setActiveTab("detail");
    } else if (window.location.pathname === "/tasks/new") {
      setIsFormOpen(true);
    } else {
      setActiveTab("all");
    }
  }, [id]);

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const pendingTasks = tasks.filter(task => task.status === "pending");
  const completedTasks = tasks.filter(task => task.status === "completed");
  const postponedTasks = tasks.filter(task => task.status === "postponed");

  const handleNewTaskSuccess = () => {
    setIsFormOpen(false);
    // Redirect to tasks list
    setLocation("/tasks");
  };

  if (id) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <TaskDetail taskId={id} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Görevler</h1>
          <div className="flex space-x-2">
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Dışa Aktar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Excel'e Dışa Aktar</DialogTitle>
                </DialogHeader>
                <ExcelExport type="tasks" />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Yeni Görev Ekle</DialogTitle>
            </DialogHeader>
            <TaskForm 
              onSuccess={handleNewTaskSuccess} 
              defaultCustomerId={customerId ? parseInt(customerId) : undefined}
            />
          </DialogContent>
        </Dialog>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="all">Tüm Görevler</TabsTrigger>
            <TabsTrigger value="pending">Bekleyenler ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Tamamlananlar ({completedTasks.length})</TabsTrigger>
            <TabsTrigger value="postponed">Ertelenenler ({postponedTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <TaskList />
          </TabsContent>
          <TabsContent value="pending" className="mt-6">
            <TaskList tasks={pendingTasks} />
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <TaskList tasks={completedTasks} />
          </TabsContent>
          <TabsContent value="postponed" className="mt-6">
            <TaskList tasks={postponedTasks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
