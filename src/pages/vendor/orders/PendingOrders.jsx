import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Clock, Eye, AlertTriangle, Calendar, 
  User, Building, FileText, Download, Printer, CheckCircle2, XCircle,
  Loader2
} from 'lucide-react';
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useToast } from "../../../components/ui/use-toast";
import { Progress } from "../../../components/ui/progress";
import { Skeleton } from "../../../components/ui/skeleton";

const PendingOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock user ID - in a real app, this would come from authentication context
  const userId = 1; // Assuming vendor has ID 1
  
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // Fetch orders using React Query
  const { 
    data: orders = [], 
    isLoading: ordersLoading,
    error: ordersError
  } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersAPI.getAll,
    // Prevent error from being thrown to the console
    onError: () => {
      // Silent error handling - the API will return mock data
    },
    // Don't retry failed requests
    retry: false
  });
  
  // Download order mutation
  const downloadMutation = useMutation({
    mutationFn: ordersAPI.download,
    onSuccess: () => {
      toast({
        title: "Téléchargement réussi",
        description: "Le bon de commande a été téléchargé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur de téléchargement",
        description: error.message || "Une erreur s'est produite lors du téléchargement.",
        variant: "destructive",
      });
    }
  });
  
  // Filter orders by pending status and created by this vendor
  const pendingOrders = orders.filter(order => 
    (order.status === 'pending' || order.status === 'in_review') && 
    (order.createdBy === userId || order.vendorId === userId)
  );
  
  // Apply additional filters
  const filteredOrders = pendingOrders.filter(order => {
    const matchesSearch = order.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || order.department === departmentFilter;
    const matchesUrgency = urgencyFilter === 'all' || order.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesUrgency && matchesStatus;
  });
  
  // Sort orders by urgency and date
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // First sort by urgency (high > normal > low)
    const urgencyOrder = { high: 0, normal: 1, low: 2 };
    const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    
    // Then sort by date (oldest first)
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  
  // Calculate waiting time progress (0-100)
  const calculateWaitingProgress = (days) => {
    if (days <= 0) return 0;
    if (days >= 7) return 100;
    return Math.round((days / 7) * 100);
  };
  
  // Calculate waiting days from date
  const calculateWaitingDays = (dateString) => {
    const orderDate = new Date(dateString);
    const today = new Date();
    const diffTime = today - orderDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Get urgency badge
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'high':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Normal</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Faible</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  // Get departments from orders
  const departments = [...new Set(pendingOrders.map(order => order.department))];
  
  // Get urgency levels
  const urgencyLevels = ['low', 'normal', 'high'];
  
  // Pagination
  const ordersPerPage = 10;
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  
  // Handle print order
  const handlePrintOrder = (orderId) => {
    // In a real app, this would trigger a print dialog
    toast({
      title: "Impression en cours",
      description: `Le bon de commande ${orderId} est en cours d'impression.`,
    });
  };
  
  // Handle download order
  const handleDownloadOrder = (orderId) => {
    downloadMutation.mutate(orderId);
  };
  
  // Loading and error states
  if (ordersLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bons de commande en attente</h1>
          <Button onClick={() => navigate('/dashboard/vendor/orders/create')}>
            Créer un bon de commande
          </Button>
        </div>
        <div className="space-y-4">
          {Array(5).fill(0).map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (ordersError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bons de commande en attente</h1>
          <Button onClick={() => navigate('/dashboard/vendor/orders/create')}>
            Créer un bon de commande
          </Button>
        </div>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-xl font-medium">Erreur lors du chargement des bons de commande</h3>
            <p className="text-muted-foreground mt-2">
              {ordersError.message || "Une erreur s'est produite lors du chargement des données."}
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bons de commande en attente</h1>
        <Button onClick={() => navigate('/dashboard/vendor/orders/create')}>
          Créer un bon de commande
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un bon de commande..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in_review">En cours de validation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les départements</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Urgence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les urgences</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="normal">Normale</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des bons en attente</CardTitle>
          <CardDescription>
            {filteredOrders.length} bons de commande en attente de validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Aucun bon en attente</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tous vos bons de commande ont été traités
              </p>
              <Button className="mt-4" onClick={() => navigate('/dashboard/vendor/orders/create')}>
                <FileText className="h-4 w-4 mr-2" />
                Créer un nouveau bon
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Urgence</TableHead>
                    <TableHead>Attente</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                          <p>Chargement des bons de commande...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : ordersError ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-red-500">
                          <AlertTriangle className="h-12 w-12 mb-2" />
                          <p>Erreur lors du chargement des bons de commande</p>
                          <p className="text-sm">{ordersError.message}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <FileText className="h-12 w-12 mb-2" />
                          <p>Aucun bon de commande en attente</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.title || 'Bon de commande'}</TableCell>
                        <TableCell>{order.department}</TableCell>
                        <TableCell>{order.createdAt || order.date}</TableCell>
                        <TableCell>{getUrgencyBadge(order.urgency || 'normal')}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Progress 
                              value={getWaitingProgress(order.waitingTime || calculateWaitingDays(order.createdAt || order.date))} 
                              className="h-2 w-24 mr-2" 
                            />
                            <span className="text-sm">
                              {order.waitingTime || calculateWaitingDays(order.createdAt || order.date)} 
                              jour{(order.waitingTime || calculateWaitingDays(order.createdAt || order.date)) > 1 ? 's' : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handlePrintOrder(order.id)}>
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadOrder(order.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>Détails du bon de commande</DialogTitle>
              <DialogDescription>
                Référence: {selectedOrder.id}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Informations</TabsTrigger>
                <TabsTrigger value="products">Produits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Titre</h4>
                    <p className="text-base">{selectedOrder.title}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Département</h4>
                    <p className="text-base">{selectedOrder.department}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Date de création</h4>
                    <p className="text-base">{selectedOrder.createdAt}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Créé par</h4>
                    <p className="text-base">{selectedOrder.createdBy}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Statut</h4>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Urgence</h4>
                    <div className="mt-1">{getUrgencyBadge(selectedOrder.urgency)}</div>
                  </div>
                  
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Progression de la validation</h4>
                    <div className="mt-2">
                      <Progress value={selectedOrder.status === 'in_review' ? selectedOrder.progress : 0} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Soumis</span>
                        <span>En cours de validation</span>
                        <span>Validé</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Temps d'attente</h4>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {selectedOrder.waitingTime === 0 
                          ? "Soumis aujourd'hui" 
                          : selectedOrder.waitingTime === 1 
                            ? "En attente depuis 1 jour" 
                            : `En attente depuis ${selectedOrder.waitingTime} jours`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Montant total</h4>
                    <p className="text-xl font-bold">{selectedOrder.total.toFixed(2)} DH</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-center">Quantité</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-center">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">{item.price.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">{(item.price * item.quantity).toFixed(2)} DH</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">{selectedOrder.total.toFixed(2)} DH</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handlePrintOrder(selectedOrder.id)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button variant="outline" onClick={() => handleDownloadOrder(selectedOrder.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
              <Button variant="outline" onClick={() => setShowOrderDetails(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PendingOrders;
