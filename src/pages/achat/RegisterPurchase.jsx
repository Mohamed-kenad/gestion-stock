import React, { useState } from 'react';
import { 
  ShoppingCart, Search, Plus, Trash2, Save, FileText, Package
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
import { format } from "date-fns";

// Mock data
const mockSuppliers = [
  { id: 1, name: 'Fournisseur A', contact: 'contact@fournisseura.com', phone: '+212 661 234 567' },
  { id: 2, name: 'Fournisseur B', contact: 'contact@fournisseurb.com', phone: '+212 662 345 678' },
  { id: 3, name: 'Fournisseur C', contact: 'contact@fournisseurc.com', phone: '+212 663 456 789' },
  { id: 4, name: 'Fournisseur D', contact: 'contact@fournisseurd.com', phone: '+212 664 567 890' },
  { id: 5, name: 'Fournisseur E', contact: 'contact@fournisseure.com', phone: '+212 665 678 901' },
];

const mockProducts = [
  { id: 1, name: 'Tomates', category: 'Légumes', unit: 'kg', price: 3.5 },
  { id: 2, name: 'Oignons', category: 'Légumes', unit: 'kg', price: 2.8 },
  { id: 3, name: 'Pommes de terre', category: 'Légumes', unit: 'kg', price: 2.2 },
  { id: 4, name: 'Carottes', category: 'Légumes', unit: 'kg', price: 2.5 },
  { id: 5, name: 'Poulet', category: 'Viandes', unit: 'kg', price: 12.5 },
  { id: 6, name: 'Boeuf', category: 'Viandes', unit: 'kg', price: 18.5 },
  { id: 7, name: 'Agneau', category: 'Viandes', unit: 'kg', price: 22.0 },
  { id: 8, name: 'Riz', category: 'Céréales', unit: 'kg', price: 4.5 },
  { id: 9, name: 'Pâtes', category: 'Céréales', unit: 'kg', price: 3.8 },
  { id: 10, name: 'Huile d\'olive', category: 'Huiles et graisses', unit: 'L', price: 8.5 },
  { id: 11, name: 'Lait', category: 'Produits laitiers', unit: 'L', price: 1.2 },
  { id: 12, name: 'Fromage', category: 'Produits laitiers', unit: 'kg', price: 15.0 },
];

const mockDepartments = [
  { id: 1, name: 'Cuisine' },
  { id: 2, name: 'Pâtisserie' },
  { id: 3, name: 'Bar' },
  { id: 4, name: 'Service' },
  { id: 5, name: 'Entretien' },
];

const RegisterPurchase = () => {
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [supplier, setSupplier] = useState('');
  const [department, setDepartment] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');

  // Filter products based on search term
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Open product dialog
  const openProductDialog = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setUnitPrice(product.price);
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
    if (!selectedProduct || quantity <= 0 || unitPrice <= 0) return;

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
  };

  // Remove item from purchase
  const removeItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Handle save purchase
  const handleSavePurchase = () => {
    if (!supplier || !department || items.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires et ajouter au moins un produit.');
      return;
    }

    const purchase = {
      date: purchaseDate,
      supplier,
      department,
      reference,
      notes,
      items,
      total: calculateTotal(),
      createdAt: new Date().toISOString(),
      createdBy: 'Nadia Tazi', // Would come from auth context in a real app
    };

    // In a real app, this would be an API call
    console.log('Purchase saved:', purchase);
    alert('Achat enregistré avec succès!');
    
    // Reset form
    setSupplier('');
    setDepartment('');
    setReference('');
    setNotes('');
    setItems([]);
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
              <Label htmlFor="supplier">Fournisseur</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {mockSuppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference">Référence (Facture/Bon de livraison)</Label>
              <Input
                id="reference"
                placeholder="Entrez la référence du document"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
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
