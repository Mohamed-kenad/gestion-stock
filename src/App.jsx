
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to login page */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<Navigate to="/auth/login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Admin Routes */}
              <Route path="admin" element={<AdminDashboard />} />
              
              {/* Vendor Routes */}
              <Route path="vendor" element={<VendorDashboard />} />
              
              {/* Chef Routes */}
              <Route path="chef" element={<ChefDashboard />} />
              
              {/* Purchase Routes */}
              <Route path="purchase" element={<PurchaseDashboard />} />
              
              {/* Store Routes */}
              <Route path="store" element={<StoreDashboard />} />
              
              {/* Cashier Routes */}
              <Route path="cashier" element={<CashierDashboard />} />
              
              {/* Auditor Routes */}
              <Route path="auditor" element={<AuditorDashboard />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </Provider>
  </QueryClientProvider>
);

export default App;
