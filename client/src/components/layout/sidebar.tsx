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

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SidebarItem({ href, icon, children }: SidebarItemProps) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-2 py-2 text-base font-medium rounded-md group",
          isActive
            ? "text-white bg-gray-900"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        )}
      >
        <div
          className={cn(
            "w-6 h-6 mr-3",
            isActive ? "text-gray-300" : "text-gray-400"
          )}
        >
          {icon}
        </div>
        {children}
      </a>
    </Link>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-gray-800">
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-xl font-semibold text-white">CRM Sistemi</span>
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <SidebarItem href="/" icon={<Home />}>
              Dashboard
            </SidebarItem>
            <SidebarItem href="/customers" icon={<Users />}>
              Müşteriler
            </SidebarItem>
            <SidebarItem href="/tasks" icon={<ClipboardList />}>
              Görevler
            </SidebarItem>
            <SidebarItem href="/reports" icon={<BarChart2 />}>
              Raporlar
            </SidebarItem>
            <SidebarItem href="/settings" icon={<Settings />}>
              Ayarlar
            </SidebarItem>
          </nav>
        </div>
        <div className="flex-shrink-0 p-4 bg-gray-700">
          <div className="flex items-center">
            <div>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                {user ? user.fullName.substring(0, 2).toUpperCase() : "KK"}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user ? user.fullName : "Kullanıcı"}
              </p>
              <button 
                onClick={logout}
                className="text-xs font-medium text-gray-300 hover:text-gray-200 flex items-center"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
