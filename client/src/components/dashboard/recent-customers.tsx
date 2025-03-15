import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@shared/schema";
import { getStatusColor, getStatusText } from "@/lib/utils";

interface RecentCustomersProps {
  customers: Customer[];
}

export default function RecentCustomers({ customers }: RecentCustomersProps) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Son Eklenen Müşteriler</h2>
        <Link href="/customers">
          <a className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            Tümünü Gör
          </a>
        </Link>
      </div>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {customers.length === 0 ? (
              <li className="px-4 py-6 text-center text-gray-500">
                Henüz müşteri bulunmuyor.
              </li>
            ) : (
              customers.map((customer) => (
                <li key={customer.id}>
                  <Link href={`/customers/${customer.id}`}>
                    <a className="block hover:bg-gray-50">
                      <div className="px-4 py-4 flex items-center sm:px-6">
                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <div className="text-sm font-medium text-blue-600 truncate">
                              {customer.companyName}
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              <span>{customer.sector} | </span>
                              <span>{customer.address}</span>
                            </div>
                          </div>
                          <div className="mt-4 flex-shrink-0 sm:mt-0">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                              {getStatusText(customer.status)}
                            </div>
                          </div>
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </a>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
