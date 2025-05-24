import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsAPI, categoriesAPI } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Package, ShoppingCart, Plus, 
  Info, BarChart2, ArrowRight, ChevronRight, ChevronDown,
  AlertTriangle, Loader2
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";

const ProductsByCategory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [stockFilter, setStockFilter] = useState('all');
  
  // Fetch categories using React Query
  const { 
    data: categories = [], 
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll,
    // Prevent error from being thrown to the console
    onError: () => {
      // Silent error handling - the API will return mock data
    },
    // Don't retry failed requests
    retry: false
  });
  
  // Fetch products using React Query
  const { 
    data: products = [], 
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll,
    // Prevent error from being thrown to the console
    onError: () => {
      // Silent error handling - the API will return mock data
    },
    // Don't retry failed requests
    retry: false
  });
  
  // Loading state
  const isLoading = categoriesLoading || productsLoading;
  const hasError = categoriesError || productsError;
  
  // Filter products based on search term and stock filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStock = 
      stockFilter === 'all' || 
      (stockFilter === 'low' && product.quantity <= (product.threshold || 10)) ||
      (stockFilter === 'normal' && product.quantity > (product.threshold || 10));
    
    return matchesSearch && matchesStock;
  });
  
  // Group products by category
  const productsByCategory = categories.map(category => {
    const categoryProducts = filteredProducts.filter(product => 
      product.categoryId === category.id || product.category === category.name
    );
    
    return {
      ...category,
      count: categoryProducts.length,
      products: categoryProducts
    };
  }).filter(category => category.count > 0);
  
  // Handle view product details
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };
  
  // Handle add to order
  const handleAddToOrder = (productId) => {
    // Navigate to create order page with product pre-selected
    navigate(`/dashboard/vendor/orders/create?product=${productId}`);
    
    toast({
      title: "Produit sélectionné",
      description: "Vous pouvez maintenant créer un bon de commande avec ce produit.",
    });
  };
  
  // Get stock status badge
  const getStockStatusBadge = (product) => {
    if (!product.quantity && product.quantity !== 0) return <Badge variant="outline">Inconnu</Badge>;
    
    const isLow = product.quantity <= (product.threshold || 10);
    
    if (isLow) {
      return <Badge variant="destructive">Stock bas</Badge>;
    } else {
      return <Badge variant="outline">Normal</Badge>;
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Produits par catégorie</h1>
          <p className="text-muted-foreground">Consultez les produits disponibles par catégorie</p>
        </div>
        <Button onClick={() => navigate('/dashboard/vendor/orders/create')}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Créer un bon de commande
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Filtrez les produits par nom ou statut de stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
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
            </div>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut du stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits</SelectItem>
                <SelectItem value="low">Stock bas</SelectItem>
                <SelectItem value="normal">Stock normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Products by Category */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : hasError ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-medium">Erreur lors du chargement des produits</h3>
            <p className="text-muted-foreground mt-2">
              {categoriesError?.message || productsError?.message || "Une erreur s'est produite"}
            </p>
          </div>
        ) : productsByCategory.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">Aucun produit trouvé</h3>
            <p className="text-muted-foreground mt-2">Aucun produit ne correspond à votre recherche</p>
          </div>
        ) : (
          productsByCategory.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Collapsible open={expandedCategories.includes(category.id)} onOpenChange={(open) => {
                  setExpandedCategories(open 
                    ? [...expandedCategories, category.id]
                    : expandedCategories.filter(id => id !== category.id)
                  );
                }}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <span className="mr-2">{category.icon || '📦'}</span>
                      {category.name}
                    </CardTitle>
                    <Badge variant="outline">{category.count} produits</Badge>
                  </div>
                  <CardDescription className="mt-1.5">
                    Produits disponibles dans cette catégorie
                  </CardDescription>
                  
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full mt-2 flex justify-between items-center">
                      <span>Voir les produits</span>
                      {expandedCategories.includes(category.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-2">
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {category.products.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            Aucun produit dans cette catégorie
                          </div>
                        ) : (
                          category.products.map((product) => (
                            <div 
                              key={product.id} 
                              className="p-2 rounded-md hover:bg-muted flex justify-between items-center cursor-pointer"
                              onClick={() => handleViewProduct(product)}
                            >
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Stock: {product.quantity || 0} {product.unit || 'unité'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{(product.price || 0).toFixed(2)} DH</div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToOrder(product.id);
                                  }}
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
      
      {/* Product Details Dialog */}
      {selectedProduct && (
        <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Détails du produit</DialogTitle>
              <DialogDescription>
                Informations détaillées sur {selectedProduct.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
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
                  <h4 className="text-sm font-medium text-muted-foreground">Prix</h4>
                  <p className="text-base">{(selectedProduct.price || 0).toFixed(2)} DH</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Unité</h4>
                  <p className="text-base">{selectedProduct.unit || 'unité'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Stock actuel</h4>
                  <p className="text-base">{selectedProduct.quantity || 0} {selectedProduct.unit || 'unité'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Statut du stock</h4>
                  <div className="mt-1">{getStockStatusBadge(selectedProduct)}</div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProductDetails(false)}>
                Fermer
              </Button>
              <Button onClick={() => handleAddToOrder(selectedProduct.id)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Commander
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProductsByCategory;
