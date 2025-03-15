import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Customer, Task } from "@shared/schema";
import { Download, FileSpreadsheet } from "lucide-react";

interface ExcelExportProps {
  type: "customers" | "tasks";
}

export default function ExcelExport({ type }: ExcelExportProps) {
  const [exporting, setExporting] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    enabled: type === "customers",
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    enabled: type === "tasks",
  });
  
  const customerFields = [
    { id: "companyName", label: "Firma Adı" },
    { id: "contactName", label: "İletişim Kişisi" },
    { id: "phone", label: "Telefon" },
    { id: "email", label: "E-posta" },
    { id: "address", label: "Adres" },
    { id: "sector", label: "Sektör" },
    { id: "status", label: "Durum" },
    { id: "createdAt", label: "Kayıt Tarihi" },
  ];
  
  const taskFields = [
    { id: "title", label: "Görev Adı" },
    { id: "description", label: "Açıklama" },
    { id: "status", label: "Durum" },
    { id: "dueDate", label: "Tamamlanma Tarihi" },
    { id: "customerId", label: "Müşteri" },
    { id: "assignedTo", label: "Atanan Kişi" },
    { id: "createdAt", label: "Oluşturulma Tarihi" },
  ];
  
  const fields = type === "customers" ? customerFields : taskFields;

  const handleToggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    if (selectedFields.length === fields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(fields.map((f) => f.id));
    }
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: "Alan Seçin",
        description: "Lütfen dışa aktarılacak en az bir alan seçin.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      if (type === "customers") {
        const data = customers.map((customer) => {
          const item: Record<string, any> = {};
          
          selectedFields.forEach((field) => {
            if (field === "status") {
              item["Durum"] = customer.status === "active" ? "Aktif" : "Pasif";
            } else if (field === "createdAt") {
              item["Kayıt Tarihi"] = new Date(customer.createdAt).toLocaleDateString("tr-TR");
            } else {
              const fieldLabel = customerFields.find(f => f.id === field)?.label || field;
              item[fieldLabel] = (customer as any)[field] || "";
            }
          });
          
          return item;
        });
        
        await exportToExcel(data, "musteriler");
        
      } else if (type === "tasks") {
        const data = tasks.map((task) => {
          const item: Record<string, any> = {};
          
          selectedFields.forEach((field) => {
            if (field === "status") {
              item["Durum"] = task.status === "completed" 
                ? "Tamamlandı" 
                : task.status === "pending" 
                  ? "Bekliyor" 
                  : "Ertelendi";
            } else if (field === "createdAt" || field === "dueDate") {
              const label = field === "createdAt" 
                ? "Oluşturulma Tarihi" 
                : "Tamamlanma Tarihi";
              item[label] = task[field] 
                ? new Date(task[field] as string).toLocaleDateString("tr-TR") 
                : "";
            } else {
              const fieldLabel = taskFields.find(f => f.id === field)?.label || field;
              item[fieldLabel] = (task as any)[field] || "";
            }
          });
          
          return item;
        });
        
        await exportToExcel(data, "gorevler");
      }
      
      toast({
        title: "Dışa Aktarma Başarılı",
        description: "Veriler başarıyla Excel dosyasına aktarıldı.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Dışa Aktarma Hatası",
        description: "Dışa aktarma işlemi sırasında bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Excel'e Dışa Aktar</CardTitle>
        <CardDescription>
          {type === "customers" 
            ? "Müşteri verilerini Excel dosyasına aktarın. Dışa aktarmak istediğiniz alanları seçin."
            : "Görev verilerini Excel dosyasına aktarın. Dışa aktarmak istediğiniz alanları seçin."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 py-2">
            <Checkbox 
              id="select-all" 
              checked={selectedFields.length === fields.length} 
              onCheckedChange={handleSelectAll} 
            />
            <Label htmlFor="select-all" className="font-medium">Tümünü Seç</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={field.id} 
                  checked={selectedFields.includes(field.id)} 
                  onCheckedChange={() => handleToggleField(field.id)} 
                />
                <Label htmlFor={field.id}>{field.label}</Label>
              </div>
            ))}
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={handleExport} 
              disabled={selectedFields.length === 0 || exporting}
              className="w-full"
            >
              {exporting ? (
                "Dışa Aktarılıyor..."
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel'e Aktar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
