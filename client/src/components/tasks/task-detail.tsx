import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task, Customer, User } from "@shared/schema";
import { formatDate, getStatusColor, getStatusText } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TaskForm from "./task-form";
import { Calendar, AlignLeft, Building, User as UserIcon, Clock, Tag } from "lucide-react";

interface TaskDetailProps {
  taskId: string;
}

export default function TaskDetail({ taskId }: TaskDetailProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const id = parseInt(taskId);

  const { data: task, isLoading: isLoadingTask } = useQuery<Task>({
    queryKey: [`/api/tasks/${id}`],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  if (isLoadingTask) {
    return <div className="text-center py-10">Görev bilgileri yükleniyor...</div>;
  }

  if (!task) {
    return <div className="text-center py-10 text-red-500">Görev bulunamadı.</div>;
  }

  const customer = customers.find(c => c.id === task.customerId);
  const assignedUser = users.find(u => u.id === task.assignedTo);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <div className="flex items-center mt-1">
            <Badge className={getStatusColor(task.status)}>
              {getStatusText(task.status)}
            </Badge>
            {customer && (
              <span className="ml-2 text-sm text-gray-600">
                {customer.companyName}
              </span>
            )}
          </div>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Düzenle</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Görev Düzenle</DialogTitle>
            </DialogHeader>
            <TaskForm 
              onSuccess={() => {
                setIsFormOpen(false);
                queryClient.invalidateQueries({ queryKey: [`/api/tasks/${id}`] });
              }} 
              task={task} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Görev Detayları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && (
            <div className="flex items-start">
              <AlignLeft className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <div className="font-medium">Açıklama</div>
                <div className="whitespace-pre-wrap">{task.description}</div>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <Building className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
            <div>
              <div className="font-medium">Müşteri</div>
              <div>{customer ? customer.companyName : "-"}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <UserIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
            <div>
              <div className="font-medium">Atanan Kişi</div>
              <div>{assignedUser ? assignedUser.fullName : "-"}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
            <div>
              <div className="font-medium">Tamamlanma Tarihi</div>
              <div>{task.dueDate ? formatDate(task.dueDate) : "-"}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
            <div>
              <div className="font-medium">Oluşturulma Tarihi</div>
              <div>{formatDate(task.createdAt)}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <Tag className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
            <div>
              <div className="font-medium">Durum</div>
              <div>
                <Badge className={getStatusColor(task.status)}>
                  {getStatusText(task.status)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
