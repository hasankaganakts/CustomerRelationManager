import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Customer, Note, Task, InsertNote } from "@shared/schema";
import { formatDate, getStatusText } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CustomerForm from "./customer-form";
import TaskList from "@/components/tasks/task-list";
import { apiRequest } from "@/lib/queryClient";
import { Building2, Phone, Mail, MapPin, Tag, Calendar, User, Plus, Edit } from "lucide-react";

interface CustomerDetailProps {
  customerId: string;
}

export default function CustomerDetail({ customerId }: CustomerDetailProps) {
  const [note, setNote] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const id = parseInt(customerId);

  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer>({
    queryKey: [`/api/customers/${id}`],
  });

  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<Note[]>({
    queryKey: [`/api/customers/${id}/notes`],
  });

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: [`/api/customers/${id}/tasks`],
  });

  const addNoteMutation = useMutation({
    mutationFn: (newNote: InsertNote) => 
      apiRequest("POST", `/api/customers/${id}/notes`, newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${id}/notes`] });
      setNote("");
      toast({
        title: "Not eklendi",
        description: "Not başarıyla eklendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Not eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleAddNote = () => {
    if (!note.trim()) return;
    
    addNoteMutation.mutate({
      content: note,
      customerId: id,
    });
  };

  if (isLoadingCustomer) {
    return <div className="text-center py-10">Müşteri bilgileri yükleniyor...</div>;
  }

  if (!customer) {
    return <div className="text-center py-10 text-red-500">Müşteri bulunamadı.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{customer.companyName}</h1>
          <div className="flex items-center mt-1">
            <Badge variant={customer.status === "active" ? "default" : "secondary"}>
              {getStatusText(customer.status)}
            </Badge>
            {customer.sector && (
              <span className="ml-2 text-sm text-gray-600">
                {customer.sector}
              </span>
            )}
          </div>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Müşteri Düzenle</DialogTitle>
            </DialogHeader>
            <CustomerForm 
              onSuccess={() => {
                setIsFormOpen(false);
                queryClient.invalidateQueries({ queryKey: [`/api/customers/${id}`] });
              }} 
              customer={customer} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <div className="font-medium">İletişim Kişisi</div>
                <div>{customer.contactName || "-"}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <div className="font-medium">Telefon</div>
                <div>{customer.phone || "-"}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <div className="font-medium">E-posta</div>
                <div>{customer.email || "-"}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <div className="font-medium">Adres</div>
                <div>{customer.address || "-"}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Building2 className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <div className="font-medium">Firma Adı</div>
                <div>{customer.companyName}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Tag className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <div className="font-medium">Sektör</div>
                <div>{customer.sector || "-"}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <div className="font-medium">Kayıt Tarihi</div>
                <div>{formatDate(customer.createdAt)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="Yeni not ekle..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mb-2"
                />
                <Button 
                  onClick={handleAddNote} 
                  disabled={!note.trim() || addNoteMutation.isPending}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Not Ekle
                </Button>
              </div>
              
              <div className="space-y-2 mt-4">
                {isLoadingNotes ? (
                  <div className="text-center py-4">Notlar yükleniyor...</div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Henüz not eklenmemiş.</div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Görevler</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          {isLoadingTasks ? (
            <div className="text-center py-10">Görevler yükleniyor...</div>
          ) : (
            <TaskList tasks={tasks} customerId={id} showAddButton />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
