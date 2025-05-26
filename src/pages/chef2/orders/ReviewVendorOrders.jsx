import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ordersAPI, notificationsAPI } from '../../../lib/api';
import { 
  FileText, Search, Filter, Calendar, Eye, CheckCircle, X, AlertTriangle, RefreshCw
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";

const ReviewVendorOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [validationNote, setValidationNote] = useState('');
  const [reviewItems, setReviewItems] = useState([]);
  
  // Fetch orders using React Query
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError,
    refetch: refetchOrders 
  } = useQuery({
    queryKey: ['orders', statusFilter, departmentFilter, dateRange],
    queryFn: () => ordersAPI.getAll(),
    select: (data) => {
      // Filter orders based on criteria
      return data.filter(order => {
        // Filter by status
        const statusMatch = statusFilter === 'all' ? true : order.status === statusFilter;
        
        // Filter by department if specified
        const departmentMatch = !departmentFilter || order.department === departmentFilter;
        
        // Filter by date range
        const orderDate = new Date(order.createdAt);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;
        const dateMatch = (!fromDate || orderDate >= fromDate) && 
                          (!toDate || orderDate <= toDate);
        
        // Filter by search term
        const searchMatch = !searchTerm || 
          order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.createdBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Only show orders created by vendors
        const roleMatch = order.createdByRole === 'Vendor';
        
        return statusMatch && departmentMatch && dateMatch && searchMatch && roleMatch;
      });
    },
    staleTime: 10000,
  });
  
  // Import useNavigate from react-router-dom
  const navigate = useNavigate();
  
  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: (orderData) => ordersAPI.update(orderData.id, orderData),
    onSuccess: (data, variables) => {
      // Invalidate all relevant queries to ensure data is refreshed everywhere
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Show success message based on the action taken
      const action = variables.status === 'approved' ? 'approuvé' : 'rejeté';
      toast({
        title: `Bon ${action}`,
        description: `Le bon a été ${action} avec succès.`,
      });
      
      // Reset UI state
      setReviewDialogOpen(false);
      setValidationNote('');
      setReviewItems([]);
      
      // Force refresh all queries immediately
      queryClient.refetchQueries({ queryKey: ['orders'] });
      
      // Navigate to the appropriate page based on the action
      setTimeout(() => {
        if (variables.status === 'approved') {
          navigate('/dashboard/chef2/orders/tracking');
        } else {
          navigate('/dashboard/chef2/orders/history');
        }
      }, 1000);
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: (notificationData) => notificationsAPI.create(notificationData),
    onSuccess: () => {
      console.log('Notification sent successfully');
    },
    onError: (error) => {
      console.error('Error sending notification:', error);
    }
  });

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  // Handle opening review dialog
  const handleOpenReviewDialog = (order) => {
    setSelectedOrder(order);
    
    // Initialize review items from order items
    if (order.items && Array.isArray(order.items)) {
      const initialItems = order.items.map(item => ({
        ...item,
        approved: true,
        adjustedQuantity: item.quantity
      }));
      setReviewItems(initialItems);
    }
    
    setReviewDialogOpen(true);
  };

  // Handle item approval toggle
  const handleItemApprovalToggle = (index) => {
    const updatedItems = [...reviewItems];
    updatedItems[index].approved = !updatedItems[index].approved;
    setReviewItems(updatedItems);
  };

  // Handle quantity adjustment
  const handleQuantityChange = (index, value) => {
    const updatedItems = [...reviewItems];
    updatedItems[index].adjustedQuantity = parseInt(value) || 0;
    setReviewItems(updatedItems);
  };

  // Calculate total based on approved items and adjusted quantities
  const calculateTotal = () => {
    return reviewItems
      .filter(item => item.approved)
      .reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.adjustedQuantity || 0;
        return total + (price * quantity);
      }, 0);
  };

  // Handle approve order
  const handleApproveOrder = async () => {
    if (!validationNote) {
      toast({
        title: "Note requise",
        description: "Veuillez ajouter une note de validation avant d'approuver le bon.",
        variant: "destructive",
      });
      return;
    }
    
    // Get only approved items with adjusted quantities
    const approvedItems = reviewItems
      .filter(item => item.approved)
      .map(item => ({
        ...item,
        quantity: item.adjustedQuantity
      }));
    
    if (approvedItems.length === 0) {
      toast({
        title: "Aucun article approuvé",
        description: "Vous devez approuver au moins un article pour valider le bon.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate new total
    const newTotal = calculateTotal();
    
    // Create updated order object
    const updatedOrder = {
      ...selectedOrder,
      status: 'approved',
      approvedBy: user.name,
      approvedAt: new Date().toISOString(),
      items: approvedItems,
      total: newTotal,
      comments: [
        ...(selectedOrder.comments || []),
        {
          author: user.name,
          date: new Date().toISOString(),
          text: validationNote
        }
      ]
    };
    
    // Submit the update
    updateOrderMutation.mutate(updatedOrder);
    
    // Send notification to purchase department
    sendNotificationMutation.mutate({
      id: `notif-${Date.now()}`,
      title: "Nouveau bon approuvé",
      message: `Un bon de commande (${selectedOrder.id}) a été approuvé par ${user.name} et nécessite votre attention.`,
      type: "order_approved",
      recipientRole: "purchase",
      read: false,
      createdAt: new Date().toISOString(),
      reference: selectedOrder.id
    });
    
    // Send notification to vendor
    sendNotificationMutation.mutate({
      id: `notif-vendor-${Date.now()}`,
      title: "Bon approuvé",
      message: `Votre bon de commande (${selectedOrder.id}) a été approuvé par le chef de département.`,
      type: "order_status_change",
      recipientRole: "vendor",
      recipientId: selectedOrder.userId,
      read: false,
      createdAt: new Date().toISOString(),
      reference: selectedOrder.id
    });
  };

  // Handle reject order
  const handleRejectOrder = async () => {
    if (!validationNote) {
      toast({
        title: "Note requise",
        description: "Veuillez ajouter une note explicative avant de rejeter le bon.",
        variant: "destructive",
      });
      return;
    }
    
    // Create updated order object
    const updatedOrder = {
      ...selectedOrder,
      status: 'rejected',
      rejectedBy: user.name,
      rejectedAt: new Date().toISOString(),
      comments: [
        ...(selectedOrder.comments || []),
        {
          author: user.name,
          date: new Date().toISOString(),
          text: validationNote
        }
      ]
    };
    
    // Submit the update
    updateOrderMutation.mutate(updatedOrder);
    
    // Send notification to vendor
    sendNotificationMutation.mutate({
      id: `notif-vendor-${Date.now()}`,
      title: "Bon rejeté",
      message: `Votre bon de commande (${selectedOrder.id}) a été rejeté par le chef de département.`,
      type: "order_status_change",
      recipientRole: "vendor",
      recipientId: selectedOrder.userId,
      read: false,
      createdAt: new Date().toISOString(),
      reference: selectedOrder.id
    });
  };

  // Get unique departments for filter
  const departments = [...new Set(orders.map(order => order.department).filter(Boolean))];

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Examiner les bons des vendeurs</h1>
          <p className="text-muted-foreground">
            Examinez et approuvez ou rejetez les bons envoyés par les vendeurs pour votre département.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchOrders()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Filtrez les bons par statut, département, date ou recherchez par mot-clé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Tous les départements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les départements</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Période</Label>
              <DatePickerWithRange
                date={dateRange}
                setDate={setDateRange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="search"
                  placeholder="Rechercher un bon..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Bons à examiner</CardTitle>
          <CardDescription>
            {orders.length} bon(s) trouvé(s) correspondant aux critères
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <p>Chargement des bons...</p>
            </div>
          ) : ordersError ? (
            <div className="flex justify-center py-8 text-red-500">
              <p>Erreur lors du chargement des bons: {ordersError.message}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">
                Aucun bon trouvé correspondant aux critères de recherche
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Créé par</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.title}</TableCell>
                      <TableCell>{order.createdBy}</TableCell>
                      <TableCell>{order.department}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'approved' ? 'success' :
                            order.status === 'rejected' ? 'destructive' :
                            'outline'
                          }
                        >
                          {order.status === 'approved' ? 'Approuvé' :
                           order.status === 'rejected' ? 'Rejeté' :
                           'En attente'}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.total?.toFixed(2)} DH</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReviewDialog(order)}
                            >
                              Examiner
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="mx-4 flex items-center text-sm text-muted-foreground">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto sm:max-h-[90vh] md:max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Détails du bon</DialogTitle>
            <DialogDescription>
              Référence: {selectedOrder?.id} • Créé le: {selectedOrder?.createdAt && new Date(selectedOrder.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Créé par</h4>
                  <p>{selectedOrder.createdBy}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Département</h4>
                  <p>{selectedOrder.department}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Fournisseur</h4>
                  <p>{selectedOrder.supplier}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Titre</h4>
                <p className="font-medium">{selectedOrder.title}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Articles</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="text-right">{item.price?.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">{item.total?.toFixed(2)} DH</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-2 text-right">
                  <span className="font-medium">Total: {selectedOrder.total?.toFixed(2)} DH</span>
                </div>
              </div>
              
              {selectedOrder.comments && selectedOrder.comments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Commentaires</h4>
                  <ScrollArea className="max-h-32">
                    <ul className="space-y-2">
                      {selectedOrder.comments.map((comment, index) => (
                        <li key={index} className="rounded-md border p-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p>{comment.text}</p>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="w-full sm:w-auto">
              Fermer
            </Button>
            {selectedOrder?.status === 'pending' && (
              <Button onClick={() => {
                setViewDialogOpen(false);
                handleOpenReviewDialog(selectedOrder);
              }}>
                Examiner
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Review Order Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto sm:max-h-[90vh] md:max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Examiner le bon</DialogTitle>
            <DialogDescription>
              Référence: {selectedOrder?.id} • Département: {selectedOrder?.department}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Articles à examiner</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Vous pouvez ajuster les quantités ou désélectionner des articles
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Approuver</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Quantité demandée</TableHead>
                      <TableHead className="text-right">Quantité approuvée</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={item.approved}
                            onChange={() => handleItemApprovalToggle(index)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>{item.product}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="1"
                            value={item.adjustedQuantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            disabled={!item.approved}
                            className="w-20 text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right">{item.price?.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">
                          {item.approved ? (item.price * item.adjustedQuantity).toFixed(2) : '0.00'} DH
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-2 text-right">
                  <span className="font-medium">
                    Total approuvé: {calculateTotal().toFixed(2)} DH
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="validationNote">Note de validation</Label>
                <Textarea
                  id="validationNote"
                  placeholder="Ajoutez une note ou un commentaire concernant votre décision..."
                  value={validationNote}
                  onChange={(e) => setValidationNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <Button
              variant="destructive"
              onClick={handleRejectOrder}
              disabled={!validationNote}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <X className="mr-2 h-4 w-4" />
              Rejeter le bon
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 w-full sm:w-auto order-1 sm:order-2">
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)} className="w-full sm:w-auto">
                Annuler
              </Button>
              <Button
                variant="default"
                onClick={handleApproveOrder}
                disabled={!validationNote || reviewItems.filter(item => item.approved).length === 0}
                className="w-full sm:w-auto"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approuver le bon
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewVendorOrders;
