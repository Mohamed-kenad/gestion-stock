import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Package, ShoppingCart, Plus, 
  Info, BarChart2, ArrowRight, ChevronRight, ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";

// Mock data for categories
const mockCategories = [
  { id: 1, name: 'Viandes', icon: '🥩', count: 8 },
  { id: 2, name: 'Légumes', icon: '🥬', count: 12 },
  { id: 3, name: 'Fruits', icon: '🍎', count: 10 },
  { id: 4, name: 'Produits laitiers', icon: '🧀', count: 6 },
  { id: 5, name: 'Boissons', icon: '🥤', count: 9 },
  { id: 6, name: 'Céréales', icon: '🌾', count: 5 },
  { id: 7, name: 'Épices', icon: '🌶️', count: 15 },
  { id: 8, name: 'Conserves', icon: '🥫', count: 7 },
];

// Mock data for products
const mockProducts = [
  // Viandes
  { id: 1, name: 'Poulet entier', category: 'Viandes', unit: 'kg', price: 45.00, stock: 25, threshold: 10, status: 'normal' },
  { id: 2, name: 'Boeuf haché', category: 'Viandes', unit: 'kg', price: 120.00, stock: 15, threshold: 8, status: 'normal' },
  { id: 3, name: 'Escalope de dinde', category: 'Viandes', unit: 'kg', price: 90.00, stock: 12, threshold: 10, status: 'normal' },
  { id: 4, name: 'Agneau', category: 'Viandes', unit: 'kg', price: 130.00, stock: 8, threshold: 5, status: 'normal' },
  { id: 5, name: 'Côtelettes de porc', category: 'Viandes', unit: 'kg', price: 85.00, stock: 10, threshold: 8, status: 'normal' },
  { id: 6, name: 'Foie de veau', category: 'Viandes', unit: 'kg', price: 95.00, stock: 5, threshold: 5, status: 'warning' },
  { id: 7, name: 'Lapin entier', category: 'Viandes', unit: 'kg', price: 75.00, stock: 3, threshold: 5, status: 'warning' },
  { id: 8, name: 'Cailles', category: 'Viandes', unit: 'unité', price: 25.00, stock: 20, threshold: 15, status: 'normal' },
  
  // Légumes
  { id: 9, name: 'Tomates', category: 'Légumes', unit: 'kg', price: 8.00, stock: 50, threshold: 20, status: 'normal' },
  { id: 10, name: 'Pommes de terre', category: 'Légumes', unit: 'kg', price: 5.00, stock: 100, threshold: 30, status: 'normal' },
  { id: 11, name: 'Oignons', category: 'Légumes', unit: 'kg', price: 6.00, stock: 40, threshold: 20, status: 'normal' },
  { id: 12, name: 'Carottes', category: 'Légumes', unit: 'kg', price: 7.00, stock: 35, threshold: 15, status: 'normal' },
  { id: 13, name: 'Courgettes', category: 'Légumes', unit: 'kg', price: 9.00, stock: 25, threshold: 15, status: 'normal' },
  { id: 14, name: 'Aubergines', category: 'Légumes', unit: 'kg', price: 12.00, stock: 18, threshold: 10, status: 'normal' },
  { id: 15, name: 'Poivrons', category: 'Légumes', unit: 'kg', price: 15.00, stock: 20, threshold: 10, status: 'normal' },
  { id: 16, name: 'Concombres', category: 'Légumes', unit: 'kg', price: 8.00, stock: 30, threshold: 15, status: 'normal' },
  { id: 17, name: 'Champignons', category: 'Légumes', unit: 'kg', price: 25.00, stock: 8, threshold: 10, status: 'warning' },
  { id: 18, name: 'Ail', category: 'Légumes', unit: 'kg', price: 30.00, stock: 5, threshold: 5, status: 'warning' },
  { id: 19, name: 'Chou-fleur', category: 'Légumes', unit: 'unité', price: 15.00, stock: 12, threshold: 8, status: 'normal' },
  { id: 20, name: 'Brocoli', category: 'Légumes', unit: 'kg', price: 18.00, stock: 10, threshold: 8, status: 'normal' },
  
  // Fruits
  { id: 21, name: 'Pommes', category: 'Fruits', unit: 'kg', price: 15.00, stock: 40, threshold: 20, status: 'normal' },
  { id: 22, name: 'Bananes', category: 'Fruits', unit: 'kg', price: 12.00, stock: 35, threshold: 20, status: 'normal' },
  { id: 23, name: 'Oranges', category: 'Fruits', unit: 'kg', price: 10.00, stock: 45, threshold: 20, status: 'normal' },
  { id: 24, name: 'Citrons', category: 'Fruits', unit: 'kg', price: 14.00, stock: 25, threshold: 15, status: 'normal' },
  { id: 25, name: 'Fraises', category: 'Fruits', unit: 'kg', price: 35.00, stock: 12, threshold: 10, status: 'normal' },
  { id: 26, name: 'Raisins', category: 'Fruits', unit: 'kg', price: 25.00, stock: 15, threshold: 10, status: 'normal' },
  { id: 27, name: 'Ananas', category: 'Fruits', unit: 'unité', price: 20.00, stock: 8, threshold: 5, status: 'normal' },
  { id: 28, name: 'Mangues', category: 'Fruits', unit: 'kg', price: 40.00, stock: 6, threshold: 5, status: 'normal' },
  { id: 29, name: 'Poires', category: 'Fruits', unit: 'kg', price: 18.00, stock: 20, threshold: 15, status: 'normal' },
  { id: 30, name: 'Kiwis', category: 'Fruits', unit: 'kg', price: 30.00, stock: 10, threshold: 8, status: 'normal' },
];

const ProductsByCategory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [openCategories, setOpenCategories] = useState({});
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setCategories(mockCategories);
      
      // Initialize all categories as open
      const initialOpenState = {};
      mockCategories.forEach(category => {
        initialOpenState[category.id] = true;
      });
      setOpenCategories(initialOpenState);
    }, 500);
  }, []);
  
  // Filter products based on search, category, and stock
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStock = stockFilter === 'all' || 
      (stockFilter === 'low' && product.stock <= product.threshold) ||
      (stockFilter === 'normal' && product.stock > product.threshold);
    
    return matchesSearch && matchesCategory && matchesStock;
  });
  
  // Group products by category
  const productsByCategory = {};
  filteredProducts.forEach(product => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });
  
  // Handle view product details
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };
  
  // Handle add to order
  const handleAddToOrder = (productId) => {
    toast({
      title: "Produit ajouté",
      description: "Le produit a été ajouté au bon de commande.",
    });
    
    // Navigate to create order page
    navigate('/dashboard/vendor/orders/create');
  };
  
  // Toggle category collapse
  const toggleCategory = (categoryId) => {
    setOpenCategories({
      ...openCategories,
      [categoryId]: !openCategories[categoryId]
    });
  };
  
  // Get stock status badge
  const getStockStatusBadge = (status) => {
    switch (status) {
      case 'normal':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Stock normal</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Stock bas</Badge>;
      case 'critical':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Stock critique</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits par catégorie</h1>
          <p className="text-muted-foreground">
            Consultez les produits disponibles par catégorie
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/vendor/orders/create')}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Créer un bon de commande
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
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
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Niveau de stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="low">Stock bas</SelectItem>
                <SelectItem value="normal">Stock normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Products by Category */}
      <div className="space-y-6">
        {Object.keys(productsByCategory).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Aucun produit trouvé</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Aucun produit ne correspond à vos critères de recherche
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(productsByCategory).map(([category, categoryProducts]) => {
            const categoryInfo = categories.find(c => c.name === category);
            return (
              <Card key={category}>
                <Collapsible
                  open={openCategories[categoryInfo?.id] || false}
                  onOpenChange={() => toggleCategory(categoryInfo?.id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between p-4 cursor-pointer">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{categoryInfo?.icon}</span>
                        <div>
                          <CardTitle>{category}</CardTitle>
                          <CardDescription>{categoryProducts.length} produits</CardDescription>
                        </div>
                      </div>
                      {openCategories[categoryInfo?.id] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produit</TableHead>
                            <TableHead>Unité</TableHead>
                            <TableHead className="text-right">Prix</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>{product.unit}</TableCell>
                              <TableCell className="text-right">{product.price.toFixed(2)} DH</TableCell>
                              <TableCell className="text-right">{product.stock} {product.unit}</TableCell>
                              <TableCell>{getStockStatusBadge(product.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleViewProduct(product)}>
                                    <Info className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleAddToOrder(product.id)}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Product Details Dialog */}
      {selectedProduct && (
        <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Détails du produit</DialogTitle>
              <DialogDescription>
                Informations détaillées sur {selectedProduct.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Nom</h4>
                <p className="text-base">{selectedProduct.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Catégorie</h4>
                <p className="text-base">{selectedProduct.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Unité</h4>
                <p className="text-base">{selectedProduct.unit}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Prix</h4>
                <p className="text-base">{selectedProduct.price.toFixed(2)} DH</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Stock actuel</h4>
                <p className="text-base">{selectedProduct.stock} {selectedProduct.unit}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Seuil d'alerte</h4>
                <p className="text-base">{selectedProduct.threshold} {selectedProduct.unit}</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground">Statut du stock</h4>
                <div className="mt-1">{getStockStatusBadge(selectedProduct.status)}</div>
              </div>
              
              {/* Stock history chart would go here in a real app */}
              <div className="col-span-2 border rounded-lg p-4 mt-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Historique du stock</h4>
                  <Button variant="ghost" size="sm">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Voir détails
                  </Button>
                </div>
                <div className="h-32 flex items-center justify-center text-muted-foreground">
                  Graphique d'historique du stock (simulé)
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowProductDetails(false)}>
                Fermer
              </Button>
              <Button onClick={() => {
                handleAddToOrder(selectedProduct.id);
                setShowProductDetails(false);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter au bon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProductsByCategory;
