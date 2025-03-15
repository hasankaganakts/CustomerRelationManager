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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertUserSchema, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserFormProps {
  onSuccess: () => void;
  user?: User;
}

const formSchema = insertUserSchema.extend({
  passwordConfirm: z.string().min(1, "Şifre tekrarı gerekli"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Şifreler eşleşmiyor",
  path: ["passwordConfirm"],
});

type FormValues = z.infer<typeof formSchema>;

export default function UserForm({ onSuccess, user }: UserFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || "",
      fullName: user?.fullName || "",
      role: user?.role || "standard",
      password: "",
      passwordConfirm: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      if (user) {
        // Update existing user
        const { passwordConfirm, ...userData } = values;
        await apiRequest("PATCH", `/api/users/${user.id}`, userData);
        toast({
          title: "Kullanıcı güncellendi",
          description: `${values.fullName} başarıyla güncellendi.`,
        });
      } else {
        // Create new user
        const { passwordConfirm, ...userData } = values;
        await apiRequest("POST", "/api/users", userData);
        toast({
          title: "Kullanıcı eklendi",
          description: `${values.fullName} başarıyla eklendi.`,
        });
      }
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Hata",
        description: "Kullanıcı kaydedilirken bir hata oluştu.",
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kullanıcı Adı</FormLabel>
              <FormControl>
                <Input placeholder="Kullanıcı adı giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl>
                <Input placeholder="Ad soyad giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Rol seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="standard">Standart Kullanıcı</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{user ? "Yeni Şifre (değiştirmek istemiyorsanız boş bırakın)" : "Şifre"}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Şifre giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şifre Tekrar</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Şifreyi tekrar giriniz" {...field} />
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
            {loading ? "Kaydediliyor..." : user ? "Güncelle" : "Kaydet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
