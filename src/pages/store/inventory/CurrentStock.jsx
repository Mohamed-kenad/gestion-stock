import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, Download, RefreshCw, AlertTriangle, ArrowUpDown, Plus, Minus
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
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

// Mock data - replace with actual API calls
const mockProducts = [
  { id: 1, name: 'Farine de blé', category: 'Ingrédients de base', quantity: 120, unit: 'kg', threshold: 20, status: 'normal', lastUpdated: '2025-05-18' },
  { id: 2, name: 'Sucre', category: 'Ingrédients de base', quantity: 85, unit: 'kg', threshold: 15, status: 'normal', lastUpdated: '2025-05-19' },
  { id: 3, name: 'Huile d\'olive', category: 'Huiles et graisses', quantity: 12, unit: 'L', threshold: 10, status: 'warning', lastUpdated: '2025-05-17' },
  { id: 4, name: 'Tomates', category: 'Légumes', quantity: 45, unit: 'kg', threshold: 50, status: 'critical', lastUpdated: '2025-05-20' },
  { id: 5, name: 'Poulet', category: 'Viandes', quantity: 60, unit: 'kg', threshold: 20, status: 'normal', lastUpdated: '2025-05-16' },
  { id: 6, name: 'Pommes de terre', category: 'Légumes', quantity: 200, unit: 'kg', threshold: 50, status: 'normal', lastUpdated: '2025-05-15' },
  { id: 7, name: 'Lait', category: 'Produits laitiers', quantity: 25, unit: 'L', threshold: 30, status: 'critical', lastUpdated: '2025-05-19' },
  { id: 8, name: 'Œufs', category: 'Produits laitiers', quantity: 150, unit: 'unité', threshold: 50, status: 'normal', lastUpdated: '2025-05-18' },
];

const CurrentStock = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 800);
  }, []);

  // Filter products based on search term and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    const matchesStatus = statusFilter === '' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map(product => product.category))];

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

  // Handle refresh inventory
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 800);
  };

  // Handle export inventory
  const handleExport = () => {
    alert('Exporting inventory to CSV...');
    // Implement actual export functionality
  };

  // Open adjustment dialog
  const openAdjustmentDialog = (product, type) => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setAdjustmentQuantity(1);
    setAdjustmentReason('');
    setIsAdjustmentDialogOpen(true);
  };

  // Handle stock adjustment
  const handleStockAdjustment = () => {
    if (!selectedProduct || adjustmentQuantity <= 0 || !adjustmentReason) {
      return;
    }

    // Clone products array
    const updatedProducts = [...products];
    const productIndex = updatedProducts.findIndex(p => p.id === selectedProduct.id);
    
    if (productIndex === -1) return;

    // Update product quantity
    if (adjustmentType === 'add') {
      updatedProducts[productIndex].quantity += Number(adjustmentQuantity);
    } else {
      const newQuantity = Math.max(0, updatedProducts[productIndex].quantity - Number(adjustmentQuantity));
      updatedProducts[productIndex].quantity = newQuantity;
    }

    // Update status based on threshold
    const product = updatedProducts[productIndex];
    if (product.quantity <= 0) {
      product.status = 'critical';
    } else if (product.quantity <= product.threshold) {
      product.status = 'warning';
    } else {
      product.status = 'normal';
    }

    // Update last updated date
    product.lastUpdated = new Date().toISOString().split('T')[0];

    // Update products state
    setProducts(updatedProducts);
    setIsAdjustmentDialogOpen(false);

    // In a real app, you would send this adjustment to the API
    console.log(`Stock adjustment: ${adjustmentType === 'add' ? 'Added' : 'Removed'} ${adjustmentQuantity} ${product.unit} of ${product.name}. Reason: ${adjustmentReason}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Actuel</h1>
          <p className="text-muted-foreground">
            Gérez et ajustez votre inventaire
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
              <SelectItem key={category} value={category}>{category}</SelectItem>
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
          <CardTitle>Inventaire</CardTitle>
          <CardDescription>
            Gérez les quantités en stock et effectuez des ajustements
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
                    <TableHead>Nom du produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead>Unité</TableHead>
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
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell>{product.threshold}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>{product.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openAdjustmentDialog(product, 'add')}
                              title="Ajouter au stock"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openAdjustmentDialog(product, 'remove')}
                              title="Retirer du stock"
                            >
                              <Minus className="h-4 w-4" />
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
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
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

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'add' ? 'Ajouter au stock' : 'Retirer du stock'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <span>
                  {adjustmentType === 'add' ? 'Ajouter' : 'Retirer'} du {selectedProduct.name} ({selectedProduct.unit})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantité
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Raison
              </Label>
              <Input
                id="reason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="col-span-3"
                placeholder="Motif de l'ajustement"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleStockAdjustment}
              disabled={adjustmentQuantity <= 0 || !adjustmentReason}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CurrentStock;
