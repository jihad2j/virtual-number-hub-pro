import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/sonner';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MyOrders from '@/pages/MyOrders';
import Balance from '@/pages/Balance';
import Countries from '@/pages/Countries';
import Applications from '@/pages/Applications';
import ActiveProviders from '@/pages/dashboard/ActiveProviders';
import ManualActivation from '@/pages/ManualActivation';
import Support from '@/pages/Support';
import Profile from '@/pages/Profile';
import SystemSettings from '@/pages/SystemSettings';
import NotFound from '@/pages/NotFound';
import ActivationWaiting from '@/pages/ActivationWaiting';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminCountries from '@/pages/admin/Countries';
import AdminProviders from '@/pages/admin/Providers';
import AdminApplicationsManager from '@/pages/admin/ApplicationsManager';
import AdminManageApplications from '@/pages/admin/ManageApplications';
import AdminAddApplications from '@/pages/admin/AddApplications';
import AdminManualServices from '@/pages/admin/ManualServices';
import AdminManualRequests from '@/pages/admin/ManualRequests';
import AdminSupport from '@/pages/admin/Support';
import AdminProviderBalances from '@/pages/admin/ProviderBalances';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="orders" element={<MyOrders />} />
                  <Route path="balance" element={<Balance />} />
                  <Route path="countries" element={<Countries />} />
                  <Route path="applications" element={<Applications />} />
                  <Route path="active-providers" element={<ActiveProviders />} />
                  <Route path="services/manual-activation" element={<ManualActivation />} />
                  <Route path="support" element={<Support />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<SystemSettings />} />
                  <Route path="activation-waiting/:orderId" element={<ActivationWaiting />} />
                  
                  {/* Admin Routes */}
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="admin/users" element={<AdminUsers />} />
                  <Route path="admin/countries" element={<AdminCountries />} />
                  <Route path="admin/providers" element={<AdminProviders />} />
                  <Route path="admin/applications" element={<AdminApplicationsManager />} />
                  <Route path="admin/manage-applications" element={<AdminManageApplications />} />
                  <Route path="admin/add-applications" element={<AdminAddApplications />} />
                  <Route path="admin/manual-services" element={<AdminManualServices />} />
                  <Route path="admin/manual-requests" element={<AdminManualRequests />} />
                  <Route path="admin/support" element={<AdminSupport />} />
                  <Route path="admin/providers/balances" element={<AdminProviderBalances />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
