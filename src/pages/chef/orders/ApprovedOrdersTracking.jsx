import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, Search, Filter, Calendar, Eye, RefreshCw, Clock, CheckCircle2
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { ordersAPI } from '../../../lib/api';
import { useQuery } from '@tanstack/react-query';

// Fallback mock data in case API fails
const fallbackApprovedOrders = [
  { 
    id: 'PO-2025-002', 
    title: 'Commande légumes',
    createdBy: 'Fatima Zahra',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur B', 
    department: 'Cuisine',
    createdAt: '2025-05-16', 
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-17',
    validationNote: 'Approuvé pour la cuisine principale. Vérifier la fraîcheur à la livraison.',
    purchaseStatus: 'completed',
    purchasedAt: '2025-05-18',
    purchasedBy: 'Nadia Tazi',
    deliveryStatus: 'completed',
    deliveredAt: '2025-05-19',
    receivedBy: 'Hassan Benjelloun',
    totalItems: 2,
    estimatedTotal: 180.20,
    actualTotal: 175.50,
    progressPercentage: 100,
    items: [
      { 
        id: 1, 
        name: 'Tomates', 
        category: 'Légumes', 
        quantity: 20, 
        unit: 'kg', 
        unitPrice: 3.5, 
        total: 70,
        status: 'delivered',
        receivedQuantity: 20
      },
      { 
        id: 2, 
        name: 'Oignons', 
        category: 'Légumes', 
        quantity: 15, 
        unit: 'kg', 
        unitPrice: 2.8, 
        total: 42,
        status: 'delivered',
        receivedQuantity: 15
      }
    ]
  },
  { 
    id: 'PO-2025-004', 
    title: 'Commande produits laitiers',
    createdBy: 'Fatima Zahra',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur A', 
    department: 'Pâtisserie',
    createdAt: '2025-05-10', 
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-11',
    validationNote: 'Approuvé pour les besoins de la pâtisserie.',
    purchaseStatus: 'completed',
    purchasedAt: '2025-05-12',
    purchasedBy: 'Nadia Tazi',
    deliveryStatus: 'completed',
    deliveredAt: '2025-05-13',
    receivedBy: 'Hassan Benjelloun',
    totalItems: 2,
    estimatedTotal: 150.00,
    actualTotal: 150.00,
    progressPercentage: 100,
    items: [
      { 
        id: 1, 
        name: 'Lait', 
        category: 'Produits laitiers', 
        quantity: 50, 
        unit: 'L', 
        unitPrice: 1.2, 
        total: 60,
        status: 'delivered',
        receivedQuantity: 50
      },
      { 
        id: 2, 
        name: 'Crème fraîche', 
        category: 'Produits laitiers', 
        quantity: 10, 
        unit: 'L', 
        unitPrice: 4.5, 
        total: 45,
        status: 'delivered',
        receivedQuantity: 10
      }
    ]
  },
  { 
    id: 'PO-2025-006', 
    title: 'Commande boissons',
    createdBy: 'Mohammed Alami',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur E', 
    department: 'Bar',
    createdAt: '2025-05-12', 
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-13',
    validationNote: 'Approuvé pour le réapprovisionnement du bar.',
    purchaseStatus: 'completed',
    purchasedAt: '2025-05-14',
    purchasedBy: 'Nadia Tazi',
    deliveryStatus: 'in_progress',
    deliveredAt: null,
    receivedBy: null,
    totalItems: 8,
    estimatedTotal: 560.75,
    actualTotal: 560.75,
    progressPercentage: 50,
    items: [
      { 
        id: 1, 
        name: 'Eau minérale', 
        category: 'Boissons', 
        quantity: 100, 
        unit: 'bouteille', 
        unitPrice: 0.8, 
        total: 80,
        status: 'purchased',
        receivedQuantity: 0
      },
      { 
        id: 2, 
        name: 'Jus d\'orange', 
        category: 'Boissons', 
        quantity: 50, 
        unit: 'bouteille', 
        unitPrice: 1.5, 
        total: 75,
        status: 'purchased',
        receivedQuantity: 0
      }
    ]
  },
  { 
    id: 'PO-2025-007', 
    title: 'Commande fruits',
    createdBy: 'Fatima Zahra',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur B', 
    department: 'Cuisine',
    createdAt: '2025-05-05', 
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-06',
    validationNote: 'Approuvé. Vérifier la maturité des fruits à la livraison.',
    purchaseStatus: 'in_progress',
    purchasedAt: null,
    purchasedBy: null,
    deliveryStatus: 'pending',
    deliveredAt: null,
    receivedBy: null,
    totalItems: 6,
    estimatedTotal: 230.40,
    actualTotal: null,
    progressPercentage: 25,
    items: [
      { 
        id: 1, 
        name: 'Pommes', 
        category: 'Fruits', 
        quantity: 15, 
        unit: 'kg', 
        unitPrice: 2.5, 
        total: 37.5,
        status: 'approved',
        receivedQuantity: 0
      },
      { 
        id: 2, 
        name: 'Bananes', 
        category: 'Fruits', 
        quantity: 10, 
        unit: 'kg', 
        unitPrice: 1.8, 
        total: 18,
        status: 'approved',
        receivedQuantity: 0
      }
    ]
  }
];

const ApprovedOrdersTracking = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [date, setDate] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  // Order details
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch approved orders data using React Query
  const { data: orders = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['approvedOrdersTracking'],
    queryFn: () => {
      console.log('Fetching approved orders tracking data...');
      return ordersAPI.getApprovedOrdersTracking();
    },
    staleTime: 5000, // 5 seconds for more frequent updates during testing
    refetchOnWindowFocus: true, // Refresh when window gains focus
    refetchInterval: 10000, // Refresh every 10 seconds
    retry: 3, // Retry failed requests 3 times
  });

  // Log orders data for debugging
  useEffect(() => {
    console.log('Approved orders tracking data:', orders);
    
    // If we have no orders, try to refresh
    if (orders.length === 0 && !loading) {
      console.log('No approved orders found, trying to refresh...');
      setTimeout(() => {
        console.log('Refreshing approved orders data...');
        refetch();
        queryClient.invalidateQueries(['approvedOrdersTracking']);
      }, 2000);
    }
  }, [orders, loading, refetch, queryClient]);
  
  // Handle error
  useEffect(() => {
    if (error) {
      console.error('Error fetching approved orders tracking:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les bons approuvés. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter orders based on search term, filters, and date range
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'completed' && order.deliveryStatus === 'completed') ||
                         (statusFilter === 'in_progress' && (order.purchaseStatus === 'in_progress' || order.deliveryStatus === 'in_progress')) ||
                         (statusFilter === 'pending' && order.purchaseStatus === 'pending');
    const matchesDepartment = departmentFilter === '' || order.department === departmentFilter;
    const matchesSupplier = supplierFilter === '' || order.supplier === supplierFilter;
    
    // Date filtering
    let matchesDate = true;
    if (date.from && date.to) {
      const orderDate = new Date(order.approvedAt);
      matchesDate = orderDate >= date.from && orderDate <= date.to;
    }
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesSupplier && matchesDate;
  });

  // Get unique departments and suppliers for filter dropdowns
  const departments = [...new Set(orders.map(order => order.department))];
  const suppliers = [...new Set(orders.map(order => order.supplier))];

  // Status badge color mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Complété</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">En cours</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Open view dialog
  const openViewDialog = (order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  // This function is now handled by React Query's refetch

  // Get current status text
  const getCurrentStatusText = (order) => {
    if (order.deliveryStatus === 'completed') {
      return 'Livré et reçu';
    } else if (order.purchaseStatus === 'completed' && order.deliveryStatus === 'in_progress') {
      return 'Acheté, en attente de livraison';
    } else if (order.purchaseStatus === 'in_progress') {
      return 'En cours d\'achat';
    } else {
      return 'En attente de traitement';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suivi des Bons Validés</h1>
          <p className="text-muted-foreground">
            Suivez l'état d'avancement des bons de commande que vous avez approuvés
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des bons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complétés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.deliveryStatus === 'completed').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.deliveryStatus === 'in_progress' || o.purchaseStatus === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.reduce((sum, order) => sum + (order.actualTotal || order.estimatedTotal), 0).toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un bon de commande..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              <SelectItem value="completed">Complétés</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les départements</SelectItem>
              {departments.map(department => (
                <SelectItem key={department} value={department}>{department}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Fournisseur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les fournisseurs</SelectItem>
              {suppliers.map(supplier => (
                <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi des bons validés</CardTitle>
          <CardDescription>
            Suivez l'état d'avancement des bons de commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Date approbation</TableHead>
                    <TableHead>Statut actuel</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.title}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>{order.department}</TableCell>
                        <TableCell>{order.approvedAt}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {getCurrentStatusText(order)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-full">
                            <Progress value={order.progressPercentage} className="h-2" />
                            <div className="text-xs text-muted-foreground mt-1 text-right">
                              {order.progressPercentage}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openViewDialog(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun bon de commande trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du bon de commande</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span>
                  {selectedOrder.id} - {selectedOrder.title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Informations générales</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Créé par:</span> {selectedOrder.createdBy} ({selectedOrder.createdByRole})
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date de création:</span> {selectedOrder.createdAt}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Département:</span> {selectedOrder.department}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Fournisseur:</span> {selectedOrder.supplier}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Suivi de la commande</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Approuvé par:</span> {selectedOrder.approvedBy}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date d'approbation:</span> {selectedOrder.approvedAt}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Statut d'achat:</span> {getStatusBadge(selectedOrder.purchaseStatus)}
                    </p>
                    {selectedOrder.purchasedAt && (
                      <p className="text-sm">
                        <span className="font-medium">Date d'achat:</span> {selectedOrder.purchasedAt}
                      </p>
                    )}
                    {selectedOrder.purchasedBy && (
                      <p className="text-sm">
                        <span className="font-medium">Acheté par:</span> {selectedOrder.purchasedBy}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Statut de livraison:</span> {getStatusBadge(selectedOrder.deliveryStatus)}
                    </p>
                    {selectedOrder.deliveredAt && (
                      <p className="text-sm">
                        <span className="font-medium">Date de livraison:</span> {selectedOrder.deliveredAt}
                      </p>
                    )}
                    {selectedOrder.receivedBy && (
                      <p className="text-sm">
                        <span className="font-medium">Reçu par:</span> {selectedOrder.receivedBy}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Progression de la commande</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Approuvé</span>
                    <span>Acheté</span>
                    <span>Livré</span>
                    <span>Reçu</span>
                  </div>
                  <Progress value={selectedOrder?.progressPercentage || 0} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {selectedOrder?.progressPercentage || 0}% complété
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Produits commandés</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedOrder?.items || []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit}
                          {item.receivedQuantity > 0 && item.receivedQuantity !== item.quantity && (
                            <div className="text-xs text-muted-foreground">
                              Reçu: {item.receivedQuantity} {item.unit}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {(item.unitPrice || 0).toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right">
                          {(item.total || 0).toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total estimé
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {(selectedOrder?.estimatedTotal || 0).toFixed(2)} €
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    {selectedOrder?.actualTotal && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">
                          Total réel
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {(selectedOrder?.actualTotal || 0).toFixed(2)} €
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {selectedOrder?.validationNote && (
                <div>
                  <h3 className="text-sm font-medium">Note d'approbation</h3>
                  <p className="mt-1 text-sm p-3 bg-gray-50 rounded-md">
                    {selectedOrder?.validationNote || 'Aucune note'}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovedOrdersTracking;
