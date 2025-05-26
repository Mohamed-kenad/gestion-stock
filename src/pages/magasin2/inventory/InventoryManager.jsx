import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI, categoriesAPI, stockMovementsAPI, notificationsAPI, bonsAPI } from '../../../lib/api';
import { 
  Package, Search, Filter, ArrowUpDown, Plus, Edit, Trash, FileText, 
  ArrowDownCircle, ArrowUpCircle, AlertTriangle, DollarSign, Send
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";

const InventoryManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [readyFilter, setReadyFilter] = useState('all'); // Filter for products ready for sale
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('in');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1);
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  
  // State for sending products to Auditor
  const [showSendToAuditorDialog, setShowSendToAuditorDialog] = useState(false);
  const [productsToSend, setProductsToSend] = useState([]);
  const [sendingNotes, setSendingNotes] = useState('');
  
  // Fetch inventory data
  const { 
    data: inventory = [], 
    isLoading: inventoryLoading, 
    error: inventoryError 
  } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryAPI.getAll()
  });
  
  // Fetch categories
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll()
  });
  
  // Mutation for creating a bon to send to Auditor
  const sendToAuditorMutation = useMutation({
    mutationFn: async (data) => {
      const { products, notes } = data;
      
      // Create a new bon for the Auditor
      const bonData = {
        id: `BON-${Date.now().toString().substring(6)}`,
        date: new Date().toISOString().split('T')[0],
        supplier: 'Magasin2 Department',
        warehouseRef: 'Internal-Transfer',
        status: 'pending',
        totalItems: products.length,
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          quantity: product.quantity,
          unit: product.unit,
          purchasePrice: product.price,
          currentSellingPrice: 0, // To be set by Auditor
          sellingPrice: 0, // To be set by Auditor
          readyForSale: false
        })),
        notes: notes
      };
      
      // Create the bon
      const createdBon = await bonsAPI.create(bonData);
      
      // Send notification to Auditor
      await notificationsAPI.create({
        title: 'Nouveaux produits à tarifer',
        message: `${products.length} produits ont été envoyés pour tarification par Magasin2.`,
        type: 'pricing_request',
        recipientRole: 'auditor',
        reference: createdBon.id,
        date: new Date().toISOString().split('T')[0],
        read: false,
        priority: 'high'
      });
      
      return createdBon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Produits envoyés à l'Auditeur",
        description: "Les produits ont été envoyés à l'Auditeur pour tarification.",
      });
      setShowSendToAuditorDialog(false);
      setProductsToSend([]);
      setSendingNotes('');
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'envoi des produits: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutation for adjusting inventory
  const adjustInventoryMutation = useMutation({
    mutationFn: async (adjustmentData) => {
      const { product, type, quantity, notes } = adjustmentData;
      
      // 1. Update product quantity in inventory
      const updatedQuantity = type === 'in' 
        ? product.quantity + quantity
        : Math.max(0, product.quantity - quantity);
      
      await inventoryAPI.update(product.id, {
        ...product,
        quantity: updatedQuantity
      });
      
      // 2. Record stock movement
      const movementData = {
        productId: product.id,
        product: product.name,
        type,
        quantity,
        date: new Date().toISOString(),
        unit: product.unit,
        createdBy: 'Magasin2 Department',
        notes
      };
      
      await stockMovementsAPI.create(movementData);
      
      // 3. Check if we need to send low stock notification
      if (updatedQuantity <= product.threshold && updatedQuantity > 0) {
        await notificationsAPI.notifyLowStock(
          product.id,
          product.name,
          updatedQuantity,
          product.threshold
        );
      }
      
      // 4. Check if we need to send out of stock notification
      if (updatedQuantity === 0) {
        await notificationsAPI.notifyOutOfStock(
          product.id,
          product.name
        );
      }
      
      // 5. If this is a new product being added (type is 'in'), automatically send it to Auditor for pricing
      if (type === 'in' && !product.readyForSale) {
        // Create a new bon for the Auditor with this product
        const bonData = {
          id: `BON-${Date.now().toString().substring(6)}`,
          date: new Date().toISOString().split('T')[0],
          supplier: 'Magasin2 Department',
          warehouseRef: 'Internal-Transfer',
          status: 'pending',
          totalItems: 1,
          products: [{
            id: product.id,
            name: product.name,
            category: product.category,
            quantity: updatedQuantity,
            unit: product.unit,
            purchasePrice: product.price,
            currentSellingPrice: 0, // To be set by Auditor
            sellingPrice: 0, // To be set by Auditor
            readyForSale: false
          }],
          notes: `Nouveau produit ajouté à l'inventaire. ${notes || ''}`
        };
        
        // Create the bon
        const createdBon = await bonsAPI.create(bonData);
        
        // Send notification to Auditor
        await notificationsAPI.create({
          title: 'Nouveau produit à tarifer',
          message: `Un nouveau produit (${product.name}) a été ajouté à l'inventaire et nécessite une tarification.`,
          type: 'pricing_request',
          recipientRole: 'auditor',
          reference: createdBon.id,
          date: new Date().toISOString().split('T')[0],
          read: false,
          priority: 'high'
        });
      }
      
      return { success: true, product: { ...product, quantity: updatedQuantity } };
    },
    onSuccess: (data) => {
      // Show different toast messages based on the action
      if (adjustmentType === 'in' && !selectedProduct.readyForSale) {
        toast({
          title: "Produit ajouté et envoyé à l'Auditeur",
          description: `Le produit a été ajouté à l'inventaire et envoyé à l'Auditeur pour tarification.`,
          variant: "success"
        });
      } else {
        toast({
          title: "Inventaire mis à jour",
          description: `Quantité ${adjustmentType === 'in' ? 'ajoutée' : 'retirée'} avec succès.`,
          variant: "success"
        });
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      
      // Reset form
      setAdjustmentQuantity(1);
      setAdjustmentNotes('');
      setShowAdjustmentDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de l'inventaire.",
        variant: "destructive"
      });
    }
  });
  
  // Handle adjustment dialog open
  const handleAdjustmentDialogOpen = (product, type) => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setAdjustmentQuantity(1);
    setAdjustmentNotes('');
    setShowAdjustmentDialog(true);
  };
  
  // Handle adjustment submission
  const handleAdjustmentSubmit = () => {
    if (!selectedProduct) return;
    
    // Validate quantity
    if (adjustmentQuantity <= 0) {
      toast({
        title: "Quantité invalide",
        description: "La quantité doit être supérieure à zéro.",
        variant: "destructive"
      });
      return;
    }
    
    // For stock out, check if we have enough
    if (adjustmentType === 'out' && adjustmentQuantity > selectedProduct.quantity) {
      toast({
        title: "Quantité insuffisante",
        description: `Il n'y a que ${selectedProduct.quantity} ${selectedProduct.unit} disponible.`,
        variant: "destructive"
      });
      return;
    }
    
    adjustInventoryMutation.mutate({
      product: selectedProduct,
      type: adjustmentType,
      quantity: parseInt(adjustmentQuantity),
      notes: adjustmentNotes
    });
  };
  
  // Filter inventory based on search, category, status, and ready for sale status
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.categoryId?.toString() === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'low') {
      matchesStatus = item.quantity > 0 && item.quantity <= item.threshold;
    } else if (statusFilter === 'out') {
      matchesStatus = item.quantity === 0;
    } else if (statusFilter === 'normal') {
      matchesStatus = item.quantity > item.threshold;
    }
    
    let matchesReady = true;
    if (readyFilter === 'ready') {
      matchesReady = item.readyForSale === true;
    } else if (readyFilter === 'not_ready') {
      matchesReady = item.readyForSale !== true;
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesReady;
  });
  
  // Sort inventory
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle nulls
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    // String comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    // Compare
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Toggle sort
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id.toString() === categoryId?.toString());
    return category ? category.name : 'Non catégorisé';
  };
  
  // Get stock status
  const getStockStatus = (item) => {
    if (item.quantity <= 0) {
      return { label: 'Rupture', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (item.quantity < (item.threshold || 5)) {
      return { label: 'Faible', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    } else {
      return { label: 'Normal', color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };
  
  // Get ready for sale status
  const getReadyStatus = (item) => {
    if (item.readyForSale) {
      return { label: 'Prêt pour la vente', color: 'bg-green-100 text-green-800 border-green-200' };
    } else {
      return { label: 'Non tarifé', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    }
  };

  // Handle opening the send to auditor dialog
  const handleOpenSendToAuditorDialog = () => {
    // Reset the state
    setProductsToSend([]);
    setSendingNotes('');
    setShowSendToAuditorDialog(true);
  };

  // Handle toggling a product selection for sending to auditor
  const handleToggleProductSelection = (product) => {
    setProductsToSend(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Handle sending products to auditor
  const handleSendToAuditor = () => {
    if (productsToSend.length === 0) {
      toast({
        title: "Aucun produit sélectionné",
        description: "Veuillez sélectionner au moins un produit à envoyer.",
        variant: "destructive",
      });
      return;
    }

    sendToAuditorMutation.mutate({
      products: productsToSend,
      notes: sendingNotes
    });
  };

  // Loading state
  if (inventoryLoading || categoriesLoading) {
    return <div className="p-6">Chargement de l'inventaire...</div>;
  }
  
  // Error state
  if (inventoryError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {inventoryError.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion de l'Inventaire</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/magasin2">
              <FileText className="mr-2 h-4 w-4" />
              Tableau de Bord
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard/magasin2/inventory/alerts">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Alertes
            </Link>
          </Button>
          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={handleOpenSendToAuditorDialog}
          >
            <DollarSign className="h-4 w-4" />
            Envoyer à l'Auditeur
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, description ou fournisseur..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="normal">Stock normal</SelectItem>
                  <SelectItem value="low">Stock faible</SelectItem>
                  <SelectItem value="out">Rupture de stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={readyFilter} onValueChange={setReadyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Disponibilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  <SelectItem value="ready">Prêts à la vente</SelectItem>
                  <SelectItem value="not_ready">En attente de prix</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStatusFilter('all');
              setReadyFilter('all');
            }}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire ({sortedInventory.length} produits)</CardTitle>
          <CardDescription>
            Gestion des stocks et ajustements d'inventaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedInventory.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Aucun produit trouvé</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('name')}>
                      Produit
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('categoryId')}>
                      Catégorie
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('quantity')}>
                      Quantité
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('threshold')}>
                      Seuil Alerte
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Statut Stock</TableHead>
                  <TableHead>Disponibilité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInventory.map(item => {
                  const status = getStockStatus(item);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                      <TableCell className="font-medium">{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.threshold}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getReadyStatus(item).color}>{getReadyStatus(item).label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleAdjustmentDialogOpen(item, 'in')}
                            title="Entrée de stock"
                          >
                            <ArrowDownCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleAdjustmentDialogOpen(item, 'out')}
                            title="Sortie de stock"
                            disabled={item.quantity === 0}
                          >
                            <ArrowUpCircle className="h-4 w-4 text-orange-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Adjustment Dialog */}
      <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'in' ? 'Entrée de Stock' : 'Sortie de Stock'}
            </DialogTitle>
            <DialogDescription>
              {adjustmentType === 'in' 
                ? 'Ajoutez des produits à l\'inventaire' 
                : 'Retirez des produits de l\'inventaire'}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="font-medium">{selectedProduct.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Stock actuel: {selectedProduct.quantity} {selectedProduct.unit}
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={adjustmentType === 'out' ? selectedProduct.quantity : undefined}
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Raison de l'ajustement..."
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                />
              </div>
              
              <div className="mt-2">
                <p className="text-sm font-medium">
                  Nouveau stock: {' '}
                  {adjustmentType === 'in' 
                    ? selectedProduct.quantity + parseInt(adjustmentQuantity || 0)
                    : Math.max(0, selectedProduct.quantity - parseInt(adjustmentQuantity || 0))
                  } {selectedProduct.unit}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustmentDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAdjustmentSubmit}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Send to Auditor Dialog */}
      <Dialog open={showSendToAuditorDialog} onOpenChange={setShowSendToAuditorDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Envoyer des produits à l'Auditeur pour tarification
            </DialogTitle>
            <DialogDescription>
              Sélectionnez les produits à envoyer à l'Auditeur pour qu'ils soient tarifés et rendus disponibles pour la vente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="max-h-[300px] overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right">Prix d'achat</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory
                    .filter(item => !item.readyForSale) // Only show products not ready for sale
                    .map(item => {
                      const isSelected = productsToSend.some(p => p.id === item.id);
                      return (
                        <TableRow 
                          key={item.id}
                          className={`cursor-pointer hover:bg-muted ${isSelected ? 'bg-muted' : ''}`}
                          onClick={() => handleToggleProductSelection(item)}
                        >
                          <TableCell>
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={() => handleToggleProductSelection(item)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                          <TableCell className="text-right">{item.price?.toFixed(2) || '0.00'} DH</TableCell>
                          <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes pour l'Auditeur</Label>
              <Input
                id="notes"
                placeholder="Informations supplémentaires pour l'Auditeur..."
                value={sendingNotes}
                onChange={(e) => setSendingNotes(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-muted-foreground">
                Les produits envoyés à l'Auditeur ne seront disponibles pour la vente qu'après avoir été tarifés.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendToAuditorDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSendToAuditor}
              disabled={productsToSend.length === 0 || sendToAuditorMutation.isPending}
              className="flex items-center gap-2"
            >
              {sendToAuditorMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer à l'Auditeur
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManager;
