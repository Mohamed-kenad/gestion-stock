import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Plus, Edit, Trash, RefreshCw, Filter, Download, AlertTriangle
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Mock data
const mockCategories = [
  { id: 1, name: 'Ingrédients de base' },
  { id: 2, name: 'Légumes' },
  { id: 3, name: 'Viandes' },
  { id: 4, name: 'Produits laitiers' },
  { id: 5, name: 'Huiles et graisses' },
  { id: 6, name: 'Épices' },
  { id: 7, name: 'Céréales' },
  { id: 8, name: 'Boissons' },
  { id: 9, name: 'Alcools' },
  { id: 10, name: 'Fruits' },
];

const mockProducts = [
  { id: 1, name: 'Farine de blé', category: 'Ingrédients de base', categoryId: 1, description: 'Farine de blé tout usage', quantity: 120, unit: 'kg', threshold: 20, status: 'normal', price: 2.5, lastUpdated: '2025-05-18' },
  { id: 2, name: 'Sucre', category: 'Ingrédients de base', categoryId: 1, description: 'Sucre blanc raffiné', quantity: 85, unit: 'kg', threshold: 15, status: 'normal', price: 1.8, lastUpdated: '2025-05-19' },
  { id: 3, name: 'Huile d\'olive', category: 'Huiles et graisses', categoryId: 5, description: 'Huile d\'olive extra vierge', quantity: 12, unit: 'L', threshold: 10, status: 'warning', price: 8.5, lastUpdated: '2025-05-17' },
  { id: 4, name: 'Tomates', category: 'Légumes', categoryId: 2, description: 'Tomates fraîches', quantity: 45, unit: 'kg', threshold: 50, status: 'critical', price: 3.2, lastUpdated: '2025-05-20' },
  { id: 5, name: 'Poulet', category: 'Viandes', categoryId: 3, description: 'Poulet entier frais', quantity: 60, unit: 'kg', threshold: 20, status: 'normal', price: 6.5, lastUpdated: '2025-05-16' },
  { id: 6, name: 'Pommes de terre', category: 'Légumes', categoryId: 2, description: 'Pommes de terre', quantity: 200, unit: 'kg', threshold: 50, status: 'normal', price: 1.2, lastUpdated: '2025-05-15' },
  { id: 7, name: 'Lait', category: 'Produits laitiers', categoryId: 4, description: 'Lait entier', quantity: 25, unit: 'L', threshold: 30, status: 'critical', price: 1.0, lastUpdated: '2025-05-19' },
  { id: 8, name: 'Œufs', category: 'Produits laitiers', categoryId: 4, description: 'Œufs frais', quantity: 150, unit: 'unité', threshold: 50, status: 'normal', price: 0.2, lastUpdated: '2025-05-18' },
];

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form fields
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productQuantity, setProductQuantity] = useState(0);
  const [productUnit, setProductUnit] = useState('');
  const [productThreshold, setProductThreshold] = useState(0);
  const [productPrice, setProductPrice] = useState(0);

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setProducts(mockProducts);
      setCategories(mockCategories);
      setLoading(false);
    }, 800);
  }, []);

  // Filter products based on search term and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || product.categoryId === Number(categoryFilter);
    const matchesStatus = statusFilter === '' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Status badge color mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Critique</Badge>;
      case 'warning':
        return <Badge variant="warning" className="bg-yellow-500">Attention</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Normal</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Open add dialog
  const openAddDialog = () => {
    setProductName('');
    setProductDescription('');
    setProductCategory('');
    setProductQuantity(0);
    setProductUnit('');
    setProductThreshold(0);
    setProductPrice(0);
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductCategory(product.categoryId.toString());
    setProductQuantity(product.quantity);
    setProductUnit(product.unit);
    setProductThreshold(product.threshold);
    setProductPrice(product.price);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Handle add product
  const handleAddProduct = () => {
    if (!productName || !productCategory || !productUnit) return;

    // Create new product
    const newProduct = {
      id: products.length + 1,
      name: productName,
      description: productDescription,
      categoryId: Number(productCategory),
      category: categories.find(c => c.id === Number(productCategory))?.name || '',
      quantity: Number(productQuantity),
      unit: productUnit,
      threshold: Number(productThreshold),
      price: Number(productPrice),
      status: Number(productQuantity) <= Number(productThreshold) ? 'critical' : 'normal',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    // Update products
    setProducts([...products, newProduct]);
    setIsAddDialogOpen(false);
    
    // Show success message
    alert(`Produit "${productName}" ajouté avec succès`);
  };

  // Handle edit product
  const handleEditProduct = () => {
    if (!productName || !productCategory || !productUnit || !selectedProduct) return;

    // Update product
    const updatedProducts = products.map(product => {
      if (product.id === selectedProduct.id) {
        const status = Number(productQuantity) <= Number(productThreshold) 
          ? 'critical' 
          : Number(productQuantity) <= Number(productThreshold) * 1.2 
            ? 'warning' 
            : 'normal';
            
        return {
          ...product,
          name: productName,
          description: productDescription,
          categoryId: Number(productCategory),
          category: categories.find(c => c.id === Number(productCategory))?.name || '',
          quantity: Number(productQuantity),
          unit: productUnit,
          threshold: Number(productThreshold),
          price: Number(productPrice),
          status,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return product;
    });

    // Update state
    setProducts(updatedProducts);
    setIsEditDialogOpen(false);
    
    // Show success message
    alert(`Produit "${productName}" mis à jour avec succès`);
  };

  // Handle delete product
  const handleDeleteProduct = () => {
    if (!selectedProduct) return;

    // Delete product
    const updatedProducts = products.filter(product => product.id !== selectedProduct.id);
    
    // Update state
    setProducts(updatedProducts);
    setIsDeleteDialogOpen(false);
    
    // Show success message
    alert(`Produit "${selectedProduct.name}" supprimé avec succès`);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 800);
  };

  // Handle export
  const handleExport = () => {
    alert('Exporting products to CSV...');
    // Implement actual export functionality
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue de produits
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.status === 'critical').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits en alerte</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter(p => p.status === 'warning').length}</div>
          </CardContent>
        </Card>
      </div>

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
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les statuts</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="warning">Attention</SelectItem>
            <SelectItem value="critical">Critique</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des produits</CardTitle>
          <CardDescription>
            Gérez les produits de votre inventaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-right">Prix</TableHead>
                    <TableHead>Seuil</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière mise à jour</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">
                          {product.quantity} {product.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.price.toFixed(2)} €
                        </TableCell>
                        <TableCell>{product.threshold} {product.unit}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>{product.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditDialog(product)}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openDeleteDialog(product)}
                              title="Supprimer"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun produit trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
            <DialogDescription>
              Créez un nouveau produit dans votre inventaire
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="productName">Nom du produit</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Nom du produit"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="productDescription">Description</Label>
              <Textarea
                id="productDescription"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Description du produit"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="productCategory">Catégorie</Label>
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger id="productCategory" className="mt-1">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productQuantity">Quantité</Label>
                <Input
                  id="productQuantity"
                  type="number"
                  min="0"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="productUnit">Unité</Label>
                <Select value={productUnit} onValueChange={setProductUnit}>
                  <SelectTrigger id="productUnit" className="mt-1">
                    <SelectValue placeholder="Unité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogramme (kg)</SelectItem>
                    <SelectItem value="g">Gramme (g)</SelectItem>
                    <SelectItem value="L">Litre (L)</SelectItem>
                    <SelectItem value="ml">Millilitre (ml)</SelectItem>
                    <SelectItem value="unité">Unité</SelectItem>
                    <SelectItem value="carton">Carton</SelectItem>
                    <SelectItem value="paquet">Paquet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productThreshold">Seuil d'alerte</Label>
                <Input
                  id="productThreshold"
                  type="number"
                  min="0"
                  value={productThreshold}
                  onChange={(e) => setProductThreshold(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="productPrice">Prix unitaire (€)</Label>
                <Input
                  id="productPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddProduct}
              disabled={!productName || !productCategory || !productUnit}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier un produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="editProductName">Nom du produit</Label>
              <Input
                id="editProductName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Nom du produit"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editProductDescription">Description</Label>
              <Textarea
                id="editProductDescription"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Description du produit"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editProductCategory">Catégorie</Label>
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger id="editProductCategory" className="mt-1">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editProductQuantity">Quantité</Label>
                <Input
                  id="editProductQuantity"
                  type="number"
                  min="0"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editProductUnit">Unité</Label>
                <Select value={productUnit} onValueChange={setProductUnit}>
                  <SelectTrigger id="editProductUnit" className="mt-1">
                    <SelectValue placeholder="Unité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogramme (kg)</SelectItem>
                    <SelectItem value="g">Gramme (g)</SelectItem>
                    <SelectItem value="L">Litre (L)</SelectItem>
                    <SelectItem value="ml">Millilitre (ml)</SelectItem>
                    <SelectItem value="unité">Unité</SelectItem>
                    <SelectItem value="carton">Carton</SelectItem>
                    <SelectItem value="paquet">Paquet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editProductThreshold">Seuil d'alerte</Label>
                <Input
                  id="editProductThreshold"
                  type="number"
                  min="0"
                  value={productThreshold}
                  onChange={(e) => setProductThreshold(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editProductPrice">Prix unitaire (€)</Label>
                <Input
                  id="editProductPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleEditProduct}
              disabled={!productName || !productCategory || !productUnit}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer un produit</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedProduct && (
              <p>
                Vous êtes sur le point de supprimer le produit <strong>{selectedProduct.name}</strong>.
                Cette action est irréversible.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteProduct}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsList;
