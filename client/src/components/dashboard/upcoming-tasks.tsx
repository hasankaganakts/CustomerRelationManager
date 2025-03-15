import { useLocation } from "wouter";
import { ChevronRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Task, User, Customer } from "@shared/schema";
import { getStatusColor, getStatusText, formatDate, getInitials } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UpcomingTasksProps {
  tasks: Task[];
  users: User[];
  customers: Customer[];
}

export default function UpcomingTasks({ tasks, users, customers }: UpcomingTasksProps) {
  const [, setLocation] = useLocation();
  
  const goToTasks = () => {
    setLocation("/tasks");
  };
  
  const goToTaskDetail = (id: number) => {
    setLocation(`/tasks/${id}`);
  };
  
  return (
    <div className="mt-8 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Yaklaşan Görevler</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary/90 font-medium"
          onClick={goToTasks}
        >
          Tümünü Gör
        </Button>
      </div>
      <Card className="overflow-hidden border-0 shadow-md">
        <CardContent className="p-0">
          <motion.ul 
            className="divide-y divide-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {tasks.length === 0 ? (
              <li className="px-6 py-6 text-center text-gray-500">
                Yaklaşan görev bulunmuyor.
              </li>
            ) : (
              tasks.map((task, index) => {
                const assignedUser = users.find(u => u.id === task.assignedTo);
                const customer = customers.find(c => c.id === task.customerId);
                const initials = customer 
                  ? getInitials(customer.companyName) 
                  : "?";
                
                return (
                  <motion.li 
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative"
                  >
                    <div 
                      onClick={() => goToTaskDetail(task.id)}
                      className="block hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-medium shadow-sm border border-primary/20`}>
                                {initials}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-primary">
                                {task.title}
                              </div>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                {task.dueDate && (
                                  <div className="flex items-center mr-2">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{formatDate(task.dueDate)}</span>
                                  </div>
                                )}
                                <span>Atanan: {assignedUser?.fullName || "Atanmamış"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                task.status === "completed" 
                                  ? "bg-green-100 text-green-800" 
                                  : task.status === "pending" 
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {getStatusText(task.status)}
                            </span>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        {customer && (
                          <div className="mt-2 pl-14">
                            <Badge variant="secondary" className="text-xs font-normal">
                              {customer.companyName}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.li>
                );
              })
            )}
          </motion.ul>
        </CardContent>
      </Card>
    </div>
  );
}
