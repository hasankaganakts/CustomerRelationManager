import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Task, Customer, User } from "@shared/schema";
import TaskForm from "./task-form";
import { apiRequest } from "@/lib/queryClient";
import { getStatusColor, getStatusText, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Plus, MoreHorizontal, Edit, Trash, Eye, CheckCircle, Clock } from "lucide-react";

interface TaskListProps {
  tasks?: Task[];
  customerId?: number;
  showAddButton?: boolean;
}

export default function TaskList({ tasks: propTasks, customerId, showAddButton = true }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fetchedTasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: [customerId ? `/api/customers/${customerId}/tasks` : "/api/tasks"],
    enabled: !propTasks,
  });
  
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: number) => 
      apiRequest("DELETE", `/api/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (customerId) {
        queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}/tasks`] });
      }
      toast({
        title: "Görev silindi",
        description: "Görev başarıyla silindi.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Görev silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: string }) => 
      apiRequest("PATCH", `/api/tasks/${taskId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (customerId) {
        queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}/tasks`] });
      }
      toast({
        title: "Görev durumu güncellendi",
        description: "Görev durumu başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Görev durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const tasks = propTasks || fetchedTasks;
  const isLoading = !propTasks && isLoadingTasks;

  const filteredTasks = tasks.filter(
    (task) => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteMutation.mutate(selectedTask.id);
    }
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleStatusChange = (taskId: number, status: string) => {
    updateStatusMutation.mutate({ taskId, status });
  };

  const closeForm = () => {
    setSelectedTask(null);
    setIsFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    if (customerId) {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}/tasks`] });
    }
  };

  const getCustomerName = (customerId?: number) => {
    if (!customerId) return "-";
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.companyName : "-";
  };

  const getUserName = (userId?: number) => {
    if (!userId) return "-";
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : "-";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="w-1/3">
          <Input
            placeholder="Görev ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {showAddButton && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Görev
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {selectedTask ? "Görev Düzenle" : "Yeni Görev Ekle"}
                </DialogTitle>
              </DialogHeader>
              <TaskForm 
                onSuccess={closeForm} 
                task={selectedTask || undefined} 
                defaultCustomerId={customerId}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-10">Yükleniyor...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-10">
          {searchTerm ? "Arama kriterlerine uygun görev bulunamadı." : "Henüz görev bulunmuyor."}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Görev</TableHead>
              {!customerId && <TableHead>Müşteri</TableHead>}
              <TableHead>Atanan Kişi</TableHead>
              <TableHead>Tamamlanma Tarihi</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                {!customerId && (
                  <TableCell>{getCustomerName(task.customerId)}</TableCell>
                )}
                <TableCell>{getUserName(task.assignedTo)}</TableCell>
                <TableCell>{task.dueDate ? formatDate(task.dueDate) : "-"}</TableCell>
                <TableCell>
                  <Badge
                    className={getStatusColor(task.status)}
                  >
                    {getStatusText(task.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/tasks/${task.id}`}>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Detaylar</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={() => handleEditClick(task)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Düzenle</span>
                      </DropdownMenuItem>
                      {task.status !== "completed" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, "completed")}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Tamamlandı Olarak İşaretle</span>
                        </DropdownMenuItem>
                      )}
                      {task.status !== "postponed" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, "postponed")}>
                          <Clock className="mr-2 h-4 w-4" />
                          <span>Ertelendi Olarak İşaretle</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTask(task);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Sil</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Görevi silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
