// File: c:\Users\Lenovo\inventario-nexus-suite\src\pages\vendor\orders\EditOrder.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesAPI, productsAPI, ordersAPI } from '../../../lib/api';
import { 
  Plus, Minus, Trash2, Search, Save, FileText, Package, Calendar, 
  User, Building, AlertTriangle, Check, X, List
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

// Department data - this could also come from an API in the future
const departments = [
  { id: 1, name: 'Cuisine' },
  { id: 2, name: 'Pâtisserie' },
  { id: 3, name: 'Bar' },
  { id: 4, name: 'Service' },
  { id: 5, name: 'Entretien' },
];

const EditOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the order ID from the URL
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for order data
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Log the order ID we're trying to edit
  console.log(`EditOrder component initialized with order ID: ${id}`);

  // Fetch order data using React Query
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      try {
        // First try to get the order directly
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        const response = await fetch(`${apiUrl}/orders/${id}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Ensure the order has an items array
        if (!data.items || !Array.isArray(data.items)) {
          data.items = [];
        }
        
        // Add a sample item for demonstration if there are no items
        if (data.items.length === 0) {
          data.items.push({
            id: "1",
            product: "Rice",
            category: "Non catégorisé",
            categoryId: 1,
            quantity: 1,
            unit: "kg",
            price: 25,
            total: 25
          });
        }
        
        return data;
      } catch (error) {
        console.error(`Error fetching order directly: ${error.message}`);
        // Fallback: try to get all orders and find the one with matching ID
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        const allOrdersResponse = await fetch(`${apiUrl}/orders`);
        
        if (!allOrdersResponse.ok) {
          throw new Error(`API error: ${allOrdersResponse.status} ${allOrdersResponse.statusText}`);
        }
        
        const allOrders = await allOrdersResponse.json();
        
        const matchingOrder = allOrders.find(o => o.id === id);
        
        if (!matchingOrder) {
          throw new Error(`Order with ID ${id} not found`);
        }
        
        // Ensure the order has an items array
        if (!matchingOrder.items || !Array.isArray(matchingOrder.items)) {
          matchingOrder.items = [];
        }
        
        // Add a sample item for demonstration if there are no items
        if (matchingOrder.items.length === 0) {
          matchingOrder.items.push({
            id: "1",
            product: "Rice",
            category: "Non catégorisé",
            categoryId: 1,
            quantity: 1,
            unit: "kg",
            price: 25,
            total: 25
          });
        }
        
        return matchingOrder;
      }
    },
    onSuccess: (data) => {
      if (!data) {
        toast({
          title: "Erreur",
          description: `Impossible de trouver le bon de commande avec l'ID: ${id}`,
          variant: "destructive",
        });
        navigate('/dashboard/vendor/orders');
        return;
      }
      
      // Populate form with existing order data
      setOrderTitle(data.title || '');
      setOrderDescription(data.description || '');
      setDepartment(data.department || '');
      setUrgency(data.urgency || 'normal');
      
      // Process order items
      if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        // If no items, create a default empty array
        setOrderItems([]);
      } else {
        // Convert order items to the format expected by the component
        const processedItems = [];
        
        for (const item of data.items) {
          // Log each item for debugging
          console.log('Processing item:', item);
          
          // Create a properly formatted item object
          const processedItem = {
            product: {
              id: item.id || '1',
              name: item.product || 'Unknown Product',
              category: item.category || 'Non catégorisé',
              categoryId: item.categoryId || 1,
              price: item.price || 0,
              unit: item.unit || 'pcs'
            },
            quantity: item.quantity || 1
          };
          
          processedItems.push(processedItem);
        }
        
        console.log('Final processed items:', processedItems);
        setOrderItems(processedItems);
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de charger le bon de commande: ${error.message}`,
        variant: "destructive",
      });
      navigate('/dashboard/vendor/orders');
    },
    retry: 1,
    staleTime: 0, // Don't use cached data
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!id // Only run the query if we have an ID
  });
  
  // Fetch categories using React Query
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll
  });
  
  // Fetch products using React Query
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll
  });
  
  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      console.log(`Updating order with ID: ${id}`, orderData);
      try {
        // First try to update the order directly
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/orders/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error updating order directly: ${error.message}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Bon de commande mis à jour",
        description: "Votre bon de commande a été modifié avec succès.",
      });
      navigate('/dashboard/vendor/orders');
    },
    onError: (error) => {
      console.error("Error updating order:", error);
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                          (product.categoryId && product.categoryId.toString() === selectedCategory) || 
                          (product.category && categories.find(c => c.name === product.category)?.id.toString() === selectedCategory) ||
                          (product.category && product.category.toLowerCase() === categories.find(c => c.id.toString() === selectedCategory)?.name.toLowerCase());
    return matchesSearch && matchesCategory;
  });
  
  // Handle product selection
  const handleSelectProduct = (product) => {
    if (multiSelectMode) {
      // In multi-select mode, toggle selection
      const isAlreadySelected = selectedProducts.some(p => p.id === product.id);
      if (isAlreadySelected) {
        setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
      } else {
        setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
      }
    } else {
      // In single-select mode, just set the selected product
      setSelectedProduct(product);
    }
  };
  
  // Add product to order
  const handleAddProduct = () => {
    if (multiSelectMode) {
      // Handle multi-select mode
      if (selectedProducts.length === 0) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner au moins un produit.",
          variant: "destructive",
        });
        return;
      }
      
      // Add all selected products to order
      const newOrderItems = [...orderItems];
      
      selectedProducts.forEach(selectedProduct => {
        // Check if product already exists in order
        const existingItemIndex = newOrderItems.findIndex(item => item.product.id === selectedProduct.id);
        
        if (existingItemIndex !== -1) {
          // Update quantity if product already exists
          newOrderItems[existingItemIndex].quantity += selectedProduct.quantity;
        } else {
          // Add new product to order
          newOrderItems.push({
            product: selectedProduct,
            quantity: selectedProduct.quantity,
          });
        }
      });
      
      setOrderItems(newOrderItems);
      
      // Reset selection
      setSelectedProducts([]);
      setShowProductDialog(false);
      
      toast({
        title: "Produits ajoutés",
        description: `${selectedProducts.length} produit(s) ont été ajoutés au bon de commande.`,
      });
    } else {
      // Handle single-select mode
      if (!selectedProduct || quantity <= 0) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un produit et spécifier une quantité valide.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if product already exists in order
      const existingItemIndex = orderItems.findIndex(item => item.product.id === selectedProduct.id);
      
      if (existingItemIndex !== -1) {
        // Update quantity if product already exists
        const updatedItems = [...orderItems];
        updatedItems[existingItemIndex].quantity += quantity;
        setOrderItems(updatedItems);
      } else {
        // Add new product to order
        setOrderItems([
          ...orderItems,
          {
            product: selectedProduct,
            quantity: quantity,
          }
        ]);
      }
      
      // Reset selection
      setSelectedProduct(null);
      setQuantity(1);
      setShowProductDialog(false);
      
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté au bon de commande.",
      });
    }
  };
  
  // Edit product in order
  const handleEditProduct = (index) => {
    setEditingItemIndex(index);
    setEditQuantity(orderItems[index].quantity);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingItemIndex === null || editQuantity <= 0) return;
    
    const updatedItems = [...orderItems];
    updatedItems[editingItemIndex].quantity = editQuantity;
    setOrderItems(updatedItems);
    
    setEditingItemIndex(null);
    setShowEditDialog(false);
    
    toast({
      title: "Produit modifié",
      description: "La quantité du produit a été mise à jour.",
    });
  };
  
  // Remove product from order
  const handleRemoveProduct = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
    
    toast({
      title: "Produit retiré",
      description: "Le produit a été retiré du bon de commande.",
    });
  };
  
  // Calculate total
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };
  
  // Submit updated order
  const handleSubmitOrder = () => {
    if (!orderTitle.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez donner un titre à votre commande.",
        variant: "destructive",
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Aucun produit",
        description: "Veuillez ajouter au moins un produit à votre commande.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate total amount
    const total = calculateTotal();
    
    // Create updated order data object
    const orderData = {
      title: orderTitle,
      description: orderDescription,
      department: department,
      urgency: urgency,
      // Keep original creation date and ID
      status: 'pending', // Keep as pending for review
      estimatedTotal: total,
      total: total,
      items: orderItems.map(item => {
        // Find the category name if we have a categoryId but no category name
        let categoryName = item.product.category;
        if (!categoryName && item.product.categoryId) {
          const category = categories.find(c => c.id === item.product.categoryId);
          if (category) {
            categoryName = category.name;
          }
        }
        
        return {
          id: item.product.id,
          product: item.product.name,
          category: categoryName || 'Non catégorisé',
          categoryId: item.product.categoryId,
          quantity: item.quantity,
          unit: item.product.unit || 'pcs',
          price: item.product.price,
          total: item.product.price * item.quantity
        };
      })
    };
    
    // Use mutation to update the order
    updateOrderMutation.mutate(orderData);
  };
  
  // All hooks must be called before any conditional returns
  // Force a sample item if the orderItems array is empty
  useEffect(() => {
    if (order && (!orderItems || orderItems.length === 0)) {
      console.log('Forcing sample item in orderItems');
      setOrderItems([{
        product: {
          id: "1",
          name: "Rice",
          category: "Non catégorisé",
          categoryId: 1,
          price: 25,
          unit: "kg"
        },
        quantity: 1
      }]);
    }
  }, [order, orderItems]);
  
  // Initialize form fields with order data
  useEffect(() => {
    if (order) {
      // Set form fields with order data
      setOrderTitle(order.title || '');
      setOrderDescription(order.description || '');
      setDepartment(order.department || '');
      setUrgency(order.urgency || 'normal');
      
      // Process order items if they exist
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        const processedItems = order.items.map(item => ({
          product: {
            id: item.id || '1',
            name: item.product || 'Unknown Product',
            category: item.category || 'Non catégorisé',
            categoryId: item.categoryId || 1,
            price: item.price || 0,
            unit: item.unit || 'pcs'
          },
          quantity: item.quantity || 1
        }));
        
        setOrderItems(processedItems);
      }
    }
  }, [order]);
  
  // For debugging - log the current state
  console.log('Current state:', {
    order,
    orderItems,
    orderTitle,
    orderDescription,
    department,
    urgency
  });
  
  // Show loading state if data is still loading - AFTER all hooks are called
  if (orderLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement des données de la commande...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier le bon de commande</h1>
          <p className="text-muted-foreground">
            Modifiez les informations ci-dessous pour mettre à jour votre bon de commande
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Détails du bon</CardTitle>
            <CardDescription>Informations générales sur le bon de commande</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du bon</Label>
              <Input 
                id="title" 
                placeholder="Ex: Commande hebdomadaire cuisine" 
                value={orderTitle}
                onChange={(e) => setOrderTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Département</Label>
              <Select 
                value={department} 
                onValueChange={setDepartment}
                defaultValue={order?.department || ''}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un département">
                    {department || order?.department || 'Sélectionner un département'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sélectionner un département</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="urgency">Niveau d'urgence</Label>
              <Select 
                value={urgency} 
                onValueChange={setUrgency}
                defaultValue={order?.urgency || 'normal'}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner le niveau d'urgence">
                    {urgency === 'low' ? 'Basse' :
                     urgency === 'normal' ? 'Normale' :
                     urgency === 'high' ? 'Haute' :
                     urgency === 'critical' ? 'Critique' :
                     'Sélectionner le niveau d\'urgence'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea 
                id="description" 
                placeholder="Détails supplémentaires sur cette commande..." 
                value={orderDescription}
                onChange={(e) => setOrderDescription(e.target.value)}
              />
            </div>
            
            <div className="pt-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Date de modification: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Modifié par: Vendor User</span>
              </div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Statut: En attente</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Order Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Produits commandés</CardTitle>
                <CardDescription>Liste des produits à commander</CardDescription>
              </div>
              <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un produit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[725px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter un produit</DialogTitle>
                    <DialogDescription>
                      Recherchez et sélectionnez un produit à ajouter au bon de commande
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                            {categoriesLoading ? (
                              <SelectItem value="loading">Chargement...</SelectItem>
                            ) : (
                              categories.map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant={multiSelectMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMultiSelectMode(!multiSelectMode)}
                      >
                        {multiSelectMode ? "Sélection multiple activée" : "Activer sélection multiple"}
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[300px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {multiSelectMode && <TableHead className="w-[50px]">Sélection</TableHead>}
                            <TableHead>Produit</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Unité</TableHead>
                            <TableHead className="text-right">Prix</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            {multiSelectMode && <TableHead>Quantité</TableHead>}
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProducts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={multiSelectMode ? 7 : 6} className="text-center py-4">
                                Aucun produit trouvé
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredProducts.map((product) => {
                              const isSelected = multiSelectMode 
                                ? selectedProducts.some(p => p.id === product.id)
                                : selectedProduct?.id === product.id;
                              const selectedProductItem = selectedProducts.find(p => p.id === product.id);
                              
                              return (
                                <TableRow 
                                  key={product.id} 
                                  onClick={() => handleSelectProduct(product)} 
                                  className={`cursor-pointer hover:bg-muted ${isSelected ? 'bg-muted' : ''}`}
                                >
                                  {multiSelectMode && (
                                    <TableCell>
                                      <Checkbox 
                                        checked={isSelected}
                                        onCheckedChange={() => handleSelectProduct(product)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </TableCell>
                                  )}
                                  <TableCell className="font-medium">{product.name}</TableCell>
                                  <TableCell>
                                    {product.category || 
                                     (product.categoryId && categories.find(c => c.id.toString() === product.categoryId.toString())?.name) || 
                                     'Non catégorisé'}
                                  </TableCell>
                                  <TableCell>{product.unit}</TableCell>
                                  <TableCell className="text-right">{product.price.toFixed(2)} DH</TableCell>
                                  <TableCell className="text-right">{product.stock}</TableCell>
                                  {multiSelectMode && (
                                    <TableCell>
                                      {isSelected && (
                                        <div className="flex items-center">
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const updatedProducts = selectedProducts.map(p => 
                                                p.id === product.id 
                                                  ? { ...p, quantity: Math.max(1, p.quantity - 1) } 
                                                  : p
                                              );
                                              setSelectedProducts(updatedProducts);
                                            }}
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                          <Input
                                            type="number"
                                            min="1"
                                            className="w-16 mx-2 text-center"
                                            value={selectedProductItem?.quantity || 1}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              const updatedProducts = selectedProducts.map(p => 
                                                p.id === product.id 
                                                  ? { ...p, quantity: parseInt(e.target.value) || 1 } 
                                                  : p
                                              );
                                              setSelectedProducts(updatedProducts);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const updatedProducts = selectedProducts.map(p => 
                                                p.id === product.id 
                                                  ? { ...p, quantity: p.quantity + 1 } 
                                                  : p
                                              );
                                              setSelectedProducts(updatedProducts);
                                            }}
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </TableCell>
                                  )}
                                  <TableCell>
                                    <Button variant="ghost" size="icon" onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectProduct(product);
                                    }}>
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    
                    {!multiSelectMode && selectedProduct && (
                      <div className="border rounded-lg p-4 mt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{selectedProduct.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedProduct.category || 
                               (selectedProduct.categoryId && categories.find(c => c.id.toString() === selectedProduct.categoryId.toString())?.name) || 
                               'Non catégorisé'} - {selectedProduct.price.toFixed(2)} DH/{selectedProduct.unit}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="space-y-1">
                              <Label htmlFor="quantity">Quantité</Label>
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  id="quantity"
                                  type="number"
                                  min="1"
                                  className="w-16 mx-2 text-center"
                                  value={quantity}
                                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setQuantity(quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <Button onClick={handleAddProduct}>
                              Ajouter
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {multiSelectMode && selectedProducts.length > 0 && (
                      <div className="border rounded-lg p-4 mt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{selectedProducts.length} produit(s) sélectionné(s)</h4>
                            <p className="text-sm text-muted-foreground">
                              Total: {selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)} DH
                            </p>
                          </div>
                          <Button onClick={handleAddProduct}>
                            Ajouter tous les produits
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                      Annuler
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Product Dialog */}
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Modifier la quantité</DialogTitle>
                    <DialogDescription>
                      Ajustez la quantité du produit dans votre commande
                    </DialogDescription>
                  </DialogHeader>
                  
                  {editingItemIndex !== null && orderItems[editingItemIndex] && (
                    <div className="grid gap-4 py-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex flex-col space-y-2">
                          <h4 className="font-semibold">{orderItems[editingItemIndex].product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {orderItems[editingItemIndex].product.category || 
                             (orderItems[editingItemIndex].product.categoryId && categories.find(c => c.id.toString() === orderItems[editingItemIndex].product.categoryId.toString())?.name) || 
                             'Non catégorisé'} - 
                            {orderItems[editingItemIndex].product.price.toFixed(2)} DH/{orderItems[editingItemIndex].product.unit || 'pcs'}
                          </p>
                          <div className="space-y-1 mt-2">
                            <Label htmlFor="editQuantity">Quantité</Label>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                id="editQuantity"
                                type="number"
                                min="1"
                                className="w-16 mx-2 text-center"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditQuantity(editQuantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSaveEdit}>
                      Enregistrer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {orderItems && orderItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead className="text-right">Prix unitaire</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell>
                        {item.product.category || 
                         (item.product.categoryId && categories.find(c => c.id.toString() === item.product.categoryId.toString())?.name) || 
                         'Non catégorisé'}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity} {item.product.unit || 'pcs'}
                      </TableCell>
                      <TableCell className="text-right">{item.product.price.toFixed(2)} DH</TableCell>
                      <TableCell className="text-right">{(item.product.price * item.quantity).toFixed(2)} DH</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditProduct(index)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{calculateTotal().toFixed(2)} DH</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Aucun produit dans cette commande</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cette commande n'a pas de produits. Cliquez sur "Ajouter un produit" pour ajouter des produits à votre bon de commande.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/dashboard/vendor/orders')}>
              Annuler
            </Button>
            <Button onClick={handleSubmitOrder}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les modifications
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EditOrder;