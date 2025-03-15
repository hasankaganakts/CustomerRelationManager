import { useState } from "react";
import { Menu, Search, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./sidebar";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
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
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <Search className="h-5 w-5" />
              </div>
              <Input
                id="search-field"
                className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-transparent focus:placeholder-gray-400 sm:text-sm"
                placeholder="Müşteri Ara..."
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary relative">
            <span className="sr-only">Bildirimler</span>
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
        </div>
      </div>
    </div>
  );
}
