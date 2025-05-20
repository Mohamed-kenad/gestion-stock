
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShieldCheck, FolderClosed, Package, ClipboardList, 
  ShoppingCart, LineChart, Settings, FileText, PlusCircle, Download, 
  List, Store, BarChart3, CheckSquare, History, PackageCheck, Bell, 
  Receipt, LogOut, ArrowUpDown, ScanBarcode, Printer, ClipboardSignature,
  Puzzle, DollarSign, AreaChart 
} from 'lucide-react';

const navItems = {
  admin: [
    { name: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard/admin' },
    { name: 'Gestion des utilisateurs', icon: Users, to: '/dashboard/admin/users' },
    { name: 'Gestion des rôles', icon: ShieldCheck, to: '/dashboard/admin/roles' },
    { name: 'Catégories de produits', icon: FolderClosed, to: '/dashboard/admin/categories' },
    { name: 'Produits', icon: Package, to: '/dashboard/admin/products' },
    { name: 'Bons de commande', icon: ClipboardList, to: '/dashboard/admin/orders' },
    { name: 'Créer un bon', icon: PlusCircle, to: '/dashboard/admin/orders/create' },
    { name: 'Importer un bon', icon: Download, to: '/dashboard/admin/orders/import' },
    { name: 'Tous les bons', icon: List, to: '/dashboard/admin/orders/all' },
    { name: 'Achats', icon: ShoppingCart, to: '/dashboard/admin/purchases' },
    { name: 'Ventes', icon: DollarSign, to: '/dashboard/admin/sales' },
    { name: 'Stock global', icon: Store, to: '/dashboard/admin/inventory' },
    { name: 'Rapports et statistiques', icon: BarChart3, to: '/dashboard/admin/reports' },
    { name: 'Paramètres système', icon: Settings, to: '/dashboard/admin/settings' },
  ],
  vendor: [
    { name: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard/vendor' },
    { name: 'Créer un bon de commande', icon: PlusCircle, to: '/dashboard/vendor/orders/create' },
    { name: 'Importer un bon', icon: Download, to: '/dashboard/vendor/orders/import' },
    { name: 'Mes bons', icon: List, to: '/dashboard/vendor/orders/my' },
    { name: 'Produits par catégorie', icon: Package, to: '/dashboard/vendor/products' },
    { name: 'Bons en attente', icon: ClipboardList, to: '/dashboard/vendor/orders/pending' },
    { name: 'Notifications', icon: Bell, to: '/dashboard/vendor/notifications' },
  ],
  chef: [
    { name: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard/chef' },
    { name: 'Valider ou rejeter un bon', icon: CheckSquare, to: '/dashboard/chef/orders/validate' },
    { name: 'Historique des décisions', icon: History, to: '/dashboard/chef/decisions' },
    { name: 'Suivi des bons validés', icon: PackageCheck, to: '/dashboard/chef/orders/approved' },
    { name: 'Alertes de validation', icon: Bell, to: '/dashboard/chef/alerts' },
  ],
  purchase: [
    { name: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard/purchase' },
    { name: 'Bons validés à traiter', icon: CheckSquare, to: '/dashboard/purchase/orders/approved' },
    { name: 'Enregistrer un achat', icon: ShoppingCart, to: '/dashboard/purchase/register' },
    { name: 'Historique des achats', icon: History, to: '/dashboard/purchase/history' },
    { name: 'Fournisseurs', icon: Store, to: '/dashboard/purchase/suppliers' },
  ],
  store: [
    { name: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard/store' },
    { name: 'Réception des marchandises', icon: ShoppingCart, to: '/dashboard/store/receive' },
    { name: 'Sortie de stock', icon: ArrowUpDown, to: '/dashboard/store/release' },
    { name: 'Stock actuel', icon: Store, to: '/dashboard/store/inventory' },
    { name: 'Produits en seuil critique', icon: Bell, to: '/dashboard/store/alerts' },
    { name: 'Historique des mouvements', icon: History, to: '/dashboard/store/movements' },
  ],
  cashier: [
    { name: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard/cashier' },
    { name: 'Interface de vente (POS)', icon: ScanBarcode, to: '/dashboard/cashier/pos' },
    { name: 'Historique des ventes', icon: History, to: '/dashboard/cashier/sales' },
    { name: 'Clients', icon: Users, to: '/dashboard/cashier/customers' },
    { name: 'Imprimer reçu', icon: Printer, to: '/dashboard/cashier/receipts' },
  ],
  auditor: [
    { name: 'Tableau de bord', icon: LayoutDashboard, to: '/dashboard/auditor' },
    { name: 'Montages / packs produits', icon: Puzzle, to: '/dashboard/auditor/product-packs' },
    { name: 'Définir les prix de vente', icon: DollarSign, to: '/dashboard/auditor/pricing' },
    { name: 'Historique des prix', icon: History, to: '/dashboard/auditor/price-history' },
    { name: 'Stock & mouvements', icon: Store, to: '/dashboard/auditor/inventory' },
    { name: 'Toutes les ventes', icon: ShoppingCart, to: '/dashboard/auditor/sales' },
    { name: 'Tous les achats', icon: ShoppingCart, to: '/dashboard/auditor/purchases' },
    { name: 'Tous les bons', icon: ClipboardSignature, to: '/dashboard/auditor/orders' },
    { name: 'Rapports d\'audit', icon: FileText, to: '/dashboard/auditor/reports' },
    { name: 'Suivi des marges', icon: AreaChart, to: '/dashboard/auditor/margins' },
  ],
};

const Sidebar = ({ user, closeSidebar }) => {
  const location = useLocation();
  const role = user?.role || 'vendor';
  const items = navItems[role] || [];

  const activeClass = "bg-primary-100 text-primary-600";
  const inactiveClass = "text-gray-600 hover:bg-gray-100";

  return (
    <div className="h-0 flex-1 flex flex-col overflow-y-auto border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-primary-600">Stock Management</h1>
        </div>
        <div className="mt-5 flex-1 px-2">
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                onClick={closeSidebar}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.to ? activeClass : inactiveClass
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
