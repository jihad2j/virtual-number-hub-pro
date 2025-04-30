
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
import Dashboard from './pages/Dashboard';
import Countries from './pages/Countries';
import Balance from './pages/Balance';
import Support from './pages/Support';
import AdminDashboard from './pages/admin/Dashboard';
import Providers from './pages/admin/Providers';
import AdminCountries from './pages/admin/Countries';
import Users from './pages/admin/Users';
import ManualServices from './pages/admin/ManualServices';
import ManualRequests from './pages/admin/ManualRequests';
import SystemSettings from './pages/SystemSettings';
import ManualActivation from './pages/ManualActivation';
import Index from "./pages/Index";
import { useEffect } from "react";
import { api } from "./services/api";

// Import the missing component
import MyOrders from "./pages/MyOrders";

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
              
              <Route path="/" element={<Index />} />
              
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="countries" element={<Countries />} />
                <Route path="balance" element={<Balance />} />
                <Route path="support" element={<Support />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="settings" element={<SystemSettings />} />
                <Route path="manual-activation" element={<ManualActivation />} />
                
                {/* Admin Routes */}
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/providers" element={<Providers />} />
                <Route path="admin/countries" element={<AdminCountries />} />
                <Route path="admin/users" element={<Users />} />
                <Route path="admin/manual-requests" element={<ManualRequests />} />
                <Route path="admin/manual-services" element={<ManualServices />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
