import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './contexts/AuthContext';
import { useEffect } from 'react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Countries from './pages/Countries';
import Balance from './pages/Balance';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import Support from './pages/Support';
import ManualActivation from './pages/ManualActivation';
import SystemSettings from './pages/SystemSettings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProviders from './pages/admin/Providers';
import AdminCountries from './pages/admin/Countries';
import AdminUsers from './pages/admin/Users';
import AdminManualServices from './pages/admin/ManualServices';
import AdminManualRequests from './pages/admin/ManualRequests';
import AdminSupport from './pages/admin/Support';

function App() {
  const { isAuthenticated, user, loadingInitial, isAdmin } = useAuth();

  useEffect(() => {
    // Nothing specific needed here, just keeping component updated with auth state
  }, [isAuthenticated, isAdmin]);

  // Admin check for protected routes
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    return isAdmin ? <>{children}</> : <Navigate to="/dashboard" replace />;
  };

  if (loadingInitial) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
    </div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="countries" element={<Countries />} />
          <Route path="balance" element={<Balance />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="manual-activation" element={<ManualActivation />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="support" element={<Support />} />

          {/* Admin Routes */}
          <Route path="admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="admin/providers" element={
            <AdminRoute>
              <AdminProviders />
            </AdminRoute>
          } />
          <Route path="admin/countries" element={
            <AdminRoute>
              <AdminCountries />
            </AdminRoute>
          } />
          <Route path="admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          <Route path="admin/manual-services" element={
            <AdminRoute>
              <AdminManualServices />
            </AdminRoute>
          } />
          <Route path="admin/manual-requests" element={
            <AdminRoute>
              <AdminManualRequests />
            </AdminRoute>
          } />
          <Route path="admin/support" element={
            <AdminRoute>
              <AdminSupport />
            </AdminRoute>
          } />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
