
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { useSelector } from "react-redux";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Role-based dashboards
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import VendorDashboard from "./pages/dashboards/VendorDashboard";
import ChefDashboard from "./pages/dashboards/ChefDashboard";
import PurchaseDashboard from "./pages/dashboards/PurchaseDashboard";
import StoreDashboard from "./pages/dashboards/StoreDashboard";
import CashierDashboard from "./pages/dashboards/CashierDashboard";
import AuditorDashboard from "./pages/dashboards/AuditorDashboard";
import NotFound from "./pages/NotFound";

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Admin Routes */}
          <Route path="admin" element={
            <ProtectedRoute requiredRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Vendor Routes */}
          <Route path="vendor" element={
            <ProtectedRoute requiredRoles={["vendor"]}>
              <VendorDashboard />
            </ProtectedRoute>
          } />
          
          {/* Chef Routes */}
          <Route path="chef" element={
            <ProtectedRoute requiredRoles={["chef"]}>
              <ChefDashboard />
            </ProtectedRoute>
          } />
          
          {/* Purchase Routes */}
          <Route path="purchase" element={
            <ProtectedRoute requiredRoles={["purchase"]}>
              <PurchaseDashboard />
            </ProtectedRoute>
          } />
          
          {/* Store Routes */}
          <Route path="store" element={
            <ProtectedRoute requiredRoles={["store"]}>
              <StoreDashboard />
            </ProtectedRoute>
          } />
          
          {/* Cashier Routes */}
          <Route path="cashier" element={
            <ProtectedRoute requiredRoles={["cashier"]}>
              <CashierDashboard />
            </ProtectedRoute>
          } />
          
          {/* Auditor Routes */}
          <Route path="auditor" element={
            <ProtectedRoute requiredRoles={["auditor"]}>
              <AuditorDashboard />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <Provider store={store}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  </Provider>
);

export default App;
