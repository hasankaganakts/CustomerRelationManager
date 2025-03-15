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
import { Customer } from "@shared/schema";
import CustomerForm from "./customer-form";
import { apiRequest } from "@/lib/queryClient";
import { getStatusText } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Plus, MoreHorizontal, Edit, Trash, Eye, FilePlus } from "lucide-react";

export default function CustomerList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const deleteMutation = useMutation({
    mutationFn: (customerId: number) => 
      apiRequest("DELETE", `/api/customers/${customerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Müşteri silindi",
        description: "Müşteri başarıyla silindi.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Müşteri silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers.filter(
    (customer) => 
      customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.sector && customer.sector.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      deleteMutation.mutate(selectedCustomer.id);
    }
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedCustomer(null);
    setIsFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="w-1/3">
          <Input
            placeholder="Müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Müşteri
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedCustomer ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}
              </DialogTitle>
            </DialogHeader>
            <CustomerForm 
              onSuccess={closeForm} 
              customer={selectedCustomer || undefined} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Yükleniyor...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-10">
          {searchTerm ? "Arama kriterlerine uygun müşteri bulunamadı." : "Henüz müşteri bulunmuyor."}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Firma</TableHead>
              <TableHead>İletişim Kişisi</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Sektör</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.companyName}</TableCell>
                <TableCell>{customer.contactName}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.sector}</TableCell>
                <TableCell>
                  <Badge
                    variant={customer.status === "active" ? "default" : "secondary"}
                  >
                    {getStatusText(customer.status)}
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
                      <Link href={`/customers/${customer.id}`}>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Detaylar</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={() => handleEditClick(customer)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Düzenle</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Sil</span>
                      </DropdownMenuItem>
                      <Link href={`/tasks/new?customerId=${customer.id}`}>
                        <DropdownMenuItem>
                          <FilePlus className="mr-2 h-4 w-4" />
                          <span>Görev Ekle</span>
                        </DropdownMenuItem>
                      </Link>
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
            <AlertDialogTitle>Müşteriyi silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Bu müşteriye ait tüm görevler ve notlar da silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
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
