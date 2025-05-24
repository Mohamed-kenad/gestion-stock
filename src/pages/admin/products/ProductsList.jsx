import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, categoriesAPI } from '../../../lib/api';
import { useToast } from "@/components/ui/use-toast";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Product status calculation helper function
const calculateProductStatus = (quantity, threshold) => {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= threshold * 0.5) return 'critical';
  if (quantity <= threshold) return 'warning';
  return 'normal';
};

const ProductsList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Fetch products using React Query
  const { 
    data: products = [], 
    isLoading: productsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll
  });

  // Fetch categories using React Query
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll
  });
  
  // Loading state based on queries
  const loading = productsLoading || categoriesLoading;
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (productId) => productsAPI.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowDeleteModal(false);
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Filter products based on search term, category, and status
  const filteredProducts = products.filter(product => {
    // Calculate status if not present
    const productStatus = product.status || calculateProductStatus(product.quantity, product.threshold);
    
    const matchesSearch = 
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      categoryFilter === 'all' || 
      product.categoryId === parseInt(categoryFilter) || 
      (product.category && categories.find(c => c.name === product.category)?.id === parseInt(categoryFilter));
    
    const matchesStatus = statusFilter === 'all' || productStatus === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get status badge based on status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'critical':
        return <Badge variant="destructive">Critique</Badge>;
      case 'warning':
        return <Badge variant="warning" className="bg-yellow-500">Attention</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Normal</Badge>;
      case 'out_of_stock':
        return <Badge variant="secondary">Rupture</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Handle product deletion
  const handleDeleteProduct = () => {
    if (!currentProduct) return;
    deleteProductMutation.mutate(currentProduct.id);
  };

  // Handle refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue de produits et leurs niveaux de stock
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>
      </div>
      
      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des produits</CardTitle>
          <CardDescription>
            Gérez votre catalogue de produits et leurs niveaux de stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-1 flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
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
                  <SelectItem value="all">Toutes les catégories</SelectItem>
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
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="warning">Attention</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="out_of_stock">Rupture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Seuil</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Dernière MAJ</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                        <p>Chargement des produits...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : productsError ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-red-500">
                        <AlertTriangle className="h-12 w-12 mb-2" />
                        <p>Erreur lors du chargement des produits</p>
                        <p className="text-sm">{productsError.message}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Package className="h-12 w-12 mb-2" />
                        <p>Aucun produit trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map(product => {
                    // Calculate status if not present
                    const productStatus = product.status || calculateProductStatus(product.quantity, product.threshold);
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.quantity} {product.unit}</TableCell>
                        <TableCell>{product.threshold} {product.unit}</TableCell>
                        <TableCell>
                          <Badge className={`
                            ${productStatus === 'normal' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                            ${productStatus === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                            ${productStatus === 'critical' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                            ${productStatus === 'out_of_stock' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' : ''}
                          `}>
                            {productStatus === 'normal' ? 'Normal' : 
                             productStatus === 'warning' ? 'Attention' : 
                             productStatus === 'critical' ? 'Critique' : 'Rupture'}
                          </Badge>
                        </TableCell>
                        <TableCell>{(product.price || 0).toFixed(2)} €</TableCell>
                        <TableCell>{product.lastUpdated || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setCurrentProduct(product);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500"
                              onClick={() => {
                                setCurrentProduct(product);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit "{currentProduct?.name}"? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsList;
