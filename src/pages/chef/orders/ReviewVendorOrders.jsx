import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";

const ReviewVendorOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
    queryKey: ['orders'],
    queryFn: () => ordersAPI.getAll(),
    select: (data) => data.filter(order => 
      order.createdByRole === 'Vendor' && 
      (statusFilter === 'all' ? true : order.status === statusFilter)
    ),
    staleTime: 10000, // 10 seconds for more frequent updates during testing
    refetchOnWindowFocus: true, // Refresh when window gains focus
  });
  
  // Log orders for debugging
  useEffect(() => {
    console.log('Pending orders for review:', orders);
  }, [orders]);
  
  // Import useNavigate from react-router-dom
  const navigate = useNavigate();
  
  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: (orderData) => ordersAPI.update(orderData.id, orderData),
    onSuccess: (data, variables) => {
      console.log('Order updated successfully:', variables);
      
      // Invalidate all relevant queries to ensure data is refreshed everywhere
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['decisionHistory'] });
      queryClient.invalidateQueries({ queryKey: ['approvedOrdersTracking'] });
      
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
      queryClient.refetchQueries({ queryKey: ['decisionHistory'] });
      queryClient.refetchQueries({ queryKey: ['approvedOrdersTracking'] });
      
      // Navigate to the appropriate page based on the action
      setTimeout(() => {
        if (variables.status === 'approved') {
          navigate('/dashboard/chef/orders/tracking');
        } else {
          navigate('/dashboard/chef/orders/history');
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
        description: "Veuillez ajouter une note de validation.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Define chef name and current date
      const chefName = 'Chef Karim'; // Would come from auth context in a real app
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Prepare updated items with approval status and adjusted quantities
      const updatedItems = reviewItems.map(item => ({
        ...item,
        quantity: item.approved ? item.adjustedQuantity : 0,
        status: item.approved ? 'approved' : 'rejected'
      }));

      // Calculate new total based on approved items
      const newTotal = calculateTotal();
      
      // Create updated order with all necessary fields for tracking
      const updatedOrder = {
        ...selectedOrder,
        status: 'approved',
        approvedBy: chefName,
        approvedAt: currentDate,
        reviewDate: currentDate,
        reviewedBy: chefName,
        reviewComment: validationNote || 'Approuvé',
        reviewAction: 'approve',
        validationNote: validationNote || 'Approuvé',
        items: updatedItems,
        total: newTotal,
        purchaseStatus: 'pending',
        deliveryStatus: 'pending',
        progressPercentage: 25 // Order is 25% complete after chef approval
      };

      console.log('Approving order with data:', updatedOrder);

      // Update the order
      await updateOrderMutation.mutateAsync(updatedOrder);
      
      // Force refresh all related queries
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['decisionHistory']);
      queryClient.invalidateQueries(['approvedOrdersTracking']);

      // Send notification to Purchase Manager
      await sendNotificationMutation.mutateAsync({
        title: 'Nouveau bon approuvé',
        message: `Le bon "${updatedOrder.title}" a été approuvé et est prêt pour achat.`,
        type: 'approved_order',
        recipientId: '4', // Purchase Manager role ID
        orderId: updatedOrder.id,
        date: currentDate,
        read: false,
        priority: 'high'
      });
      
      // Show success toast
      toast({
        title: "Bon approuvé",
        description: "Le bon de commande a été approuvé avec succès.",
      });

    } catch (error) {
      console.error('Error approving order:', error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Handle reject order
  const handleRejectOrder = async () => {
    if (!validationNote) {
      toast({
        title: "Note requise",
        description: "Veuillez ajouter une note de rejet.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Define chef name and current date
      const chefName = 'Chef Karim'; // Would come from auth context in a real app
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Update order status and details with all necessary fields for decision history
      const updatedOrder = {
        ...selectedOrder,
        status: 'rejected',
        rejectedBy: chefName,
        rejectedAt: currentDate,
        reviewDate: currentDate,
        reviewedBy: chefName,
        reviewComment: validationNote,
        reviewAction: 'reject',
        validationNote: validationNote,
        progressPercentage: 0 // Reset progress since order is rejected
      };

      console.log('Rejecting order with data:', updatedOrder);

      // Update the order
      await updateOrderMutation.mutateAsync(updatedOrder);
      
      // Force refresh all related queries
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['decisionHistory']);
      queryClient.invalidateQueries(['approvedOrdersTracking']);

      // Send notification to the Vendor who created the order
      await sendNotificationMutation.mutateAsync({
        title: 'Bon rejeté',
        message: `Le bon "${updatedOrder.title}" a été rejeté. Raison: ${validationNote}`,
        type: 'rejected_order',
        recipientId: selectedOrder.userId.toString(), // Vendor user ID
        orderId: updatedOrder.id,
        date: currentDate,
        read: false,
        priority: 'high'
      });
      
      // Show success toast
      toast({
        title: "Bon rejeté",
        description: "Le bon de commande a été rejeté avec succès.",
      });

    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Filter orders based on search term, filters, and date range
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (order.title && order.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.createdBy && order.createdBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.supplier && order.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = !departmentFilter || order.department === departmentFilter;
    
    // Date filtering
    let matchesDate = true;
    if (dateRange.from && dateRange.to && order.createdAt) {
      const orderDate = new Date(order.createdAt);
      matchesDate = orderDate >= dateRange.from && orderDate <= dateRange.to;
    }
    
    return matchesSearch && matchesDepartment && matchesDate;
  });
  
  // Get unique departments for filters
  const departments = [...new Set(orders.map(order => order.department).filter(Boolean))];
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Révision des bons</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {
            console.log('Refreshing orders...');
            refetchOrders();
            queryClient.invalidateQueries(['orders']);
            queryClient.invalidateQueries(['decisionHistory']);
            queryClient.invalidateQueries(['approvedOrdersTracking']);
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Filtrer les bons à réviser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="department">Département</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
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
            
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Date de création</Label>
              <DatePickerWithRange
                date={dateRange}
                setDate={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Bons à réviser</CardTitle>
          <CardDescription>
            {filteredOrders.length} bon(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Chargement des bons...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>Aucun bon trouvé</p>
            </div>
          ) : (
            <div className="rounded-md border">
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
                      <TableCell>{order.createdAt ? format(new Date(order.createdAt), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                      <TableCell>
                        {order.status === 'pending' && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            En attente
                          </Badge>
                        )}
                        {order.status === 'approved' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Approuvé
                          </Badge>
                        )}
                        {order.status === 'rejected' && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Rejeté
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{order.total?.toFixed(2) || 0} DH</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          {order.status === 'pending' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleOpenReviewDialog(order)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Réviser
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredOrders.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.max(1, currentPage - 1));
                      }} 
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.min(totalPages, currentPage + 1));
                      }} 
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du bon</DialogTitle>
            <DialogDescription>
              Référence: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Titre</h3>
                  <p>{selectedOrder.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Département</h3>
                  <p>{selectedOrder.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Créé par</h3>
                  <p>{selectedOrder.createdBy} ({selectedOrder.createdByRole})</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                  <p>{selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy') : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                  <p>
                    {selectedOrder.status === 'pending' && 'En attente'}
                    {selectedOrder.status === 'approved' && 'Approuvé'}
                    {selectedOrder.status === 'rejected' && 'Rejeté'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total</h3>
                  <p>{selectedOrder.total?.toFixed(2) || 0} DH</p>
                </div>
              </div>
              
              {selectedOrder.validationNote && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Note de validation</h3>
                  <p className="p-2 bg-gray-50 rounded">{selectedOrder.validationNote}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Articles</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>Prix unitaire</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items && selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product || item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.price || item.unitPrice} DH</TableCell>
                          <TableCell>{item.total?.toFixed(2) || 0} DH</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Review Order Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Réviser le bon</DialogTitle>
            <DialogDescription>
              Référence: {selectedOrder?.id} - {selectedOrder?.title}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Département</h3>
                    <p>{selectedOrder.department}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Créé par</h3>
                    <p>{selectedOrder.createdBy} ({selectedOrder.createdByRole})</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                    <p>{selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy') : 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total initial</h3>
                    <p>{selectedOrder.total?.toFixed(2) || 0} DH</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Articles à réviser</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Quantité demandée</TableHead>
                          <TableHead>Quantité approuvée</TableHead>
                          <TableHead>Prix unitaire</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Approuver</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviewItems.map((item, index) => (
                          <TableRow key={index} className={!item.approved ? "bg-red-50" : ""}>
                            <TableCell>{item.product || item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                value={item.adjustedQuantity}
                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                disabled={!item.approved}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>{item.price || item.unitPrice} DH</TableCell>
                            <TableCell>
                              {item.approved 
                                ? ((item.price || item.unitPrice) * item.adjustedQuantity).toFixed(2) 
                                : 0} DH
                            </TableCell>
                            <TableCell>
                              <Button
                                variant={item.approved ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleItemApprovalToggle(index)}
                              >
                                {item.approved ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approuvé
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-1" />
                                    Rejeté
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total après révision</h3>
                  <p className="text-lg font-bold">{calculateTotal().toFixed(2)} DH</p>
                </div>
                
                <div>
                  <Label htmlFor="validationNote">Note de validation</Label>
                  <Textarea
                    id="validationNote"
                    placeholder="Ajoutez une note de validation ou de rejet..."
                    value={validationNote}
                    onChange={(e) => setValidationNote(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="flex justify-between">
            <div>
              <Button variant="destructive" onClick={handleRejectOrder}>
                <X className="h-4 w-4 mr-1" />
                Rejeter le bon
              </Button>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="default" onClick={handleApproveOrder}>
                <CheckCircle className="h-4 w-4 mr-1" />
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
