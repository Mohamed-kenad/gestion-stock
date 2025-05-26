import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI, purchasesAPI, suppliersAPI } from '../../lib/api';
import { 
  ShoppingCart, FileText, Users, Clock, TrendingUp, Calendar, Truck
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';

const Achat2Dashboard = () => {
  // Fetch pending purchase requests from Magasin2
  const { 
    data: pendingOrders = [], 
    isLoading: ordersLoading 
  } = useQuery({
    queryKey: ['pendingPurchaseOrders'],
    queryFn: () => ordersAPI.getByDepartmentAndType('magasin2', 'purchase', ['pending'])
  });
  
  // Fetch recent purchases
  const { 
    data: recentPurchases = [], 
    isLoading: purchasesLoading 
  } = useQuery({
    queryKey: ['recentPurchases'],
    queryFn: () => purchasesAPI.getAll()
  });
  
  // Fetch suppliers
  const { 
    data: suppliers = [], 
    isLoading: suppliersLoading 
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersAPI.getAll()
  });
  
  // Count statistics
  const pendingOrdersCount = pendingOrders.length;
  const scheduledDeliveriesCount = recentPurchases.filter(p => p.status === 'scheduled').length;
  const suppliersCount = suppliers.length;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de Bord Achat2</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/achat2/orders">
              <FileText className="mr-2 h-4 w-4" />
              Demandes d'Achat
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/achat2/suppliers">
              <Users className="mr-2 h-4 w-4" />
              Fournisseurs
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Demandes d'Achat en Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">{pendingOrdersCount}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Livraisons Programmées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{scheduledDeliveriesCount}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{suppliersCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Bons de Commande en Attente
          </CardTitle>
          <CardDescription>
            Bons de commande reçus du Magasin nécessitant un traitement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <p>Chargement des bons de commande...</p>
          ) : pendingOrders.length === 0 ? (
            <p className="text-muted-foreground">Aucun bon de commande en attente</p>
          ) : (
            <div className="space-y-4">
              {pendingOrders.slice(0, 5).map(order => (
                <Card key={order.id} className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-base">Bon #{order.id}</CardTitle>
                      <Badge>{order.status}</Badge>
                    </div>
                    <CardDescription>
                      Créé le: {new Date(order.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Département:</p>
                        <p className="font-medium">{order.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Créé par:</p>
                        <p className="font-medium">{order.createdBy}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Nombre d'articles:</p>
                        <p className="font-medium">{order.items?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total:</p>
                        <p className="font-medium">{order.total?.toFixed(2) || 0} DH</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button asChild size="sm">
                        <Link to={`/dashboard/achat2/orders/${order.id}`}>
                          Traiter ce bon
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {pendingOrders.length > 5 && (
                <div className="text-center mt-4">
                  <Button asChild variant="outline">
                    <Link to="/dashboard/achat2/orders">
                      Voir tous les bons ({pendingOrders.length})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Purchases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Achats Récents
          </CardTitle>
          <CardDescription>
            Derniers achats traités et programmés pour livraison
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchasesLoading ? (
            <p>Chargement des achats récents...</p>
          ) : recentPurchases.length === 0 ? (
            <p className="text-muted-foreground">Aucun achat récent</p>
          ) : (
            <div className="space-y-4">
              {recentPurchases.slice(0, 5).map(purchase => (
                <Card key={purchase.id} className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-base">Achat #{purchase.id}</CardTitle>
                      <Badge className={purchase.status === 'scheduled' ? 'bg-blue-500' : 'bg-green-500'}>
                        {purchase.status === 'scheduled' ? 'Programmé' : 'Livré'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Date: {new Date(purchase.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Fournisseur:</p>
                        <p className="font-medium">{purchase.supplier}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bon d'origine:</p>
                        <p className="font-medium">#{purchase.orderId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Livraison prévue:</p>
                        <p className="font-medium">{purchase.deliveryDate ? new Date(purchase.deliveryDate).toLocaleDateString() : 'Non définie'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total:</p>
                        <p className="font-medium">{purchase.total?.toFixed(2) || 0} DH</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/dashboard/achat2/purchases/${purchase.id}`}>
                          Voir les détails
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {recentPurchases.length > 5 && (
                <div className="text-center mt-4">
                  <Button asChild variant="outline">
                    <Link to="/dashboard/achat2/purchases">
                      Voir tous les achats ({recentPurchases.length})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Achat2Dashboard;
