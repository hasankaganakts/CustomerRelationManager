import { useState } from "react";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import Sidebar from "./sidebar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [searchValue, setSearchValue] = useState("");
  const { user, logout } = useAuth();

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-md backdrop-blur-sm bg-white/80 border-b">
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 flex justify-between px-4">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <label htmlFor="search-field" className="sr-only">Ara</label>
            <div className="relative w-full max-w-md text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <Search className="h-4 w-4 stroke-[1.5]" />
              </div>
              <Input
                id="search-field"
                className="block w-full h-10 pl-10 pr-3 py-2 bg-gray-50/80 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-primary/30 rounded-lg transition-all sm:text-sm border-0"
                placeholder="Müşteri veya görev ara..."
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="ml-4 flex items-center md:ml-6 space-x-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary relative transition-colors">
              <span className="sr-only">Bildirimler</span>
              <Bell className="h-5 w-5 stroke-[1.5]" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
          </motion.div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {user ? user.fullName.substring(0, 2).toUpperCase() : "KK"}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-default">
                <div className="flex flex-col py-1">
                  <span className="font-medium">{user?.fullName}</span>
                  <span className="text-xs text-gray-500">{user?.role === "admin" ? "Admin" : "Standart Kullanıcı"}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
