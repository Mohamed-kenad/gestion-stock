import React, { lazy, Suspense } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
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
import AdminDashboard from "./pages/admin/AdminDashboard";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import Chef2Dashboard from "./pages/chef2/Chef2Dashboard";
import PurchaseDashboard from "./pages/purchase/PurchaseDashboard";
import CashierDashboard from "./pages/cashier/CashierDashboard";
import AuditorDashboard from "./pages/auditor/AuditorDashboard";
import MagasinDashboard from "./pages/magasin/Dashboard";
import Achat2Dashboard from "./pages/achat2/Achat2Dashboard";
import Magasin2Dashboard from "./pages/magasin2/Dashboard";
import NotFound from "./pages/NotFound";

// Lazy loaded pages to improve initial load time
const Loader = () => <div className="flex items-center justify-center h-full">Chargement...</div>;

// Placeholder component for routes that don't have their components implemented yet
const PlaceholderComponent = () => <div>Cette fonctionnalité sera bientôt disponible</div>;

// Admin Pages - Import all components
const UsersList = lazy(() => import("./pages/admin/users/UsersList"));
const RolesList = lazy(() => import("./pages/admin/users/RolesList"));
const CategoriesList = lazy(() => import("./pages/admin/products/CategoriesList"));
const ProductsList = lazy(() => import("./pages/admin/products/ProductsList"));
const OrdersList = lazy(() => import("./pages/admin/orders/OrdersList"));
const CreateOrder = lazy(() => import("./pages/admin/orders/CreateOrder"));
const ImportOrder = lazy(() => import("./pages/admin/orders/ImportOrder"));
const AllOrders = lazy(() => import("./pages/admin/orders/AllOrders"));
const PurchasesList = lazy(() => import("./pages/admin/purchases/PurchasesList"));
const SalesList = lazy(() => import("./pages/admin/sales/SalesList"));
const GlobalInventory = lazy(() => import("./pages/admin/inventory/GlobalInventory"));
const ReportsStats = lazy(() => import("./pages/admin/reports/ReportsStats"));
const SystemSettings = lazy(() => import("./pages/admin/settings/SystemSettings"));

// Vendor Pages
// Import all existing vendor components
const VendorCreateOrder = lazy(() => import("./pages/vendor/orders/CreateOrder"));
const VendorEditOrder = lazy(() => import("./pages/vendor/orders/EditOrder"));
const VendorImportOrder = lazy(() => import("./pages/vendor/orders/ImportOrder"));
const VendorOrders = lazy(() => import("./pages/vendor/orders/MyOrders"));
const VendorPendingOrders = lazy(() => import("./pages/vendor/orders/PendingOrders"));
const VendorProducts = lazy(() => import("./pages/vendor/products/ProductsByCategory"));
const VendorNotifications = lazy(() => import("./pages/vendor/notifications/Notifications"));
const VendorPOS = lazy(() => import("./pages/vendor/sales/VendorPOS"));

// Chef2 (Department Head) Pages
const ReviewVendorOrders = lazy(() => import("./pages/chef2/orders/ReviewVendorOrders"));
const Chef2DecisionsHistory = lazy(() => import("./pages/chef2/orders/DecisionHistory"));
const Chef2ApprovedOrdersTracking = lazy(() => import("./pages/chef2/orders/ApprovedOrdersTracking"));

// Purchase Pages
const ValidatedOrdersToProcess = lazy(() => import("./pages/purchase/orders/ValidatedOrdersToProcess"));
const ApprovedOrders = lazy(() => import("./pages/achat/orders/ApprovedOrders"));
const RecordPurchase = lazy(() => import("./pages/purchase/RecordPurchase"));
const PurchaseHistory = lazy(() => import("./pages/purchase/PurchaseHistory"));
const SuppliersList = lazy(() => Promise.resolve({ default: PlaceholderComponent })); // To be implemented

// Achat2 (Purchasing Department) Pages
const Achat2PendingOrders = lazy(() => import("./pages/achat2/orders/PendingOrders"));
const Achat2ProcessOrder = lazy(() => import("./pages/achat2/orders/ProcessOrder"));
const Achat2PurchaseHistory = lazy(() => import("./pages/achat2/purchases/PurchaseHistory"));
const Achat2PurchaseDetails = lazy(() => import("./pages/achat2/purchases/PurchaseDetails"));
const Achat2Suppliers = lazy(() => import("./pages/achat2/suppliers/Suppliers"));

// Store Pages removed as 'magasin' provides the same functionality

// Cashier Pages
const POSInterface = lazy(() => import("./pages/cashier/pos/POSInterface"));
const SalesHistory = lazy(() => Promise.resolve({ default: PlaceholderComponent })); // To be implemented
const CustomersList = lazy(() => Promise.resolve({ default: PlaceholderComponent })); // To be implemented
const PrintReceipt = lazy(() => Promise.resolve({ default: PlaceholderComponent })); // To be implemented

// Shared Components
const SharedPOS = POSInterface; // Using the existing POS interface for both roles

// Auditor Pages
const ProductBundles = lazy(() => import("./pages/auditor/pricing/ProductBundles"));
const SalesPricing = lazy(() => import("./pages/auditor/pricing/SalesPricing"));
const PricingHistory = lazy(() => import("./pages/auditor/pricing/PricingHistory"));
const BonManagement = lazy(() => import("./pages/auditor/pricing/BonManagement"));
const MarginAnalysis = lazy(() => import("./pages/auditor/reports/MarginAnalysis"));
const OperationsAudit = lazy(() => import("./pages/auditor/reports/OperationsAudit"));
const AllSales = lazy(() => Promise.resolve({ default: PlaceholderComponent }));
const AllPurchases = lazy(() => Promise.resolve({ default: PlaceholderComponent }));
const AuditorAllOrders = lazy(() => Promise.resolve({ default: PlaceholderComponent }));
const AuditReports = lazy(() => Promise.resolve({ default: PlaceholderComponent }));

// Magasin (Warehouse Manager) Pages
const InventoryManager = lazy(() => import("./pages/magasin/inventory/InventoryManager"));
const StockAlerts = lazy(() => import("./pages/magasin/inventory/StockAlerts"));
const AdjustmentHistory = lazy(() => import("./pages/magasin/inventory/AdjustmentHistory"));
const ReceptionList = lazy(() => import("./pages/magasin/reception/ReceptionList"));
const ReceptionCalendar = lazy(() => import("./pages/magasin/reception/ReceptionCalendar"));
const ReceptionManager = lazy(() => import("./pages/magasin/reception/ReceptionManager"));
const StockMovementReport = lazy(() => import("./pages/magasin/reports/StockMovementReport"));

// Magasin2 (Warehouse) Pages
const Magasin2InventoryManager = lazy(() => import("./pages/magasin2/inventory/InventoryManager"));
const Magasin2ReceptionList = lazy(() => import("./pages/magasin2/reception/ReceptionList"));
const Magasin2ReceptionManager = lazy(() => import("./pages/magasin2/reception/ReceptionManager"));
const Magasin2VendorRequests = lazy(() => import("./pages/magasin2/requests/VendorRequests"));
const Magasin2PurchaseRequests = lazy(() => import("./pages/magasin2/purchase/PurchaseRequests"));
const Magasin2PurchaseRequestDetails = lazy(() => import("./pages/magasin2/purchase/PurchaseRequestDetails"));
const Magasin2CreatePurchaseRequest = lazy(() => import("./pages/magasin2/purchase/CreatePurchaseRequest"));
const TestProducts = lazy(() => import("./pages/magasin2/purchase/TestProducts"));

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
            
            {/* Redirect /magasin routes to /dashboard/magasin routes */}
            <Route path="/magasin" element={<Navigate to="/dashboard/magasin" replace />} />
            <Route path="/magasin/inventory" element={<Navigate to="/dashboard/magasin/inventory" replace />} />
            <Route path="/magasin/inventory/alerts" element={<Navigate to="/dashboard/magasin/inventory/alerts" replace />} />
            <Route path="/magasin/inventory/adjustments" element={<Navigate to="/dashboard/magasin/inventory/adjustments" replace />} />
            <Route path="/magasin/reception" element={<Navigate to="/dashboard/magasin/reception" replace />} />
            <Route path="/magasin/reception/calendar" element={<Navigate to="/dashboard/magasin/reception/calendar" replace />} />
            <Route path="/magasin/reports" element={<Navigate to="/dashboard/magasin/reports" replace />} />
            
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
              <Route path="admin/users" element={<Suspense fallback={<Loader />}><UsersList /></Suspense>} />
              <Route path="admin/roles" element={<Suspense fallback={<Loader />}><RolesList /></Suspense>} />
              <Route path="admin/categories" element={<Suspense fallback={<Loader />}><CategoriesList /></Suspense>} />
              <Route path="admin/products" element={<Suspense fallback={<Loader />}><ProductsList /></Suspense>} />
              <Route path="admin/orders" element={<Suspense fallback={<Loader />}><OrdersList /></Suspense>} />
              <Route path="admin/orders/create" element={<Suspense fallback={<Loader />}><CreateOrder /></Suspense>} />
              <Route path="admin/orders/import" element={<Suspense fallback={<Loader />}><ImportOrder /></Suspense>} />
              <Route path="admin/orders/all" element={<Suspense fallback={<Loader />}><AllOrders /></Suspense>} />
              <Route path="admin/purchases" element={<Suspense fallback={<Loader />}><PurchasesList /></Suspense>} />
              <Route path="admin/sales" element={<Suspense fallback={<Loader />}><SalesList /></Suspense>} />
              <Route path="admin/inventory" element={<Suspense fallback={<Loader />}><GlobalInventory /></Suspense>} />
              <Route path="admin/reports" element={<Suspense fallback={<Loader />}><ReportsStats /></Suspense>} />
              <Route path="admin/settings" element={<Suspense fallback={<Loader />}><SystemSettings /></Suspense>} />
              
              {/* Vendor Routes */}
              <Route path="vendor" element={<VendorDashboard />} />
              <Route path="vendor/orders/create" element={<Suspense fallback={<Loader />}><VendorCreateOrder /></Suspense>} />
              <Route path="vendor/orders/edit/:id" element={<Suspense fallback={<Loader />}><VendorEditOrder /></Suspense>} />
              <Route path="vendor/orders/import" element={<Suspense fallback={<Loader />}><VendorImportOrder /></Suspense>} />
              <Route path="vendor/orders" element={<Suspense fallback={<Loader />}><VendorOrders /></Suspense>} />
              <Route path="vendor/products" element={<Suspense fallback={<Loader />}><VendorProducts /></Suspense>} />
              <Route path="vendor/orders/pending" element={<Suspense fallback={<Loader />}><VendorPendingOrders /></Suspense>} />
              <Route path="vendor/notifications" element={<Suspense fallback={<Loader />}><VendorNotifications /></Suspense>} />
              <Route path="vendor/sales" element={<Suspense fallback={<Loader />}><SharedPOS role="vendor" /></Suspense>} />
              
              {/* Chef2 (Department Head) Routes */}
              <Route path="chef2" element={<Chef2Dashboard />} />
              <Route path="chef2/orders/review" element={<Suspense fallback={<Loader />}><ReviewVendorOrders /></Suspense>} />
              <Route path="chef2/orders/history" element={<Suspense fallback={<Loader />}><Chef2DecisionsHistory /></Suspense>} />
              <Route path="chef2/orders/tracking" element={<Suspense fallback={<Loader />}><Chef2ApprovedOrdersTracking /></Suspense>} />
              
              {/* Purchase Routes */}
              <Route path="purchase" element={<PurchaseDashboard />} />
              <Route path="purchase/orders/approved" element={<Suspense fallback={<Loader />}><ApprovedOrders /></Suspense>} />
              <Route path="purchase/orders" element={<Navigate to="/dashboard/purchase/orders/approved" replace />} />
              <Route path="purchase/record" element={<Suspense fallback={<Loader />}><RecordPurchase /></Suspense>} />
              <Route path="purchase/history" element={<Suspense fallback={<Loader />}><PurchaseHistory /></Suspense>} />
              <Route path="purchase/suppliers" element={<Suspense fallback={<Loader />}><SuppliersList /></Suspense>} />
              
              {/* Achat2 (Purchasing Department) Routes */}
              <Route path="achat2" element={<Achat2Dashboard />} />
              <Route path="achat2/orders" element={<Suspense fallback={<Loader />}><Achat2PendingOrders /></Suspense>} />
              <Route path="achat2/orders/:id" element={<Suspense fallback={<Loader />}><Achat2ProcessOrder /></Suspense>} />
              <Route path="achat2/purchases" element={<Suspense fallback={<Loader />}><Achat2PurchaseHistory /></Suspense>} />
              <Route path="achat2/purchases/:id" element={<Suspense fallback={<Loader />}><Achat2PurchaseDetails /></Suspense>} />
              <Route path="achat2/suppliers" element={<Suspense fallback={<Loader />}><Achat2Suppliers /></Suspense>} />
              
              {/* Store Routes removed as 'magasin' provides the same functionality */}
              
              {/* Cashier Routes */}
              <Route path="cashier" element={<CashierDashboard />} />
              <Route path="cashier/pos" element={<Suspense fallback={<Loader />}><SharedPOS role="cashier" /></Suspense>} />
              <Route path="cashier/history" element={<Suspense fallback={<Loader />}><SalesHistory /></Suspense>} />
              <Route path="cashier/customers" element={<Suspense fallback={<Loader />}><CustomersList /></Suspense>} />
              <Route path="cashier/receipts" element={<Suspense fallback={<Loader />}><PrintReceipt /></Suspense>} />
              
              {/* Auditor Routes */}
              <Route path="auditor" element={<AuditorDashboard />} />
              <Route path="auditor/product-packs" element={<Suspense fallback={<Loader />}><ProductBundles /></Suspense>} />
              <Route path="auditor/pricing" element={<Suspense fallback={<Loader />}><SalesPricing /></Suspense>} />
              <Route path="auditor/pricing/bons" element={<Suspense fallback={<Loader />}><BonManagement /></Suspense>} />
              <Route path="auditor/price-history" element={<Suspense fallback={<Loader />}><PricingHistory /></Suspense>} />
              <Route path="auditor/inventory" element={<Suspense fallback={<Loader />}><PlaceholderComponent /></Suspense>} />
              <Route path="auditor/sales" element={<Suspense fallback={<Loader />}><AllSales /></Suspense>} />
              <Route path="auditor/purchases" element={<Suspense fallback={<Loader />}><AllPurchases /></Suspense>} />
              <Route path="auditor/orders" element={<Suspense fallback={<Loader />}><AuditorAllOrders /></Suspense>} />
              <Route path="auditor/reports" element={<Suspense fallback={<Loader />}><AuditReports /></Suspense>} />
              <Route path="auditor/margins" element={<Suspense fallback={<Loader />}><MarginAnalysis /></Suspense>} />
              <Route path="auditor/operations-audit" element={<Suspense fallback={<Loader />}><OperationsAudit /></Suspense>} />
              
              {/* Magasin (Warehouse Manager) Routes */}
              <Route path="magasin" element={<MagasinDashboard />} />
              <Route path="magasin/inventory" element={<Suspense fallback={<Loader />}><InventoryManager /></Suspense>} />
              <Route path="magasin/inventory/alerts" element={<Suspense fallback={<Loader />}><StockAlerts /></Suspense>} />
              <Route path="magasin/inventory/adjustments" element={<Suspense fallback={<Loader />}><AdjustmentHistory /></Suspense>} />
              <Route path="magasin/reception" element={<Suspense fallback={<Loader />}><ReceptionList /></Suspense>} />
              <Route path="magasin/reception/calendar" element={<Suspense fallback={<Loader />}><ReceptionCalendar /></Suspense>} />
              <Route path="magasin/reception/:orderId" element={<Suspense fallback={<Loader />}><ReceptionManager /></Suspense>} />
              <Route path="magasin/reports" element={<Suspense fallback={<Loader />}><StockMovementReport /></Suspense>} />
              
              {/* Magasin2 (Warehouse) Routes */}
              <Route path="magasin2" element={<Magasin2Dashboard />} />
              <Route path="magasin2/inventory" element={<Suspense fallback={<Loader />}><Magasin2InventoryManager /></Suspense>} />
              <Route path="magasin2/reception" element={<Suspense fallback={<Loader />}><Magasin2ReceptionList /></Suspense>} />
              <Route path="magasin2/reception/:id" element={<Suspense fallback={<Loader />}><Magasin2ReceptionManager /></Suspense>} />
              <Route path="magasin2/requests" element={<Suspense fallback={<Loader />}><Magasin2VendorRequests /></Suspense>} />
              <Route path="magasin2/purchase" element={<Suspense fallback={<Loader />}><Magasin2PurchaseRequests /></Suspense>} />
              <Route path="magasin2/purchase/create" element={<Suspense fallback={<Loader />}><Magasin2CreatePurchaseRequest /></Suspense>} />
              <Route path="magasin2/purchase/test" element={<Suspense fallback={<Loader />}><TestProducts /></Suspense>} />
              <Route path="magasin2/purchase/:id" element={<Suspense fallback={<Loader />}><Magasin2PurchaseRequestDetails /></Suspense>} />
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
