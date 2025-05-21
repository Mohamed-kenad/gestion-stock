
import React from 'react';
import { useSelector } from 'react-redux';
import DashboardCard from '../../components/DashboardCard';
import StatsChart from '../../components/StatsChart';
import { 
  Users, Package, Receipt, AlertTriangle, ShoppingCart, DollarSign, Clipboard, BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const { users } = useSelector((state) => state.users);
  const { products } = useSelector((state) => state.products);
  const { orders } = useSelector((state) => state.orders);
  const { movements } = useSelector((state) => state.inventory);
  const { sales } = useSelector((state) => state.sales);

  // Calculate low stock products
  const lowStockProducts = products.filter(
    (product) => product.quantity <= product.threshold
  );

  // Calculate pending orders
  const pendingOrders = orders.filter(
    (order) => order.status === 'pending'
  );

  // Total revenue from sales
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  // Recent activity - combined and sorted by date
  const recentActivity = [
    ...orders.map(order => ({ 
      type: 'order', 
      date: order.date, 
      status: order.status, 
      id: order.id 
    })),
    ...movements.map(movement => ({ 
      type: 'movement', 
      date: movement.date, 
      movementType: movement.type, 
      id: movement.id, 
      productId: movement.productId 
    })),
    ...sales.map(sale => ({ 
      type: 'sale', 
      date: sale.date, 
      id: sale.id, 
      total: sale.total 
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  // Create data for charts
  const salesData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Apr', value: 280 },
    { name: 'May', value: 590 },
  ];

  const inventoryData = [
    { name: 'Dry Goods', value: 250 },
    { name: 'Condiments', value: 140 },
    { name: 'Meat', value: 90 },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard 
          title="Utilisateurs" 
          value={users.length} 
          icon={Users} 
          color="primary" 
        />
        <DashboardCard 
          title="Produits" 
          value={products.length} 
          icon={Package} 
          color="success" 
        />
        <DashboardCard 
          title="Bons en attente" 
          value={pendingOrders.length} 
          icon={Receipt} 
          color="warning" 
        />
        <DashboardCard 
          title="Produits en alerte" 
          value={lowStockProducts.length} 
          icon={AlertTriangle} 
          color="danger" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <StatsChart data={salesData} title="Ventes par mois" />
        <StatsChart data={inventoryData} title="Répartition du stock par catégorie" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-5 col-span-2">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Activité récente</h3>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={`${activity.type}-${activity.id}`} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === 'order' && <Clipboard className="h-6 w-6 text-primary-500" />}
                      {activity.type === 'movement' && (
                        activity.movementType === 'in' 
                          ? <ShoppingCart className="h-6 w-6 text-success-500" />
                          : <ShoppingCart className="h-6 w-6 text-warning-500" />
                      )}
                      {activity.type === 'sale' && <DollarSign className="h-6 w-6 text-success-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.type === 'order' && `Bon de commande #${activity.id} - ${activity.status}`}
                        {activity.type === 'movement' && `Mouvement de stock ${activity.movementType === 'in' ? 'entrant' : 'sortant'} - Produit #${activity.productId}`}
                        {activity.type === 'sale' && `Vente #${activity.id} - ${activity.total} DH`}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <a
              href="#"
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Voir toute l'activité
            </a>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-5">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Statistiques</h3>
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-gray-500">Total des ventes</dt>
              <dd className="text-sm font-semibold text-gray-900">{totalRevenue} DH</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-gray-500">Nombre de bons</dt>
              <dd className="text-sm font-semibold text-gray-900">{orders.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-gray-500">Produits en stock</dt>
              <dd className="text-sm font-semibold text-gray-900">{products.reduce((sum, product) => sum + product.quantity, 0)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-gray-500">Mouvements de stock</dt>
              <dd className="text-sm font-semibold text-gray-900">{movements.length}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <a
              href="#"
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <BarChart3 className="mr-2 h-5 w-5 text-gray-500" />
              Voir les rapports détaillés
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
