
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import { 
  Package, ArrowDown, ArrowUp, AlertTriangle, History
} from 'lucide-react';

const StoreDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.products);
  const { movements } = useSelector((state) => state.inventory);

  // Calculate inventory stats
  const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
  const inMovements = movements.filter(m => m.type === 'in').length;
  const outMovements = movements.filter(m => m.type === 'out').length;
  
  // Calculate low stock products
  const lowStockProducts = products.filter(
    (product) => product.quantity <= product.threshold
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Bienvenue, {user.name}</h1>
        <p className="text-gray-600">Gérez le stock et les mouvements d'inventaire</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard 
          title="Stock total" 
          value={totalStock} 
          icon={Package} 
          color="primary" 
        />
        <DashboardCard 
          title="Entrées" 
          value={inMovements} 
          icon={ArrowDown} 
          color="success" 
        />
        <DashboardCard 
          title="Sorties" 
          value={outMovements} 
          icon={ArrowUp} 
          color="warning" 
        />
        <DashboardCard 
          title="Alertes de stock" 
          value={lowStockProducts.length} 
          icon={AlertTriangle} 
          color="danger" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/dashboard/store/receive"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-success-600 hover:bg-success-700"
            >
              <ArrowDown className="mr-2 h-5 w-5" /> Réceptionner des produits
            </Link>
            <Link 
              to="/dashboard/store/release"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-warning-600 hover:bg-warning-700"
            >
              <ArrowUp className="mr-2 h-5 w-5" /> Sortie de stock
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Alertes de stock</h2>
          {lowStockProducts.length > 0 ? (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <li key={product.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-danger-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            Quantité: <span className="font-medium text-danger-600">{product.quantity}</span> / Seuil: {product.threshold}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Link to={`/dashboard/store/inventory`} className="text-primary-600 hover:text-primary-900">
                          Voir
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {lowStockProducts.length > 5 && (
                <div className="mt-6">
                  <Link
                    to="/dashboard/store/alerts"
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Voir toutes les alertes
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              Aucun produit n'est actuellement en alerte de stock.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Mouvements récents</h2>
          <Link 
            to="/dashboard/store/movements"
            className="text-primary-600 hover:text-primary-900"
          >
            Voir tout
          </Link>
        </div>

        {movements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.slice(0, 5).map((movement) => {
                  const product = products.find(p => p.id === movement.productId);
                  return (
                    <tr key={movement.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product ? product.name : `Product #${movement.productId}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          movement.type === 'in' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                        }`}>
                          {movement.type === 'in' ? 'Entrée' : 'Sortie'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.orderId ? `Bon #${movement.orderId}` : (movement.reference || '-')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Aucun mouvement de stock récent.
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDashboard;
