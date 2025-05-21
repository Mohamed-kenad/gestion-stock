import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Plus, Eye, RefreshCw, Filter, Download, Calendar
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Link } from 'react-router-dom';

// Mock data
const mockOrders = [
  { 
    id: 'PO-2025-001', 
    title: 'Commande ingrédients cuisine',
    createdBy: 'Ahmed Benali',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur A', 
    department: 'Cuisine',
    createdAt: '2025-05-15', 
    status: 'pending',
    totalItems: 3,
    estimatedTotal: 450.75,
    approvedBy: null,
    approvedAt: null
  },
  { 
    id: 'PO-2025-002', 
    title: 'Commande légumes',
    createdBy: 'Fatima Zahra',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur B', 
    department: 'Cuisine',
    createdAt: '2025-05-16', 
    status: 'approved',
    totalItems: 2,
    estimatedTotal: 180.20,
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-17'
  },
  { 
    id: 'PO-2025-003', 
    title: 'Commande viandes',
    createdBy: 'Ahmed Benali',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur C', 
    department: 'Cuisine',
    createdAt: '2025-05-17', 
    status: 'rejected',
    totalItems: 2,
    estimatedTotal: 320.50,
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-18'
  },
  { 
    id: 'PO-2025-004', 
    title: 'Commande produits laitiers',
    createdBy: 'Fatima Zahra',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur A', 
    department: 'Pâtisserie',
    createdAt: '2025-05-10', 
    status: 'completed',
    totalItems: 2,
    estimatedTotal: 150.00,
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-11'
  },
  { 
    id: 'PO-2025-005', 
    title: 'Commande épices',
    createdBy: 'Ahmed Benali',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur D', 
    department: 'Cuisine',
    createdAt: '2025-05-18', 
    status: 'pending',
    totalItems: 5,
    estimatedTotal: 95.30,
    approvedBy: null,
    approvedAt: null
  },
  { 
    id: 'PO-2025-006', 
    title: 'Commande boissons',
    createdBy: 'Mohammed Alami',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur E', 
    department: 'Bar',
    createdAt: '2025-05-12', 
    status: 'approved',
    totalItems: 8,
    estimatedTotal: 560.75,
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-13'
  },
];

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
  }, []);

  // Filter orders based on search term, filters, and active tab
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    const matchesSupplier = supplierFilter === '' || order.supplier === supplierFilter;
    const matchesDepartment = departmentFilter === '' || order.department === departmentFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && order.status === 'pending') || 
                      (activeTab === 'approved' && order.status === 'approved') ||
                      (activeTab === 'rejected' && order.status === 'rejected') ||
                      (activeTab === 'completed' && order.status === 'completed');
    return matchesSearch && matchesStatus && matchesSupplier && matchesDepartment && matchesTab;
  });

  // Get unique suppliers and departments for filter dropdowns
  const suppliers = [...new Set(orders.map(order => order.supplier))];
  const departments = [...new Set(orders.map(order => order.department))];

  // Status badge color mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejeté</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Complété</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
  };

  // Handle export
  const handleExport = () => {
    alert('Exporting orders to CSV...');
    // Implement actual export functionality
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bons de Commande</h1>
          <p className="text-muted-foreground">
            Gérez et suivez tous les bons de commande
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
          <Button asChild>
            <Link to="/dashboard/admin/orders/create">
              <Plus className="h-4 w-4 mr-2" />
              Créer un bon
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des bons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'approved').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'rejected').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="approved">Approuvés</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés</TabsTrigger>
            <TabsTrigger value="completed">Complétés</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un bon de commande..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Fournisseur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les fournisseurs</SelectItem>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les départements</SelectItem>
                {departments.map(department => (
                  <SelectItem key={department} value={department}>{department}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des bons de commande</CardTitle>
              <CardDescription>
                Consultez et gérez tous les bons de commande
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
                        <TableHead>N° Commande</TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead>Créé par</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Département</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Montant estimé</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.title}</TableCell>
                            <TableCell>
                              <div>{order.createdBy}</div>
                              <div className="text-xs text-muted-foreground">{order.createdByRole}</div>
                            </TableCell>
                            <TableCell>{order.supplier}</TableCell>
                            <TableCell>{order.department}</TableCell>
                            <TableCell>{order.createdAt}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-right">{order.estimatedTotal.toFixed(2)} €</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/dashboard/admin/orders/${order.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            Aucun bon de commande trouvé
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

        <TabsContent value="pending" className="mt-0">
          {/* Same content as "all" tab but filtered for pending status */}
          {/* This is handled by the filteredOrders logic */}
        </TabsContent>

        <TabsContent value="approved" className="mt-0">
          {/* Same content as "all" tab but filtered for approved status */}
          {/* This is handled by the filteredOrders logic */}
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          {/* Same content as "all" tab but filtered for rejected status */}
          {/* This is handled by the filteredOrders logic */}
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          {/* Same content as "all" tab but filtered for completed status */}
          {/* This is handled by the filteredOrders logic */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersList;
