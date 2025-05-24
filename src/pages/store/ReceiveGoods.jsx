import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI, inventoryAPI, stockMovementsAPI, notificationsAPI } from '../../lib/api';
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, CheckCircle, X, Package, Truck, Calendar, Eye, FileText
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const ReceiveGoods = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receivingItems, setReceivingItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  // Fetch orders using React Query
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersAPI.getAll()
  });
  
  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async (items) => {
      // Process each item to update inventory
      const updatePromises = items.map(async (item) => {
        // Get current inventory for this product
        const inventoryItems = await inventoryAPI.getByProduct(item.productId);
        const inventoryItem = inventoryItems[0]; // Assume one inventory entry per product
        
        if (inventoryItem) {
          // Update existing inventory
          return inventoryAPI.update(inventoryItem.id, {
            ...inventoryItem,
            quantity: inventoryItem.quantity + item.receivedQuantity,
            lastUpdated: new Date().toISOString().split('T')[0]
          });
        } else {
          // Create new inventory entry
          return inventoryAPI.create({
            productId: item.productId,
            quantity: item.receivedQuantity,
            threshold: 10, // Default threshold
            lastUpdated: new Date().toISOString().split('T')[0]
          });
        }
      });
      
      return Promise.all(updatePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });
  
  // Record stock movement mutation
  const recordStockMovementMutation = useMutation({
    mutationFn: (items) => {
      const movements = items.map(item => ({
        productId: item.productId,
        type: 'receive',
        quantity: item.receivedQuantity,
        date: new Date().toISOString().split('T')[0],
        userId: 5 // In a real app, this would be the current user's ID
      }));
      
      return Promise.all(movements.map(movement => stockMovementsAPI.create(movement)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
    }
  });
  
  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: (order) => ordersAPI.update(order.id, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Réception complétée",
        description: "Les produits ont été ajoutés à l'inventaire avec succès.",
      });
      setShowReceiveDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Filter orders based on search term, status filter, and active tab
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.supplier && typeof order.supplier === 'string' && 
       order.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'pending' && (order.status === 'pending' || order.status === 'partial')) || 
      (activeTab === 'completed' && order.status === 'completed');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Status badge color mapping
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Partielle</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Complète</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Approuvée</Badge>;
      case 'received':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Reçue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle order selection for receiving
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    // Initialize receiving items with order items
    const items = order.items?.map(item => ({
      productId: item.productId || item.id,
      name: item.name,
      category: item.category,
      orderedQuantity: item.quantity,
      receivedQuantity: item.quantity, // Default to ordered quantity
      unit: item.unit || 'unité',
      isChecked: true
    })) || [];
    
    setReceivingItems(items);
    setNotes('');
    setInvoiceNumber('');
    setShowReceiveDialog(true);
  };

  // Handle item checkbox change
  const handleCheckboxChange = (index, checked) => {
    const updatedItems = [...receivingItems];
    updatedItems[index].isChecked = checked;
    setReceivingItems(updatedItems);
  };

  // Handle item quantity change
  const handleQuantityChange = (index, value) => {
    const updatedItems = [...receivingItems];
    updatedItems[index].receivedQuantity = parseInt(value) || 0;
    setReceivingItems(updatedItems);
  };

  // Handle receive goods submission
  const handleReceiveGoods = async () => {
    // Filter only checked items
    const itemsToReceive = receivingItems.filter(item => item.isChecked);
    
    if (itemsToReceive.length === 0) {
      toast({
        title: "Aucun produit sélectionné",
        description: "Veuillez sélectionner au moins un produit à réceptionner.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // 1. Update inventory quantities
      await updateInventoryMutation.mutateAsync(itemsToReceive);
      
      // 2. Record stock movements
      await recordStockMovementMutation.mutateAsync(itemsToReceive);
      
      // 3. Send notifications to Audite for price setting
      // This is a key responsibility of the Magasin role
      const notificationPromises = itemsToReceive.map(item => {
        // Check if the product is new or needs pricing
        const product = products.find(p => p.id === item.productId || 
                                     p.id.toString() === item.productId.toString());
        
        // Send notification to Audite for price setting if:
        // - It's a new product (no price set)
        // - Or if price is 0 or undefined
        if (!product || !product.price) {
          return notificationsAPI.create({
            title: 'Nouveau produit à tarifer',
            message: `${item.receivedQuantity} unités de ${item.name || `Produit #${item.productId}`} ont été reçues et nécessitent un prix de vente.`,
            type: 'price_setting',
            recipientId: '7', // Audite role ID
            productId: item.productId,
            date: new Date().toISOString().split('T')[0],
            read: false,
            priority: 'high'
          });
        }
        return Promise.resolve(); // No notification needed
      });
      
      await Promise.all(notificationPromises);
      
      // 4. Update order status
      const updatedOrder = {
        ...selectedOrder,
        status: 'received',
        receivedDate: new Date().toISOString().split('T')[0],
        receivedBy: 'Magasinier Karim', // Would come from auth context in a real app
        receivingNotes: notes,
        invoiceNumber: invoiceNumber,
        receivedItems: itemsToReceive
      };
      
      updateOrderMutation.mutate(updatedOrder);
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Réception des marchandises</h1>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Commandes à réceptionner</CardTitle>
            <CardDescription>
              Gérez la réception des commandes approuvées et mettez à jour l'inventaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Rechercher une commande..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-[180px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="partial">Partielle</SelectItem>
                    <SelectItem value="approved">Approuvée</SelectItem>
                    <SelectItem value="received">Reçue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">À réceptionner</TabsTrigger>
                <TabsTrigger value="completed">Réceptionnées</TabsTrigger>
                <TabsTrigger value="all">Toutes</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Date de commande</TableHead>
                        <TableHead>Produits</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                              <p>Chargement des commandes...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : ordersError ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center text-red-500">
                              <X className="h-12 w-12 mb-2" />
                              <p>Erreur lors du chargement des commandes</p>
                              <p className="text-sm">{ordersError.message}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Package className="h-12 w-12 mb-2" />
                              <p>Aucune commande à réceptionner</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.supplier || 'Non spécifié'}</TableCell>
                            <TableCell>{order.date || order.orderDate}</TableCell>
                            <TableCell>{order.items?.length || 0} produits</TableCell>
                            <TableCell>
                              {getStatusBadge(order.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {/* View order details */}}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Détails
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => handleSelectOrder(order)}
                                  disabled={order.status === 'received'}
                                >
                                  {order.status === 'received' ? (
                                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                  ) : (
                                    <Truck className="h-4 w-4 mr-1" />
                                  )}
                                  {order.status === 'received' ? 'Reçu' : 'Réceptionner'}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Receive Order Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Réceptionner la commande {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Vérifiez les produits reçus et ajoutez-les à l'inventaire
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Numéro de facture</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Numéro de facture fournisseur"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="deliveryDate">Date de livraison</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes de réception</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informations complémentaires sur la livraison"
                className="mt-1"
              />
            </div>
            
            <div className="mt-2">
              <Label className="text-base font-medium">Produits à réceptionner</Label>
              <div className="border rounded-md mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Commandé</TableHead>
                      <TableHead className="text-right">À recevoir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivingItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Checkbox
                            checked={item.isChecked}
                            onCheckedChange={(checked) => handleCheckboxChange(index, checked)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">{item.orderedQuantity} {item.unit}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            max={item.orderedQuantity}
                            value={item.receivedQuantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            disabled={!item.isChecked}
                            className="w-20 text-right inline-block"
                          />
                          <span className="ml-2">{item.unit}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleReceiveGoods}
              disabled={!receivingItems.some(item => item.isChecked)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer la réception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiveGoods;
