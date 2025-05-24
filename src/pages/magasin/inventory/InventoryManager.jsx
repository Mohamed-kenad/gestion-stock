import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI, productsAPI, notificationsAPI, stockMovementsAPI } from '../../../lib/api';
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

const InventoryManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'out'
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
  
  const handleAdjustStock = () => {
    if (!adjustmentQuantity || adjustmentQuantity <= 0) {
      toast({
        title: "Erreur",
        description: "La quantité doit être supérieure à zéro.",
        variant: "destructive",
      });
      return;
    }
    
    if (!adjustmentReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir une raison pour cet ajustement.",
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
  
  if (inventoryLoading || productsLoading) {
    return <div className="p-6">Chargement de l'inventaire...</div>;
  }
  
  if (inventoryError || productsError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {inventoryError?.message || productsError?.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion de Stock</h1>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom, catégorie, ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock-status">Statut de Stock</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger id="stock-status">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="low">Stock faible</SelectItem>
                  <SelectItem value="out">Rupture de stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire ({filteredInventory.length} produits)</CardTitle>
          <CardDescription>
            Gérez les niveaux de stock et effectuez des ajustements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Seuil</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière Mise à Jour</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Aucun produit trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category || 'Non catégorisé'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.threshold || 10}</TableCell>
                    <TableCell>
                      {item.stockStatus === 'normal' ? (
                        <Badge variant="outline" className="bg-green-50">Normal</Badge>
                      ) : item.stockStatus === 'low' ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">Faible</Badge>
                      ) : (
                        <Badge variant="destructive">Rupture</Badge>
                      )}
                    </TableCell>
                    <TableCell>{item.lastUpdated || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openAdjustmentDialog(item, 'increase')}
                        >
                          <ArrowUp className="h-4 w-4 mr-1" />
                          +
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
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
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'increase' ? 'Augmenter' : 'Diminuer'} le Stock
            </DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <>
                  Produit: {selectedProduct.name} (ID: {selectedProduct.productId})
                  <br />
                  Quantité actuelle: {selectedProduct.quantity}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Raison</Label>
              <Textarea
                id="reason"
                placeholder="Raison de l'ajustement..."
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustmentDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAdjustStock}
              disabled={adjustStockMutation.isLoading}
            >
              {adjustStockMutation.isLoading ? 'Traitement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManager;
