import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@shared/schema";
import { getStatusColor, getStatusText } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecentCustomersProps {
  customers: Customer[];
}

export default function RecentCustomers({ customers }: RecentCustomersProps) {
  const [, setLocation] = useLocation();
  
  const goToCustomers = () => {
    setLocation("/customers");
  };
  
  const goToCustomerDetail = (id: number) => {
    setLocation(`/customers/${id}`);
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Son Eklenen Müşteriler</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary/90 font-medium"
          onClick={goToCustomers}
        >
          Tümünü Gör
        </Button>
      </div>
      <Card className="overflow-hidden border-0 shadow-md">
        <CardContent className="p-0">
          <motion.ul 
            className="divide-y divide-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {customers.length === 0 ? (
              <li className="px-6 py-6 text-center text-gray-500">
                Henüz müşteri bulunmuyor.
              </li>
            ) : (
              customers.map((customer, index) => (
                <motion.li 
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative"
                >
                  <div 
                    onClick={() => goToCustomerDetail(customer.id)}
                    className="block hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="px-6 py-4 flex items-center">
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mr-3">
                              {customer.companyName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-primary truncate">
                                {customer.companyName}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                {customer.sector ? (
                                  <span>{customer.sector} | </span>
                                ) : null}
                                <span>{customer.address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex-shrink-0 sm:mt-0 flex items-center space-x-2">
                          <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                            {getStatusText(customer.status)}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))
            )}
          </motion.ul>
        </CardContent>
      </Card>
    </div>
  );
}
