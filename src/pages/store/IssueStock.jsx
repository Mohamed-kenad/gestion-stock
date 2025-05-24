import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI, productsAPI, stockMovementsAPI } from '../../lib/api';
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, Package, ArrowDown, RefreshCw, Filter, Send, Plus, Minus, Trash
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

const IssueStock = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [issueNote, setIssueNote] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  
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
  
  // Fetch departments data
  const { 
    data: departments = [], 
    isLoading: departmentsLoading, 
    error: departmentsError 
  } = useQuery({
    queryKey: ['departments'],
    queryFn: () => fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/departments`)
      .then(res => res.json())
      .catch(err => {
        console.error('Error fetching departments:', err);
        return [];
      })
  });
  
  // Combine inventory and products data
  const inventoryWithDetails = inventory.map(item => {
    // Convert productId to number if it's a string for proper comparison
    const productIdNum = typeof item.productId === 'string' ? parseInt(item.productId) : item.productId;
    const product = products.find(p => p.id === productIdNum || p.id === item.productId || 
                                   p.id.toString() === item.productId.toString()) || {};
    return {
      ...item,
      ...product,
      productId: productIdNum || item.productId, // Ensure consistent productId format
      stockStatus: item.quantity <= (item.threshold || 10) 
        ? item.quantity === 0 ? 'out' : 'low' 
        : 'normal'
    };
  });
  
  // Issue stock mutation
  const issueStockMutation = useMutation({
    mutationFn: async ({ departmentId, items, note }) => {
      // Process each item to update inventory
      const updatePromises = items.map(async (item) => {
        // Get current inventory for this product
        const inventoryItems = await inventoryAPI.getByProduct(item.productId);
        const inventoryItem = inventoryItems[0];
        
        if (!inventoryItem) {
          throw new Error(`Inventory item not found for product ${item.productId}`);
        }
        
        if (inventoryItem.quantity < item.quantity) {
          throw new Error(`Not enough stock for ${item.name}`);
        }
        
        // Update inventory
        await inventoryAPI.update(inventoryItem.id, {
          ...inventoryItem,
          quantity: inventoryItem.quantity - item.quantity,
          lastUpdated: new Date().toISOString().split('T')[0]
        });
      });
      
      await Promise.all(updatePromises);
      
      // Record stock movements
      return stockMovementsAPI.recordIssue(departmentId, items, 5); // 5 is the Magasinier role ID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      toast({
        title: "Stock distribué",
        description: "Les produits ont été distribués avec succès.",
      });
      setCartItems([]);
      setIssueNote('');
      setSelectedDepartment('');
      setShowIssueDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la distribution: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Filter inventory based on search and category
  const filteredInventory = inventoryWithDetails.filter(item => {
    const matchesSearch = 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.productId && item.productId.toString().includes(searchTerm));
    
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    
    // Only show items with stock available
    const hasStock = item.quantity > 0;
    
    return matchesSearch && matchesCategory && hasStock;
  });
  
  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map(product => product.category || 'Non catégorisé'))];
  
  // Handle adding item to cart
  const addToCart = (item) => {
    const existingItem = cartItems.find(cartItem => cartItem.productId === item.productId);
    
    if (existingItem) {
      // Update quantity if already in cart
      const updatedCart = cartItems.map(cartItem => 
        cartItem.productId === item.productId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      setCartItems(updatedCart);
    } else {
      // Add new item to cart
      setCartItems([...cartItems, {
        productId: item.productId,
        name: item.name,
        category: item.category,
        quantity: 1,
        unit: item.unit || 'unité',
        availableQuantity: item.quantity
      }]);
    }
    
    toast({
      title: "Produit ajouté",
      description: `${item.name} ajouté au panier.`,
    });
  };
  
  // Handle removing item from cart
  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };
  
  // Handle updating item quantity in cart
  const updateCartItemQuantity = (productId, newQuantity) => {
    const item = cartItems.find(item => item.productId === productId);
    
    if (!item) return;
    
    // Ensure quantity is within bounds
    newQuantity = Math.max(1, Math.min(newQuantity, item.availableQuantity));
    
    const updatedCart = cartItems.map(cartItem => 
      cartItem.productId === productId
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );
    
    setCartItems(updatedCart);
  };
  
  // Handle issue stock dialog
  const openIssueDialog = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Panier vide",
        description: "Veuillez ajouter des produits au panier avant de distribuer.",
        variant: "destructive",
      });
      return;
    }
    
    setShowIssueDialog(true);
  };
  
  // Handle issue stock submission
  const handleIssueStock = () => {
    if (!selectedDepartment) {
      toast({
        title: "Département requis",
        description: "Veuillez sélectionner un département.",
        variant: "destructive",
      });
      return;
    }
    
    issueStockMutation.mutate({
      departmentId: selectedDepartment,
      items: cartItems,
      note: issueNote
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
    
    toast({
      title: "Rafraîchissement",
      description: "Les données d'inventaire ont été rafraîchies.",
    });
  };
  
  // Calculate total items in cart
  const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Distribution de Stock</h1>
          <p className="text-muted-foreground">
            Distribuez des produits aux différents départements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button 
            onClick={openIssueDialog}
            disabled={cartItems.length === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Distribuer ({totalItemsInCart})
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-2 space-y-4">
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
          </div>
          
          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Produits Disponibles</CardTitle>
              <CardDescription>
                Sélectionnez les produits à distribuer
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
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Disponible</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.quantity} {item.unit || 'unités'}</TableCell>
                            <TableCell>{getStockStatusBadge(item.stockStatus)}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => addToCart(item)}
                                disabled={item.quantity <= 0}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Aucun produit disponible
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Cart */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Panier de Distribution</CardTitle>
              <CardDescription>
                Produits à distribuer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="w-10 text-center">
                          {item.quantity}
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.availableQuantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Votre panier est vide
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total articles</div>
                <div className="text-lg font-bold">{totalItemsInCart}</div>
              </div>
              <Button 
                onClick={openIssueDialog}
                disabled={cartItems.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                Distribuer
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Issue Stock Dialog */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Distribuer le Stock</DialogTitle>
            <DialogDescription>
              Confirmez la distribution des produits au département sélectionné
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Département
              </Label>
              <Select 
                value={selectedDepartment} 
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="issue-note" className="text-right">
                Note
              </Label>
              <Textarea
                id="issue-note"
                placeholder="Note de distribution..."
                value={issueNote}
                onChange={(e) => setIssueNote(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="border rounded-md p-3">
              <h4 className="font-medium mb-2">Récapitulatif</h4>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleIssueStock}>
              Confirmer la Distribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IssueStock;
