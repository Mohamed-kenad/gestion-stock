import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryAPI, ordersAPI, stockMovementsAPI, notificationsAPI } from '../../../lib/api';
import { useToast } from "@/components/ui/use-toast";
import { 
  Truck, Package, CheckCircle, XCircle, ArrowLeft, AlertTriangle, Send
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const ReceptionManager = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [receivedItems, setReceivedItems] = useState({});
  const [notes, setNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [notifyVendor, setNotifyVendor] = useState(true);
  
  // Fetch order details
  const { 
    data: order, 
    isLoading: orderLoading, 
    error: orderError 
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersAPI.getById(orderId),
    enabled: !!orderId
  });
  
  // Fetch order items
  const { 
    data: orderItems = [], 
    isLoading: itemsLoading, 
    error: itemsError 
  } = useQuery({
    queryKey: ['orderItems', orderId],
    queryFn: () => ordersAPI.getItemsByOrderId(orderId),
    enabled: !!orderId,
    onSuccess: (data) => {
      // Initialize received items with order quantities
      const initialReceivedItems = {};
      data.forEach(item => {
        initialReceivedItems[item.id] = {
          quantity: item.quantity,
          received: false
        };
      });
      setReceivedItems(initialReceivedItems);
    }
  });
  
  // Mutation to confirm reception
  const confirmReceptionMutation = useMutation({
    mutationFn: async () => {
      // 1. Update order status
      await ordersAPI.updateStatus(orderId, 'received', notes);
      
      // 2. Process each received item
      for (const itemId in receivedItems) {
        if (receivedItems[itemId].received) {
          const orderItem = orderItems.find(item => item.id.toString() === itemId);
          const receivedQuantity = receivedItems[itemId].quantity;
          
          // 3. Update inventory
          const inventoryItems = await inventoryAPI.getByProduct(orderItem.productId);
          let inventoryItem = inventoryItems[0];
          
          if (inventoryItem) {
            // Update existing inventory
            await inventoryAPI.update(inventoryItem.id, {
              ...inventoryItem,
              quantity: inventoryItem.quantity + receivedQuantity,
              lastUpdated: new Date().toISOString().split('T')[0]
            });
          } else {
            // Create new inventory entry
            await inventoryAPI.create({
              productId: orderItem.productId,
              quantity: receivedQuantity,
              threshold: 10, // Default threshold
              lastUpdated: new Date().toISOString().split('T')[0]
            });
          }
          
          // 4. Record stock movement
          await stockMovementsAPI.create({
            productId: orderItem.productId,
            type: 'reception',
            quantity: receivedQuantity,
            date: new Date().toISOString().split('T')[0],
            userId: 5, // Magasinier role ID
            orderId: parseInt(orderId),
            notes: `Réception de commande #${orderId}`
          });
        }
      }
      
      // 5. Notify vendor if requested
      if (notifyVendor) {
        await notificationsAPI.notifyVendor(
          order.vendorId,
          `Les produits de la commande #${orderId} sont maintenant disponibles en stock.`,
          `reception-${orderId}`
        );
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderItems', orderId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['pendingReceptions'] });
      
      toast({
        title: "Réception confirmée",
        description: "La réception des produits a été enregistrée avec succès.",
      });
      
      // Navigate back to receptions list
      navigate('/dashboard/magasin/reception');
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la confirmation: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle quantity change
  const handleQuantityChange = (itemId, value) => {
    const quantity = parseInt(value) || 0;
    setReceivedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: quantity
      }
    }));
  };
  
  // Handle received status change
  const handleReceivedChange = (itemId, received) => {
    setReceivedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        received
      }
    }));
  };
  
  // Prepare for confirmation
  const handlePrepareConfirmation = () => {
    // Check if at least one item is marked as received
    const hasReceivedItems = Object.values(receivedItems).some(item => item.received);
    
    if (!hasReceivedItems) {
      toast({
        title: "Attention",
        description: "Veuillez marquer au moins un produit comme reçu.",
        variant: "warning",
      });
      return;
    }
    
    setShowConfirmDialog(true);
  };
  
  // Confirm reception
  const handleConfirmReception = () => {
    confirmReceptionMutation.mutate();
  };
  
  // Loading state
  if (orderLoading || itemsLoading) {
    return <div className="p-6">Chargement des détails de la commande...</div>;
  }
  
  // Error state
  if (orderError || itemsError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {orderError?.message || itemsError?.message}
      </div>
    );
  }
  
  // If no order found
  if (!order) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Commande non trouvée</CardTitle>
            <CardDescription>
              La commande #{orderId} n'existe pas ou n'est pas accessible.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate('/dashboard/magasin/reception')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux réceptions
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/magasin/reception')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Réception de Commande #{orderId}</h1>
        </div>
        <Badge 
          className={
            order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
            order.status === 'approved' ? 'bg-amber-100 text-amber-800' :
            order.status === 'received' ? 'bg-green-100 text-green-800' :
            'bg-gray-100'
          }
        >
          {order.status === 'pending' ? 'En attente' :
           order.status === 'approved' ? 'Approuvé' :
           order.status === 'received' ? 'Reçu' :
           order.status}
        </Badge>
      </div>
      
      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Détails de la Commande</CardTitle>
          <CardDescription>
            Informations générales sur la commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Fournisseur:</strong> {order.vendorName}</p>
              <p><strong>Date de commande:</strong> {order.orderDate}</p>
              <p><strong>Date de livraison prévue:</strong> {order.expectedDeliveryDate || 'Non spécifiée'}</p>
            </div>
            <div>
              <p><strong>Référence:</strong> {order.reference || '-'}</p>
              <p><strong>Approuvé par:</strong> {order.approvedBy || '-'}</p>
              <p><strong>Date d'approbation:</strong> {order.approvalDate || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Produits à Réceptionner</CardTitle>
          <CardDescription>
            Vérifiez les produits reçus et ajustez les quantités si nécessaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Quantité Commandée</TableHead>
                <TableHead>Quantité Reçue</TableHead>
                <TableHead>Prix Unitaire</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Reçu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Aucun produit dans cette commande
                  </TableCell>
                </TableRow>
              ) : (
                orderItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.productReference || '-'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={receivedItems[item.id]?.quantity || 0}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        disabled={!receivedItems[item.id]?.received}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>{(item.unitPrice * item.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={receivedItems[item.id]?.received || false}
                        onCheckedChange={(checked) => handleReceivedChange(item.id, checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="space-y-2 w-full md:w-1/2">
            <Label htmlFor="notes">Notes de réception</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez des notes concernant cette réception..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handlePrepareConfirmation}
              disabled={
                order.status === 'received' || 
                confirmReceptionMutation.isLoading ||
                !Object.values(receivedItems).some(item => item.received)
              }
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer Réception
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la Réception</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de confirmer la réception des produits sélectionnés.
              Cette action mettra à jour le stock et ne pourra pas être annulée.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Checkbox
                  checked={notifyVendor}
                  onCheckedChange={setNotifyVendor}
                />
                <span>Notifier le fournisseur que les produits sont disponibles</span>
              </Label>
            </div>
            
            <div className="border rounded-md p-3 bg-amber-50">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700">Attention</p>
                  <p className="text-sm text-amber-600">
                    Seuls les produits marqués comme "Reçu" seront ajoutés au stock.
                    Veuillez vérifier les quantités avant de confirmer.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmReception}
              disabled={confirmReceptionMutation.isLoading}
            >
              {confirmReceptionMutation.isLoading ? 'Traitement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceptionManager;
