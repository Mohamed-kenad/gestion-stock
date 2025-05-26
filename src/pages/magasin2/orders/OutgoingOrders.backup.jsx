import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { inventoryAPI, stockMovementsAPI, ordersAPI } from '../../../lib/api';
import { 
  Search, ArrowUpDown, FileText, Package, Check, X, Truck, ShoppingCart
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
  const [sortField, setSortField] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [itemAvailability, setItemAvailability] = useState({});
  const [notes, setNotes] = useState('');
  
  // Fetch inventory data
  const { 
    data: inventory = [], 
    isLoading: inventoryLoading 
  } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryAPI.getAll()
  });
  
  // Fetch outgoing orders
  const { 
    data: orders = [], 
    isLoading: ordersLoading,
    error: ordersError
  } = useQuery({
    queryKey: ['outgoingOrders'],
    queryFn: () => {
      // Mock data for demonstration
      return Promise.resolve([
        { 
          id: 'ORD-2025-001', 
          customerName: 'Restaurant Le Gourmet', 
          status: 'pending', 
          orderDate: '2025-05-24',
          total: 1250.50,
          shippingAddress: '123 Avenue Mohammed V, Marrakech',
          phone: '+212 661-234567',
          items: [
            { id: 1, productId: 1, name: 'Riz Basmati', quantity: 10, unit: 'kg', price: 75.50 },
            { id: 2, productId: 2, name: 'Huile d\'Olive', quantity: 5, unit: 'L', price: 95.00 }
          ]
        },
        { 
          id: 'ORD-2025-002', 
          customerName: 'Café Marrakech', 
          status: 'processing', 
          orderDate: '2025-05-23',
          total: 980.00,
          shippingAddress: '45 Rue Ibn Sina, Casablanca',
          phone: '+212 662-345678',
          items: [
            { id: 1, productId: 3, name: 'Café Arabica', quantity: 8, unit: 'kg', price: 120.00 },
            { id: 2, productId: 4, name: 'Sucre', quantity: 10, unit: 'kg', price: 10.00 }
          ]
        },
        { 
          id: 'ORD-2025-003', 
          customerName: 'Hôtel Royal', 
          status: 'shipped', 
          orderDate: '2025-05-22',
          total: 3500.00,
          shippingAddress: '78 Boulevard Zerktouni, Rabat',
          phone: '+212 663-456789',
          items: [
            { id: 1, productId: 5, name: 'Serviettes', quantity: 100, unit: 'pcs', price: 15.00 },
            { id: 2, productId: 6, name: 'Savon Liquide', quantity: 20, unit: 'L', price: 75.00 }
          ]
        },
        { 
          id: 'ORD-2025-004', 
          customerName: 'Pâtisserie Amande', 
          status: 'delivered', 
          orderDate: '2025-05-20',
          total: 1750.00,
          shippingAddress: '12 Rue Hassan II, Fès',
          phone: '+212 664-567890',
          items: [
            { id: 1, productId: 7, name: 'Farine', quantity: 25, unit: 'kg', price: 30.00 },
            { id: 2, productId: 8, name: 'Amandes', quantity: 8, unit: 'kg', price: 150.00 }
          ]
        }
      ]);
    }
  });
  
  // Mutation for processing an outgoing order
  const processOrderMutation = useMutation({
    mutationFn: async (data) => {
      const { order, action, items, notes } = data;
      
      if (action === 'process') {
        // Process each item in the order
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
                notes: `Commande sortante #${order.id}`,
                reference: order.id
              });
            }
          }
        }
      }
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      const { action } = variables;
      
      const actionMessages = {
        'process': 'La commande a été traitée et les articles ont été prélevés du stock.',
        'ship': 'La commande a été marquée comme expédiée.',
        'deliver': 'La commande a été marquée comme livrée.',
        'cancel': 'La commande a été annulée.'
      };
      
      toast({
        title: "Commande mise à jour",
        description: actionMessages[action] || "Commande mise à jour avec succès",
        variant: "success"
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['outgoingOrders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      
      // Reset state
      setSelectedOrder(null);
      setShowProcessDialog(false);
      setItemAvailability({});
      setNotes('');
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement de la commande.",
        variant: "destructive"
      });
    }
  });
  
  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates
    if (sortField.includes('Date')) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
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
  const handleOpenProcessDialog = (order) => {
    setSelectedOrder(order);
    
    if (order.status === 'pending') {
      // Check availability for each item
      const availability = {};
      
      order.items.forEach(item => {
        const product = inventory.find(p => p.id === item.productId);
        
        if (product) {
          availability[item.id] = {
            available: product.quantity,
            fulfill: Math.min(item.quantity, product.quantity),
            canFulfill: product.quantity >= item.quantity
          };
        } else {
          availability[item.id] = {
            available: 0,
            fulfill: 0,
            canFulfill: false
          };
        }
      });
      
      setItemAvailability(availability);
    }
    
    setShowProcessDialog(true);
  };
  
  // Handle fulfilling quantity change
  const handleFulfillChange = (itemId, quantity) => {
    setItemAvailability(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        fulfill: Math.min(parseInt(quantity) || 0, prev[itemId].available)
      }
    }));
  };
  
  // Check if order can be fulfilled
  const canFulfillOrder = () => {
    if (!selectedOrder) return false;
    
    return selectedOrder.items.some(item => {
      const availability = itemAvailability[item.id];
      return availability && availability.fulfill > 0;
    });
  };
  
  // Handle order processing
  const handleProcessOrder = (action) => {
    if (!selectedOrder) return;
    
    const itemsToProcess = selectedOrder.items.map(item => ({
      ...item,
      fulfill: action === 'process' ? (itemAvailability[item.id]?.fulfill || 0) : 0
    }));
    
    processOrderMutation.mutate({
      order: selectedOrder,
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
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };
  
  // Get status display text
  const getStatusDisplayText = (status) => {
    const texts = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return texts[status] || status;
  };
  
  // Loading state
  if (ordersLoading || inventoryLoading) {
    return <div className="p-6">Chargement des commandes...</div>;
  }
  
  // Error state
  if (ordersError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {ordersError.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Commandes Sortantes</h1>
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
          <TabsTrigger value="processing">En Traitement</TabsTrigger>
          <TabsTrigger value="shipped">Expédiées</TabsTrigger>
          <TabsTrigger value="delivered">Livrées</TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par ID, client ou adresse..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes ({sortedOrders.length})</CardTitle>
              <CardDescription>
                {statusFilter === 'all' ? 'Toutes les commandes' : `Commandes ${getStatusDisplayText(statusFilter).toLowerCase()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedOrders.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">Aucune commande trouvée</p>
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
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('customerName')}>
                          Client <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('orderDate')}>
                          Date <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell>{order.total.toFixed(2)} DH</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {getStatusDisplayText(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm"
                            variant={order.status === 'pending' ? 'default' : 'outline'}
                            onClick={() => handleOpenProcessDialog(order)}
                          >
                            {order.status === 'pending' ? 'Traiter' : 'Détails'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
      
      {/* Process Order Dialog */}
      {selectedOrder && (
        <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedOrder.status === 'pending' 
                  ? 'Traiter la Commande' 
                  : 'Détails de la Commande'}
              </DialogTitle>
              <DialogDescription>
                Commande #{selectedOrder.id} - {selectedOrder.customerName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de Commande</p>
                  <p className="font-medium">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{selectedOrder.shippingAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{selectedOrder.phone}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Articles Commandés</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Prix</TableHead>
                      {selectedOrder.status === 'pending' && (
                        <>
                          <TableHead>Disponible</TableHead>
                          <TableHead>À Prélever</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map(item => {
                      const availability = itemAvailability[item.id];
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          <TableCell>{item.price.toFixed(2)} DH</TableCell>
                          
                          {selectedOrder.status === 'pending' && availability && (
                            <>
                              <TableCell>
                                {availability.available} {item.unit}
                                {availability.available < item.quantity && (
                                  <Badge className="ml-2 bg-amber-500">Insuffisant</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max={availability.available}
                                  value={availability.fulfill}
                                  onChange={(e) => handleFulfillChange(item.id, e.target.value)}
                                  className="w-20"
                                />
                              </TableCell>
                            </>
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
                    placeholder="Ajoutez des notes concernant cette commande..."
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
                    Annuler
                  </Button>
                  <Button variant="destructive" onClick={() => handleProcessOrder('cancel')}>
                    <X className="mr-2 h-4 w-4" />
                    Annuler Commande
                  </Button>
                  <Button 
                    onClick={() => handleProcessOrder('process')}
                    disabled={!canFulfillOrder()}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Traiter Commande
                  </Button>
                </>
              ) : selectedOrder.status === 'processing' ? (
                <>
                  <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                    Fermer
                  </Button>
                  <Button onClick={() => handleProcessOrder('ship')}>
                    <Truck className="mr-2 h-4 w-4" />
                    Marquer comme Expédiée
                  </Button>
                </>
              ) : selectedOrder.status === 'shipped' ? (
                <>
                  <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                    Fermer
                  </Button>
                  <Button onClick={() => handleProcessOrder('deliver')}>
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
