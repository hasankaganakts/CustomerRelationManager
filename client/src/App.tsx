import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Tasks from "@/pages/tasks";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  // Check if user is authenticated
  // If not, redirect to login page
  const isAuthenticated = localStorage.getItem("auth_token");
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/customers">
        <ProtectedRoute>
          <AppLayout>
            <Customers />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/customers/:id">
        {(params) => (
          <ProtectedRoute>
            <AppLayout>
              <Customers id={params.id} />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/tasks">
        <ProtectedRoute>
          <AppLayout>
            <Tasks />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/tasks/:id">
        {(params) => (
          <ProtectedRoute>
            <AppLayout>
              <Tasks id={params.id} />
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <AppLayout>
            <Reports />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
