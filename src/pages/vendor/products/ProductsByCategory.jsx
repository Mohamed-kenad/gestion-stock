import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsAPI, categoriesAPI, bonsAPI } from '../../../lib/api';
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
  const [activeCategory, setActiveCategory] = useState(null); // Only one active category at a time
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
    retry: false,
    refetchInterval: 30000 // Refetch every 30 seconds to get newly priced products
  });
  
  // Fetch bons to get products that have been priced by the Auditor
  const {
    data: bons = [],
    isLoading: bonsLoading
  } = useQuery({
    queryKey: ['bons', 'ready_for_sale'],
    queryFn: () => bonsAPI.getByStatus('ready_for_sale'),
    onError: () => {
      // Silent error handling
    },
    retry: false,
    refetchInterval: 30000 // Refetch every 30 seconds
  });
  
  // Loading state
  const isLoading = categoriesLoading || productsLoading || bonsLoading;
  const hasError = categoriesError || productsError;
  
  // Extract products from bons that have been priced by the Auditor with their selling prices
  const pricedProducts = useMemo(() => {
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
                price: product.sellingPrice || 0, // Use selling price set by Auditor
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
                price: product.sellingPrice || 0, // Use selling price set by Auditor
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
    
    return bonProductsMap;
  }, [bons]);
  
  // Extract just the IDs for filtering
  const pricedProductIds = useMemo(() => {
    return new Set(pricedProducts.keys());
  }, [pricedProducts]);
  
  // Use products directly from bons that have been priced by the Auditor
  const enhancedProducts = useMemo(() => {
    return products.filter(product => {
      // Check if this product is in our set of priced product IDs
      return pricedProductIds.has(product.id?.toString()) || 
             pricedProductIds.has(product.name);
    }).map(product => {
      // Add the selling price from our pricedProducts map
      const pricedProduct = pricedProducts.get(product.id?.toString()) || pricedProducts.get(product.name);
      if (pricedProduct) {
        return {
          ...product,
          price: pricedProduct.price,
          sellingPrice: pricedProduct.sellingPrice,
          purchasePrice: pricedProduct.purchasePrice,
          // Ensure we have the correct quantity and unit from the bon
          quantity: pricedProduct.quantity || product.quantity,
          unit: pricedProduct.unit || product.unit || 'unité'
        };
      }
      return product;
    });
  }, [products, pricedProductIds, pricedProducts]);
  
  // Filter products based on search term and stock filter
  const filteredProducts = enhancedProducts.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStock = 
      stockFilter === 'all' ? true :
      stockFilter === 'in_stock' ? (product.quantity > 0) :
      stockFilter === 'low_stock' ? (product.quantity > 0 && product.quantity <= product.threshold) :
      stockFilter === 'out_of_stock' ? (product.quantity <= 0) : true;
    
    return matchesSearch && matchesStock;
  });
  
  // Group products by category - create a map of all categories with their products
  const productsByCategory = useMemo(() => {
    return categories.map(category => {
      // Find products that belong to this category
      const categoryProducts = filteredProducts.filter(product => {
        // Check for different ways the category might be stored
        return (
          // Direct category ID match
          (product.categoryId && product.categoryId.toString() === category.id.toString()) ||
          // Direct category name match
          (product.category && product.category.toLowerCase() === category.name.toLowerCase()) ||
          // For numeric category IDs stored as numbers
          (product.categoryId && parseInt(product.categoryId) === parseInt(category.id))
        );
      });
      
      // Return category with its products
      return {
        ...category,
        count: categoryProducts.length,
        products: categoryProducts
      };
    });
  }, [categories, filteredProducts]);
  
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
      description: "Vous pouvez maintenant créer une commande avec ce produit",
    });
  };
  
  // Get stock status badge
  const getStockStatusBadge = (product) => {
    if (!product.quantity || product.quantity <= 0) {
      return <Badge variant="destructive">Rupture de stock</Badge>;
    } else if (product.quantity <= (product.threshold || 10)) {
      return <Badge variant="warning" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Stock bas</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">En stock</Badge>;
    }
  };
  
  // Handle product selection for details
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };
  
  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Produits par catégorie</h1>
          <p className="text-muted-foreground">Consultez les produits disponibles par catégorie</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher un produit..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrer par stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les produits</SelectItem>
              <SelectItem value="in_stock">En stock</SelectItem>
              <SelectItem value="low_stock">Stock bas</SelectItem>
              <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-48 mt-1" />
                <Skeleton className="h-8 w-full mt-2" />
              </CardHeader>
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
        ) : categories.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">Aucune catégorie trouvée</h3>
            <p className="text-muted-foreground mt-2">Aucune catégorie n'est disponible dans le système</p>
          </div>
        ) : (
          categories.map((category) => {
            // Get the products for this category from our productsByCategory
            const categoryData = productsByCategory.find(c => c.id === category.id) || {
              ...category,
              count: 0,
              products: []
            };
            
            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Collapsible 
                    open={activeCategory === category.id} 
                    onOpenChange={(open) => {
                      // When opening, set this as the active category
                      // When closing, clear the active category
                      setActiveCategory(open ? category.id : null);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <span className="mr-2">{category.icon || '📦'}</span>
                        {category.name}
                      </CardTitle>
                      <Badge variant="outline">{categoryData.count} produits</Badge>
                    </div>
                    <CardDescription className="mt-1.5">
                      Produits disponibles dans cette catégorie
                    </CardDescription>
                    
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full mt-2 flex justify-between items-center">
                        <span>Voir les produits</span>
                        {activeCategory === category.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-2">
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2 p-2">
                          {categoryData.products.length > 0 ? (
                            categoryData.products.map(product => (
                              <div
                                key={product.id}
                                className="p-2 rounded-md hover:bg-muted flex justify-between items-center cursor-pointer"
                                onClick={() => handleProductSelect(product)}
                              >
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Stock: {product.quantity || 0} {product.unit || 'unité'}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-green-700">
                                    Prix de vente: {(product.sellingPrice || product.price || 0).toFixed(2)} DH
                                  </div>
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
                          ) : (
                            <div className="p-4 text-center">
                              <AlertTriangle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                              <p className="text-sm text-muted-foreground">Aucun produit disponible dans cette catégorie</p>
                              <p className="text-xs text-muted-foreground mt-1">Les produits doivent être tarifés par l'Auditeur avant d'être disponibles</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CollapsibleContent>
                  </Collapsible>
                </CardHeader>
              </Card>
            );
          })
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
                  <h4 className="text-sm font-medium text-muted-foreground">Prix de vente</h4>
                  <p className="text-base font-bold text-green-700">{(selectedProduct.sellingPrice || selectedProduct.price || 0).toFixed(2)} DH</p>
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
