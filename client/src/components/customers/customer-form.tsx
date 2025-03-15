import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertCustomerSchema, Customer } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CustomerFormProps {
  onSuccess: () => void;
  customer?: Customer;
}

const formSchema = insertCustomerSchema.extend({
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomerForm({ onSuccess, customer }: CustomerFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: customer?.companyName || "",
      contactName: customer?.contactName || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      address: customer?.address || "",
      sector: customer?.sector || "",
      status: customer?.status || "active",
      notes: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      if (customer) {
        // Update existing customer
        await apiRequest("PATCH", `/api/customers/${customer.id}`, values);
        toast({
          title: "Müşteri güncellendi",
          description: `${values.companyName} başarıyla güncellendi.`,
        });
      } else {
        // Create new customer
        await apiRequest("POST", "/api/customers", values);
        toast({
          title: "Müşteri eklendi",
          description: `${values.companyName} başarıyla eklendi.`,
        });
      }
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Hata",
        description: "Müşteri kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firma Adı</FormLabel>
              <FormControl>
                <Input placeholder="Firma adı giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İletişim Kişisi</FormLabel>
              <FormControl>
                <Input placeholder="İletişim kişisini giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input placeholder="Telefon numarası giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input placeholder="E-posta adresi giriniz" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adres</FormLabel>
              <FormControl>
                <Input placeholder="Adres giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="sector"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sektör</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sektör seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Teknoloji">Teknoloji</SelectItem>
                  <SelectItem value="Gıda">Gıda</SelectItem>
                  <SelectItem value="Turizm">Turizm</SelectItem>
                  <SelectItem value="İnşaat">İnşaat</SelectItem>
                  <SelectItem value="Eğitim">Eğitim</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durum</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Müşteri hakkında notlar giriniz" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : customer ? "Güncelle" : "Kaydet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
