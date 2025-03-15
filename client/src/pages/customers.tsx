import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerList from "@/components/customers/customer-list";
import CustomerDetail from "@/components/customers/customer-detail";
import ExcelImport from "@/components/excel/excel-import";
import ExcelExport from "@/components/excel/excel-export";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";

interface CustomersProps {
  id?: string;
}

export default function Customers({ id }: CustomersProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setActiveTab("detail");
    } else {
      setActiveTab("list");
    }
  }, [id]);

  if (id) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <CustomerDetail customerId={id} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Müşteriler</h1>
          <div className="flex space-x-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  İçe Aktar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Excel'den İçe Aktar</DialogTitle>
                </DialogHeader>
                <ExcelImport 
                  type="customers" 
                  onSuccess={() => setIsImportDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>

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
                <ExcelExport type="customers" />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">Müşteri Listesi</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6">
            <CustomerList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
