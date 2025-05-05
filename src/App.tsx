
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/sonner';

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import MyOrders from '@/pages/MyOrders';
import Balance from '@/pages/Balance';
import Profile from '@/pages/Profile';
import Support from '@/pages/Support';
import Countries from '@/pages/Countries';
import ManualActivation from '@/pages/ManualActivation';
import MyManualRequests from '@/pages/MyManualRequests'; // Add import
import NotFound from '@/pages/NotFound';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminCountries from '@/pages/admin/Countries';
import Users from '@/pages/admin/Users';
import Providers from '@/pages/admin/Providers';
import ProviderBalances from '@/pages/admin/ProviderBalances';
import SystemSettings from '@/pages/SystemSettings';
import ManualServices from '@/pages/admin/ManualServices';
import ManualRequests from '@/pages/admin/ManualRequests';
import AdminSupport from '@/pages/admin/Support';
import PrepaidCodes from '@/pages/admin/PrepaidCodes';

// New Page
import ActiveProviders from '@/pages/dashboard/ActiveProviders';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" attribute="class">
        <div className="app">
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/orders" element={<MyOrders />} />
              <Route path="/dashboard/balance" element={<Balance />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/settings" element={<Profile />} />
              <Route path="/dashboard/support" element={<Support />} />
              <Route path="/dashboard/countries" element={<Countries />} />
              <Route path="/dashboard/services/:countryCode" element={<ManualActivation />} />
              <Route path="/dashboard/manual-requests" element={<MyManualRequests />} /> {/* Add route */}
              <Route path="/dashboard/active-providers" element={<ActiveProviders />} />
              
              {/* Admin Routes */}
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/admin/countries" element={<AdminCountries />} />
              <Route path="/dashboard/admin/users" element={<Users />} />
              <Route path="/dashboard/admin/providers" element={<Providers />} />
              <Route path="/dashboard/admin/providers/balances" element={<ProviderBalances />} />
              <Route path="/dashboard/admin/settings" element={<SystemSettings />} />
              <Route path="/dashboard/admin/manual-services" element={<ManualServices />} />
              <Route path="/dashboard/admin/manual-requests" element={<ManualRequests />} />
              <Route path="/dashboard/admin/support" element={<AdminSupport />} />
              <Route path="/dashboard/admin/prepaid-codes" element={<PrepaidCodes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
