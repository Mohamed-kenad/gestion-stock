import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockMovementsAPI, productsAPI } from '../../../lib/api';
import { 
  Search, Calendar, ArrowUpDown, ArrowUp, ArrowDown, Filter
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
import { DatePicker } from "@/components/ui/date-picker";

const AdjustmentHistory = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('all'); // 'all', 'increase', 'decrease'
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Fetch stock movements
  const { 
    data: stockMovements = [], 
    isLoading: movementsLoading, 
    error: movementsError 
  } = useQuery({
    queryKey: ['stockMovements'],
    queryFn: () => stockMovementsAPI.getAll()
  });
  
  // Fetch products
  const { 
    data: products = [], 
    isLoading: productsLoading, 
    error: productsError 
  } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll()
  });
  
  // Filter for adjustment movements only
  const adjustmentMovements = stockMovements.filter(
    movement => movement.type === 'adjustment-in' || movement.type === 'adjustment-out'
  );
  
  // Combine movements with product details
  const movementsWithDetails = adjustmentMovements.map(movement => {
    const product = products.find(p => p.id === movement.productId) || {};
    return {
      ...movement,
      productName: product.name || `Produit #${movement.productId}`,
      productReference: product.reference || '-',
      category: product.category || 'Non catégorisé',
      adjustmentType: movement.type === 'adjustment-in' ? 'increase' : 'decrease'
    };
  });
  
  // Filter movements based on search, product, type, and date range
  const filteredMovements = movementsWithDetails.filter(movement => {
    // Filter by search term
    const matchesSearch = 
      (movement.productName && movement.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movement.productReference && movement.productReference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movement.notes && movement.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by product
    const matchesProduct = productFilter === '' || movement.productId.toString() === productFilter;
    
    // Filter by adjustment type
    const matchesType = 
      adjustmentType === 'all' || 
      (adjustmentType === 'increase' && movement.adjustmentType === 'increase') ||
      (adjustmentType === 'decrease' && movement.adjustmentType === 'decrease');
    
    // Filter by date range
    let matchesDateRange = true;
    if (startDate) {
      const movementDate = new Date(movement.date);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchesDateRange = matchesDateRange && movementDate >= start;
    }
    if (endDate) {
      const movementDate = new Date(movement.date);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDateRange = matchesDateRange && movementDate <= end;
    }
    
    return matchesSearch && matchesProduct && matchesType && matchesDateRange;
  });
  
  // Sort movements
  const sortedMovements = [...filteredMovements].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates
    if (sortField === 'date' && aValue && bValue) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle nulls
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
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
  
  // Loading state
  if (movementsLoading || productsLoading) {
    return <div className="p-6">Chargement de l'historique des ajustements...</div>;
  }
  
  // Error state
  if (movementsError || productsError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {movementsError?.message || productsError?.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Historique des Ajustements</h1>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="search">Recherche</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Produit, référence, notes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="product">Produit</label>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Tous les produits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les produits</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="type">Type d'ajustement</label>
              <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="increase">Augmentation</SelectItem>
                  <SelectItem value="decrease">Diminution</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label>Période</label>
              <div className="flex space-x-2">
                <DatePicker
                  placeholder="Date début"
                  selected={startDate}
                  onSelect={setStartDate}
                />
                <DatePicker
                  placeholder="Date fin"
                  selected={endDate}
                  onSelect={setEndDate}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Adjustments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ajustements de Stock ({sortedMovements.length})</CardTitle>
          <CardDescription>
            Historique des ajustements manuels de stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('id')}>
                    ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('date')}>
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('productName')}>
                    Produit
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('quantity')}>
                    Quantité
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Raison</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Aucun ajustement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                sortedMovements.map(movement => (
                  <TableRow key={movement.id}>
                    <TableCell>{movement.id}</TableCell>
                    <TableCell>{movement.date}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          movement.adjustmentType === 'increase' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {movement.adjustmentType === 'increase' ? (
                          <ArrowUp className="h-3 w-3 mr-1 inline" />
                        ) : (
                          <ArrowDown className="h-3 w-3 mr-1 inline" />
                        )}
                        {movement.adjustmentType === 'increase' ? 'Augmentation' : 'Diminution'}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.productName}</TableCell>
                    <TableCell>{movement.productReference}</TableCell>
                    <TableCell className={
                      movement.adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }>
                      {movement.adjustmentType === 'increase' ? '+' : '-'}{Math.abs(movement.quantity)}
                    </TableCell>
                    <TableCell>{movement.userName || `Utilisateur #${movement.userId}`}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {movement.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdjustmentHistory;
