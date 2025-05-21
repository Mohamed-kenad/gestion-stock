import React, { useState } from 'react';
import { 
  Search, Filter, CheckCircle, ShoppingCart, Plus, Minus, 
  Trash2, Save, FileText, Calendar, Building, Package, Truck, User
} from 'lucide-react';
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../components/ui/dialog";
import { useToast } from "../../components/ui/use-toast";

// Mock data for suppliers
const mockSuppliers = [
  { id: 1, name: 'Fournisseur Alpha', contact: '+33 1 23 45 67 89', email: 'contact@alpha-fournisseur.fr' },
  { id: 2, name: 'Grossiste Beta', contact: '+33 1 23 45 67 90', email: 'ventes@beta-grossiste.fr' },
  { id: 3, name: 'Distributeur Gamma', contact: '+33 1 23 45 67 91', email: 'commandes@gamma-distrib.fr' },
  { id: 4, name: 'Fournisseur Delta', contact: '+33 1 23 45 67 92', email: 'info@delta-fourni.fr' },
  { id: 5, name: 'Grossiste Epsilon', contact: '+33 1 23 45 67 93', email: 'service@epsilon-gross.fr' },
];

// Mock data for products
const mockProducts = [
  { id: 1, name: 'Farine de blé T55', category: 'Ingrédients', unit: 'kg' },
  { id: 2, name: 'Sucre en poudre', category: 'Ingrédients', unit: 'kg' },
  { id: 3, name: 'Huile d\'olive extra vierge', category: 'Ingrédients', unit: 'L' },
  { id: 4, name: 'Sel de mer', category: 'Ingrédients', unit: 'kg' },
  { id: 5, name: 'Levure boulangère', category: 'Ingrédients', unit: 'kg' },
  { id: 6, name: 'Vodka premium', category: 'Boissons', unit: 'bouteille' },
  { id: 7, name: 'Rhum ambré', category: 'Boissons', unit: 'bouteille' },
  { id: 8, name: 'Gin London Dry', category: 'Boissons', unit: 'bouteille' },
  { id: 9, name: 'Tequila Reposado', category: 'Boissons', unit: 'bouteille' },
  { id: 10, name: 'Whisky écossais', category: 'Boissons', unit: 'bouteille' },
  { id: 11, name: 'Détergent multi-surfaces', category: 'Entretien', unit: 'L' },
  { id: 12, name: 'Désinfectant alimentaire', category: 'Entretien', unit: 'L' },
  { id: 13, name: 'Liquide vaisselle professionnel', category: 'Entretien', unit: 'L' },
  { id: 14, name: 'Serviettes en papier', category: 'Entretien', unit: 'paquet' },
  { id: 15, name: 'Sacs poubelle renforcés', category: 'Entretien', unit: 'rouleau' },
];

// Mock data for departments
const mockDepartments = [
  { id: 1, name: 'Cuisine' },
  { id: 2, name: 'Bar' },
  { id: 3, name: 'Restaurant' },
  { id: 4, name: 'Service' },
  { id: 5, name: 'Entretien' },
];

const RecordPurchase = () => {
  const { toast } = useToast();
  
  // Purchase form state
  const [purchaseDate, setPurchaseDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [department, setDepartment] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  
  // New item form state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Filter products based on search and category
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  // Add item to purchase
  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || unitPrice <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un produit, spécifier une quantité et un prix valides.",
        variant: "destructive",
      });
      return;
    }
    
    const product = mockProducts.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;
    
    const newItem = {
      id: Date.now(),
      productId: product.id,
      name: product.name,
      quantity,
      unit: product.unit,
      unitPrice,
      total: quantity * unitPrice
    };
    
    setItems([...items, newItem]);
    setShowAddItemDialog(false);
    
    // Reset form
    setSelectedProduct('');
    setQuantity(1);
    setUnitPrice(0);
    setSearchTerm('');
    setSelectedCategory('all');
  };
  
  // Remove item from purchase
  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };
  
  // Submit purchase
  const handleSubmitPurchase = () => {
    if (!purchaseDate || !supplier || !department || !invoiceNumber || items.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et ajouter au moins un article.",
        variant: "destructive",
      });
      return;
    }
    
    // Here you would typically send the purchase data to your backend
    toast({
      title: "Achat enregistré",
      description: `L'achat a été enregistré avec succès. Référence: PUR-${Date.now().toString().substring(7)}`,
    });
    
    // Reset form
    setPurchaseDate('');
    setSupplier('');
    setDepartment('');
    setInvoiceNumber('');
    setDeliveryDate('');
    setPaymentMethod('');
    setNotes('');
    setItems([]);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Enregistrer un achat</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Détails de l'achat</CardTitle>
          <CardDescription>
            Enregistrez les informations d'un nouvel achat effectué
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Date d'achat*</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur*</Label>
              <Select value={supplier} onValueChange={setSupplier} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {mockSuppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Département*</Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Numéro de facture*</Label>
              <Input
                id="invoiceNumber"
                placeholder="ex: FACT-2025-123"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Date de livraison</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Méthode de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                  <SelectItem value="credit_card">Carte bancaire</SelectItem>
                  <SelectItem value="cash">Espèces</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez des notes concernant cet achat..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <Separator />
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Articles achetés</h3>
              <Button onClick={() => setShowAddItemDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un article
              </Button>
            </div>
            
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border rounded-md">
                Aucun article ajouté. Cliquez sur "Ajouter un article" pour commencer.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.unitPrice.toFixed(2)} €</TableCell>
                      <TableCell className="text-right">{item.total.toFixed(2)} €</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            <div className="mt-4 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-500">Montant total</p>
                <p className="text-xl font-bold">{totalAmount.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmitPurchase}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer l'achat
          </Button>
        </CardFooter>
      </Card>
      
      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un article</DialogTitle>
            <DialogDescription>
              Sélectionnez un produit et spécifiez la quantité et le prix
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Rechercher un produit..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
            
            <div className="h-60 overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        Aucun produit trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow 
                        key={product.id} 
                        className={selectedProduct === product.id.toString() ? "bg-blue-50" : ""}
                        onClick={() => setSelectedProduct(product.id.toString())}
                      >
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell>
                          <input 
                            type="radio" 
                            name="product" 
                            checked={selectedProduct === product.id.toString()} 
                            onChange={() => setSelectedProduct(product.id.toString())} 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité</Label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="mx-2 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Prix unitaire (€)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <p className="text-sm">Total: <span className="font-bold">{(quantity * unitPrice).toFixed(2)} €</span></p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleAddItem}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecordPurchase;
