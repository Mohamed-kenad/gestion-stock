
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import { 
  CheckCircle, XCircle, ClipboardList, History, Clock
} from 'lucide-react';

const ChefDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { orders } = useSelector((state) => state.orders);

  // Count orders by status
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const approvedCount = orders.filter(order => order.status === 'approved').length;
  const rejectedCount = orders.filter(order => order.status === 'rejected').length;
  const totalDecisions = approvedCount + rejectedCount;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Bienvenue, {user.name}</h1>
        <p className="text-gray-600">Validez les bons de commande et suivez leur état</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard 
          title="Bons en attente" 
          value={pendingOrders.length} 
          icon={Clock} 
          color="warning" 
        />
        <DashboardCard 
          title="Bons approuvés" 
          value={approvedCount} 
          icon={CheckCircle} 
          color="success" 
        />
        <DashboardCard 
          title="Bons rejetés" 
          value={rejectedCount} 
          icon={XCircle} 
          color="danger" 
        />
        <DashboardCard 
          title="Décisions totales" 
          value={totalDecisions} 
          icon={History} 
          color="primary" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/dashboard/chef/orders/validate"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <CheckCircle className="mr-2 h-5 w-5" /> Valider des bons
            </Link>
            <Link 
              to="/dashboard/chef/decisions"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700"
            >
              <History className="mr-2 h-5 w-5" /> Historique
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Alertes</h2>
          <div className="overflow-hidden">
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Bons en attente de validation</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Vous avez {pendingOrders.length} bon(s) qui nécessite(nt) votre validation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Bons en attente de validation</h2>
        {pendingOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bon #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre d'articles
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingOrders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.total} DH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">Détails</button>
                        <button className="text-success-600 hover:text-success-900">Approuver</button>
                        <button className="text-danger-600 hover:text-danger-900">Rejeter</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Aucun bon n'est actuellement en attente de validation.
          </div>
        )}
        {pendingOrders.length > 5 && (
          <div className="mt-6">
            <Link
              to="/dashboard/chef/orders/validate"
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Voir tous les bons en attente
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefDashboard;
