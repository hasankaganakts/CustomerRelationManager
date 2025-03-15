import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserList from "@/components/users/user-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Shield, User } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("users");
  const { user } = useAuth();
  
  const isAdmin = user?.role === "admin";

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Ayarlar</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">Kullanıcı Yönetimi</TabsTrigger>
            <TabsTrigger value="account">Hesap Ayarları</TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="system">Sistem Ayarları</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="users" className="mt-6">
            {isAdmin ? (
              <UserList />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-600">
                    <Shield className="mr-2 h-5 w-5" />
                    Yetki Gerekiyor
                  </CardTitle>
                  <CardDescription>
                    Kullanıcı yönetimi için admin yetkisi gerekmektedir.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Hesap Bilgileri</CardTitle>
                <CardDescription>
                  Kişisel hesap bilgilerinizi görüntüleyin ve düzenleyin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{user?.fullName}</h3>
                      <p className="text-sm text-gray-500">{user?.username}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex flex-col space-y-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-sm font-medium">Kullanıcı Adı:</div>
                      <div className="col-span-2 text-sm">{user?.username}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-sm font-medium">Ad Soyad:</div>
                      <div className="col-span-2 text-sm">{user?.fullName}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-sm font-medium">Rol:</div>
                      <div className="col-span-2 text-sm">{user?.role === "admin" ? "Admin" : "Standart Kullanıcı"}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline">Şifremi Değiştir</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="system" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sistem Ayarları</CardTitle>
                  <CardDescription>
                    Sistem genelinde geçerli ayarları yönetin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Bu bölüm henüz geliştirme aşamasındadır.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
