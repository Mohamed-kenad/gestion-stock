import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryAPI, stockMovementsAPI, notificationsAPI } from '../../lib/api';
import { 
  Package, AlertTriangle, TrendingUp, TrendingDown, Clock, Truck, Bell, PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';

const MagasinDashboard = () => {
  // Fetch inventory data
  const { 
    data: inventory = [], 
    isLoading: inventoryLoading 
  } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryAPI.getAll()
  });
  
  // Fetch recent stock movements
  const { 
    data: recentMovements = [], 
    isLoading: movementsLoading 
  } = useQuery({
    queryKey: ['recentStockMovements'],
    queryFn: () => stockMovementsAPI.getRecent(10)
  });
  
  // Fetch pending receptions
  const { 
    data: pendingReceptions = [], 
    isLoading: receptionsLoading 
  } = useQuery({
    queryKey: ['pendingReceptions'],
    queryFn: () => inventoryAPI.getPendingReceptions()
  });
  
  // Fetch low stock alerts
  const { 
    data: lowStockAlerts = [], 
    isLoading: alertsLoading 
  } = useQuery({
    queryKey: ['lowStockAlerts'],
    queryFn: () => inventoryAPI.getLowStockItems()
  });

  // Count statistics
  const totalProducts = inventory.length;
  const lowStockCount = lowStockAlerts.length;
  const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
  const pendingReceptionsCount = pendingReceptions.length;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de Bord Magasin</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/magasin/reception">
              <Truck className="mr-2 h-4 w-4" />
              Réceptions
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/magasin/inventory">
              <Package className="mr-2 h-4 w-4" />
              Gestion Stock
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">{totalProducts}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">{lowStockCount}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rupture de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-2xl font-bold">{outOfStockCount}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Réceptions en Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-2xl font-bold">{pendingReceptionsCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Circle Chart with Details */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              Distribution par Catégorie
            </CardTitle>
            <CardDescription>
              Analyse détaillée de l'inventaire par catégorie avec métriques importantes
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {inventoryLoading ? (
              <div className="h-full flex items-center justify-center">
                <p>Chargement...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                <div className="md:col-span-2 h-full">
                  <EnhancedCategoryPieChart inventory={inventory} />
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Métriques Importantes</h3>
                  <InventoryMetrics inventory={inventory} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different views */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Réceptions en Attente</TabsTrigger>
          <TabsTrigger value="alerts">Alertes Stock</TabsTrigger>
          <TabsTrigger value="recent">Mouvements Récents</TabsTrigger>
        </TabsList>
        
        {/* Pending Receptions Tab */}
        <TabsContent value="pending" className="space-y-4">
          <h2 className="text-xl font-semibold mt-4">Réceptions en Attente</h2>
          {receptionsLoading ? (
            <p>Chargement des réceptions...</p>
          ) : pendingReceptions.length === 0 ? (
            <p className="text-muted-foreground">Aucune réception en attente</p>
          ) : (
            <div className="grid gap-4">
              {pendingReceptions.map(reception => (
                <Card key={reception.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>Commande #{reception.orderId}</CardTitle>
                      <Badge>{reception.status}</Badge>
                    </div>
                    <CardDescription>
                      Date prévue: {reception.expectedDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Fournisseur: {reception.vendorName}</p>
                    <p>Produits: {reception.productCount}</p>
                    <div className="mt-2">
                      <Button asChild size="sm">
                        <Link to={`/dashboard/magasin/reception/${reception.orderId}`}>
                          Voir Détails
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Low Stock Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <h2 className="text-xl font-semibold mt-4">Alertes de Stock</h2>
          {alertsLoading ? (
            <p>Chargement des alertes...</p>
          ) : lowStockAlerts.length === 0 ? (
            <p className="text-muted-foreground">Aucune alerte de stock</p>
          ) : (
            <div className="grid gap-4">
              {lowStockAlerts.map(alert => (
                <Card key={alert.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{alert.productName}</CardTitle>
                      <Badge variant={alert.quantity === 0 ? "destructive" : "warning"}>
                        {alert.quantity === 0 ? "Rupture" : "Stock Faible"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>Quantité actuelle: {alert.quantity}</p>
                    <p>Seuil d'alerte: {alert.threshold}</p>
                    <div className="mt-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/dashboard/magasin/inventory?product=${alert.productId}`}>
                          Gérer Stock
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Recent Movements Tab */}
        <TabsContent value="recent" className="space-y-4">
          <h2 className="text-xl font-semibold mt-4">Mouvements Récents</h2>
          {movementsLoading ? (
            <p>Chargement des mouvements...</p>
          ) : recentMovements.length === 0 ? (
            <p className="text-muted-foreground">Aucun mouvement récent</p>
          ) : (
            <div className="grid gap-4">
              {recentMovements.map(movement => (
                <Card key={movement.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{movement.productName}</CardTitle>
                      <Badge variant={movement.type.includes('in') ? "success" : "destructive"}>
                        {movement.type.includes('in') ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {movement.type}
                      </Badge>
                    </div>
                    <CardDescription>
                      Date: {movement.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Quantité: {Math.abs(movement.quantity)}</p>
                    {movement.notes && <p>Notes: {movement.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Enhanced Category Pie Chart Component with Active Sector
const EnhancedCategoryPieChart = ({ inventory }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Group inventory items by category with detailed metrics
  const categoryData = React.useMemo(() => {
    const categoriesMap = {};
    
    inventory.forEach(item => {
      const categoryName = item.category || 'Non catégorisé';
      if (!categoriesMap[categoryName]) {
        categoriesMap[categoryName] = {
          count: 0,
          totalValue: 0,
          totalQuantity: 0,
          lowStockItems: 0,
          items: []
        };
      }
      
      categoriesMap[categoryName].count += 1;
      categoriesMap[categoryName].totalValue += (item.price || 0) * (item.quantity || 0);
      categoriesMap[categoryName].totalQuantity += (item.quantity || 0);
      
      // Check if item is low on stock
      if (item.threshold && item.quantity <= item.threshold) {
        categoriesMap[categoryName].lowStockItems += 1;
      }
      
      categoriesMap[categoryName].items.push(item);
    });
    
    return Object.entries(categoriesMap).map(([name, data], index) => ({
      name,
      value: data.count,
      totalValue: data.totalValue,
      totalQuantity: data.totalQuantity,
      lowStockItems: data.lowStockItems,
      itemCount: data.count,
      fill: getColorByIndex(index)
    }));
  }, [inventory]);

  // Return empty state if no data
  if (categoryData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Render active shape with more details
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill="#333" className="text-sm font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#999" className="text-xs">
          {`${value} produits (${(percent * 100).toFixed(0)}%)`}
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill="#999" className="text-xs">
          {`Quantité totale: ${payload.totalQuantity}`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 16}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={categoryData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={onPieEnter}
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name, props) => {
            if (name === 'value') return [`${value} produits`, 'Nombre'];
            return [value, name];
          }}
          labelFormatter={(label) => `Catégorie: ${label}`}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
          formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Inventory Metrics Component
const InventoryMetrics = ({ inventory }) => {
  // Calculate important metrics
  const metrics = React.useMemo(() => {
    if (!inventory || inventory.length === 0) return null;
    
    // Total inventory value
    const totalValue = inventory.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    
    // Total quantity
    const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    // Low stock items
    const lowStockItems = inventory.filter(item => item.threshold && item.quantity <= item.threshold);
    
    // Out of stock items
    const outOfStockItems = inventory.filter(item => item.quantity === 0);
    
    // Most valuable category
    const categoryValues = {};
    inventory.forEach(item => {
      const category = item.category || 'Non catégorisé';
      if (!categoryValues[category]) categoryValues[category] = 0;
      categoryValues[category] += (item.price || 0) * (item.quantity || 0);
    });
    
    let mostValuableCategory = { name: 'Aucune', value: 0 };
    Object.entries(categoryValues).forEach(([name, value]) => {
      if (value > mostValuableCategory.value) {
        mostValuableCategory = { name, value };
      }
    });
    
    return {
      totalValue,
      totalQuantity,
      lowStockCount: lowStockItems.length,
      lowStockPercent: ((lowStockItems.length / inventory.length) * 100).toFixed(1),
      outOfStockCount: outOfStockItems.length,
      outOfStockPercent: ((outOfStockItems.length / inventory.length) * 100).toFixed(1),
      mostValuableCategory
    };
  }, [inventory]);
  
  if (!metrics) return <p>Aucune donnée disponible</p>;
  
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="font-medium text-gray-700">Valeur Totale</h4>
        <p className="text-xl font-bold">{metrics.totalValue.toLocaleString()} DH</p>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-700">Quantité Totale</h4>
        <p className="text-xl font-bold">{metrics.totalQuantity.toLocaleString()} unités</p>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-700">Stock Faible</h4>
        <div className="flex items-center">
          <span className="text-xl font-bold text-amber-500">{metrics.lowStockCount}</span>
          <span className="ml-2 text-gray-500">({metrics.lowStockPercent}% du total)</span>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-700">Rupture de Stock</h4>
        <div className="flex items-center">
          <span className="text-xl font-bold text-red-500">{metrics.outOfStockCount}</span>
          <span className="ml-2 text-gray-500">({metrics.outOfStockPercent}% du total)</span>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-700">Catégorie la plus valorisée</h4>
        <p className="font-medium">{metrics.mostValuableCategory.name}</p>
        <p className="text-gray-500">{metrics.mostValuableCategory.value.toLocaleString()} DH</p>
      </div>
    </div>
  );
};



// Helper function to get colors for charts
const getColorByIndex = (index) => {
  const colors = [
    '#1a56db', // primary-600
    '#10b981', // success-500
    '#f59e0b', // warning-500
    '#ef4444', // danger-500
    '#8b5cf6', // purple-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
  ];
  return colors[index % colors.length];
};

export default MagasinDashboard;
