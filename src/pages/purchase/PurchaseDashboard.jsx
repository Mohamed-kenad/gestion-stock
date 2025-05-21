
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import { 
  ShoppingCart, Receipt, CheckCircle, Package, Users
} from 'lucide-react';

const PurchaseDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { orders } = useSelector((state) => state.orders);
  const { movements } = useSelector((state) => state.inventory);

  // Filter for purchase-related data
  const approvedOrders = orders.filter(order => order.status === 'approved');
  const purchasedOrders = orders.filter(order => order.status === 'purchased');
  
  // Filter inventory movements for purchases (incoming)
  const incomingMovements = movements.filter(
    (movement) => movement.type === 'in'
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Bienvenue, {user.name}</h1>
        <p className="text-gray-600">Gérez les achats et les fournisseurs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard 
          title="Bons à traiter" 
          value={approvedOrders.length} 
          icon={Receipt} 
          color="warning" 
        />
        <DashboardCard 
          title="Achats effectués" 
          value={purchasedOrders.length} 
          icon={ShoppingCart} 
          color="success" 
        />
        <DashboardCard 
          title="Réceptions" 
          value={incomingMovements.length} 
          icon={Package} 
          color="primary" 
        />
        <DashboardCard 
          title="Fournisseurs" 
          value={5} 
          icon={Users} 
          color="secondary" 
        />
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/dashboard/purchase/orders/approved"
            className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <CheckCircle className="mr-2 h-5 w-5" /> Voir les bons approuvés
          </Link>
          <Link 
            to="/dashboard/purchase/register"
            className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-success-600 hover:bg-success-700"
          >
            <ShoppingCart className="mr-2 h-5 w-5" /> Enregistrer un achat
          </Link>
          <Link 
            to="/dashboard/purchase/suppliers"
            className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700"
          >
            <Users className="mr-2 h-5 w-5" /> Gérer les fournisseurs
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Bons approuvés à traiter</h2>
          {approvedOrders.length > 0 ? (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {approvedOrders.slice(0, 5).map((order) => (
                  <li key={order.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Receipt className="h-6 w-6 text-primary-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Bon #{order.id}</p>
                          <p className="text-sm text-gray-500">{order.date} - {order.items.length} articles</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-xs font-medium rounded-md bg-primary-100 text-primary-800">
                          Détails
                        </button>
                        <button className="px-3 py-1 text-xs font-medium rounded-md bg-success-100 text-success-800">
                          Traiter
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {approvedOrders.length > 5 && (
                <div className="mt-6">
                  <Link
                    to="/dashboard/purchase/orders/approved"
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Voir tous les bons approuvés
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              Aucun bon approuvé n'est en attente de traitement.
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Historique des achats récents</h2>
          {purchasedOrders.length > 0 ? (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {purchasedOrders.slice(0, 5).map((order) => (
                  <li key={order.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShoppingCart className="h-6 w-6 text-success-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Achat #{order.id}</p>
                          <p className="text-sm text-gray-500">{order.date} - {order.total} DH</p>
                        </div>
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          Complété
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {purchasedOrders.length > 5 && (
                <div className="mt-6">
                  <Link
                    to="/dashboard/purchase/history"
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Voir tout l'historique
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              Aucun historique d'achat disponible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseDashboard;
