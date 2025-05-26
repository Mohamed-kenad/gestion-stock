import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ordersAPI, suppliersAPI } from '../../../lib/api';
import { 
  FileText, Search, Filter, ArrowUpDown, Calendar, Users, Check
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

const PendingOrders = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Fetch purchase requests from Magasin2 department
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useQuery({
    queryKey: ['orders', 'magasin2', 'purchase'],
    queryFn: () => ordersAPI.getByDepartmentAndType('magasin2', 'purchase', ['pending'])
  });
  
  // Fetch suppliers for reference
  const { 
    data: suppliers = [], 
    isLoading: suppliersLoading 
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersAPI.getAll()
  });
  
  // Filter orders based on search, priority, and exclude vendor orders
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = 
      order.id?.toString().includes(searchTerm) ||
      (order.title && order.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.department && order.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.createdBy && order.createdBy.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Priority filter
    const matchesPriority = 
      priorityFilter === 'all' || 
      order.priority === priorityFilter;
    
    // Exclude vendor orders (only show Magasin2 purchase requests)
    const isMagasin2Request = 
      order.departmentId === 'magasin2' && 
      order.type === 'purchase' && 
      !order.createdByRole?.toLowerCase().includes('vendor');
    
    return matchesSearch && matchesPriority && isMagasin2Request;
  });
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
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
  
  // Get priority label
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'Haute';
      case 'normal':
        return 'Normale';
      case 'low':
        return 'Basse';
      default:
        return 'Normale';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'normal':
        return 'bg-blue-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  // Get priority button class
  const getPriorityButtonClass = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600 hover:bg-red-700 font-bold';
      case 'high':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'normal':
        return '';
      case 'low':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return '';
    }
  };
  
  // Loading state
  if (ordersLoading || suppliersLoading) {
    return <div className="p-6">Chargement des bons de commande...</div>;
  }
  
  // Error state
  if (ordersError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {ordersError.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bons de Commande à Traiter</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/achat2">
              <FileText className="mr-2 h-4 w-4" />
              Tableau de Bord
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/achat2/suppliers">
              <Users className="mr-2 h-4 w-4" />
              Fournisseurs
            </Link>
          </Button>
        </div>
      </div>
      
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
                placeholder="Rechercher par ID, titre, département ou créateur..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes d'Achat ({sortedOrders.length})</CardTitle>
          <CardDescription>
            Demandes d'achat créées par le département Magasin2 en attente de traitement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedOrders.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Aucun bon de commande à traiter</p>
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
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('department')}>
                      Département
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('createdBy')}>
                      Créé Par
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
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('total')}>
                      Total
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{order.title || "Demande d'achat"}</span>
                        {order.priority && (
                          <Badge className={`mt-1 w-fit ${getPriorityColor(order.priority)}`}>
                            {getPriorityLabel(order.priority)}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{order.department}</TableCell>
                    <TableCell>{order.createdBy}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{order.total?.toFixed(2) || 0} DH</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        asChild 
                        size="sm"
                        className={`flex items-center gap-1 ${getPriorityButtonClass(order.priority)}`}
                      >
                        <Link to={`/dashboard/achat2/orders/${order.id}`}>
                          {order.priority === 'urgent' && <span className="animate-pulse">⚠️</span>}
                          <span>Traiter</span>
                          <Check className="h-4 w-4 ml-1" />
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
  );
};

export default PendingOrders;
