import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, DollarSign, Package, Edit, Save, X, 
  ArrowUp, ArrowDown, Percent, History, Eye, FileText
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
import { useToast } from "../../../components/ui/use-toast";

// Mock data for products
const mockProducts = [
  {
    id: 1,
    name: 'Farine de blé T55',
    category: 'Ingrédients',
    unit: 'kg',
    purchasePrice: 2.50,
    currentSellingPrice: 4.75,
    suggestedSellingPrice: 5.00,
    stock: 120,
    lastPriceUpdate: '2025-04-15',
    margin: 90,
    status: 'normal'
  },
  {
    id: 2,
    name: 'Sucre en poudre',
    category: 'Ingrédients',
    unit: 'kg',
    purchasePrice: 1.80,
    currentSellingPrice: 3.25,
    suggestedSellingPrice: 3.60,
    stock: 85,
    lastPriceUpdate: '2025-04-20',
    margin: 80.6,
    status: 'review'
  },
  {
    id: 3,
    name: 'Huile d\'olive extra vierge',
    category: 'Ingrédients',
    unit: 'L',
    purchasePrice: 8.50,
    currentSellingPrice: 15.90,
    suggestedSellingPrice: 17.00,
    stock: 45,
    lastPriceUpdate: '2025-04-10',
    margin: 87.1,
    status: 'normal'
  },
  {
    id: 4,
    name: 'Vodka premium',
    category: 'Boissons',
    unit: 'bouteille',
    purchasePrice: 18.75,
    currentSellingPrice: 42.50,
    suggestedSellingPrice: 45.00,
    stock: 32,
    lastPriceUpdate: '2025-04-05',
    margin: 126.7,
    status: 'normal'
  },
  {
    id: 5,
    name: 'Rhum ambré',
    category: 'Boissons',
    unit: 'bouteille',
    purchasePrice: 22.50,
    currentSellingPrice: 48.90,
    suggestedSellingPrice: 47.25,
    stock: 28,
    lastPriceUpdate: '2025-04-12',
    margin: 117.3,
    status: 'review'
  },
  {
    id: 6,
    name: 'Gin London Dry',
    category: 'Boissons',
    unit: 'bouteille',
    purchasePrice: 19.80,
    currentSellingPrice: 44.50,
    suggestedSellingPrice: 44.50,
    stock: 35,
    lastPriceUpdate: '2025-04-18',
    margin: 124.7,
    status: 'normal'
  },
  {
    id: 7,
    name: 'Détergent multi-surfaces',
    category: 'Entretien',
    unit: 'L',
    purchasePrice: 3.25,
    currentSellingPrice: 5.90,
    suggestedSellingPrice: 6.50,
    stock: 60,
    lastPriceUpdate: '2025-04-22',
    margin: 81.5,
    status: 'normal'
  },
  {
    id: 8,
    name: 'Désinfectant alimentaire',
    category: 'Entretien',
    unit: 'L',
    purchasePrice: 4.50,
    currentSellingPrice: 7.90,
    suggestedSellingPrice: 8.10,
    stock: 48,
    lastPriceUpdate: '2025-04-25',
    margin: 75.6,
    status: 'review'
  },
];

// Mock data for price history
const mockPriceHistory = {
  1: [
    { date: '2025-04-15', price: 4.75, previousPrice: 4.50, change: 5.56, reason: 'Ajustement pour inflation' },
    { date: '2025-03-10', price: 4.50, previousPrice: 4.25, change: 5.88, reason: 'Augmentation du prix d\'achat' },
    { date: '2025-02-05', price: 4.25, previousPrice: 4.00, change: 6.25, reason: 'Ajustement saisonnier' },
  ],
  2: [
    { date: '2025-04-20', price: 3.25, previousPrice: 3.00, change: 8.33, reason: 'Ajustement pour inflation' },
    { date: '2025-03-15', price: 3.00, previousPrice: 2.85, change: 5.26, reason: 'Harmonisation des prix' },
    { date: '2025-02-10', price: 2.85, previousPrice: 2.75, change: 3.64, reason: 'Légère augmentation' },
  ],
};

const SalesPricing = () => {
  const { toast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  // Edit form state
  const [newSellingPrice, setNewSellingPrice] = useState(0);
  const [priceChangeReason, setPriceChangeReason] = useState('');
  const [applyDate, setApplyDate] = useState('');
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 800);
  }, []);

  // Filter products based on search term, category, and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Open edit dialog
  const handleEditPrice = (product) => {
    setSelectedProduct(product);
    setNewSellingPrice(product.currentSellingPrice);
    setPriceChangeReason('');
    setApplyDate(new Date().toISOString().split('T')[0]);
    setIsEditDialogOpen(true);
  };

  // Open history dialog
  const handleViewHistory = (product) => {
    setSelectedProduct(product);
    setIsHistoryDialogOpen(true);
  };

  // Save new price
  const handleSavePrice = () => {
    if (!newSellingPrice || newSellingPrice <= 0 || !priceChangeReason || !applyDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate new margin
    const newMargin = ((newSellingPrice - selectedProduct.purchasePrice) / selectedProduct.purchasePrice) * 100;
    
    // Update product in state
    const updatedProducts = products.map(product => 
      product.id === selectedProduct.id 
        ? { 
            ...product, 
            currentSellingPrice: parseFloat(newSellingPrice), 
            lastPriceUpdate: applyDate,
            margin: parseFloat(newMargin.toFixed(1)),
            status: 'normal'
          } 
        : product
    );
    
    setProducts(updatedProducts);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Prix mis à jour",
      description: `Le prix de vente de ${selectedProduct.name} a été mis à jour avec succès.`,
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'review':
        return <Badge className="bg-yellow-500">À réviser</Badge>;
      case 'normal':
      default:
        return <Badge className="bg-green-500">Normal</Badge>;
    }
  };

  // Get price change indicator
  const getPriceChangeIndicator = (current, suggested) => {
    if (current === suggested) return null;
    
    return current < suggested ? (
      <span className="text-green-600 flex items-center">
        <ArrowUp className="h-4 w-4 mr-1" />
        {(((suggested - current) / current) * 100).toFixed(1)}%
      </span>
    ) : (
      <span className="text-red-600 flex items-center">
        <ArrowDown className="h-4 w-4 mr-1" />
        {(((current - suggested) / current) * 100).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Définir les prix de vente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des produits</CardTitle>
          <CardDescription>
            Gérez les prix de vente de tous les produits en stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="review">À réviser</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix d'achat</TableHead>
                    <TableHead>Prix de vente actuel</TableHead>
                    <TableHead>Prix suggéré</TableHead>
                    <TableHead>Marge</TableHead>
                    <TableHead>Dernière mise à jour</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4 text-gray-500">
                        Aucun produit trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.purchasePrice.toFixed(2)} €</TableCell>
                        <TableCell>{product.currentSellingPrice.toFixed(2)} €</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {product.suggestedSellingPrice.toFixed(2)} €
                            {getPriceChangeIndicator(product.currentSellingPrice, product.suggestedSellingPrice)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={product.margin < 30 ? "text-red-600" : "text-green-600"}>
                            {product.margin.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>{product.lastPriceUpdate}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewHistory(product)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditPrice(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Price Dialog */}
      {selectedProduct && isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Modifier le prix de vente
              </DialogTitle>
              <DialogDescription>
                Définir un nouveau prix de vente pour {selectedProduct.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Produit</Label>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Catégorie</Label>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Prix d'achat</Label>
                  <p className="font-medium">{selectedProduct.purchasePrice.toFixed(2)} €</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Prix de vente actuel</Label>
                  <p className="font-medium">{selectedProduct.currentSellingPrice.toFixed(2)} €</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Prix suggéré</Label>
                  <p className="font-medium">{selectedProduct.suggestedSellingPrice.toFixed(2)} €</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Marge actuelle</Label>
                  <p className="font-medium">{selectedProduct.margin.toFixed(1)}%</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPrice">Nouveau prix de vente (€)*</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="newPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-8"
                      value={newSellingPrice}
                      onChange={(e) => setNewSellingPrice(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  {newSellingPrice > 0 && selectedProduct.purchasePrice > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Nouvelle marge: </span>
                      <span className={((newSellingPrice - selectedProduct.purchasePrice) / selectedProduct.purchasePrice) * 100 < 30 ? "text-red-600" : "text-green-600"}>
                        {(((newSellingPrice - selectedProduct.purchasePrice) / selectedProduct.purchasePrice) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="applyDate">Date d'application*</Label>
                  <Input
                    id="applyDate"
                    type="date"
                    value={applyDate}
                    onChange={(e) => setApplyDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Raison du changement de prix*</Label>
                  <Textarea
                    id="reason"
                    placeholder="Expliquez pourquoi vous modifiez ce prix..."
                    value={priceChangeReason}
                    onChange={(e) => setPriceChangeReason(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleSavePrice}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer le nouveau prix
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Price History Dialog */}
      {selectedProduct && isHistoryDialogOpen && (
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                Historique des prix pour {selectedProduct.name}
              </DialogTitle>
              <DialogDescription>
                Consultez l'évolution des prix de vente au fil du temps
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Produit</Label>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Catégorie</Label>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Prix d'achat actuel</Label>
                  <p className="font-medium">{selectedProduct.purchasePrice.toFixed(2)} €</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Prix de vente actuel</Label>
                  <p className="font-medium">{selectedProduct.currentSellingPrice.toFixed(2)} €</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Historique des changements de prix</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Nouveau prix</TableHead>
                      <TableHead>Ancien prix</TableHead>
                      <TableHead>Variation</TableHead>
                      <TableHead>Raison</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPriceHistory[selectedProduct.id] ? (
                      mockPriceHistory[selectedProduct.id].map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.price.toFixed(2)} €</TableCell>
                          <TableCell>{record.previousPrice.toFixed(2)} €</TableCell>
                          <TableCell>
                            <span className={record.change > 0 ? "text-green-600" : "text-red-600"}>
                              {record.change > 0 ? "+" : ""}{record.change.toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell>{record.reason}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          Aucun historique de prix disponible pour ce produit
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Fermer</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SalesPricing;
