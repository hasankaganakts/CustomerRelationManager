import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { importFromExcel } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Customer, InsertCustomer } from "@shared/schema";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

interface ExcelImportProps {
  type: "customers" | "tasks";
  onSuccess?: () => void;
}

export default function ExcelImport({ type, onSuccess }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportSummary(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setImporting(true);
      setProgress(10);
      
      // Parse Excel file
      const data = await importFromExcel(file);
      setProgress(40);
      
      if (data.length === 0) {
        toast({
          title: "Hata",
          description: "Excel dosyası boş veya uyumsuz.",
          variant: "destructive",
        });
        setImporting(false);
        return;
      }

      // Process data based on type
      if (type === "customers") {
        const summary = await importCustomers(data);
        setImportSummary(summary);
      } else if (type === "tasks") {
        // Task import logic would be similar to customers
        toast({
          title: "Bilgi",
          description: "Görev içe aktarma henüz desteklenmiyor.",
        });
      }
      
      setProgress(100);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "İçe Aktarma Hatası",
        description: "Dosya işlenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const importCustomers = async (data: any[]): Promise<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  }> => {
    const total = data.length;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Map Excel columns to customer schema
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Create mapping based on Excel headers
        const customer: Partial<InsertCustomer> = {
          companyName: row["Firma Adı"] || row["companyName"] || "",
          contactName: row["İletişim Kişisi"] || row["contactName"] || "",
          phone: row["Telefon"] || row["phone"] || "",
          email: row["E-posta"] || row["email"] || "",
          address: row["Adres"] || row["address"] || "",
          sector: row["Sektör"] || row["sector"] || "",
          status: (row["Durum"] === "Aktif" || row["status"] === "active") ? "active" : "inactive",
        };

        if (!customer.companyName || !customer.contactName) {
          throw new Error("Firma adı ve iletişim kişisi zorunludur");
        }

        // Send to API
        await apiRequest("POST", "/api/customers/import", customer);
        success++;
      } catch (error: any) {
        failed++;
        errors.push(`Satır ${i + 1}: ${error.message || "Bilinmeyen hata"}`);
      }

      // Update progress
      setProgress(40 + Math.floor((i / data.length) * 50));
    }

    // Refresh customers list
    queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    
    return { total, success, failed, errors };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Excel'den İçe Aktar</CardTitle>
        <CardDescription>
          {type === "customers" 
            ? "Excel dosyasından müşterileri içe aktarın. Dosya, en az Firma Adı ve İletişim Kişisi sütunlarını içermelidir."
            : "Excel dosyasından görevleri içe aktarın."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            <input
              type="file"
              id="excel-file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
              disabled={importing}
            />
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <label
              htmlFor="excel-file"
              className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
            >
              Excel Dosyası Seç
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Seçilen dosya: {file.name}
              </p>
            )}
          </div>
          
          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-gray-600">
                İçe aktarılıyor... (%{progress})
              </p>
            </div>
          )}
          
          {importSummary && (
            <div className={`p-4 rounded-md ${
              importSummary.failed === 0 ? "bg-green-50" : "bg-yellow-50"
            }`}>
              <div className="flex items-center">
                {importSummary.failed === 0 
                  ? <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  : <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                }
                <h3 className="font-medium">
                  İçe Aktarma Sonucu
                </h3>
              </div>
              <ul className="mt-2 text-sm space-y-1 pl-7">
                <li>Toplam: {importSummary.total} kayıt</li>
                <li>Başarılı: {importSummary.success} kayıt</li>
                <li>Başarısız: {importSummary.failed} kayıt</li>
              </ul>
              {importSummary.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm font-medium cursor-pointer">
                    Hata Detayları ({importSummary.errors.length})
                  </summary>
                  <ul className="mt-1 text-xs text-red-600 space-y-1 pl-2">
                    {importSummary.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          
          <Button 
            onClick={handleImport} 
            disabled={!file || importing} 
            className="w-full"
          >
            {importing ? "İçe Aktarılıyor..." : "İçe Aktar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
