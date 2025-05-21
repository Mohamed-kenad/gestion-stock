import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, Receipt, Save, 
  CreditCard, Banknote, Package, User, DollarSign, Percent, X,
  Barcode, Camera, Moon, Sun, Tag, Clock, Zap, Coffee, Pizza, Beef,
  Carrot, Milk, Wine, Sandwich, Apple, Fish
} from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
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
import { useToast } from "../../../components/ui/use-toast";

// Mock data for products
const mockProducts = [
  {
    id: 1,
    name: 'Farine de blé T55',
    category: 'Ingrédients',
    unit: 'kg',
    sellingPrice: 4.75,
    stock: 120,
    image: 'https://via.placeholder.com/50',
    barcode: '3760049580012',
  },
  {
    id: 2,
    name: 'Sucre en poudre',
    category: 'Ingrédients',
    unit: 'kg',
    sellingPrice: 3.25,
    stock: 85,
    image: 'https://via.placeholder.com/50',
    barcode: '3760049580029',
  },
  {
    id: 3,
    name: 'Huile d\'olive extra vierge',
    category: 'Ingrédients',
    unit: 'L',
    sellingPrice: 15.90,
    stock: 45,
    image: 'https://via.placeholder.com/50',
    barcode: '3760049580036',
  },
  {
    id: 4,
    name: 'Vodka premium',
    category: 'Boissons',
    unit: 'bouteille',
    sellingPrice: 42.50,
    stock: 32,
    image: 'https://via.placeholder.com/50',
    barcode: '3760049580043',
  },
  {
    id: 5,
    name: 'Rhum ambré',
    category: 'Boissons',
    unit: 'bouteille',
    sellingPrice: 48.90,
    stock: 28,
    image: 'https://via.placeholder.com/50',
    barcode: '3760049580050',
  },
  {
    id: 6,
    name: 'Gin London Dry',
    category: 'Boissons',
    unit: 'bouteille',
    sellingPrice: 44.50,
    stock: 35,
    image: 'https://via.placeholder.com/50',
    barcode: '3760049580067',
  },
  {
    id: 7,
    name: 'Détergent multi-surfaces',
    category: 'Entretien',
    unit: 'L',
    sellingPrice: 5.90,
    stock: 60,
    image: 'https://via.placeholder.com/50',
    barcode: '3760049580074',
  },
  {
    id: 8,
    name: 'Désinfectant alimentaire',
    category: 'Entretien',
    unit: 'L',
    sellingPrice: 7.90,
    stock: 48,
    image: 'https://via.placeholder.com/50',
    barcode: '3760049580081',
  },
];

// Mock data for customers
const mockCustomers = [
  { id: 1, name: 'Restaurant Le Gourmet', type: 'business', contact: '+33 1 23 45 67 89', email: 'contact@legourmet.fr' },
  { id: 2, name: 'Hôtel Luxe', type: 'business', contact: '+33 1 23 45 67 90', email: 'reservations@hotelluxe.fr' },
  { id: 3, name: 'Café Central', type: 'business', contact: '+33 1 23 45 67 91', email: 'info@cafecentral.fr' },
  { id: 4, name: 'Client occasionnel', type: 'individual', contact: '', email: '' },
];

const POSInterface = ({ role = 'cashier' }) => {
  const { toast } = useToast();
  
  // State for product search and filtering
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // State for current sale
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState('4'); // Default to occasional client
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  
  // State for payment dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [receiptNumber, setReceiptNumber] = useState('');
  
  // State for barcode scanner
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  
  // State for dark mode
  const [darkMode, setDarkMode] = useState(false);
  
  // Role-specific styling
  const isVendor = role === 'vendor';
  const themeColor = isVendor ? 'blue' : 'green';
  const roleTitle = isVendor ? 'Vendor Sales Interface' : 'Cashier POS Interface';
  
  // State for quick access products
  const [quickProducts, setQuickProducts] = useState([]);
  
  // State for recent transactions
  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, time: '19:45', total: 124.50, items: 8 },
    { id: 2, time: '18:30', total: 67.25, items: 5 },
    { id: 3, time: '17:15', total: 210.90, items: 12 },
  ]);
  
  // State for favorite products
  const [favoriteProducts, setFavoriteProducts] = useState([1, 4, 6]);
  
  // Load products
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
      
      // Set quick access products (most popular)
      setQuickProducts([
        { id: 1, name: 'Farine', icon: Coffee, color: 'bg-amber-100 text-amber-800' },
        { id: 2, name: 'Sucre', icon: Carrot, color: 'bg-green-100 text-green-800' },
        { id: 3, name: 'Huile', icon: Pizza, color: 'bg-red-100 text-red-800' },
        { id: 4, name: 'Vodka', icon: Wine, color: 'bg-purple-100 text-purple-800' },
        { id: 5, name: 'Rhum', icon: Wine, color: 'bg-orange-100 text-orange-800' },
        { id: 6, name: 'Gin', icon: Wine, color: 'bg-blue-100 text-blue-800' },
        { id: 7, name: 'Détergent', icon: Milk, color: 'bg-cyan-100 text-cyan-800' },
        { id: 8, name: 'Désinfectant', icon: Fish, color: 'bg-teal-100 text-teal-800' },
      ]);
    }, 800);
  }, []);
  
  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Add product to cart
  const handleAddToCart = (product) => {
    // Check if product already exists in cart
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Update quantity if product already in cart
      handleUpdateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      // Add new product to cart
      setCartItems([
        ...cartItems,
        {
          id: product.id,
          name: product.name,
          price: product.sellingPrice,
          quantity: 1,
          total: product.sellingPrice,
        }
      ]);
      
      toast({
        title: "Produit ajouté",
        description: `${product.name} a été ajouté au panier.`,
      });
    }
  };
  
  // Handle barcode detection
  const handleBarcodeDetected = (barcode) => {
    // Search for product by barcode
    const product = products.find(p => p.barcode === barcode);
    
    // If exact barcode not found, try to find a product with a barcode that starts with the scanned code
    // This is helpful for partial scans
    const partialMatch = !product ? products.find(p => p.barcode.startsWith(barcode.substring(0, 6))) : null;
    
    const matchedProduct = product || partialMatch;
    
    if (matchedProduct) {
      handleAddToCart(matchedProduct);
      toast({
        title: "Produit scanné",
        description: `${matchedProduct.name} (Code: ${matchedProduct.barcode}) a été ajouté au panier.`,
      });
    } else {
      toast({
        title: "Produit non trouvé",
        description: `Aucun produit trouvé avec le code-barres ${barcode}.`,
        variant: "destructive",
      });
    }
    
    // Close the scanner after successful scan
    setIsBarcodeScannerOpen(false);
  };
  
  // Update item quantity in cart
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.price,
        };
      }
      return item;
    });
    
    setCartItems(updatedItems);
  };
  
  // Remove item from cart
  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };
  
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate discount amount
  const discountAmount = (subtotal * discount) / 100;
  
  // Calculate total
  const total = subtotal - discountAmount;
  
  // Calculate change
  const change = Math.max(0, amountPaid - total);
  
  // Process payment
  const handleProcessPayment = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Le panier est vide. Ajoutez des produits avant de procéder au paiement.",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentMethod === 'cash' && amountPaid < total) {
      toast({
        title: "Erreur",
        description: "Le montant payé est inférieur au total de la vente.",
        variant: "destructive",
      });
      return;
    }
    
    // Generate receipt number
    const newReceiptNumber = `RECU-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setReceiptNumber(newReceiptNumber);
    
    // Here you would typically send the sale data to your backend
    toast({
      title: "Vente enregistrée",
      description: `La vente a été enregistrée avec succès. Numéro de reçu: ${newReceiptNumber}`,
    });
    
    // Reset form for new sale
    setCartItems([]);
    setCustomer('4');
    setDiscount(0);
    setNotes('');
    setPaymentMethod('cash');
    setAmountPaid(0);
    setIsPaymentDialogOpen(false);
  };
  
  // Open payment dialog
  const handleOpenPaymentDialog = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Le panier est vide. Ajoutez des produits avant de procéder au paiement.",
        variant: "destructive",
      });
      return;
    }
    
    setAmountPaid(total);
    setIsPaymentDialogOpen(true);
  };
  
  // Get selected customer
  const selectedCustomer = mockCustomers.find(c => c.id.toString() === customer);
  
  return (
    <div className="p-6 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Produits</CardTitle>
              <CardDescription>
                Sélectionnez les produits à ajouter à la vente
              </CardDescription>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsBarcodeScannerOpen(true)}
                    className="flex-shrink-0"
                  >
                    <Barcode className="mr-2 h-4 w-4" />
                    Scanner
                  </Button>
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
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Aucun produit trouvé
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <Card key={product.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleAddToCart(product)}>
                        <CardContent className="p-4 flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="mr-1 text-xs">{product.category}</Badge>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-sm font-bold">{product.sellingPrice.toFixed(2)} €</p>
                              <Badge className={product.stock > 10 ? "bg-green-500" : "bg-yellow-500"}>
                                {product.stock} {product.unit}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center">
                              <Barcode className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="text-xs text-gray-500 truncate">{product.barcode}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Cart Section */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Panier
              </CardTitle>
              <div className="flex flex-col space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="customer">Client</Label>
                  <Select value={customer} onValueChange={setCustomer}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCustomer && selectedCustomer.type === 'business' && (
                  <div className="text-sm text-gray-500 ml-auto">
                    {selectedCustomer.contact}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border rounded-md">
                  Le panier est vide. Ajoutez des produits pour créer une vente.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Qté</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.price.toFixed(2)} €</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
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
                        <TableCell className="text-right">{item.total.toFixed(2)} €</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="discount">Remise (%)</Label>
                  <div className="flex items-center w-[100px]">
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="text-right"
                    />
                    <Percent className="h-4 w-4 ml-2 text-gray-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Notes sur la vente..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-20 mt-2"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t pt-4">
              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total:</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Remise ({discount}%):</span>
                  <span>-{discountAmount.toFixed(2)} €</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleOpenPaymentDialog}
                disabled={cartItems.length === 0}
              >
                <DollarSign className="mr-2 h-5 w-5" />
                Procéder au paiement
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Barcode Scanner Dialog */}
      <Dialog open={isBarcodeScannerOpen} onOpenChange={setIsBarcodeScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <BarcodeScanner 
            onBarcodeDetected={handleBarcodeDetected} 
            onClose={() => setIsBarcodeScannerOpen(false)} 
          />
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
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total à payer:</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            
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
          </div>
          
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleProcessPayment}>
              <Receipt className="h-4 w-4 mr-2" />
              Finaliser la vente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSInterface;
