import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { purchasesAPI, suppliersAPI } from '../../../lib/api';
import { 
  ShoppingCart, Search, Filter, ArrowUpDown, Calendar, FileText, Truck
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

const PurchaseHistory = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Fetch purchases
  const { 
    data: purchases = [], 
    isLoading: purchasesLoading, 
    error: purchasesError 
  } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => purchasesAPI.getAll()
  });
  
  // Fetch suppliers for reference
  const { 
    data: suppliers = [], 
    isLoading: suppliersLoading 
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersAPI.getAll()
  });
  
  // Filter purchases based on search and status
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.id?.toString().includes(searchTerm) ||
      (purchase.title && purchase.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (purchase.supplier && purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (purchase.orderId && purchase.orderId.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort purchases
  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates
    if (sortField.includes('At') || sortField.includes('Date')) {
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
  if (purchasesLoading || suppliersLoading) {
    return <div className="p-6">Chargement des achats...</div>;
  }
  
  // Error state
  if (purchasesError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {purchasesError.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Historique des Achats</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/achat2">
              <FileText className="mr-2 h-4 w-4" />
              Tableau de Bord
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/achat2/orders">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Bons à Traiter
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="scheduled">Programmés</TabsTrigger>
          <TabsTrigger value="delivered">Livrés</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par ID, titre, fournisseur ou bon d'origine..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Purchases Table */}
          <Card>
            <CardHeader>
              <CardTitle>Achats ({sortedPurchases.length})</CardTitle>
              <CardDescription>
                {statusFilter === 'all' && "Tous les achats"}
                {statusFilter === 'scheduled' && "Achats programmés en attente de livraison"}
                {statusFilter === 'delivered' && "Achats livrés et reçus"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedPurchases.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">Aucun achat trouvé</p>
              ) : (
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
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('title')}>
                          Titre
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('supplier')}>
                          Fournisseur
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('orderId')}>
                          Bon d'origine
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('createdAt')}>
                          Date Création
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('deliveryDate')}>
                          Livraison Prévue
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('total')}>
                          Total
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPurchases.map(purchase => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.id}</TableCell>
                        <TableCell>{purchase.title}</TableCell>
                        <TableCell>{purchase.supplier}</TableCell>
                        <TableCell>{purchase.orderId}</TableCell>
                        <TableCell>{new Date(purchase.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{purchase.deliveryDate ? new Date(purchase.deliveryDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{purchase.total?.toFixed(2) || 0} DH</TableCell>
                        <TableCell>
                          <Badge className={purchase.status === 'scheduled' ? 'bg-blue-500' : 'bg-green-500'}>
                            {purchase.status === 'scheduled' ? 'Programmé' : 'Livré'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/dashboard/achat2/purchases/${purchase.id}`}>
                              Détails
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
};

export default PurchaseHistory;
