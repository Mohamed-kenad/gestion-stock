import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bonsAPI, productsAPI, categoriesAPI, notificationsAPI } from '../../../lib/api';
import { useToast } from '../../../hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../components/ui/accordion';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Checkbox } from '../../../components/ui/checkbox';
import { Package, Search, CheckCircle, AlertCircle, Tag, Layers, Plus, Filter, Bell, BellRing } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../../components/ui/alert';

const BonManagement = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBon, setSelectedBon] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [newSellingPrice, setNewSellingPrice] = useState('');
  const [isBundled, setIsBundled] = useState(false);
  const [bundleInfo, setBundleInfo] = useState('');
  const [isPromotion, setIsPromotion] = useState(false);
  const [promotionInfo, setPromotionInfo] = useState('');
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [productToAdd, setProductToAdd] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();
  
  // Fetch bons data using React Query
  const { data: bons = [], isLoading, error } = useQuery({
    queryKey: ['bons'],
    queryFn: () => bonsAPI.getAll(),
    refetchInterval: 30000 // Refetch every 30 seconds to catch new bons
  });
  
  // Fetch notifications for auditor
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'auditor'],
    queryFn: () => notificationsAPI.getByRole('auditor'),
    refetchInterval: 15000 // Check for new notifications every 15 seconds
  });
  
  // Fetch products data
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll()
  });
  
  // Fetch categories data
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll()
  });
  
  // Update bon mutation
  const updateBonMutation = useMutation({
    mutationFn: (updatedBon) => bonsAPI.update(updatedBon.id, updatedBon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bons'] });
      toast({
        title: "Bon mis à jour",
        description: "Les informations du bon ont été mises à jour.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Filtered bons based on search query
  const filteredBons = searchQuery.trim() === '' 
    ? bons 
    : bons.filter(bon => {
        const query = searchQuery.toLowerCase();
        return bon.id.toLowerCase().includes(query) ||
          bon.supplier?.toLowerCase().includes(query) ||
          bon.warehouseRef?.toLowerCase().includes(query) ||
          bon.products?.some(product => 
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
          );
      });



  // Handle product selection for editing
  const handleProductSelect = (bon, product) => {
    setSelectedBon(bon);
    setSelectedProduct(product);
    setNewSellingPrice(product.sellingPrice || product.currentSellingPrice || product.purchasePrice * 1.3);
    setIsBundled(product.bundle || false);
    setBundleInfo(product.bundleInfo || '');
    setIsPromotion(product.promotion || false);
    setPromotionInfo(product.promotionInfo || '');
    setIsProductDialogOpen(true);
  };
  
  // Filter products based on search and category
  const filteredProducts = productSearchTerm.trim() === '' && selectedCategory === 'all'
    ? products
    : products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(productSearchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || 
                              (product.categoryId && product.categoryId.toString() === selectedCategory) || 
                              (product.category && categories.find(c => c.name === product.category)?.id.toString() === selectedCategory);
        return matchesSearch && matchesCategory;
      });
  
  // Handle adding a product to a bon
  const handleAddProductToBon = () => {
    if (!productToAdd || !selectedBon) return;
    
    // Create a new product entry for the bon
    const newProduct = {
      id: `${selectedBon.id}-p${selectedBon.products.length + 1}`,
      name: productToAdd.name,
      category: productToAdd.category,
      purchasePrice: productToAdd.price,
      quantity: 1,
      unit: productToAdd.unit || 'pcs',
      readyForSale: false
    };
    
    // Update the bon with the new product
    const updatedBon = {
      ...selectedBon,
      products: [...selectedBon.products, newProduct],
      totalItems: (selectedBon.totalItems || 0) + 1
    };
    
    // Use mutation to update the bon
    updateBonMutation.mutate(updatedBon);
    setIsAddProductDialogOpen(false);
    setProductToAdd(null);
    setProductSearchTerm('');
    
    toast({
      title: "Produit ajouté",
      description: `${productToAdd.name} a été ajouté au bon ${selectedBon.id}.`,
    });
  };

  // Save product pricing and information
  const handleSaveProduct = () => {
    if (!newSellingPrice || parseFloat(newSellingPrice) <= 0) {
      toast({
        title: "Prix invalide",
        description: "Veuillez entrer un prix de vente valide.",
        variant: "destructive",
      });
      return;
    }

    // Create updated bon with modified product
    const updatedBon = {
      ...selectedBon,
      products: selectedBon.products.map(product => {
        if (product.id === selectedProduct.id) {
          return {
            ...product,
            sellingPrice: parseFloat(newSellingPrice),
            bundle: isBundled,
            bundleInfo: isBundled ? bundleInfo : null,
            promotion: isPromotion,
            promotionInfo: isPromotion ? promotionInfo : null,
            readyForSale: true
          };
        }
        return product;
      })
    };
    
    // Update status if all products are ready for sale
    updatedBon.status = updatedBon.products.every(p => p.readyForSale) 
      ? 'ready_for_sale' 
      : 'in_progress';

    // Use mutation to update the bon
    updateBonMutation.mutate(updatedBon);
    setIsProductDialogOpen(false);
  };

  // Mark a bon as ready for sale
  const handleMarkBonReady = (bonId) => {
    const bon = bons.find(b => b.id === bonId);
    if (!bon) return;
    
    // Check if all products have pricing information
    const allProductsReady = bon.products.every(product => product.readyForSale);
    
    if (!allProductsReady) {
      toast({
        title: "Action impossible",
        description: "Tous les produits doivent être configurés avant de marquer le bon comme prêt.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedBon = {
      ...bon,
      status: 'ready_for_sale'
    };
    
    updateBonMutation.mutate(updatedBon);
  };

  // Calculate the percentage of products ready in a bon
  const calculateReadyPercentage = (bon) => {
    if (!bon || !bon.products || !bon.products.length) return 0;
    const readyProducts = bon.products.filter(p => p.readyForSale).length;
    return Math.round((readyProducts / bon.products.length) * 100);
  };

  // Get status badge for a bon
  const getBonStatusBadge = (status) => {
    switch(status) {
      case 'pending_review':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours</Badge>;
      case 'ready_for_sale':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Prêt pour la vente</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Filter unread notifications related to pricing
  const unreadPricingNotifications = notifications.filter(n => 
    !n.read && 
    (n.title.includes('Définition de prix') || n.title.includes('livraison') || n.message.includes('prix de vente'))
  );

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationsAPI.update(notificationId, { read: true });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'auditor'] });
      toast({
        title: "Notification marquée comme lue",
        description: "La notification a été marquée comme lue.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour de la notification: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Find a bon by reference ID
  const findBonByReference = (referenceId) => {
    return bons.find(bon => bon.id === referenceId);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Bons de Réception</h1>
      
      {/* Notifications Section */}
      {unreadPricingNotifications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BellRing className="h-5 w-5 text-amber-500" />
            Nouvelles Notifications ({unreadPricingNotifications.length})
          </h2>
          <div className="space-y-3">
            {unreadPricingNotifications.map(notification => {
              const relatedBon = notification.reference ? findBonByReference(notification.reference) : null;
              return (
                <Alert key={notification.id} className="bg-amber-50 border-amber-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <Bell className="h-4 w-4 text-amber-500 mt-1" />
                      <div>
                        <AlertTitle className="text-amber-800">{notification.title}</AlertTitle>
                        <AlertDescription className="text-amber-700 mt-1">
                          {notification.message}
                        </AlertDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {relatedBon && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedBon(relatedBon);
                            markNotificationAsRead(notification.id);
                          }}
                        >
                          Voir le Bon
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Marquer comme lu
                      </Button>
                    </div>
                  </div>
                </Alert>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Search and Filter */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un bon par ID, fournisseur, produit..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="primary" size="sm" onClick={() => setSearchQuery('')}>
          Réinitialiser
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Rechercher un bon ou un produit..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bons en attente de configuration</CardTitle>
          <CardDescription>
            {filteredBons.length} bons trouvés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                      <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <p className="mt-4">Chargement des bons...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              <AlertCircle className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-medium">Erreur de chargement</h3>
              <p className="mt-1 text-sm">{error.message}</p>
            </div>
          ) : filteredBons.length === 0 ? (
            <div className="text-center py-6">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">Aucun bon trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucun bon ne correspond à vos critères de recherche
              </p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {filteredBons.map((bon) => (
                <AccordionItem key={bon.id} value={bon.id}>
                  <AccordionTrigger className="hover:bg-gray-50 px-4 py-2 rounded-md">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="mr-4">
                          {bon.status === 'ready_for_sale' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{bon.id}</div>
                          <div className="text-sm text-gray-500">{bon.supplier} - {bon.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getBonStatusBadge(bon.status)}
                        <div className="text-sm">
                          {calculateReadyPercentage(bon)}% configuré
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-2 pb-4">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Détails du bon</h4>
                        <div className="flex space-x-2">
               
                          {bon.status !== 'ready_for_sale' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleMarkBonReady(bon.id)}
                              disabled={!bon || !bon.products || !bon.products.every(p => p.readyForSale)}
                            >
                              Marquer comme prêt pour la vente
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Référence:</span> {bon.id}
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span> {bon.date}
                        </div>
                        <div>
                          <span className="text-gray-500">Fournisseur:</span> {bon.supplier}
                        </div>
                        <div>
                          <span className="text-gray-500">Entrepôt:</span> {bon.warehouseRef}
                        </div>
                        <div>
                          <span className="text-gray-500">Total produits:</span> {bon.totalItems}
                        </div>
                        <div>
                          <span className="text-gray-500">Statut:</span> {getBonStatusBadge(bon.status)}
                        </div>
                      </div>
                    </div>

                    <h4 className="font-medium mb-2">Liste des produits</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Quantité</TableHead>
                          <TableHead>Prix d'achat</TableHead>
                          <TableHead>Prix de vente</TableHead>
                          <TableHead>Options</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bon && bon.products && bon.products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.quantity} {product.unit}</TableCell>
                            <TableCell>{product.purchasePrice.toFixed(2)} €</TableCell>
                            <TableCell>
                              {product.sellingPrice ? (
                                <span className="font-medium">{product.sellingPrice.toFixed(2)} €</span>
                              ) : (
                                <span className="text-gray-400">Non défini</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {product.bundle && <Tag className="h-4 w-4 text-purple-500" title="Lot/Montage" />}
                                {product.promotion && <Layers className="h-4 w-4 text-gray-500" title="Promotion" />}
                              </div>
                            </TableCell>
                            <TableCell>
                              {product.readyForSale ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Prêt
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  À configurer
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleProductSelect(bon, product)}
                              >
                                Configurer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Product Configuration Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configuration du produit</DialogTitle>
            <DialogDescription>
              Définissez le prix de vente et les options pour ce produit
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-lg">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500">{selectedProduct.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Quantité</div>
                  <div>{selectedProduct.quantity} {selectedProduct.unit}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice">Prix d'achat</Label>
                  <div className="mt-1">
                    <Input 
                      id="purchasePrice" 
                      value={selectedProduct.purchasePrice.toFixed(2)} 
                      disabled 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sellingPrice">Prix de vente</Label>
                  <div className="mt-1">
                    <Input 
                      id="sellingPrice" 
                      type="number"
                      step="0.01"
                      min="0"
                      value={newSellingPrice}
                      onChange={(e) => setNewSellingPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="margin">Marge</Label>
                  <div className="mt-1">
                    {newSellingPrice > 0 && selectedProduct.purchasePrice > 0 && (
                      <div className="p-2 border rounded-md">
                        <span className={((parseFloat(newSellingPrice) - selectedProduct.purchasePrice) / selectedProduct.purchasePrice) * 100 < 30 ? "text-red-600" : "text-green-600"}>
                          {(((parseFloat(newSellingPrice) - selectedProduct.purchasePrice) / selectedProduct.purchasePrice) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="currentPrice">Prix actuel (si existant)</Label>
                  <div className="mt-1">
                    <Input 
                      id="currentPrice" 
                      value={selectedProduct.currentSellingPrice ? selectedProduct.currentSellingPrice.toFixed(2) : 'N/A'} 
                      disabled 
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="bundle" 
                    checked={isBundled}
                    onCheckedChange={setIsBundled}
                  />
                  <Label htmlFor="bundle" className="font-medium">
                    Lot / Montage
                  </Label>
                </div>
                
                {isBundled && (
                  <div className="pl-6 mb-4">
                    <Label htmlFor="bundleInfo">Informations sur le lot/montage</Label>
                    <Input
                      id="bundleInfo"
                      className="mt-1"
                      placeholder="Ex: Lot de 3 articles, Montage spécial..."
                      value={bundleInfo}
                      onChange={(e) => setBundleInfo(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="promotion" 
                    checked={isPromotion}
                    onCheckedChange={setIsPromotion}
                  />
                  <Label htmlFor="promotion" className="font-medium">
                    Promotion / Packaging spécial
                  </Label>
                </div>
                
                {isPromotion && (
                  <div className="pl-6">
                    <Label htmlFor="promotionInfo">Détails de la promotion</Label>
                    <Input
                      id="promotionInfo"
                      className="mt-1"
                      placeholder="Ex: 2+1 gratuit, -20% jusqu'au..."
                      value={promotionInfo}
                      onChange={(e) => setPromotionInfo(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveProduct}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Ajouter un produit au bon</DialogTitle>
            <DialogDescription>
              Recherchez et sélectionnez un produit à ajouter au bon
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un produit..."
                    className="pl-8"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-[200px]">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead className="text-right">Prix</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Aucun produit trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow 
                        key={product.id} 
                        className={`cursor-pointer hover:bg-muted ${productToAdd?.id === product.id ? 'bg-muted' : ''}`}
                        onClick={() => setProductToAdd(product)}
                      >
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.unit || 'pcs'}</TableCell>
                        <TableCell className="text-right">{product.price?.toFixed(2) || '0.00'} €</TableCell>
                        <TableCell className="text-right">{product.quantity || 0}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductToAdd(product);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            
            {productToAdd && (
              <div className="border rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{productToAdd.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {productToAdd.category} - {productToAdd.price?.toFixed(2) || '0.00'} €/{productToAdd.unit || 'pcs'}
                    </p>
                  </div>
                  <Button onClick={handleAddProductToBon}>
                    Ajouter au bon
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BonManagement;
