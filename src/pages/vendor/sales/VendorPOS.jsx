import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsAPI, categoriesAPI, bonsAPI } from '../../../lib/api';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, Receipt, Save, 
  CreditCard, Banknote, Package, User, DollarSign, Percent, X,
  Barcode, Tag, Clock, AlertTriangle, CheckCircle, Filter, ArrowLeft
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Separator } from "../../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useToast } from "../../../hooks/use-toast";

const VendorPOS = () => {
  const { toast } = useToast();
  
  // State for cart and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // State for price information dialog
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Fetch products using React Query
  const { 
    data: allProducts = [], 
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll,
    refetchInterval: 30000, // Refetch every 30 seconds to get newly priced products
    onSuccess: (data) => {
      console.log('Products loaded:', data.length);
    }
  });
  
  // Fetch categories using React Query
  const { 
    data: categories = [], 
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll
  });
  
  // Fetch bons to get products that have been priced by the Auditor
  const {
    data: bons = [],
    isLoading: bonsLoading
  } = useQuery({
    queryKey: ['bons', 'ready_for_sale'],
    queryFn: () => bonsAPI.getByStatus('ready_for_sale'),
    refetchInterval: 30000, // Refetch every 30 seconds
    onSuccess: (data) => {
      console.log('Ready for sale bons loaded:', data.length);
    }
  });
  
  // Loading state
  const loading = productsLoading || categoriesLoading || bonsLoading;
  
  // Extract products that have been priced by the Auditor from bons with their selling prices
  const pricedProducts = useMemo(() => {
    const productMap = new Map();
    
    // Check if we have bons data
    if (!bons || bons.length === 0) {
      console.error('No bons data available!');
      return productMap;
    }
    
    // Process all bons with ready_for_sale status
    bons.forEach(bon => {
      if (bon.status === 'ready_for_sale') {
        bon.products?.forEach(product => {
          // Only include products that are ready for sale
          if (product.readyForSale !== false) {
            // Get a reliable product ID (try all possible ID formats)
            const productId = product.id?.toString() || product.productId?.toString();
            const productName = product.name;
            
            // Store by both ID and name for more reliable matching
            if (productId) {
              productMap.set(productId, {
                id: productId,
                name: productName,
                sellingPrice: product.sellingPrice || 0,
                purchasePrice: product.purchasePrice || 0,
                quantity: product.quantity || 0,
                unit: product.unit || 'unité'
              });
            }
            
            // Also store by name for products that might be referenced by name
            if (productName) {
              productMap.set(productName, {
                id: productId || productName,
                name: productName,
                sellingPrice: product.sellingPrice || 0,
                purchasePrice: product.purchasePrice || 0,
                quantity: product.quantity || 0,
                unit: product.unit || 'unité'
              });
            }
          }
        });
      }
    });
    return productMap;
  }, [bons]);
  
  // Extract just the IDs for filtering
  const pricedProductIds = useMemo(() => {
    return new Set(pricedProducts.keys());
  }, [pricedProducts]);
  
  // Extract products from bons that have been priced by the Auditor
  const auditorProducts = React.useMemo(() => {
    const productsMap = new Map();
    
    bons.forEach(bon => {
      if (bon.status === 'ready_for_sale') {
        bon.products?.forEach(product => {
          if (product.readyForSale !== false) {
            const productInfo = {
              id: product.id,
              name: product.name,
              category: product.category,
              quantity: product.quantity,
              unit: product.unit,
              price: product.sellingPrice || product.currentSellingPrice || product.purchasePrice,
              sellingPrice: product.sellingPrice || product.currentSellingPrice,
              purchasePrice: product.purchasePrice,
              readyForSale: true,
              bundle: product.bundle,
              bundleInfo: product.bundleInfo,
              promotion: product.promotion,
              promotionInfo: product.promotionInfo
            };
            
            // Use ID or name as key
            productsMap.set(product.id?.toString() || product.name, productInfo);
          }
        });
      }
    });
    
    console.log('Auditor Products:', Array.from(productsMap.values()));
    
    return Array.from(productsMap.values());
  }, [bons]);
  
  // Use products directly from bons that have been priced by the Auditor
  const products = useMemo(() => {
    // First, create a map of all products from bons with their complete information
    const bonProductsMap = new Map();
    
    bons.forEach(bon => {
      if (bon.status === 'ready_for_sale') {
        bon.products?.forEach(product => {
          if (product.readyForSale !== false) {
            // Use ID as key, with fallbacks
            const productId = product.id?.toString() || product.productId?.toString();
            if (productId) {
              bonProductsMap.set(productId, {
                id: productId,
                name: product.name,
                category: product.category,
                quantity: product.quantity || 0,
                unit: product.unit || 'unité',
                sellingPrice: product.sellingPrice || 0,
                purchasePrice: product.purchasePrice || 0,
                readyForSale: true,
                bundle: product.bundle || false,
                bundleInfo: product.bundleInfo,
                promotion: product.promotion || false,
                promotionInfo: product.promotionInfo
              });
            }
            
            // Also map by name for products that might be referenced by name
            if (product.name) {
              bonProductsMap.set(product.name, {
                id: productId || product.name,
                name: product.name,
                category: product.category,
                quantity: product.quantity || 0,
                unit: product.unit || 'unité',
                sellingPrice: product.sellingPrice || 0,
                purchasePrice: product.purchasePrice || 0,
                readyForSale: true,
                bundle: product.bundle || false,
                bundleInfo: product.bundleInfo,
                promotion: product.promotion || false,
                promotionInfo: product.promotionInfo
              });
            }
          }
        });
      }
    });
    
    // Convert the map to an array of products
    return Array.from(bonProductsMap.values());
  }, [bons]);
  
  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = 
        !searchTerm || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || 
        (product.category && categories.some(c => 
          product.category?.toLowerCase().includes(c.name.toLowerCase()) && 
          c.id.toString() === categoryFilter
        ));
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter, categories]);
  
  // Calculate total
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);
  
  const taxRate = 0.2; // 20% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;
  
  // Calculate change for cash payments
  const change = Math.max(0, amountPaid - total);
  
  // Open price information dialog
  const handleOpenPriceDialog = (product) => {
    setSelectedProduct(product);
    setIsPriceDialogOpen(true);
  };

  // Add product to cart with Auditor-set price only
  const handleAddToCart = (product) => {
    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if already in cart
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
      
      toast({
        title: "Quantité mise à jour",
        description: `${product.name} : quantité augmentée à ${updatedCart[existingItemIndex].quantity}`,
      });
    } else {
      // Check if product has a valid selling price
      if (product.sellingPrice) {
        // Add to cart with the Auditor-set price
        setCart([...cart, {
          id: product.id,
          name: product.name,
          price: product.sellingPrice, // Use the exact price set by Auditor
          quantity: 1,
          category: product.category,
          unit: product.unit || 'unité'
        }]);
        
        toast({
          title: "Produit ajouté",
          description: `${product.name} ajouté au panier au prix fixé par l'Auditeur: ${product.sellingPrice.toFixed(2)} DH`,
        });
      } else {
        // Show warning if product not priced by Auditor
        toast({
          title: "Produit non disponible",
          description: `${product.name} n'a pas encore été tarifé par l'Auditeur.`,
          variant: "destructive"
        });
        
        // Open price information dialog to explain
        handleOpenPriceDialog(product);
      }
    }
  };
  
  // Handle barcode input
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    
    if (!barcodeInput.trim()) return;
    
    // Check if the product is in our auditor products list
    const productId = barcodeInput.trim();
    const product = filteredProducts.find(
      p => p.id?.toString() === productId || p.barcode === productId || p.name === productId
    );
    
    if (product) {
      // Check if product is priced by the Auditor before adding to cart
      let isPriced = false;
      
      // Verify this product has been priced by the Auditor
      bons.forEach(bon => {
        if (bon.status === 'ready_for_sale') {
          bon.products?.forEach(bonProduct => {
            if ((bonProduct.id && bonProduct.id.toString() === product.id.toString()) ||
                (bonProduct.productId && bonProduct.productId.toString() === product.id.toString()) ||
                (bonProduct.name === product.name)) {
              if (bonProduct.readyForSale !== false && bonProduct.sellingPrice) {
                isPriced = true;
              }
            }
          });
        }
      });
      
      if (isPriced) {
        // Product is priced by the Auditor, add to cart
        handleAddToCart(product);
      } else {
        // Product exists but not priced by Auditor
        toast({
          title: "Produit non disponible",
          description: `${product.name} n'a pas encore été tarifé par l'Auditeur.`,
          variant: "destructive"
        });
        
        // Open price information dialog to explain
        handleOpenPriceDialog(product);
      }
      
      setBarcodeInput('');
      return;
    }
    
    // If not found in our products list
    toast({
      title: "Produit non trouvé",
      description: `Aucun produit avec le code-barres ${barcodeInput}`,
      variant: "destructive",
    });
    
    // Clear barcode input
    setBarcodeInput('');
  };
  
  // Update item quantity in cart
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or negative
      handleRemoveItem(itemId);
      return;
    }
    
    const newCart = cart.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCart(newCart);
  };
  
  // Remove item from cart
  const handleRemoveItem = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };
  
  // Sample customers (in a real app, this would come from an API)
  const customers = [
    { id: 1, name: "Restaurant Le Gourmet", type: "business" },
    { id: 2, name: "Café de la Place", type: "business" },
    { id: 3, name: "Client Particulier", type: "individual" },
  ];
  
  // Process payment
  const handleProcessPayment = () => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de finaliser la vente",
        variant: "destructive",
      });
      return;
    }
    
    // Here you would integrate with a payment processor or save the sale to your database
    
    // Show success message
    toast({
      title: "Vente finalisée",
      description: `Paiement de ${total.toFixed(2)} DH reçu par ${
        paymentMethod === 'cash' ? 'espèces' : 
        paymentMethod === 'card' ? 'carte bancaire' : 
        paymentMethod === 'transfer' ? 'virement' : 
        paymentMethod === 'check' ? 'chèque' : 'crédit'
      }`,
    });
    
    // Clear cart and reset state
    setCart([]);
    setCustomerNote('');
    setIsPaymentDialogOpen(false);
    setPaymentMethod('cash');
    setAmountPaid(0);
  };
  
  // Open payment dialog
  const handleOpenPaymentDialog = () => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de finaliser la vente",
        variant: "destructive",
      });
      return;
    }
    
    setAmountPaid(total);
    setIsPaymentDialogOpen(true);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Point de Vente</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/vendor">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Debug Information Panel */}
      <Card className="bg-gray-100">
        <CardHeader>
          <CardTitle>Informations de Débogage</CardTitle>
          <CardDescription>Informations sur les prix des produits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Total Bons:</strong> {bons.length}</p>
            <p><strong>Bons Ready For Sale:</strong> {bons.filter(bon => bon.status === 'ready_for_sale').length}</p>
            <p><strong>Priced Products Count:</strong> {pricedProductIds.size}</p>
            <p><strong>Filtered Products Count:</strong> {filteredProducts.length}</p>
            <p><strong>Bœuf Product Info:</strong></p>
            <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(bons.flatMap(bon => 
                bon.products?.filter(p => p.name === 'Bœuf' || p.name === 'Boeuf') || []
              ), null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Produits</CardTitle>
              <CardDescription>
                Sélectionnez les produits à ajouter à la vente
              </CardDescription>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="flex space-x-2 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="Ingrédients">Ingrédients</SelectItem>
                    <SelectItem value="Boissons">Boissons</SelectItem>
                    <SelectItem value="Entretien">Entretien</SelectItem>
                  </SelectContent>
                </Select>

              </div>
              
              {/* Barcode input */}
              <form onSubmit={handleBarcodeSubmit} className="mt-4 flex space-x-2">
                <div className="relative flex-1">
                  <Barcode className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Scanner ou saisir un code-barres..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </form>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">Aucun produit disponible</h3>
                  <p className="mt-1 text-gray-500">
                    {searchTerm || categoryFilter !== 'all' 
                      ? "Essayez de modifier vos filtres de recherche"
                      : "Aucun produit n'est actuellement disponible pour la vente"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id || product.name} 
                      className="border rounded-lg p-4 flex flex-col items-center hover:shadow-md transition-shadow cursor-pointer relative"
                      onClick={() => handleAddToCart(product)}
                    >
                      {/* Auditor Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Audité
                        </Badge>
                      </div>
                      
                      <div className="h-24 w-24 flex items-center justify-center mb-2">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <Package className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <h4 className="font-medium text-center">{product.name}</h4>
                      <p className="text-sm font-bold text-center text-green-700">
                        Prix de vente: {product.sellingPrice ? 
                          `${product.sellingPrice.toFixed(2)} DH` : 
                          'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        Stock: {product.quantity || 0} {product.unit || 'unité'}
                      </p>
                      {product.bundle && (
                        <Badge variant="secondary" className="mb-2">
                          Bundle
                        </Badge>
                      )}
                      {product.promotion && (
                        <Badge variant="secondary" className="mb-2 bg-amber-100 text-amber-800">
                          Promotion
                        </Badge>
                      )}
                    </div>
                  ))}

                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Price Information Dialog */}
        <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Information sur les prix</DialogTitle>
              <DialogDescription>
                Les prix sont fixés par l'Auditeur et ne peuvent pas être modifiés
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-amber-600">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                Les produits ne peuvent être vendus qu'au prix fixé par l'Auditeur.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setIsPriceDialogOpen(false)}>
                Compris
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Finaliser la vente
              </DialogTitle>
              <DialogDescription>
                Sélectionnez le mode de paiement et confirmez la transaction
              </DialogDescription>
            </DialogHeader>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Mode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un mode de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="card">Carte bancaire</SelectItem>
                  <SelectItem value="transfer">Virement bancaire</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                  <SelectItem value="credit">Crédit client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Montant reçu</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="amountPaid"
                    type="number"
                    step="0.01"
                    min={total}
                    className="pl-8"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span>Monnaie à rendre:</span>
                  <span className="font-bold">{change.toFixed(2)} €</span>
                </div>
              </div>
            )}
            
            {paymentMethod === 'card' && (
              <div className="text-center p-4 border rounded-md bg-gray-50">
                <CreditCard className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <p>Utilisez le terminal de paiement pour traiter la transaction par carte.</p>
              </div>
            )}
            
            {paymentMethod === 'transfer' && (
              <div className="text-center p-4 border rounded-md bg-gray-50">
                <p>Le client effectuera un virement bancaire.</p>
                <p className="font-medium mt-2">Référence: VENTE-{Date.now().toString().substring(7)}</p>
              </div>
            )}
            
            {paymentMethod === 'check' && (
              <div className="space-y-2">
                <Label htmlFor="checkNumber">Numéro de chèque</Label>
                <Input
                  id="checkNumber"
                  placeholder="Entrez le numéro du chèque"
                />
              </div>
            )}
            
            {paymentMethod === 'credit' && (
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Limite de crédit</Label>
                <div className="p-4 border rounded-md bg-blue-50 text-blue-700">
                  <p className="font-medium">Client: {selectedCustomer?.name}</p>
                  <p>Crédit disponible: 1000.00 €</p>
                  <p>Nouveau solde après cette vente: {(1000 - total).toFixed(2)} €</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleProcessPayment} className="bg-blue-600 hover:bg-blue-700">
              <Receipt className="h-4 w-4 mr-2" />
              Finaliser la vente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cart Section */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Panier
            </CardTitle>
            <CardDescription>
              {cart.length === 0 
                ? "Votre panier est vide" 
                : `${cart.length} produit${cart.length > 1 ? 's' : ''} dans le panier`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Panier vide</h3>
                <p className="mt-1 text-gray-500">
                  Ajoutez des produits pour commencer une vente
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Prix</TableHead>
                    <TableHead className="text-center">Qté</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAddToCart(product)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter au prix fixé
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {cart.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total:</span>
                  <span>{subtotal.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>TVA (20%):</span>
                  <span>{taxAmount.toFixed(2)} DH</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{total.toFixed(2)} DH</span>
                </div>
              </div>
            )}
            
            <div className="mt-6 space-y-4">
              <Textarea
                placeholder="Notes client (optionnel)"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="resize-none"
              />
              
              <Button 
                className="w-full" 
                size="lg"
                disabled={cart.length === 0}
                onClick={handleOpenPaymentDialog}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Paiement
              </Button>
              
              <Button variant="outline" className="w-full" disabled={cart.length === 0}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer la vente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorPOS;
