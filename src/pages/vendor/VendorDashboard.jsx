
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI, productsAPI } from '../../lib/api';
import DashboardCard from '../../components/DashboardCard';
import { 
  ShoppingCart, Receipt, Clock, CheckCircle, XCircle, AlertTriangle, Loader2 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const VendorDashboard = () => {
  // Mock user ID - in a real app, this would come from authentication context
  const userId = 1; // Assuming vendor has ID 1
  
  // Fetch orders using React Query
  const { 
    data: orders = [], 
    isLoading: ordersLoading 
  } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersAPI.getAll
  });
  
  // Fetch products using React Query
  const { 
    data: products = [], 
    isLoading: productsLoading 
  } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll
  });
  
  // Loading state
  const isLoading = ordersLoading || productsLoading;
  
  // Filter orders created by this vendor
  const myOrders = orders.filter(order => order.createdBy === userId || order.vendorId === userId);
  
  // Count orders by status
  const pendingOrders = myOrders.filter(order => order.status === 'pending').length;
  const approvedOrders = myOrders.filter(order => order.status === 'approved').length;
  const rejectedOrders = myOrders.filter(order => order.status === 'rejected').length;
  const purchasedOrders = myOrders.filter(order => order.status === 'purchased').length;
  
  // Calculate low stock products
  const lowStockProducts = products.filter(
    (product) => product.quantity <= product.threshold
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Chargement des données...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord Fournisseur</h1>
            <p className="text-gray-500">Bienvenue. Voici un aperçu de vos activités.</p>
          </div>
      
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <DashboardCard 
              title="Bons en attente" 
              value={pendingOrders} 
              icon={Clock} 
              color="warning" 
            />
            <DashboardCard 
              title="Bons approuvés" 
              value={approvedOrders} 
              icon={CheckCircle} 
              color="success" 
            />
            <DashboardCard 
              title="Bons rejetés" 
              value={rejectedOrders} 
              icon={XCircle} 
              color="danger" 
            />
            <DashboardCard 
              title="Produits en alerte" 
              value={lowStockProducts.length} 
              icon={AlertTriangle} 
              color="warning" 
            />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/dashboard/vendor/orders/create"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Receipt className="mr-2 h-5 w-5" /> Créer un bon
            </Link>
            <Link 
              to="/dashboard/vendor/products"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Voir les produits
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">État des bons récents</h2>
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {myOrders.slice(0, 5).map((order) => (
                <li key={order.id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-primary-600">
                          Bon #{order.id}
                        </p>
                        <div className="ml-2 flex flex-shrink-0">
                          <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'approved' ? 'bg-green-100 text-green-800' :
                            order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status === 'pending' ? 'En attente' :
                             order.status === 'approved' ? 'Approuvé' :
                             order.status === 'rejected' ? 'Rejeté' :
                             'Acheté'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {order.note}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            <span className="font-medium text-gray-900">{order.total} DH</span> · {order.items.length} items
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {myOrders.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                Vous n'avez pas encore créé de bons.
              </div>
            )}
          </div>
          {myOrders.length > 5 && (
            <div className="mt-6">
              <Link
                to="/dashboard/vendor/orders/my"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Voir tous les bons
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Produits en alerte de stock</h2>
        {lowStockProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom du produit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité actuelle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seuil d'alerte
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-danger-600 font-medium">{product.quantity}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.threshold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        className="text-primary-600 hover:text-primary-900"
                        onClick={() => {/* Logic to quickly add this product to a new order */}}
                      >
                        Commander
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Aucun produit n'est actuellement en alerte de stock.
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default VendorDashboard;
