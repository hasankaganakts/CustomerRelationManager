import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Task, User, Customer } from "@shared/schema";
import { getStatusColor, getStatusText, formatDate, getInitials } from "@/lib/utils";

interface UpcomingTasksProps {
  tasks: Task[];
  users: User[];
  customers: Customer[];
}

export default function UpcomingTasks({ tasks, users, customers }: UpcomingTasksProps) {
  return (
    <div className="mt-8 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Yaklaşan Görevler</h2>
        <Link href="/tasks">
          <a className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            Tümünü Gör
          </a>
        </Link>
      </div>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {tasks.length === 0 ? (
              <li className="px-4 py-6 text-center text-gray-500">
                Yaklaşan görev bulunmuyor.
              </li>
            ) : (
              tasks.map((task) => {
                const assignedUser = users.find(u => u.id === task.assignedTo);
                const customer = customers.find(c => c.id === task.customerId);
                const initials = customer 
                  ? getInitials(customer.companyName) 
                  : "?";
                const bgColor = task.status === "pending" 
                  ? "bg-blue-500" 
                  : task.status === "completed" 
                    ? "bg-green-500" 
                    : "bg-yellow-500";
                
                return (
                  <li key={task.id}>
                    <Link href={`/tasks/${task.id}`}>
                      <a className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center text-white`}>
                                  {initials}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-blue-600">
                                  {task.title}
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                  <span>Atanan: {assignedUser?.fullName || "Atanmamış"} | </span>
                                  <span>{task.dueDate ? formatDate(task.dueDate) : "Tarih belirtilmemiş"}</span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {getStatusText(task.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
