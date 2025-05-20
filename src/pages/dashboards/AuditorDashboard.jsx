
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import StatsChart from '../../components/StatsChart';
import { 
  Package, DollarSign, LineChart, Receipt, ShoppingCart, FileText, BarChart3
} from 'lucide-react';

const AuditorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.products);
  const { orders } = useSelector((state) => state.orders);
  const { sales } = useSelector((state) => state.sales);
  
  // Calculate metrics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalSales = sales.length;
  
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrderValue = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Estimated margins (for demo)
  const estimatedMargin = totalRevenue - totalOrderValue;
  const marginPercentage = Math.round((estimatedMargin / totalRevenue) * 100);

  // Create data for charts
  const salesData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Apr', value: 280 },
    { name: 'May', value: 590 },
  ];

  const marginsData = [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 90 },
    { name: 'Mar', value: 150 },
    { name: 'Apr', value: 95 },
    { name: 'May', value: 200 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Bienvenue, {user.name}</h1>
        <p className="text-gray-600">Auditez les opérations et analysez les performances</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard 
          title="Chiffre d'affaires" 
          value={`${totalRevenue} DH`} 
          icon={DollarSign} 
          color="success" 
        />
        <DashboardCard 
          title="Marge estimée" 
          value={`${marginPercentage}%`} 
          icon={LineChart} 
          color="primary" 
        />
        <DashboardCard 
          title="Total des ventes" 
          value={totalSales} 
          icon={Receipt} 
          color="warning" 
        />
        <DashboardCard 
          title="Total des commandes" 
          value={totalOrders} 
          icon={ShoppingCart} 
          color="secondary" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <StatsChart data={salesData} title="Ventes mensuelles" />
        <StatsChart data={marginsData} title="Marges mensuelles" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Rapports d'audit</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FileText className="h-6 w-6 text-primary-500 mr-3" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Rapport d'inventaire</h3>
                <p className="text-sm text-gray-500">État actuel du stock et évaluations</p>
              </div>
              <Link 
                to="/dashboard/auditor/reports"
                className="text-primary-600 hover:text-primary-900"
              >
                Voir
              </Link>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FileText className="h-6 w-6 text-success-500 mr-3" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Rapport de ventes</h3>
                <p className="text-sm text-gray-500">Analyse des ventes et revenus</p>
              </div>
              <Link 
                to="/dashboard/auditor/reports"
                className="text-primary-600 hover:text-primary-900"
              >
                Voir
              </Link>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FileText className="h-6 w-6 text-warning-500 mr-3" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Rapport des achats</h3>
                <p className="text-sm text-gray-500">Analyse des achats et dépenses</p>
              </div>
              <Link 
                to="/dashboard/auditor/reports"
                className="text-primary-600 hover:text-primary-900"
              >
                Voir
              </Link>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FileText className="h-6 w-6 text-secondary-500 mr-3" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Rapport des marges</h3>
                <p className="text-sm text-gray-500">Analyse de rentabilité</p>
              </div>
              <Link 
                to="/dashboard/auditor/margins"
                className="text-primary-600 hover:text-primary-900"
              >
                Voir
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link 
              to="/dashboard/auditor/pricing"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <DollarSign className="mr-2 h-5 w-5" /> Définir les prix
            </Link>
            <Link 
              to="/dashboard/auditor/product-packs"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700"
            >
              <Package className="mr-2 h-5 w-5" /> Gérer les packs produits
            </Link>
            <Link 
              to="/dashboard/auditor/reports"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-success-600 hover:bg-success-700"
            >
              <BarChart3 className="mr-2 h-5 w-5" /> Générer des rapports
            </Link>
          </div>
          
          <div className="mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Résumé financier</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Chiffre d'affaires</p>
                  <p className="text-lg font-bold text-success-600">{totalRevenue} DH</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Coût d'achat</p>
                  <p className="text-lg font-bold text-danger-600">{totalOrderValue} DH</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Marge brute</p>
                  <p className="text-lg font-bold text-primary-600">{estimatedMargin} DH</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Taux de marge</p>
                  <p className="text-lg font-bold text-primary-600">{marginPercentage}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboard;
