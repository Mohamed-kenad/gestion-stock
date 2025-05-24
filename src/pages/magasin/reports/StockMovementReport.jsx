import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockMovementsAPI, productsAPI } from '../../../lib/api';
import { 
  Calendar, Download, Filter, Search, ArrowUpDown, TrendingUp, TrendingDown, RefreshCw
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

const StockMovementReport = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [reportType, setReportType] = useState('all'); // 'all', 'in', 'out'
  
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
  
  // Combine stock movements with product details
  const movementsWithDetails = stockMovements.map(movement => {
    const product = products.find(p => p.id === movement.productId) || {};
    return {
      ...movement,
      productName: product.name || `Produit #${movement.productId}`,
      productReference: product.reference || '-',
      category: product.category || 'Non catégorisé'
    };
  });
  
  // Filter movements based on search, type, product, and date range
  const filteredMovements = movementsWithDetails.filter(movement => {
    // Filter by search term
    const matchesSearch = 
      (movement.productName && movement.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movement.productReference && movement.productReference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movement.notes && movement.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movement.type && movement.type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by movement type
    const matchesType = typeFilter === 'all' || movement.type === typeFilter;
    
    // Filter by product
    const matchesProduct = productFilter === '' || movement.productId.toString() === productFilter;
    
    // Filter by report type (in/out)
    const matchesReportType = 
      reportType === 'all' || 
      (reportType === 'in' && movement.type.includes('in')) ||
      (reportType === 'out' && movement.type.includes('out'));
    
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
    
    return matchesSearch && matchesType && matchesProduct && matchesReportType && matchesDateRange;
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
  
  // Get unique movement types for filter dropdown
  const movementTypes = [...new Set(stockMovements.map(movement => movement.type))];
  
  // Export report to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = ['ID', 'Date', 'Type', 'Produit', 'Référence', 'Catégorie', 'Quantité', 'Notes'];
    const rows = sortedMovements.map(movement => [
      movement.id,
      movement.date,
      movement.type,
      movement.productName,
      movement.productReference,
      movement.category,
      movement.quantity,
      movement.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mouvements-stock-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Calculate statistics
  const totalIn = filteredMovements
    .filter(m => m.type.includes('in'))
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
  const totalOut = filteredMovements
    .filter(m => m.type.includes('out'))
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  
  // Loading state
  if (movementsLoading || productsLoading) {
    return <div className="p-6">Chargement des mouvements de stock...</div>;
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
        <h1 className="text-3xl font-bold">Rapport des Mouvements de Stock</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tous les Mouvements</TabsTrigger>
          <TabsTrigger value="in">Entrées</TabsTrigger>
          <TabsTrigger value="out">Sorties</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Mouvements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredMovements.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Entrées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">{totalIn}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sorties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-2xl font-bold">{totalOut}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Recherche</Label>
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
                  <Label htmlFor="type">Type de Mouvement</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {movementTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="product">Produit</Label>
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
                  <Label>Période</Label>
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
          
          {/* Movements Table */}
          <Card>
            <CardHeader>
              <CardTitle>Mouvements de Stock ({sortedMovements.length})</CardTitle>
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
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMovements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Aucun mouvement trouvé
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
                              movement.type.includes('in') ? 'bg-green-100 text-green-800' :
                              movement.type.includes('out') ? 'bg-red-100 text-red-800' :
                              'bg-gray-100'
                            }
                          >
                            {movement.type.includes('in') ? (
                              <TrendingUp className="h-3 w-3 mr-1 inline" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1 inline" />
                            )}
                            {movement.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{movement.productName}</TableCell>
                        <TableCell>{movement.productReference}</TableCell>
                        <TableCell className={
                          movement.type.includes('in') ? 'text-green-600' : 'text-red-600'
                        }>
                          {movement.type.includes('in') ? '+' : '-'}{Math.abs(movement.quantity)}
                        </TableCell>
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
      </Tabs>
    </div>
  );
};

export default StockMovementReport;
