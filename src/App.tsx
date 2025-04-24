
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Countries from "./pages/Countries";
import Balance from "./pages/Balance";
import Support from "./pages/Support";
import Providers from "./pages/admin/Providers";
import CountriesManagement from "./pages/admin/Countries";
import UsersManagement from "./pages/admin/Users";
import MyOrders from "./pages/MyOrders";
import SystemSettings from "./pages/SystemSettings";
import { useEffect } from "react";
import { api } from "./services/api";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // تهيئة البيانات المحلية
    api.initLocalData().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="countries" element={<Countries />} />
                <Route path="balance" element={<Balance />} />
                <Route path="support" element={<Support />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="settings" element={<SystemSettings />} />
                
                {/* Admin Routes */}
                <Route path="admin/providers" element={<Providers />} />
                <Route path="admin/countries" element={<CountriesManagement />} />
                <Route path="admin/users" element={<UsersManagement />} />
              </Route>
              
              {/* Redirect root to dashboard or login */}
              <Route path="/" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
