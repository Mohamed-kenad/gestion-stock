import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { inventoryAPI, stockMovementsAPI, notificationsAPI } from '../../../lib/api';
import { 
  Search, ArrowUpDown, FileText, Package, Check, X, Truck, Users
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const OutgoingOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [sortField, setSortField] = useState('requestDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Fetch inventory data
  const { 
    data: inventory = [], 
    isLoading: inventoryLoading 
  } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryAPI.getAll()
  });
  
  // Fetch vendor requests for products
  const { 
    data: vendorRequests = [], 
    isLoading: requestsLoading,
    error: requestsError,
    refetch
  } = useQuery({
    queryKey: ['vendorOutgoingRequests', statusFilter],
    queryFn: async () => {
      console.log('Fetching vendor orders with status filter:', statusFilter);
      try {
        // Get completed vendor orders from the database
        const orders = await fetch(`${import.meta.env.VITE_API_URL}/orders`).then(res => res.json());
        
        console.log('All orders from API:', orders);
        
        // Filter for vendor orders (case-insensitive)
        const vendorOrders = orders.filter(order => {
          return order.createdByRole && 
                 order.createdByRole.toLowerCase() === 'vendor';
        });
        
        console.log('Filtered vendor orders:', vendorOrders);
        
        // Transform orders to vendor requests format
        return vendorOrders.map(order => ({
          id: order.id,
          vendorName: order.createdBy,
          department: order.department,
          status: order.status,
          requestDate: order.date,
          priority: order.urgency,
          processedBy: order.processedBy,
          completedDate: order.processedAt,
          items: order.items.map(item => ({
            id: item.id,
            productId: item.id,
            name: item.product,
            quantity: item.quantity,
            unit: item.unit,
            fulfilled: item.provide || item.quantity
          }))
        }));
      } catch (error) {
        console.error('Error fetching vendor orders:', error);
        return [];
      }
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });
  
  // Force refetch on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  // Mutation for processing vendor requests
  const processRequestMutation = useMutation({
    mutationFn: async (data) => {
      const { request, action, items, notes } = data;
      
      if (action === 'process') {
        // Process each item in the request
        for (const item of items) {
          if (item.fulfill > 0) {
            // Find the product in inventory
            const product = inventory.find(p => p.id === item.productId);
            
            if (product) {
              // Update inventory quantity
              await inventoryAPI.update(product.id, {
                ...product,
                quantity: Math.max(0, product.quantity - item.fulfill)
              });
              
              // Record stock movement
              await stockMovementsAPI.create({
                productId: product.id,
                product: product.name,
                type: 'out',
                quantity: item.fulfill,
                date: new Date().toISOString(),
                unit: product.unit,
                createdBy: 'Magasin2 Department',
                notes: `Livraison au vendeur ${request.vendorName} (${request.department})`,
                reference: request.id
              });
            }
          }
        }
        
        // Notify the vendor
        await notificationsAPI.create({
          title: `Demande #${request.id} prête`,
          message: `Votre demande de produits est prête à être récupérée au magasin.`,
          type: 'info',
          recipientRole: 'vendor',
          recipientId: request.vendorId,
          reference: request.id,
          createdAt: new Date().toISOString(),
          read: false
        });
      }
      
      if (action === 'cancel') {
        // Notify the vendor
        await notificationsAPI.create({
          title: `Demande #${request.id} annulée`,
          message: `Votre demande de produits a été annulée. Raison: ${notes}`,
          type: 'warning',
          recipientRole: 'vendor',
          recipientId: request.vendorId,
          reference: request.id,
          createdAt: new Date().toISOString(),
          read: false
        });
      }
      
      if (action === 'complete') {
        // Mark the request as completed
        // In a real implementation, this would update the request status in the database
      }
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      const { request, action } = variables;
      
      const actionMessages = {
        'process': 'La demande est en cours de préparation.',
        'cancel': 'La demande a été annulée.',
        'complete': 'La demande a été complétée et livrée.'
      };
      
      toast({
        title: "Demande mise à jour",
        description: actionMessages[action] || "Demande mise à jour avec succès",
        variant: "success"
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['vendorOutgoingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      
      // Reset state
      setSelectedOrder(null);
      setShowProcessDialog(false);
      setNotes('');
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement de la demande.",
        variant: "destructive"
      });
    }
  });
  
  // Filter requests based on search and status
  const filteredRequests = vendorRequests.filter(request => {
    const matchesSearch = 
      request.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates
    if (sortField.includes('Date')) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle priority
    if (sortField === 'priority') {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      aValue = priorityValues[aValue] || 0;
      bValue = priorityValues[bValue] || 0;
    }
    
    // Compare
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Toggle sort
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle opening the process dialog
  const handleOpenProcessDialog = (request) => {
    setSelectedOrder(request);
    setNotes('');
    setShowProcessDialog(true);
  };
  
  // Handle request processing
  const handleProcessRequest = (action) => {
    if (!selectedOrder) return;
    
    const itemsToProcess = selectedOrder.items.map(item => {
      const product = inventory.find(p => p.id === item.productId);
      const availableQuantity = product ? product.quantity : 0;
      
      return {
        ...item,
        fulfill: action === 'process' ? Math.min(item.quantity, availableQuantity) : 0
      };
    });
    
    processRequestMutation.mutate({
      request: selectedOrder,
      items: itemsToProcess,
      action,
      notes
    });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-blue-500',
      processing: 'bg-amber-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };
  
  // Get priority badge color
  const getPriorityBadgeColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-amber-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };
  
  // Get status display text
  const getStatusDisplayText = (status) => {
    const texts = {
      pending: 'En attente',
      processing: 'En préparation',
      completed: 'Complétée',
      cancelled: 'Annulée'
    };
    return texts[status] || status;
  };
  
  // Loading state
  if (requestsLoading || inventoryLoading) {
    return <div className="p-6">Chargement des demandes...</div>;
  }
  
  // Error state
  if (requestsError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {requestsError.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Livraisons aux Vendeurs</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/magasin2">
              <FileText className="mr-2 h-4 w-4" />
              Tableau de Bord
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/magasin2/inventory">
              <Package className="mr-2 h-4 w-4" />
              Inventaire
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="pending" onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">En Attente</TabsTrigger>
          <TabsTrigger value="processing">En Préparation</TabsTrigger>
          <TabsTrigger value="completed">Complétées</TabsTrigger>
          <TabsTrigger value="cancelled">Annulées</TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>
        
        <TabsContent value={statusFilter} className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par ID, vendeur ou département..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Demandes des Vendeurs ({sortedRequests.length})</CardTitle>
              <CardDescription>
                {statusFilter === 'all' ? 'Toutes les demandes' : `Demandes ${getStatusDisplayText(statusFilter).toLowerCase()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedRequests.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">Aucune demande trouvée</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('id')}>
                          ID <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('vendorName')}>
                          Vendeur <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('department')}>
                          Département <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('requestDate')}>
                          Date <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('priority')}>
                          Priorité <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>{request.vendorName}</TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeColor(request.priority)}>
                            {request.priority === 'high' ? 'Haute' : 
                             request.priority === 'medium' ? 'Moyenne' : 
                             'Basse'}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.items.length}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(request.status)}>
                            {getStatusDisplayText(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm"
                            variant={request.status === 'pending' ? 'default' : 'outline'}
                            onClick={() => handleOpenProcessDialog(request)}
                          >
                            {request.status === 'pending' ? 'Traiter' : 'Détails'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Process Request Dialog */}
      {selectedOrder && (
        <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedOrder.status === 'pending' 
                  ? 'Traiter la Demande' 
                  : 'Détails de la Demande'}
              </DialogTitle>
              <DialogDescription>
                Demande #{selectedOrder.id} - {selectedOrder.vendorName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vendeur</p>
                  <p className="font-medium">{selectedOrder.vendorName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Département</p>
                  <p className="font-medium">{selectedOrder.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de Demande</p>
                  <p className="font-medium">{new Date(selectedOrder.requestDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priorité</p>
                  <Badge className={getPriorityBadgeColor(selectedOrder.priority)}>
                    {selectedOrder.priority === 'high' ? 'Haute' : 
                     selectedOrder.priority === 'medium' ? 'Moyenne' : 
                     'Basse'}
                  </Badge>
                </div>
                
                {selectedOrder.processedBy && (
                  <div>
                    <p className="text-sm text-muted-foreground">Traité par</p>
                    <p className="font-medium">{selectedOrder.processedBy}</p>
                  </div>
                )}
                
                {selectedOrder.completedDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date de Complétion</p>
                    <p className="font-medium">{new Date(selectedOrder.completedDate).toLocaleDateString()}</p>
                  </div>
                )}
                
                {selectedOrder.cancelledDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date d'Annulation</p>
                    <p className="font-medium">{new Date(selectedOrder.cancelledDate).toLocaleDateString()}</p>
                  </div>
                )}
                
                {selectedOrder.cancellationReason && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Raison d'Annulation</p>
                    <p className="font-medium">{selectedOrder.cancellationReason}</p>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Articles Demandés</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Quantité</TableHead>
                      {selectedOrder.status === 'completed' && (
                        <TableHead>Quantité Fournie</TableHead>
                      )}
                      {selectedOrder.status === 'pending' && (
                        <TableHead>Disponible</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map(item => {
                      const product = inventory.find(p => p.id === item.productId);
                      const availableQuantity = product ? product.quantity : 0;
                      const canFulfill = availableQuantity >= item.quantity;
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          
                          {selectedOrder.status === 'completed' && (
                            <TableCell>{item.fulfilled || item.quantity} {item.unit}</TableCell>
                          )}
                          
                          {selectedOrder.status === 'pending' && (
                            <TableCell>
                              {availableQuantity} {item.unit}
                              {!canFulfill && (
                                <Badge className="ml-2 bg-amber-500">Insuffisant</Badge>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {selectedOrder.status === 'pending' && (
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Notes</label>
                  <Textarea
                    placeholder="Ajoutez des notes concernant cette demande..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              {selectedOrder.status === 'pending' ? (
                <>
                  <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                    Fermer
                  </Button>
                  <Button variant="destructive" onClick={() => handleProcessRequest('cancel')}>
                    <X className="mr-2 h-4 w-4" />
                    Annuler Demande
                  </Button>
                  <Button onClick={() => handleProcessRequest('process')}>
                    <Truck className="mr-2 h-4 w-4" />
                    Préparer Commande
                  </Button>
                </>
              ) : selectedOrder.status === 'processing' ? (
                <>
                  <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                    Fermer
                  </Button>
                  <Button onClick={() => handleProcessRequest('complete')}>
                    <Check className="mr-2 h-4 w-4" />
                    Marquer comme Livrée
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowProcessDialog(false)}>
                  Fermer
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OutgoingOrders;
