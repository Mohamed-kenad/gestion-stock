import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Search, Filter, RefreshCw, Download, Bell, Plus
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  { id: 3, name: 'Huile d\'olive', category: 'Huiles et graisses', quantity: 12, unit: 'L', threshold: 10, status: 'warning', lastUpdated: '2025-05-17', percentageLeft: 120 },
  { id: 4, name: 'Tomates', category: 'Légumes', quantity: 45, unit: 'kg', threshold: 50, status: 'critical', lastUpdated: '2025-05-20', percentageLeft: 90 },
  { id: 7, name: 'Lait', category: 'Produits laitiers', quantity: 25, unit: 'L', threshold: 30, status: 'critical', lastUpdated: '2025-05-19', percentageLeft: 83 },
  { id: 9, name: 'Sel', category: 'Ingrédients de base', quantity: 5, unit: 'kg', threshold: 8, status: 'critical', lastUpdated: '2025-05-18', percentageLeft: 62 },
  { id: 10, name: 'Poivre noir', category: 'Épices', quantity: 2, unit: 'kg', threshold: 3, status: 'critical', lastUpdated: '2025-05-16', percentageLeft: 67 },
  { id: 11, name: 'Riz', category: 'Céréales', quantity: 30, unit: 'kg', threshold: 25, status: 'warning', lastUpdated: '2025-05-15', percentageLeft: 120 },
  { id: 12, name: 'Fromage', category: 'Produits laitiers', quantity: 8, unit: 'kg', threshold: 10, status: 'critical', lastUpdated: '2025-05-14', percentageLeft: 80 },
];

const CriticalProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(0);
  const [orderNote, setOrderNote] = useState('');
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get progress bar color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage <= 50) return 'bg-destructive';
    if (percentage <= 90) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Handle refresh products
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 800);
  };

  // Handle export products
  const handleExport = () => {
    alert('Exporting critical products to CSV...');
    // Implement actual export functionality
  };

  // Open order dialog
  const openOrderDialog = (product) => {
    setSelectedProduct(product);
    // Calculate suggested order quantity (e.g., to reach 150% of threshold)
    const suggestedQuantity = Math.ceil((product.threshold * 1.5) - product.quantity);
    setOrderQuantity(suggestedQuantity > 0 ? suggestedQuantity : 1);
    setOrderNote('');
    setIsOrderDialogOpen(true);
  };

  // Handle create order
  const handleCreateOrder = () => {
    if (!selectedProduct || orderQuantity <= 0) {
      return;
    }

    // In a real app, you would send this order to the API
    console.log(`Order created for ${selectedProduct.name}: ${orderQuantity} ${selectedProduct.unit}. Note: ${orderNote}`);
    
    // Show success message
    alert(`Bon de commande créé pour ${selectedProduct.name} (${orderQuantity} ${selectedProduct.unit})`);
    
    setIsOrderDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits en Seuil Critique</h1>
          <p className="text-muted-foreground">
            Surveillez et gérez les produits nécessitant un réapprovisionnement
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
            <CardTitle className="text-sm font-medium">Total produits critiques</CardTitle>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories concernées</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(products.map(p => p.category)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions requises</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="critical">Critique</TabsTrigger>
            <TabsTrigger value="warning">Attention</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="warning">Attention</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Critical Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Produits à réapprovisionner</CardTitle>
              <CardDescription>
                Liste des produits sous ou proche du seuil critique
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
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Quantité</TableHead>
                        <TableHead>Seuil</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Niveau</TableHead>
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
                            <TableCell>{product.threshold} {product.unit}</TableCell>
                            <TableCell>{getStatusBadge(product.status)}</TableCell>
                            <TableCell className="w-[180px]">
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={product.percentageLeft} 
                                  max={150} 
                                  className={getProgressColor(product.percentageLeft)}
                                />
                                <span className="text-xs w-10">{product.percentageLeft}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{product.lastUpdated}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openOrderDialog(product)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Commander
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Aucun produit critique trouvé
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
        </TabsContent>

        <TabsContent value="critical" className="mt-0">
          {/* Same content as "all" tab but filtered for critical status */}
          {/* This would be handled by the filteredProducts logic */}
        </TabsContent>

        <TabsContent value="warning" className="mt-0">
          {/* Same content as "all" tab but filtered for warning status */}
          {/* This would be handled by the filteredProducts logic */}
        </TabsContent>
      </Tabs>

      {/* Create Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Créer un bon de commande
            </DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <span>
                  Commander du {selectedProduct.name} ({selectedProduct.unit})
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
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <Input
                id="note"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="col-span-3"
                placeholder="Note pour le bon de commande"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateOrder}
              disabled={orderQuantity <= 0}
            >
              Créer le bon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CriticalProducts;
