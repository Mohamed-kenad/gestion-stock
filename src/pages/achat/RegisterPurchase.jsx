import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingCart, Search, Plus, Trash2, Save, FileText, Package, Truck, AlertCircle
} from 'lucide-react';
import { productsAPI, suppliersAPI, purchasesAPI, notificationsAPI, departmentsAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, addDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * RegisterPurchase Component
 * 
 * This component allows the Achat department to record detailed purchase information
 * including suppliers, quantities, prices, and other important details.
 */

const RegisterPurchase = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for purchase details
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [supplierId, setSupplierId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    format(addDays(new Date(), 7), 'yyyy-MM-dd')
  );
  
  // Fetch suppliers using React Query
  const {
    data: suppliers = [],
    isLoading: suppliersLoading
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersAPI.getAll()
  });
  
  // Fetch departments using React Query
  const {
    data: departments = [],
    isLoading: departmentsLoading
  } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsAPI.getAll()
  });
  
  // Fetch products using React Query
  const {
    data: products = [],
    isLoading: productsLoading
  } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll()
  });
  
  // Create purchase mutation
  const createPurchaseMutation = useMutation({
    mutationFn: (purchaseData) => purchasesAPI.create(purchaseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast({
        title: "Achat enregistré",
        description: "L'achat a été enregistré avec succès.",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'enregistrement: ${error.message}`,
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
  
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Open product dialog
  const openProductDialog = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setUnitPrice(product.price || 0);
    } else {
      setSelectedProduct(null);
      setUnitPrice(0);
    }
    setQuantity(1);
    setExpiryDate('');
    setBatchNumber('');
    setIsProductDialogOpen(true);
  };

  // Add product to purchase
  const addProductToPurchase = () => {
    if (!selectedProduct || quantity <= 0 || unitPrice <= 0) {
      toast({
        title: "Validation échouée",
        description: "Veuillez vérifier les informations du produit.",
        variant: "destructive",
      });
      return;
    }

    const newItem = {
      id: Date.now(),
      productId: selectedProduct.id,
      name: selectedProduct.name,
      category: selectedProduct.category,
      quantity,
      unit: selectedProduct.unit,
      unitPrice,
      total: quantity * unitPrice,
      expiryDate,
      batchNumber
    };

    setItems([...items, newItem]);
    setIsProductDialogOpen(false);
    
    toast({
      title: "Produit ajouté",
      description: `${selectedProduct.name} ajouté à l'achat.`,
    });
  };

  // Remove item from purchase
  const removeItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
    
    toast({
      title: "Produit retiré",
      description: "Le produit a été retiré de l'achat.",
    });
  };
  
  // Reset form after submission
  const resetForm = () => {
    setSupplierId('');
    setDepartmentId('');
    setInvoiceNumber('');
    setNotes('');
    setItems([]);
    setPaymentMethod('bank_transfer');
    setPaymentStatus('pending');
    setPurchaseDate(format(new Date(), 'yyyy-MM-dd'));
    setExpectedDeliveryDate(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  };

  // Handle save purchase
  const handleSavePurchase = async () => {
    if (!supplierId || !departmentId || items.length === 0) {
      toast({
        title: "Validation échouée",
        description: "Veuillez remplir tous les champs obligatoires et ajouter au moins un produit.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedSupplier = suppliers.find(s => s.id === supplierId);
      const selectedDepartment = departments.find(d => d.id === departmentId);
      
      // Prepare purchase data
      const purchaseData = {
        purchaseDate: purchaseDate,
        supplierId: supplierId,
        supplierName: selectedSupplier?.name || 'Unknown Supplier',
        departmentId: departmentId,
        departmentName: selectedDepartment?.name || 'Unknown Department',
        invoiceNumber: invoiceNumber,
        notes: notes,
        items: items.map(item => ({
          ...item,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          expiryDate: item.expiryDate,
          batchNumber: item.batchNumber
        })),
        totalAmount: calculateTotal(),
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        expectedDeliveryDate: expectedDeliveryDate,
        createdAt: new Date().toISOString(),
        createdBy: 'Achat Mohamed', // Would come from auth context in a real app
        status: 'completed'
      };
      
      // 1. Create the purchase record
      const createdPurchase = await createPurchaseMutation.mutateAsync(purchaseData);
      
      // 2. Send notification to Magasin about incoming goods
      await sendNotificationMutation.mutateAsync({
        title: 'Nouvelle commande à réceptionner',
        message: `Une commande de ${items.length} produits a été effectuée auprès de ${selectedSupplier?.name} et sera livrée le ${expectedDeliveryDate}. Veuillez préparer la réception.`,
        type: 'incoming_delivery',
        recipientId: '4', // Magasin role ID
        purchaseId: createdPurchase.id,
        date: new Date().toISOString().split('T')[0],
        read: false,
        priority: 'high'
      });
      
    } catch (error) {
      console.error('Error saving purchase:', error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enregistrer un Achat</h1>
          <p className="text-muted-foreground">
            Enregistrez un nouvel achat dans le système
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Purchase Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'achat</CardTitle>
            <CardDescription>
              Entrez les détails généraux de l'achat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Date d'achat</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur <span className="text-red-500">*</span></Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {suppliersLoading ? (
                    <SelectItem value="loading" disabled>Chargement des fournisseurs...</SelectItem>
                  ) : suppliers.length === 0 ? (
                    <SelectItem value="none" disabled>Aucun fournisseur disponible</SelectItem>
                  ) : (
                    suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Département <span className="text-red-500">*</span></Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsLoading ? (
                    <SelectItem value="loading" disabled>Chargement des départements...</SelectItem>
                  ) : departments.length === 0 ? (
                    <SelectItem value="none" disabled>Aucun département disponible</SelectItem>
                  ) : (
                    departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Numéro de facture <span className="text-red-500">*</span></Label>
              <Input
                id="invoiceNumber"
                placeholder="Entrez le numéro de facture"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedDeliveryDate">Date de livraison prévue <span className="text-red-500">*</span></Label>
              <Input
                id="expectedDeliveryDate"
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Méthode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Sélectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                  <SelectItem value="credit_card">Carte de crédit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Statut du paiement</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger id="paymentStatus">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="paid">Payé</SelectItem>
                  <SelectItem value="partial">Paiement partiel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes ou commentaires sur cet achat"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Purchase Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé de l'achat</CardTitle>
            <CardDescription>
              Aperçu des produits et du montant total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Nombre de produits:</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Montant total:</span>
                <span className="font-bold">{calculateTotal().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{purchaseDate}</span>
              </div>
              {supplier && (
                <div className="flex justify-between">
                  <span className="font-medium">Fournisseur:</span>
                  <span>{supplier}</span>
                </div>
              )}
              {department && (
                <div className="flex justify-between">
                  <span className="font-medium">Département:</span>
                  <span>{department}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-medium">Actions</h3>
              <div className="flex flex-col space-y-2">
                <Button onClick={handleSavePurchase} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer l'achat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Produits achetés</CardTitle>
            <CardDescription>
              Ajoutez les produits inclus dans cet achat
            </CardDescription>
          </div>
          <Button onClick={() => openProductDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>N° Lot</TableHead>
                  <TableHead>Date d'expiration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.unitPrice.toFixed(2)} €
                    </TableCell>
                    <TableCell className="text-right">
                      {item.total.toFixed(2)} €
                    </TableCell>
                    <TableCell>{item.batchNumber || '-'}</TableCell>
                    <TableCell>{item.expiryDate || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {calculateTotal().toFixed(2)} €
                  </TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucun produit ajouté</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Cliquez sur "Ajouter un produit" pour commencer à enregistrer votre achat
              </p>
              <Button onClick={() => openProductDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
            <DialogDescription>
              Recherchez et ajoutez un produit à l'achat
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!selectedProduct ? (
              <>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un produit..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <ScrollArea className="h-72">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Prix unitaire</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell className="text-right">
                              {product.price.toFixed(2)} € / {product.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openProductDialog(product)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Sélectionner
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            Aucun produit trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Produit</Label>
                    <Input
                      id="productName"
                      value={selectedProduct.name}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Input
                      id="category"
                      value={selectedProduct.category}
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantité</Label>
                    <div className="flex items-center">
                      <Input
                        id="quantity"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value))}
                      />
                      <span className="ml-2">{selectedProduct.unit}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Prix unitaire</Label>
                    <div className="flex items-center">
                      <Input
                        id="unitPrice"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                      />
                      <span className="ml-2">€</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchNumber">Numéro de lot (optionnel)</Label>
                    <Input
                      id="batchNumber"
                      placeholder="Entrez le numéro de lot"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Date d'expiration (optionnel)</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{(quantity * unitPrice).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              Annuler
            </Button>
            {selectedProduct && (
              <Button onClick={addProductToPurchase}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter à l'achat
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterPurchase;
