
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import { 
  DollarSign, Receipt, Users, ShoppingCart
} from 'lucide-react';

const CashierDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { sales } = useSelector((state) => state.sales);
  
  // Calculate metrics
  const totalSales = sales.length;
  const todaySales = sales.filter(
    sale => sale.date === new Date().toISOString().split('T')[0]
  ).length;
  
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const todayRevenue = sales.filter(
    sale => sale.date === new Date().toISOString().split('T')[0]
  ).reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Bienvenue, {user.name}</h1>
        <p className="text-gray-600">Gérez les ventes et les clients</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard 
          title="Ventes aujourd'hui" 
          value={todaySales} 
          icon={Receipt} 
          color="primary" 
        />
        <DashboardCard 
          title="Revenu aujourd'hui" 
          value={`${todayRevenue} DH`} 
          icon={DollarSign} 
          color="success" 
        />
        <DashboardCard 
          title="Total des ventes" 
          value={totalSales} 
          icon={ShoppingCart} 
          color="warning" 
        />
        <DashboardCard 
          title="Clients" 
          value={10} 
          icon={Users} 
          color="secondary" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/dashboard/cashier/pos"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Interface de vente
            </Link>
            <Link 
              to="/dashboard/cashier/receipts"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700"
            >
              <Receipt className="mr-2 h-5 w-5" /> Imprimer un reçu
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Ventes du jour</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{todaySales}</p>
              <p className="mt-1 text-sm text-gray-600">{todayRevenue} DH</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Total des ventes</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalSales}</p>
              <p className="mt-1 text-sm text-gray-600">{totalRevenue} DH</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Ventes récentes</h2>
          <Link 
            to="/dashboard/cashier/sales"
            className="text-primary-600 hover:text-primary-900"
          >
            Voir tout
          </Link>
        </div>

        {sales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vente #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Articles
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{sale.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.items.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success-600">
                      {sale.total} DH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-primary-600 hover:text-primary-900">Reçu</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Aucune vente récente.
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierDashboard;
