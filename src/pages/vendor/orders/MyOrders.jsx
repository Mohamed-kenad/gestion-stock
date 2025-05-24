import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, FileText, Eye, Clock, CheckCircle2, 
  XCircle, AlertTriangle, Calendar, Download, Printer, Edit, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

const MyOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Mock user ID - in a real app, this would come from authentication context
  const userId = 2; // Using the vendor user ID from db.json
  
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // We'll define pagination after we have filteredOrders
  
  // Download order mutation
  const downloadOrderMutation = useMutation({
    mutationFn: (orderId) => ordersAPI.download(orderId),
    onSuccess: (data) => {
      // Handle download success
      toast({
        title: "Téléchargement réussi",
        description: "Le bon de commande a été téléchargé avec succès."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors du téléchargement: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
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
  
  // Filter orders created by this vendor
  const myOrders = orders.filter(order => {
    // Check for numeric userId match
    const userIdMatch = order.userId === userId;
    
    // Check for string createdBy match ("Vendor User")
    const createdByMatch = order.createdBy === "Vendor User";
    
    // Check for vendorId match if it exists
    const vendorIdMatch = order.vendorId === userId;
    
    return userIdMatch || createdByMatch || vendorIdMatch;
  });
  
  // Filter orders based on search, status, date, and department
  const filteredOrders = myOrders.filter(order => {
    const matchesSearch = 
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.title && order.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesDate = dateFilter === '' || order.createdAt === dateFilter || order.date === dateFilter;
    const matchesDepartment = departmentFilter === 'all' || order.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDate && matchesDepartment;
  });
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Get unique departments for filter
  const departments = [...new Set(myOrders.map(order => order.department).filter(Boolean))];
  
  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  
  // Handle print order
  const handlePrintOrder = (orderId) => {
    // Logic to print order - would typically open a print dialog with formatted content
    window.print();
    toast({
      title: "Impression",
      description: `Impression du bon de commande #${orderId}`,
    });
  };
  
  // Handle download order
  const handleDownloadOrder = (orderId) => {
    // Use the mutation to download the order
    downloadOrderMutation.mutate(orderId);
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approuvé</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">En traitement</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Livré</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  // Get urgency badge
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Haute</Badge>;
      case 'critical':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critique</Badge>;
      default:
        return <Badge variant="outline">Inconnue</Badge>;
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes bons de commande</h1>
          <p className="text-muted-foreground">
            Consultez et gérez vos bons de commande
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/vendor/orders/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau bon
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
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="processing">En traitement</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les dates</SelectItem>
                {orders.map((order) => (
                  <SelectItem key={order.id} value={order.createdAt || order.date}>
                    {order.createdAt || order.date}
                  </SelectItem>
                ))}
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
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des bons de commande</CardTitle>
          <CardDescription>
            {filteredOrders.length} bons de commande trouvés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                        <p>Chargement des bons de commande...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : ordersError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-red-500">
                        <AlertTriangle className="h-12 w-12 mb-2" />
                        <p>Erreur lors du chargement des bons de commande</p>
                        <p className="text-sm">{ordersError.message}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FileText className="h-12 w-12 mb-2" />
                        <p>Aucun bon de commande trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.title || 'Bon de commande'}</TableCell>
                      <TableCell>{order.createdAt || order.date}</TableCell>
                      <TableCell>
                        <Badge className={`
                          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                          ${order.status === 'approved' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                          ${order.status === 'rejected' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                          ${order.status === 'purchased' || order.status === 'received' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                        `}>
                          {order.status === 'pending' ? 'En attente' : 
                           order.status === 'approved' ? 'Approuvé' : 
                           order.status === 'rejected' ? 'Rejeté' : 
                           order.status === 'received' ? 'Reçu' : 'Acheté'}
                        </Badge>
                      </TableCell>
                      <TableCell>{(order.total || 0).toFixed(2)} DH</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                          {order.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/dashboard/vendor/orders/edit/${order.id}`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )} 
              </TableBody>
            </Table>
          </div>
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Informations</TabsTrigger>
                <TabsTrigger value="products">Produits</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
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
                  
                  {selectedOrder.status === 'approved' && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Approuvé par</h4>
                        <p className="text-base">{selectedOrder.approvedBy}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Date d'approbation</h4>
                        <p className="text-base">{selectedOrder.approvedAt}</p>
                      </div>
                    </>
                  )}
                  
                  {selectedOrder.status === 'rejected' && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Rejeté par</h4>
                        <p className="text-base">{selectedOrder.rejectedBy}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Date de rejet</h4>
                        <p className="text-base">{selectedOrder.rejectedAt}</p>
                      </div>
                    </>
                  )}
                  
                  {selectedOrder.status === 'delivered' && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Date de livraison</h4>
                      <p className="text-base">{selectedOrder.deliveredAt}</p>
                    </div>
                  )}
                  
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Montant total</h4>
                    <p className="text-xl font-bold">{(selectedOrder.total || 0).toFixed(2)} DH</p>
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
                    {(selectedOrder.items || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-center">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">{(item.price || 0).toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">{((item.price || 0) * (item.quantity || 0)).toFixed(2)} DH</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">{(selectedOrder.total || 0).toFixed(2)} DH</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="history" className="pt-4">
                {(!selectedOrder.comments || selectedOrder.comments.length === 0) ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Aucun commentaire</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Aucun commentaire n'a été ajouté à ce bon de commande
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(selectedOrder.comments || []).map((comment, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{comment.author}</div>
                          <div className="text-sm text-muted-foreground">{comment.date}</div>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
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

export default MyOrders;
