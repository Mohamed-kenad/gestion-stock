import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, FolderOpen, Package, 
  FileText, FilePlus, FileInput, ShoppingCart, DollarSign, 
  Store, BarChart2, Settings, Bell, CheckSquare, History,
  PackageOpen, AlertTriangle, Receipt, FileStack, Repeat,
  PieChart, TrendingUp, Clipboard, Barcode, Calendar
} from 'lucide-react';

const Sidebar = ({ user, closeSidebar }) => {
  const location = useLocation();
  const { role } = user || { role: 'guest' };

  // Define menu items based on user role
  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { icon: LayoutDashboard, name: 'Tableau de bord', path: '/dashboard/admin' },
          { icon: Users, name: 'Gestion des utilisateurs', path: '/dashboard/admin/users' },
          { icon: Shield, name: 'Gestion des rôles', path: '/dashboard/admin/roles' },
          { icon: FolderOpen, name: 'Catégories de produits', path: '/dashboard/admin/categories' },
          { icon: Package, name: 'Produits', path: '/dashboard/admin/products' },
          { icon: FileText, name: 'Bons de commande', path: '/dashboard/admin/orders' },
          { icon: FilePlus, name: 'Créer un bon', path: '/dashboard/admin/orders/create' },
          { icon: FileInput, name: 'Importer un bon', path: '/dashboard/admin/orders/import' },
          { icon: FileText, name: 'Tous les bons', path: '/dashboard/admin/orders/all' },
          { icon: ShoppingCart, name: 'Achats', path: '/dashboard/admin/purchases' },
          { icon: DollarSign, name: 'Ventes', path: '/dashboard/admin/sales' },
          { icon: Store, name: 'Stock global', path: '/dashboard/admin/inventory' },
          { icon: BarChart2, name: 'Rapports et statistiques', path: '/dashboard/admin/reports' },
          { icon: Settings, name: 'Paramètres système', path: '/dashboard/admin/settings' },
        ];
      case 'vendor':
        return [
          { icon: LayoutDashboard, name: 'Tableau de bord', path: '/dashboard/vendor' },
          { icon: DollarSign, name: 'Interface de vente', path: '/dashboard/vendor/sales' },
          { icon: FilePlus, name: 'Créer un bon de commande', path: '/dashboard/vendor/orders/create' },
          { icon: FileInput, name: 'Importer un bon', path: '/dashboard/vendor/orders/import' },
          { icon: FileText, name: 'Mes bons', path: '/dashboard/vendor/orders' },
          { icon: FolderOpen, name: 'Produits par catégorie', path: '/dashboard/vendor/products' },
          { icon: Bell, name: 'Notifications', path: '/dashboard/vendor/notifications' },
        ];
      case 'chef':
        return [
          { icon: LayoutDashboard, name: 'Tableau de bord', path: '/dashboard/chef' },
          { icon: CheckSquare, name: 'Valider ou rejeter un bon', path: '/dashboard/chef/orders/validate' },
          { icon: History, name: 'Historique des décisions', path: '/dashboard/chef/orders/history' },
          { icon: PackageOpen, name: 'Suivi des bons validés', path: '/dashboard/chef/orders/tracking' },
          { icon: Bell, name: 'Alertes de validation', path: '/dashboard/chef/alerts' },
        ];
      case 'purchase':
        return [
          { icon: LayoutDashboard, name: 'Tableau de bord', path: '/dashboard/purchase' },
          { icon: CheckSquare, name: 'Bons approuvés à traiter', path: '/dashboard/purchase/orders/approved' },
          { icon: FileText, name: 'Enregistrer un achat', path: '/dashboard/purchase/record' },
          { icon: History, name: 'Historique des achats', path: '/dashboard/purchase/history' },
          { icon: Users, name: 'Fournisseurs', path: '/dashboard/purchase/suppliers' },
        ];
      // 'store' role removed as 'magasin' provides the same functionality
      case 'cashier':
        return [
          { icon: LayoutDashboard, name: 'Tableau de bord', path: '/dashboard/cashier' },
          { icon: Receipt, name: 'Interface de vente (POS)', path: '/dashboard/cashier/pos' },
        ];
      case 'auditor':
        return [
          { icon: LayoutDashboard, name: 'Tableau de bord', path: '/dashboard/auditor' },
          { icon: Clipboard, name: 'Gérer les bons', path: '/dashboard/auditor/pricing/bons' },
          { icon: FileStack, name: 'Montages / packs produits', path: '/dashboard/auditor/product-packs' },
          { icon: Repeat, name: 'Historique des prix', path: '/dashboard/auditor/price-history' },
          { icon: CheckSquare, name: 'Audit des opérations', path: '/dashboard/auditor/operations-audit' },
          { icon: TrendingUp, name: 'Suivi des marges', path: '/dashboard/auditor/margins' },
        ];
      case 'magasin':
        return [
          { icon: LayoutDashboard, name: 'Tableau de bord', path: '/dashboard/magasin' },
          { icon: Package, name: 'Gestion de Stock', path: '/dashboard/magasin/inventory' },
          { icon: AlertTriangle, name: 'Alertes de Stock', path: '/dashboard/magasin/inventory/alerts' },
          { icon: History, name: 'Historique Ajustements', path: '/dashboard/magasin/inventory/adjustments' },
          { icon: FileInput, name: 'Réceptions', path: '/dashboard/magasin/reception' },
          { icon: Calendar, name: 'Calendrier Réceptions', path: '/dashboard/magasin/reception/calendar' },
          { icon: BarChart2, name: 'Rapports de Stock', path: '/dashboard/magasin/reports' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="h-full flex flex-col bg-white border-r">
      {/* Logo and branding */}
      <div className="px-4 py-6 border-b">
        <div className="flex items-center">
          <Store className="h-8 w-8 text-primary-600" />
          <span className="ml-3 text-xl font-semibold">StockManager</span>
        </div>
        <div className="mt-1 text-xs text-gray-500">Système de gestion de stock</div>
      </div>
      
      {/* Menu items */}
      <div className="flex-1 overflow-y-auto pt-2">
        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
              onClick={() => closeSidebar && closeSidebar()}
            >
              <item.icon
                className={`${
                  location.pathname === item.path
                    ? 'text-primary-500'
                    : 'text-gray-500 group-hover:text-gray-600'
                } mr-3 flex-shrink-0 h-5 w-5 transition-colors`}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* User info */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name || 'Utilisateur'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Non connecté'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
