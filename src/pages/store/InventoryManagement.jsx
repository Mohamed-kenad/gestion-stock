import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI, productsAPI, notificationsAPI, stockMovementsAPI } from '../../lib/api';
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, Package, AlertTriangle, ArrowDown, ArrowUp, RefreshCw, Filter, BarChart3, Plus
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const InventoryManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'out'
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState(''); // 'increase' or 'decrease'
  
  // Fetch inventory data using React Query
  const { 
    data: inventory = [], 
    isLoading: inventoryLoading, 
    error: inventoryError 
  } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryAPI.getAll()
  });
  
  // Fetch products data
  const { 
    data: products = [], 
    isLoading: productsLoading, 
    error: productsError 
  } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll()
  });
  
  // Fetch stock movements
  const { 
    data: stockMovements = [], 
    isLoading: movementsLoading, 
    error: movementsError 
  } = useQuery({
    queryKey: ['stockMovements'],
    queryFn: () => stockMovementsAPI.getAll()
  });
  
  // Combine inventory and products data
  const inventoryWithDetails = inventory.map(item => {
    // Convert productId to number if it's a string for proper comparison
    const productIdNum = typeof item.productId === 'string' ? parseInt(item.productId) : item.productId;
    const product = products.find(p => p.id === productIdNum || p.id === item.productId) || {};
    return {
      ...item,
      ...product,
      productId: productIdNum || item.productId, // Ensure consistent productId format
      stockStatus: item.quantity <= (item.threshold || 10) 
        ? item.quantity === 0 ? 'out' : 'low' 
        : 'normal'
    };
  });
  
  // Stock adjustment mutation
  const adjustStockMutation = useMutation({
    mutationFn: async ({ productId, quantity, reason, type }) => {
      // Get current inventory for this product
      const inventoryItems = await inventoryAPI.getByProduct(productId);
      const inventoryItem = inventoryItems[0];
      
      if (!inventoryItem) {
        throw new Error('Inventory item not found');
      }
      
      // Calculate new quantity
      const newQuantity = type === 'increase' 
        ? inventoryItem.quantity + quantity
        : inventoryItem.quantity - quantity;
      
      // Update inventory
      const updatedInventory = await inventoryAPI.update(inventoryItem.id, {
        ...inventoryItem,
        quantity: newQuantity,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
      
      // Record stock movement
      await stockMovementsAPI.create({
        productId,
        type: type === 'increase' ? 'adjustment-in' : 'adjustment-out',
        quantity: type === 'increase' ? quantity : -quantity,
        date: new Date().toISOString().split('T')[0],
        userId: 5, // Magasinier role ID
        notes: reason
      });
      
      // Check if stock is low or out after adjustment
      const product = products.find(p => p.id === productId);
      if (newQuantity <= (inventoryItem.threshold || 10) && newQuantity > 0) {
        // Send low stock notification
        await notificationsAPI.notifyLowStock(
          productId, 
          product.name, 
          newQuantity, 
          inventoryItem.threshold || 10
        );
      } else if (newQuantity === 0) {
        // Send out of stock notification
        await notificationsAPI.notifyOutOfStock(productId, product.name);
      }
      
      return updatedInventory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      toast({
        title: "Stock ajusté",
        description: "Le stock a été ajusté avec succès.",
      });
      setShowAdjustmentDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajustement: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Filter inventory based on search, category, and stock status
  const filteredInventory = inventoryWithDetails.filter(item => {
    const matchesSearch = 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.productId && item.productId.toString().includes(searchTerm));
    
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    
    const matchesStockStatus = 
      stockFilter === 'all' || 
      (stockFilter === 'low' && item.stockStatus === 'low') ||
      (stockFilter === 'out' && item.stockStatus === 'out');
    
    return matchesSearch && matchesCategory && matchesStockStatus;
  });
  
  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map(product => product.category || 'Non catégorisé'))];
  
  // Handle stock adjustment dialog
  const openAdjustmentDialog = (product, type) => {
    setSelectedProduct(product);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
    setAdjustmentType(type);
    setShowAdjustmentDialog(true);
  };
  
  // Handle stock adjustment submission
  const handleAdjustStock = () => {
    if (adjustmentQuantity <= 0) {
      toast({
        title: "Quantité invalide",
        description: "Veuillez entrer une quantité positive.",
        variant: "destructive",
      });
      return;
    }
    
    if (!adjustmentReason.trim()) {
      toast({
        title: "Raison requise",
        description: "Veuillez entrer une raison pour cet ajustement.",
        variant: "destructive",
      });
      return;
    }
    
    adjustStockMutation.mutate({
      productId: selectedProduct.productId,
      quantity: parseInt(adjustmentQuantity),
      reason: adjustmentReason,
      type: adjustmentType
    });
  };
  
  // Get stock status badge
  const getStockStatusBadge = (status) => {
    switch(status) {
      case 'normal':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Normal</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Stock Bas</Badge>;
      case 'out':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Épuisé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
    
    toast({
      title: "Rafraîchissement",
      description: "Les données d'inventaire ont été rafraîchies.",
    });
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion de l'Inventaire</h1>
          <p className="text-muted-foreground">
            Gérez et suivez les niveaux de stock des produits
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryWithDetails.filter(item => item.stockStatus === 'low').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Épuisés</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryWithDetails.filter(item => item.stockStatus === 'out').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="inventory" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="movements">Mouvements de Stock</TabsTrigger>
        </TabsList>
        
        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                {categories.map((category, index) => (
                  <SelectItem key={`category-${index}`} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut du stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="low">Stock bas</SelectItem>
                <SelectItem value="out">Épuisé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventaire des Produits</CardTitle>
              <CardDescription>
                Gérez les niveaux de stock et effectuez des ajustements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryLoading || productsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>Seuil</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Dernière MAJ</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.productId}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unit || 'unité'}</TableCell>
                            <TableCell>{item.threshold || 10}</TableCell>
                            <TableCell>{getStockStatusBadge(item.stockStatus)}</TableCell>
                            <TableCell>{item.lastUpdated || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => openAdjustmentDialog(item, 'increase')}
                                >
                                  <ArrowUp className="h-4 w-4 mr-1" />
                                  +
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => openAdjustmentDialog(item, 'decrease')}
                                  disabled={item.quantity <= 0}
                                >
                                  <ArrowDown className="h-4 w-4 mr-1" />
                                  -
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-4">
                            Aucun produit trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Stock Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mouvements de Stock</CardTitle>
              <CardDescription>
                Historique des entrées et sorties de stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              {movementsLoading || productsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockMovements.length > 0 ? (
                        stockMovements.map((movement) => {
                          const product = products.find(p => p.id === movement.productId) || {};
                          return (
                            <TableRow key={movement.id}>
                              <TableCell>{movement.date}</TableCell>
                              <TableCell>{product.name || `Produit #${movement.productId}`}</TableCell>
                              <TableCell>
                                {movement.type === 'receive' && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800">Réception</Badge>
                                )}
                                {movement.type === 'issue' && (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800">Distribution</Badge>
                                )}
                                {movement.type === 'adjustment-in' && (
                                  <Badge variant="outline" className="bg-purple-100 text-purple-800">Ajustement +</Badge>
                                )}
                                {movement.type === 'adjustment-out' && (
                                  <Badge variant="outline" className="bg-orange-100 text-orange-800">Ajustement -</Badge>
                                )}
                              </TableCell>
                              <TableCell className={movement.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
                                {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                              </TableCell>
                              <TableCell>{movement.notes || 'Aucune note'}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Aucun mouvement trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'increase' ? 'Augmenter le Stock' : 'Diminuer le Stock'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <span>
                  {adjustmentType === 'increase' 
                    ? `Ajoutez des unités au stock de ${selectedProduct.name}` 
                    : `Retirez des unités du stock de ${selectedProduct.name}`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Produit
              </Label>
              <div id="product" className="col-span-3 font-medium">
                {selectedProduct?.name}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-quantity" className="text-right">
                Quantité Actuelle
              </Label>
              <div id="current-quantity" className="col-span-3">
                {selectedProduct?.quantity} {selectedProduct?.unit || 'unités'}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjustment-quantity" className="text-right">
                Quantité à {adjustmentType === 'increase' ? 'Ajouter' : 'Retirer'}
              </Label>
              <Input
                id="adjustment-quantity"
                type="number"
                min="1"
                max={adjustmentType === 'decrease' ? selectedProduct?.quantity : undefined}
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjustment-reason" className="text-right">
                Raison
              </Label>
              <Textarea
                id="adjustment-reason"
                placeholder="Raison de l'ajustement..."
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustmentDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAdjustStock}
              className={adjustmentType === 'increase' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {adjustmentType === 'increase' ? 'Augmenter' : 'Diminuer'} le Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
