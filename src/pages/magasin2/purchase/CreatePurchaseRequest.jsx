import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI, categoriesAPI, ordersAPI, notificationsAPI } from '../../../lib/api';
import { 
  Plus, Minus, Trash2, Search, Save, FileText, Package, AlertTriangle, 
  ArrowLeft, Check, Filter, ShoppingCart
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const CreatePurchaseRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for form
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // Changed default to show all products
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [requestItems, setRequestItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('normal');
  const [title, setTitle] = useState('Demande de réapprovisionnement');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Fetch inventory data
  const { 
    data: inventory = [], 
    isLoading: inventoryLoading 
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
  
  // Create purchase request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData) => {
      // 1. Create purchase request
      const request = await ordersAPI.create({
        ...requestData,
        type: 'purchase',
        status: 'pending',
        createdBy: 'Magasin2 Department',
        createdAt: new Date().toISOString(),
        departmentId: 'magasin2',
        priority: priority
      });
      
      // 2. Notify Achat2 department
      await notificationsAPI.create({
        title: `Nouvelle demande d'achat`,
        message: `Une nouvelle demande d'achat (${request.id}) a été créée par le département Magasin2.`,
        type: 'info',
        recipientRole: 'achat2',
        reference: request.id,
        createdAt: new Date().toISOString(),
        read: false
      });
      
      return request;
    },
    onSuccess: (data) => {
      toast({
        title: "Demande créée",
        description: `La demande d'achat #${data.id} a été créée avec succès.`,
        variant: "success",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Navigate to orders list
      navigate('/dashboard/magasin2/purchase');
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Filter products based on search, category and status
  const filteredProducts = inventory.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                          (product.categoryId && product.categoryId.toString() === selectedCategory);
    
    let matchesStatus = true;
    if (statusFilter === 'low') {
      matchesStatus = product.quantity > 0 && product.quantity <= product.threshold;
    } else if (statusFilter === 'out') {
      matchesStatus = product.quantity === 0;
    } else if (statusFilter === 'all') {
      matchesStatus = true;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Add product to request
  const handleAddToRequest = (product) => {
    // Check if product already exists in request
    const existingItemIndex = requestItems.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      const updatedItems = [...requestItems];
      updatedItems[existingItemIndex].quantity += 1;
      setRequestItems(updatedItems);
    } else {
      // Add new product to request
      setRequestItems([
        ...requestItems,
        {
          productId: product.id,
          product: product,
          name: product.name,
          quantity: 1,
          unit: product.unit,
          currentStock: product.quantity,
          threshold: product.threshold
        }
      ]);
    }
  };
  
  // Update request item quantity
  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...requestItems];
    updatedItems[index].quantity = newQuantity;
    setRequestItems(updatedItems);
  };
  
  // Remove item from request
  const removeItem = (index) => {
    const updatedItems = [...requestItems];
    updatedItems.splice(index, 1);
    setRequestItems(updatedItems);
  };
  
  // Submit purchase request
  const handleSubmit = () => {
    if (requestItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit à la demande.",
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmDialog(true);
  };
  
  // Calculate total price for all items
  const calculateTotal = () => {
    return requestItems.reduce((total, item) => {
      const price = item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // Confirm and create purchase request
  const confirmRequest = () => {
    // Calculate the total price
    const totalPrice = calculateTotal();
    
    const requestData = {
      title: title,
      items: requestItems.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price || 0,
        total: (item.price || 0) * item.quantity
      })),
      notes: notes,
      priority: priority,
      total: totalPrice,
      department: "Magasin2"
    };
    
    createRequestMutation.mutate(requestData);
    setShowConfirmDialog(false);
  };
  
  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id.toString() === categoryId?.toString());
    return category ? category.name : 'Non catégorisé';
  };
  
  // Get stock status
  const getStockStatus = (item) => {
    if (item.quantity === 0) {
      return { label: 'Rupture', color: 'bg-red-500' };
    } else if (item.quantity <= item.threshold) {
      return { label: 'Faible', color: 'bg-amber-500' };
    } else {
      return { label: 'Normal', color: 'bg-green-500' };
    }
  };
  
  // Loading state
  if (inventoryLoading || categoriesLoading) {
    return <div className="p-6">Chargement des données...</div>;
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Créer une Demande d'Achat</h1>
        <Button asChild variant="outline">
          <Link to="/dashboard/magasin2/purchase">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Product selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner des Produits</CardTitle>
              <CardDescription>
                Ajoutez des produits à faible stock ou en rupture à votre demande d'achat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and filters */}
              <div className="flex flex-col md:flex-row gap-4">
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
                
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
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
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Stock faible</SelectItem>
                      <SelectItem value="out">Rupture de stock</SelectItem>
                      <SelectItem value="all">Tous les produits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Products list */}
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Seuil</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Action</TableHead>
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
                      filteredProducts.map(product => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.sku}</div>
                          </TableCell>
                          <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                          <TableCell>{product.quantity} {product.unit}</TableCell>
                          <TableCell>{product.threshold} {product.unit}</TableCell>
                          <TableCell>
                            <Badge className={`${getStockStatus(product).color} text-white`}>
                              {getStockStatus(product).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAddToRequest(product)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Ajouter
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Request summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la Demande</CardTitle>
              <CardDescription>
                Vérifiez les produits et quantités avant de soumettre
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requestItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>Aucun produit ajouté</p>
                  <p className="text-sm">Ajoutez des produits depuis la liste</p>
                </div>
              ) : (
                <ScrollArea className="h-[250px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Qté</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Stock actuel: {item.currentStock} {item.unit}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6"
                                onClick={() => updateItemQuantity(index, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                className="w-16 h-8 text-center"
                                min="1"
                              />
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6"
                                onClick={() => updateItemQuantity(index, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Détails de la Demande</CardTitle>
                  <CardDescription>
                    Ajoutez des informations supplémentaires à votre demande d'achat
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de la demande</Label>
                    <Input
                      id="title"
                      placeholder="Titre de la demande d'achat"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorité</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Sélectionner une priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="normal">Normale</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Ajoutez des notes ou instructions spéciales..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    disabled={requestItems.length === 0}
                    onClick={handleSubmit}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Créer la Demande d'Achat
                  </Button>
                </CardFooter>
              </Card>
            </CardContent>

          </Card>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la demande d'achat</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de créer une demande d'achat pour {requestItems.length} produit(s).
              Cette demande sera envoyée au département Achat2 pour traitement.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="font-medium mb-2">Résumé de la demande:</h4>
            <ul className="space-y-1">
              {requestItems.map((item, index) => (
                <li key={index} className="text-sm">
                  {item.name} - {item.quantity} {item.unit}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Priorité: <Badge variant="outline">{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button onClick={confirmRequest}>
              <Check className="mr-2 h-4 w-4" />
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePurchaseRequest;
