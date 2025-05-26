import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI, suppliersAPI, purchasesAPI, notificationsAPI } from '../../../lib/api';
import { 
  FileText, ArrowLeft, Check, X, Calendar, Truck, DollarSign, ShoppingCart, Users
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DatePicker } from "@/components/ui/date-picker";

const ProcessOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for form
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [itemPrices, setItemPrices] = useState({});
  const [processing, setProcessing] = useState(false);
  
  // Individual refs for each price input to avoid state updates affecting other inputs
  const priceInputRefs = React.useRef({});
  
  // Fetch order details
  const { 
    data: order, 
    isLoading: orderLoading, 
    error: orderError 
  } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersAPI.getById(id),
    onSuccess: (data) => {
      // Initialize item prices with order prices if available
      const initialPrices = {};
      data.items?.forEach(item => {
        initialPrices[item.id] = item.price || 0;
      });
      setItemPrices(initialPrices);
      
      // Set supplier if available in order
      if (data.supplier) {
        setSelectedSupplier(data.supplier);
      }
    }
  });
  
  // Fetch suppliers
  const { 
    data: suppliers = [], 
    isLoading: suppliersLoading 
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersAPI.getAll()
  });
  
  // Mutation for processing the order
  const processMutation = useMutation({
    mutationFn: async (purchaseData) => {
      try {
        console.log('Processing purchase request:', id);
        console.log('Purchase data:', purchaseData);
        
        // 1. Create purchase record
        const purchase = await purchasesAPI.create(purchaseData);
        console.log('Purchase created:', purchase);
        
        // 2. Update order status to 'processing'
        const updatedOrder = await ordersAPI.update(id, { 
          status: 'processing',
          processedBy: 'Achat2 Department',
          processedAt: new Date().toISOString(),
          expectedDeliveryDate: deliveryDate?.toISOString(),
          supplier: selectedSupplier,
          purchaseId: purchase.id,
          totalConfirmed: calculateTotal()
        });
        console.log('Order updated:', updatedOrder);
        
        // 3. Notify Magasin2 department about the scheduled delivery
        const notification = await notificationsAPI.create({
          title: `Demande d'achat traitée - Livraison programmée`,
          message: `Votre demande d'achat (${id}) a été traitée. Une livraison est programmée pour le ${format(deliveryDate, 'PPP', { locale: fr })} via ${selectedSupplier}.`,
          type: 'info',
          recipientRole: 'magasin2',
          reference: purchase.id,
          createdAt: new Date().toISOString(),
          read: false
        });
        console.log('Notification sent:', notification);
        
        return purchase;
      } catch (error) {
        console.error('Error processing purchase request:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Purchase processed successfully:', data);
      
      // Get supplier details for the notification
      const supplierInfo = suppliers.find(s => s.name === selectedSupplier);
      const supplierName = supplierInfo?.name || selectedSupplier;
      
      // Format delivery date
      const formattedDate = format(deliveryDate, 'PPP', { locale: fr });
      
      // Show detailed success toast
      toast({
        title: "Demande traitée avec succès",
        description: (
          <div className="space-y-2">
            <p>La demande d'achat a été traitée et une livraison a été programmée.</p>
            <p><strong>Fournisseur:</strong> {supplierName}</p>
            <p><strong>Date de livraison:</strong> {formattedDate}</p>
            <p><strong>Total:</strong> {calculateTotal().toFixed(2)} DH</p>
          </div>
        ),
        variant: "default"
      });
      
      // Create a more detailed notification for Magasin2
      notificationsAPI.create({
        title: `Commande confirmée - Livraison programmée`,
        message: `Votre demande d'achat ${order.title ? `"${order.title}"` : `#${order.id}`} a été traitée par Achat2. Une livraison de ${calculateTotal().toFixed(2)} DH est programmée pour le ${formattedDate} via ${supplierName}. ${notes ? `Notes: ${notes}` : ''}`,
        type: 'success',
        recipientRole: 'magasin2',
        reference: data.id,
        createdAt: new Date().toISOString(),
        read: false
      }).catch(err => console.error('Error sending notification:', err));
      
      // Reset processing state
      setProcessing(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order', id]);
      
      // Add a small delay before navigation to ensure the user sees the success message
      setTimeout(() => {
        navigate('/dashboard/achat2/orders');
      }, 2000);
    },
    onError: (error) => {
      console.error('Error in process mutation:', error);
      
      // Show detailed error message
      toast({
        title: "Erreur lors du traitement de la demande d'Achat",
        description: error.message || "Une erreur est survenue lors de la communication avec le serveur. Veuillez réessayer ou contacter le support technique.",
        variant: "destructive"
      });
      
      // Reset processing state
      setProcessing(false);
    }
  });
  
  // Initialize price input refs when order data is loaded
  React.useEffect(() => {
    if (order?.items) {
      // Initialize price input refs with default values
      order.items.forEach(item => {
        if (!priceInputRefs.current[item.id]) {
          priceInputRefs.current[item.id] = React.createRef();
        }
      });
    }
  }, [order]);
  
  // Get numeric price value for an item
  const getNumericPrice = (itemId) => {
    const inputRef = priceInputRefs.current[itemId];
    if (!inputRef || !inputRef.current) return 0;
    
    const value = inputRef.current.value;
    return value === '' ? 0 : parseFloat(value) || 0;
  };
  
  // Calculate total based on current input values
  const calculateTotal = () => {
    if (!order?.items) return 0;
    
    return order.items.reduce((total, item) => {
      return total + (getNumericPrice(item.id) * item.quantity);
    }, 0);
  };
  
  // Force update function to refresh the total calculation
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation checks
    const validationErrors = [];
    
    if (!selectedSupplier) {
      validationErrors.push("Veuillez sélectionner un fournisseur");
    }
    
    if (!deliveryDate) {
      validationErrors.push("Veuillez sélectionner une date de livraison");
    }
    
    // Check if all prices are valid
    const invalidPriceItems = order.items?.filter(item => {
      const price = getNumericPrice(item.id);
      return price <= 0;
    });
    
    if (invalidPriceItems?.length > 0) {
      const productNames = invalidPriceItems.map(item => item.product).join(', ');
      validationErrors.push(`Prix invalides pour: ${productNames}`);
    }
    
    // Show all validation errors
    if (validationErrors.length > 0) {
      toast({
        title: "Erreur de validation",
        description: (
          <ul className="list-disc pl-4">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive"
      });
      return;
    }
    
    // Show processing toast
    toast({
      title: "Traitement en cours",
      description: "Veuillez patienter pendant le traitement de la demande d'achat...",
    });
    
    // Set processing state
    setProcessing(true);
    
    // Prepare updated items with confirmed prices
    const updatedItems = order.items.map(item => ({
      productId: item.productId || item.id,
      quantity: item.quantity,
      unit: item.unit,
      price: getNumericPrice(item.id),
      total: getNumericPrice(item.id) * item.quantity
    }));
    
    // Calculate total
    const totalAmount = calculateTotal();
    
    // Prepare purchase data
    const purchaseData = {
      orderId: order.id,
      title: order.title ? `Achat: ${order.title}` : `Achat pour Magasin2 #${order.id}`,
      supplier: selectedSupplier,
      department: order.department || 'Magasin2',
      departmentId: 'achat2', // Ensure this is set to achat2
      requestedBy: order.departmentId || 'magasin2',
      items: updatedItems,
      total: totalAmount,
      status: 'scheduled',
      notes: notes,
      createdAt: new Date().toISOString(),
      expectedDeliveryDate: deliveryDate.toISOString(),
      processedBy: 'Achat2 Department',
      priority: order.priority || 'normal'
    };
    
    console.log('Submitting purchase data:', purchaseData);
    
    // Process the order
    processMutation.mutate(purchaseData);
  };
  
  // Loading state
  if (orderLoading || suppliersLoading) {
    return <div className="p-6">Chargement des données...</div>;
  }
  
  // Error state
  if (orderError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement de la commande: {orderError.message}
      </div>
    );
  }
  
  // If order is not found
  if (!order) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Commande non trouvée</CardTitle>
            <CardDescription>
              La commande que vous recherchez n'existe pas ou n'est plus disponible.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/dashboard/achat2/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Note: We've removed the status check to allow processing of 'pending' orders
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Traiter la Demande d'Achat #{id}</h1>
        <Button asChild variant="outline">
          <Link to="/dashboard/achat2/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
      </div>
      
      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Détails de la Demande d'Achat</CardTitle>
          <CardDescription>
            Informations sur la demande d'achat créée par le département Magasin2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Titre</h3>
              <p className="font-medium">{order.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Département</h3>
              <p className="font-medium">{order.department}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Créé Par</h3>
              <p className="font-medium">{order.createdBy} ({order.createdByRole})</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date de Création</h3>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Approuvé Par</h3>
              <p className="font-medium">{order.approvedBy}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date d'Approbation</h3>
              <p className="font-medium">{new Date(order.approvedAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Articles Commandés</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Prix Estimé</TableHead>
                  <TableHead>Total Estimé</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items?.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name || item.product}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.price?.toFixed(2) || 0} DH</TableCell>
                    <TableCell>{item.total?.toFixed(2) || 0} DH</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-2 text-right">
              <span className="font-medium">Total Estimé: {order.total?.toFixed(2) || 0} DH</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Process Order Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Traiter la Commande</CardTitle>
            <CardDescription>
              Confirmez les détails de l'achat et programmez la livraison
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur</Label>
              <Select
                value={selectedSupplier}
                onValueChange={setSelectedSupplier}
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Sélectionnez un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Delivery Date */}
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Date de Livraison Prévue</Label>
              <DatePicker
                selected={deliveryDate}
                onSelect={setDeliveryDate}
                minDate={new Date()}
                locale={fr}
                placeholderText="Sélectionnez une date"
              />
            </div>
            
            {/* Confirmed Prices */}
            <div className="space-y-2">
              <Label>Prix Confirmés</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Prix Estimé</TableHead>
                    <TableHead>Prix Confirmé</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name || item.product}</TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>{item.price?.toFixed(2) || 0} DH</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue="0"
                          ref={priceInputRefs.current[item.id]}
                          onChange={() => forceUpdate()}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        {(getNumericPrice(item.id) * item.quantity).toFixed(2)} DH
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-2 text-right">
                <span className="font-medium">Total Confirmé: {calculateTotal().toFixed(2)} DH</span>
              </div>
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes pour le Magasin</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes ou instructions pour la réception..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard/achat2/orders')}
              disabled={processing}
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={processing || !selectedSupplier || !deliveryDate}
            >
              {processing ? (
                <>Traitement en cours...</>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirmer et Programmer la Livraison
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default ProcessOrder;
