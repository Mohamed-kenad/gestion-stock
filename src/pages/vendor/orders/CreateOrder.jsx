import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesAPI, productsAPI, ordersAPI } from '../../../lib/api';
import { 
  Plus, Minus, Trash2, Search, Save, FileText, Package, Calendar, 
  User, Building, AlertTriangle, Check, X
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

const CreateOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [showProductDialog, setShowProductDialog] = useState(false);
  
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
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData) => ordersAPI.create(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Commande créée",
        description: "Votre bon de commande a été créé avec succès.",
      });
      navigate('/dashboard/vendor/orders');
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Add product to order
  const handleAddProduct = () => {
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
  
  // Submit order
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
    
    // Create order data object with all necessary fields
    const orderData = {
      id: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: orderTitle,
      description: orderDescription,
      department: department,
      urgency: urgency,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      userId: 2, // In a real app, this would come from authentication
      createdBy: 'Vendor User', // In a real app, this would come from authentication
      createdByRole: 'Vendor',
      supplier: 'Fournisseur Principal', // Default supplier, could be selected by user
      estimatedTotal: total,
      total: total,
      items: orderItems.map(item => ({
        id: item.product.id,
        product: item.product.name,
        category: item.product.category,
        quantity: item.quantity,
        unit: item.product.unit || 'pcs',
        price: item.product.price,
        total: item.product.price * item.quantity
      }))
    };
    
    // Use mutation to create the order
    createOrderMutation.mutate(orderData);
  };
  
  // Handle product selection
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    // Keep the dialog open so the user can set the quantity
    // and click the Add button
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer un bon de commande</h1>
          <p className="text-muted-foreground">
            Remplissez les informations ci-dessous pour créer un nouveau bon de commande
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
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
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
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le niveau d'urgence" />
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
                <span className="text-muted-foreground">Date de création: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Créé par: [Nom d'utilisateur]</span>
              </div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Statut: Brouillon</span>
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
                              <TableRow key={product.id} onClick={() => handleSelectProduct(product)} className="cursor-pointer hover:bg-muted">
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{product.unit}</TableCell>
                                <TableCell className="text-right">{product.price.toFixed(2)} DH</TableCell>
                                <TableCell className="text-right">{product.stock}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectProduct(product);
                                  }}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                    
                    {selectedProduct && (
                      <div className="border rounded-lg p-4 mt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{selectedProduct.name}</h4>
                            <p className="text-sm text-muted-foreground">{selectedProduct.category} - {selectedProduct.price.toFixed(2)} DH/{selectedProduct.unit}</p>
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
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowProductDialog(false)}>
                      Annuler
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {orderItems.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Aucun produit ajouté</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cliquez sur "Ajouter un produit" pour commencer à créer votre bon de commande
                </p>
              </div>
            ) : (
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
                      <TableCell>{item.product.category}</TableCell>
                      <TableCell className="text-center">
                        {item.quantity} {item.product.unit}
                      </TableCell>
                      <TableCell className="text-right">{item.product.price.toFixed(2)} DH</TableCell>
                      <TableCell className="text-right">{(item.product.price * item.quantity).toFixed(2)} DH</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/dashboard/vendor/orders')}>
              Annuler
            </Button>
            <Button onClick={handleSubmitOrder}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer le bon
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CreateOrder;
