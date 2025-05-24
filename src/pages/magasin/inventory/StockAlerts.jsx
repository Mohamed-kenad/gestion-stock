import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { inventoryAPI, productsAPI } from '../../../lib/api';
import { 
  AlertTriangle, Search, Filter, Package, ArrowUp, ArrowDown
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const StockAlerts = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [alertType, setAlertType] = useState('all'); // 'all', 'low', 'out'
  
  // Fetch inventory data
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
  
  // Combine inventory and products data
  const inventoryWithDetails = inventory.map(item => {
    const product = products.find(p => p.id === item.productId) || {};
    return {
      ...item,
      ...product,
      stockStatus: item.quantity <= (item.threshold || 10) 
        ? item.quantity === 0 ? 'out' : 'low' 
        : 'normal',
      percentageOfThreshold: Math.min(
        Math.round((item.quantity / (item.threshold || 10)) * 100),
        100
      )
    };
  });
  
  // Filter inventory based on search, category, and alert type
  const filteredInventory = inventoryWithDetails.filter(item => {
    const matchesSearch = 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.productId && item.productId.toString().includes(searchTerm));
    
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    
    const matchesAlertType = 
      alertType === 'all' || 
      (alertType === 'low' && item.stockStatus === 'low') ||
      (alertType === 'out' && item.stockStatus === 'out');
    
    return matchesSearch && matchesCategory && matchesAlertType;
  });
  
  // Sort inventory by alert priority (out of stock first, then low stock)
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (a.stockStatus === 'out' && b.stockStatus !== 'out') return -1;
    if (a.stockStatus !== 'out' && b.stockStatus === 'out') return 1;
    if (a.stockStatus === 'low' && b.stockStatus === 'normal') return -1;
    if (a.stockStatus === 'normal' && b.stockStatus === 'low') return 1;
    return a.percentageOfThreshold - b.percentageOfThreshold;
  });
  
  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map(product => product.category || 'Non catégorisé'))];
  
  // Count alerts by type
  const alertCounts = {
    low: inventoryWithDetails.filter(item => item.stockStatus === 'low').length,
    out: inventoryWithDetails.filter(item => item.stockStatus === 'out').length,
    total: inventoryWithDetails.filter(item => item.stockStatus === 'low' || item.stockStatus === 'out').length
  };
  
  // Loading state
  if (inventoryLoading || productsLoading) {
    return <div className="p-6">Chargement des alertes de stock...</div>;
  }
  
  // Error state
  if (inventoryError || productsError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {inventoryError?.message || productsError?.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alertes de Stock</h1>
      </div>
      
      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des Alertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">{alertCounts.total}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock Faible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">{alertCounts.low}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rupture de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-2xl font-bold">{alertCounts.out}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setAlertType}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Toutes les Alertes</TabsTrigger>
          <TabsTrigger value="low">Stock Faible</TabsTrigger>
          <TabsTrigger value="out">Rupture de Stock</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="search">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nom, catégorie, ID..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category">Catégorie</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les catégories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Alerts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Produits en Alerte ({sortedInventory.length})</CardTitle>
              <CardDescription>
                Produits nécessitant une attention particulière
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Seuil</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Aucun produit en alerte trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedInventory.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productId}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category || 'Non catégorisé'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.threshold || 10}</TableCell>
                        <TableCell>
                          {item.stockStatus === 'normal' ? (
                            <Badge variant="outline" className="bg-green-50">Normal</Badge>
                          ) : item.stockStatus === 'low' ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">Faible</Badge>
                          ) : (
                            <Badge variant="destructive">Rupture</Badge>
                          )}
                        </TableCell>
                        <TableCell className="w-[150px]">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={item.percentageOfThreshold} 
                              className={
                                item.stockStatus === 'out' ? 'bg-red-100' :
                                item.stockStatus === 'low' ? 'bg-amber-100' :
                                'bg-green-100'
                              }
                            />
                            <span className="text-xs w-[30px]">{item.percentageOfThreshold}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              asChild
                            >
                              <Link to="/dashboard/magasin/inventory">
                                <Package className="h-4 w-4 mr-1" />
                                Gérer
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
};

export default StockAlerts;
