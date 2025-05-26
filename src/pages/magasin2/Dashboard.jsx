import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryAPI, stockMovementsAPI, notificationsAPI, purchasesAPI } from '../../lib/api';
import { 
  Package, AlertTriangle, TrendingUp, TrendingDown, Clock, Truck, Bell, PieChartIcon,
  FileText, ShoppingCart, ArrowDownCircle, ArrowUpCircle, Users
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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

const Magasin2Dashboard = () => {
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
  
  // Fetch pending receptions from Achat2
  const { 
    data: pendingReceptions = [], 
    isLoading: receptionsLoading 
  } = useQuery({
    queryKey: ['pendingReceptions'],
    queryFn: () => purchasesAPI.getAll().then(purchases => 
      purchases.filter(p => p.status === 'scheduled')
    )
  });
  
  // Fetch low stock alerts
  const { 
    data: lowStockAlerts = [], 
    isLoading: alertsLoading 
  } = useQuery({
    queryKey: ['lowStockAlerts'],
    queryFn: () => inventoryAPI.getLowStockItems()
  });

  // Fetch pending vendor requests
  const { 
    data: vendorRequests = [], 
    isLoading: requestsLoading 
  } = useQuery({
    queryKey: ['vendorRequests'],
    queryFn: () => {
      // This would be replaced with an actual API call in a real implementation
      return Promise.resolve([
        { 
          id: 'REQ-2025-001', 
          vendorName: 'Ahmed Benali', 
          department: 'Cuisine', 
          status: 'pending', 
          requestDate: '2025-05-24',
          items: [
            { product: 'Riz Basmati', quantity: 5, unit: 'kg' },
            { product: 'Huile d\'Olive', quantity: 2, unit: 'L' }
          ]
        },
        { 
          id: 'REQ-2025-002', 
          vendorName: 'Fatima Zahra', 
          department: 'Pâtisserie', 
          status: 'pending', 
          requestDate: '2025-05-25',
          items: [
            { product: 'Farine', quantity: 10, unit: 'kg' },
            { product: 'Sucre', quantity: 5, unit: 'kg' }
          ]
        }
      ]);
    }
  });
  
  // Count statistics
  const totalProducts = inventory.length;
  const lowStockCount = lowStockAlerts.length;
  const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
  const pendingReceptionsCount = pendingReceptions.length;
  const pendingRequestsCount = vendorRequests.length;
  
  // Calculate stock movements by type
  const stockInCount = recentMovements.filter(m => m.type === 'in').length;
  const stockOutCount = recentMovements.filter(m => m.type === 'out').length;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de Bord Magasin2</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/magasin2/reception">
              <Truck className="mr-2 h-4 w-4" />
              Réceptions
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard/magasin2/requests">
              <FileText className="mr-2 h-4 w-4" />
              Demandes
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/magasin2/inventory">
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
            <div className="mt-2">
              <Link to="/dashboard/magasin2/inventory/alerts" className="text-xs text-blue-500 hover:underline">
                Voir les alertes
              </Link>
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
            <CardTitle className="text-sm font-medium">Livraisons en Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{pendingReceptionsCount}</span>
            </div>
            <div className="mt-2">
              <Link to="/dashboard/magasin2/reception" className="text-xs text-blue-500 hover:underline">
                Voir les livraisons
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entrées Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDownCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{stockInCount}</span>
            </div>
            <div className="mt-2">
              <Link to="/dashboard/magasin2/reports" className="text-xs text-blue-500 hover:underline">
                Voir les mouvements
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sorties Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUpCircle className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-2xl font-bold">{stockOutCount}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Demandes Vendeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-2xl font-bold">{pendingRequestsCount}</span>
            </div>
            <div className="mt-2">
              <Link to="/dashboard/magasin2/requests" className="text-xs text-blue-500 hover:underline">
                Traiter les demandes
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different views */}
      <Tabs defaultValue="receptions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="receptions">Livraisons en Attente</TabsTrigger>
          <TabsTrigger value="requests">Demandes Vendeurs</TabsTrigger>
          <TabsTrigger value="recent">Mouvements Récents</TabsTrigger>
        </TabsList>
        
        {/* Pending Receptions Tab */}
        <TabsContent value="receptions" className="space-y-4">
          <h2 className="text-xl font-semibold mt-4">Livraisons en Attente</h2>
          {receptionsLoading ? (
            <p>Chargement des livraisons...</p>
          ) : pendingReceptions.length === 0 ? (
            <p className="text-muted-foreground">Aucune livraison en attente</p>
          ) : (
            <div className="grid gap-4">
              {pendingReceptions.slice(0, 3).map(reception => (
                <Card key={reception.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>Achat #{reception.id}</CardTitle>
                      <Badge className="bg-blue-500">Programmé</Badge>
                    </div>
                    <CardDescription>
                      Livraison prévue: {new Date(reception.deliveryDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Fournisseur: {reception.supplier}</p>
                    <p>Bon d'origine: #{reception.orderId}</p>
                    <p>Produits: {reception.items?.length || 0}</p>
                    <p>Total: {reception.total?.toFixed(2) || 0} DH</p>
                    <div className="mt-4">
                      <Button asChild size="sm">
                        <Link to={`/dashboard/magasin2/reception/${reception.id}`}>
                          Préparer la réception
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {pendingReceptions.length > 3 && (
                <div className="text-center mt-4">
                  <Button asChild variant="outline">
                    <Link to="/dashboard/magasin2/reception">
                      Voir toutes les livraisons ({pendingReceptions.length})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Vendor Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <h2 className="text-xl font-semibold mt-4">Demandes des Vendeurs</h2>
          {requestsLoading ? (
            <p>Chargement des demandes...</p>
          ) : vendorRequests.length === 0 ? (
            <p className="text-muted-foreground">Aucune demande en attente</p>
          ) : (
            <div className="grid gap-4">
              {vendorRequests.map(request => (
                <Card key={request.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>Demande #{request.id}</CardTitle>
                      <Badge>En attente</Badge>
                    </div>
                    <CardDescription>
                      Date: {new Date(request.requestDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Vendeur: {request.vendorName}</p>
                    <p>Département: {request.department}</p>
                    <p>Articles demandés:</p>
                    <ul className="list-disc pl-5 mt-2">
                      {request.items.map((item, index) => (
                        <li key={index}>{item.product} - {item.quantity} {item.unit}</li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <Button asChild size="sm">
                        <Link to={`/dashboard/magasin2/requests/${request.id}`}>
                          Traiter la demande
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
          <h2 className="text-xl font-semibold mt-4">Mouvements de Stock Récents</h2>
          {movementsLoading ? (
            <p>Chargement des mouvements...</p>
          ) : recentMovements.length === 0 ? (
            <p className="text-muted-foreground">Aucun mouvement récent</p>
          ) : (
            <div className="grid gap-4">
              {recentMovements.slice(0, 5).map(movement => (
                <Card key={movement.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-base">
                        {movement.type === 'in' ? 'Entrée' : 'Sortie'} - {movement.product}
                      </CardTitle>
                      <Badge className={movement.type === 'in' ? 'bg-green-500' : 'bg-orange-500'}>
                        {movement.type === 'in' ? 'Entrée' : 'Sortie'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Date: {new Date(movement.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Quantité:</p>
                        <p className="font-medium">{movement.quantity} {movement.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Référence:</p>
                        <p className="font-medium">{movement.reference || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Effectué par:</p>
                        <p className="font-medium">{movement.createdBy || 'Système'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Notes:</p>
                        <p className="font-medium">{movement.notes || 'Aucune'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="text-center mt-4">
                <Button asChild variant="outline">
                  <Link to="/dashboard/magasin2/reports">
                    Voir tous les mouvements
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Magasin2Dashboard;
