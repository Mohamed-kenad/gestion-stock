import React, { useState, useEffect } from 'react';
import { 
  FilePlus, Search, Plus, Trash, ArrowLeft, Save, Package
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom';

// Mock data
const mockSuppliers = [
  { id: 1, name: 'Fournisseur A', email: 'contact@fournisseura.com', phone: '0612345678' },
  { id: 2, name: 'Fournisseur B', email: 'contact@fournisseurb.com', phone: '0623456789' },
  { id: 3, name: 'Fournisseur C', email: 'contact@fournisseurc.com', phone: '0634567890' },
  { id: 4, name: 'Fournisseur D', email: 'contact@fournisseurd.com', phone: '0645678901' },
  { id: 5, name: 'Fournisseur E', email: 'contact@fournisseure.com', phone: '0656789012' },
];

const mockDepartments = [
  { id: 1, name: 'Cuisine' },
  { id: 2, name: 'Pâtisserie' },
  { id: 3, name: 'Bar' },
  { id: 4, name: 'Service' },
];

const mockProducts = [
  { id: 1, name: 'Farine de blé', category: 'Ingrédients de base', price: 2.5, unit: 'kg' },
  { id: 2, name: 'Sucre', category: 'Ingrédients de base', price: 1.8, unit: 'kg' },
  { id: 3, name: 'Huile d\'olive', category: 'Huiles et graisses', price: 8.5, unit: 'L' },
  { id: 4, name: 'Tomates', category: 'Légumes', price: 3.2, unit: 'kg' },
  { id: 5, name: 'Poulet', category: 'Viandes', price: 6.5, unit: 'kg' },
  { id: 6, name: 'Pommes de terre', category: 'Légumes', price: 1.2, unit: 'kg' },
  { id: 7, name: 'Lait', category: 'Produits laitiers', price: 1.0, unit: 'L' },
  { id: 8, name: 'Œufs', category: 'Produits laitiers', price: 0.2, unit: 'unité' },
];

const CreateOrder = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [orderTitle, setOrderTitle] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  
  // Product selection dialog
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setDepartments(mockDepartments);
      setProducts(mockProducts);
      setLoading(false);
    }, 800);
  }, []);

  // Filter products based on search term and category filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map(product => product.category))];

  // Open product selection dialog
  const openProductDialog = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSelectedProduct(null);
    setProductQuantity(1);
    setIsProductDialogOpen(true);
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  // Handle add product to order
  const handleAddProduct = () => {
    if (!selectedProduct || productQuantity <= 0) return;

    // Check if product already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += Number(productQuantity);
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setOrderItems(updatedItems);
    } else {
      // Add new product to order
      const newItem = {
        id: Date.now(),
        productId: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        quantity: Number(productQuantity),
        unit: selectedProduct.unit,
        unitPrice: selectedProduct.price,
        total: Number(productQuantity) * selectedProduct.price
      };
      setOrderItems([...orderItems, newItem]);
    }

    setIsProductDialogOpen(false);
  };

  // Handle remove product from order
  const handleRemoveProduct = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  // Calculate order total
  const orderTotal = orderItems.reduce((sum, item) => sum + item.total, 0);

  // Handle save order
  const handleSaveOrder = () => {
    if (!orderTitle || !selectedSupplier || !selectedDepartment || orderItems.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires et ajouter au moins un produit');
      return;
    }

    // Create order object
    const order = {
      id: `PO-2025-${Math.floor(Math.random() * 1000)}`,
      title: orderTitle,
      supplier: suppliers.find(s => s.id === Number(selectedSupplier))?.name || '',
      supplierId: Number(selectedSupplier),
      department: departments.find(d => d.id === Number(selectedDepartment))?.name || '',
      departmentId: Number(selectedDepartment),
      note: orderNote,
      items: orderItems,
      total: orderTotal,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Admin', // Would come from auth context in a real app
    };

    // In a real app, you would send this to the API
    console.log('Order created:', order);
    
    // Show success message and redirect
    alert(`Bon de commande ${order.id} créé avec succès`);
    navigate('/dashboard/admin/orders');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer un Bon de Commande</h1>
          <p className="text-muted-foreground">
            Créez un nouveau bon de commande pour commander des produits
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/dashboard/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Order Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la commande</CardTitle>
              <CardDescription>
                Renseignez les informations générales du bon de commande
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orderTitle">Titre de la commande</Label>
                <Input
                  id="orderTitle"
                  value={orderTitle}
                  onChange={(e) => setOrderTitle(e.target.value)}
                  placeholder="Ex: Commande ingrédients cuisine"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Fournisseur</Label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger id="supplier" className="mt-1">
                      <SelectValue placeholder="Sélectionner un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Département</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger id="department" className="mt-1">
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(department => (
                        <SelectItem key={department.id} value={department.id.toString()}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="orderNote">Note (optionnel)</Label>
                <Textarea
                  id="orderNote"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Informations complémentaires pour le fournisseur"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Produits commandés</CardTitle>
                <CardDescription>
                  Ajoutez les produits à commander
                </CardDescription>
              </div>
              <Button onClick={openProductDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </CardHeader>
            <CardContent>
              {orderItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unitPrice.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right">
                          {item.total.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveProduct(item.id)}
                            title="Supprimer"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {orderTotal.toFixed(2)} €
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucun produit ajouté à la commande
                  </p>
                  <Button className="mt-4" onClick={openProductDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un produit
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <Button variant="outline" asChild>
                <Link to="/dashboard/admin/orders">
                  Annuler
                </Link>
              </Button>
              <Button onClick={handleSaveOrder} disabled={!orderTitle || !selectedSupplier || !selectedDepartment || orderItems.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer le bon
              </Button>
            </CardFooter>
          </Card>

          {/* Product Selection Dialog */}
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Ajouter un produit</DialogTitle>
                <DialogDescription>
                  Recherchez et sélectionnez un produit à ajouter à la commande
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Unité</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow 
                          key={product.id} 
                          className={`cursor-pointer ${selectedProduct?.id === product.id ? 'bg-primary/10' : ''}`}
                          onClick={() => handleProductSelect(product)}
                        >
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell className="text-right">{product.price.toFixed(2)} €</TableCell>
                          <TableCell className="text-right">{product.unit}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Aucun produit trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {selectedProduct && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="productName">Produit sélectionné</Label>
                    <Input
                      id="productName"
                      value={selectedProduct.name}
                      readOnly
                      className="mt-1 bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productQuantity">Quantité</Label>
                    <div className="flex items-center mt-1">
                      <Input
                        id="productQuantity"
                        type="number"
                        min="1"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(Number(e.target.value))}
                      />
                      <span className="ml-2">{selectedProduct.unit}</span>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddProduct}
                  disabled={!selectedProduct || productQuantity <= 0}
                >
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default CreateOrder;
