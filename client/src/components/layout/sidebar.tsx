import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Users,
  ClipboardList,
  BarChart2,
  Settings,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SidebarItem({ href, icon, children }: SidebarItemProps) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <div onClick={() => window.location.href = href} className="cursor-pointer">
      <div
        className={cn(
          "flex items-center px-3 py-2.5 text-base font-medium rounded-lg group cursor-pointer transition-all duration-200 mb-1 relative",
          isActive
            ? "text-white bg-primary shadow-md"
            : "text-gray-300 hover:bg-primary/20 hover:text-white"
        )}
      >
        <div
          className={cn(
            "w-6 h-6 mr-3 transition-all",
            isActive ? "text-white" : "text-gray-400 group-hover:text-white"
          )}
        >
          {icon}
        </div>
        {children}
        {isActive && (
          <motion.div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" 
            layoutId="activeIndicator"
          />
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-xl rounded-r-2xl">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center h-20 border-b border-gray-700/50"
        >
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
              CRM
            </div>
            <span className="text-xl font-bold text-white tracking-wide">
              CRM <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Sistemi</span>
            </span>
          </div>
        </motion.div>
        <div className="flex flex-col flex-grow overflow-y-auto py-6">
          <nav className="flex-1 px-4 space-y-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <SidebarItem href="/" icon={<Home className="stroke-[1.5]" />}>
                Dashboard
              </SidebarItem>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <SidebarItem href="/customers" icon={<Users className="stroke-[1.5]" />}>
                Müşteriler
              </SidebarItem>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <SidebarItem href="/tasks" icon={<ClipboardList className="stroke-[1.5]" />}>
                Görevler
              </SidebarItem>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <SidebarItem href="/reports" icon={<BarChart2 className="stroke-[1.5]" />}>
                Raporlar
              </SidebarItem>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <SidebarItem href="/settings" icon={<Settings className="stroke-[1.5]" />}>
                Ayarlar
              </SidebarItem>
            </motion.div>
          </nav>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex-shrink-0 p-4 border-t border-gray-700/50 m-2 mt-0 rounded-xl bg-gray-800/50"
        >
          <div className="flex items-center">
            <div>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold shadow-lg">
                {user ? user.fullName.substring(0, 2).toUpperCase() : "KK"}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user ? user.fullName : "Kullanıcı"}
              </p>
              <button 
                onClick={logout}
                className="text-xs font-medium text-gray-300 hover:text-white flex items-center transition-colors"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
