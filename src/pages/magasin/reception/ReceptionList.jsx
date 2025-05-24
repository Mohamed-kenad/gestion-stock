import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { inventoryAPI, ordersAPI } from '../../../lib/api';
import { 
  Truck, Package, Calendar, Search, Filter, ArrowUpDown
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

const ReceptionList = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [sortField, setSortField] = useState('expectedDeliveryDate');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Fetch approved orders awaiting reception
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useQuery({
    queryKey: ['orders', 'reception'],
    queryFn: () => ordersAPI.getByStatus(['approved', 'pending', 'received'])
  });
  
  // Fetch pending receptions
  const { 
    data: pendingReceptions = [], 
    isLoading: receptionsLoading, 
    error: receptionsError 
  } = useQuery({
    queryKey: ['pendingReceptions'],
    queryFn: () => inventoryAPI.getPendingReceptions()
  });
  
  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      (order.reference && order.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.vendorName && order.vendorName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates
    if (sortField.includes('Date') && aValue && bValue) {
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
  if (ordersLoading || receptionsLoading) {
    return <div className="p-6">Chargement des réceptions...</div>;
  }
  
  // Error state
  if (ordersError || receptionsError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {ordersError?.message || receptionsError?.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Réceptions</h1>
      </div>
      
      <Tabs defaultValue="pending" onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">En Attente</TabsTrigger>
          <TabsTrigger value="approved">Approuvées</TabsTrigger>
          <TabsTrigger value="received">Reçues</TabsTrigger>
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
                    placeholder="Rechercher par ID, référence ou fournisseur..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes ({sortedOrders.length})</CardTitle>
              <CardDescription>
                {statusFilter === 'pending' && "Commandes en attente d'approbation"}
                {statusFilter === 'approved' && "Commandes approuvées en attente de réception"}
                {statusFilter === 'received' && "Commandes reçues"}
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
                      <Button variant="ghost" size="sm" onClick={() => toggleSort('reference')}>
                        Référence
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort('vendorName')}>
                        Fournisseur
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort('orderDate')}>
                        Date Commande
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort('expectedDeliveryDate')}>
                        Livraison Prévue
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Aucune commande trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.reference || '-'}</TableCell>
                        <TableCell>{order.vendorName}</TableCell>
                        <TableCell>{order.orderDate}</TableCell>
                        <TableCell>{order.expectedDeliveryDate || '-'}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'approved' ? 'bg-amber-100 text-amber-800' :
                              order.status === 'received' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100'
                            }
                          >
                            {order.status === 'pending' ? 'En attente' :
                             order.status === 'approved' ? 'Approuvé' :
                             order.status === 'received' ? 'Reçu' :
                             order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/dashboard/magasin/reception/${order.id}`}>
                              {order.status === 'received' ? 'Détails' : 'Réceptionner'}
                            </Link>
                          </Button>
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

export default ReceptionList;
