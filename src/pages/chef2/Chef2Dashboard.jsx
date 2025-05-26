import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '../../lib/api';
import { 
  FileText, CheckSquare, History, PackageOpen, 
  ArrowRight, Clock, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Chef2Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Fetch pending orders that need department head review
  const { 
    data: pendingOrders = [], 
    isLoading: ordersLoading 
  } = useQuery({
    queryKey: ['pendingOrdersForDepartmentHead'],
    queryFn: () => ordersAPI.getAll().then(orders => 
      orders.filter(order => 
        order.createdByRole === 'Vendor' && 
        order.status === 'pending'
      )
    ),
    staleTime: 60000,
  });

  // Fetch recently approved orders
  const { 
    data: approvedOrders = [], 
    isLoading: approvedLoading 
  } = useQuery({
    queryKey: ['approvedOrdersByDepartmentHead'],
    queryFn: () => ordersAPI.getAll().then(orders => 
      orders.filter(order => 
        order.status === 'approved' && 
        order.approvedBy === user.name
      ).slice(0, 5)
    ),
    staleTime: 60000,
  });

  // Fetch recently rejected orders
  const { 
    data: rejectedOrders = [], 
    isLoading: rejectedLoading 
  } = useQuery({
    queryKey: ['rejectedOrdersByDepartmentHead'],
    queryFn: () => ordersAPI.getAll().then(orders => 
      orders.filter(order => 
        order.status === 'rejected' && 
        order.rejectedBy === user.name
      ).slice(0, 5)
    ),
    staleTime: 60000,
  });

  // Dashboard cards
  const dashboardCards = [
    {
      title: "Examiner les bons",
      description: "Examiner et approuver/rejeter les bons envoyés par les vendeurs",
      icon: CheckSquare,
      path: "/dashboard/chef2/orders/review",
      count: pendingOrders.length,
      loading: ordersLoading,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Historique des décisions",
      description: "Voir l'historique des bons approuvés et rejetés",
      icon: History,
      path: "/dashboard/chef2/orders/history",
      loading: false,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      title: "Suivi des bons approuvés",
      description: "Suivre l'état des bons approuvés envoyés au service achat",
      icon: PackageOpen,
      path: "/dashboard/chef2/orders/tracking",
      loading: false,
      color: "text-green-500",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord - Chef de Département</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {user?.name || 'Utilisateur'}
          </Badge>
          <Badge variant="outline" className="bg-primary-50 text-primary-700">
            Chef de Département
          </Badge>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className={`${card.bgColor} pb-2`}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {card.count !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {card.loading ? 'Chargement...' : 'Bons en attente'}
                  </span>
                  <Badge variant={card.count > 0 ? "default" : "outline"}>
                    {card.loading ? '...' : card.count}
                  </Badge>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="ghost" 
                className="w-full justify-between"
                onClick={() => navigate(card.path)}
              >
                Accéder <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Bons en attente d'examen</CardTitle>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <CardDescription>
              Bons récemment soumis qui nécessitent votre examen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <p className="text-sm text-muted-foreground">Chargement des bons...</p>
            ) : pendingOrders.length > 0 ? (
              <ul className="space-y-2">
                {pendingOrders.slice(0, 5).map((order) => (
                  <li key={order.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{order.title || `Bon #${order.id}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.createdBy} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate('/dashboard/chef2/orders/review')}
                    >
                      Examiner
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckSquare className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Aucun bon en attente d'examen
                </p>
              </div>
            )}
          </CardContent>
          {pendingOrders.length > 0 && (
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full justify-between"
                onClick={() => navigate('/dashboard/chef2/orders/review')}
              >
                Voir tous les bons en attente <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Recent Decisions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Décisions récentes</CardTitle>
              <History className="h-5 w-5 text-indigo-500" />
            </div>
            <CardDescription>
              Vos décisions récentes sur les bons examinés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {approvedLoading || rejectedLoading ? (
              <p className="text-sm text-muted-foreground">Chargement de l'historique...</p>
            ) : approvedOrders.length > 0 || rejectedOrders.length > 0 ? (
              <ul className="space-y-2">
                {[...approvedOrders, ...rejectedOrders]
                  .sort((a, b) => new Date(b.approvedAt || b.rejectedAt) - new Date(a.approvedAt || a.rejectedAt))
                  .slice(0, 5)
                  .map((order) => (
                    <li key={order.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{order.title || `Bon #${order.id}`}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={order.status === 'approved' ? 'success' : 'destructive'}>
                            {order.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.approvedAt || order.rejectedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Aucune décision récente
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full justify-between"
              onClick={() => navigate('/dashboard/chef2/orders/history')}
            >
              Voir l'historique complet <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Chef2Dashboard;
