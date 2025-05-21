import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Download, RefreshCw, Calendar, Eye
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
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
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
  { 
    id: 'PO-2025-007', 
    title: 'Commande fruits',
    createdBy: 'Fatima Zahra',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur B', 
    department: 'Cuisine',
    createdAt: '2025-05-05', 
    status: 'completed',
    totalItems: 6,
    estimatedTotal: 230.40,
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-06'
  },
  { 
    id: 'PO-2025-008', 
    title: 'Commande produits d\'entretien',
    createdBy: 'Mohammed Alami',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur F', 
    department: 'Service',
    createdAt: '2025-05-08', 
    status: 'completed',
    totalItems: 10,
    estimatedTotal: 320.15,
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-09'
  },
  { 
    id: 'PO-2025-009', 
    title: 'Commande fromages',
    createdBy: 'Ahmed Benali',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur A', 
    department: 'Cuisine',
    createdAt: '2025-05-14', 
    status: 'rejected',
    totalItems: 4,
    estimatedTotal: 280.60,
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-15'
  },
  { 
    id: 'PO-2025-010', 
    title: 'Commande vins',
    createdBy: 'Mohammed Alami',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur E', 
    department: 'Bar',
    createdAt: '2025-05-19', 
    status: 'pending',
    totalItems: 12,
    estimatedTotal: 860.25,
    approvedBy: null,
    approvedAt: null
  },
];

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [createdByFilter, setCreatedByFilter] = useState('');
  const [date, setDate] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
  }, []);

  // Filter orders based on search term, filters, and date range
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    const matchesSupplier = supplierFilter === '' || order.supplier === supplierFilter;
    const matchesDepartment = departmentFilter === '' || order.department === departmentFilter;
    const matchesCreatedBy = createdByFilter === '' || order.createdBy === createdByFilter;
    
    // Date filtering
    let matchesDate = true;
    if (date.from && date.to) {
      const orderDate = new Date(order.createdAt);
      matchesDate = orderDate >= date.from && orderDate <= date.to;
    }
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesDepartment && matchesCreatedBy && matchesDate;
  });

  // Get unique suppliers, departments, and creators for filter dropdowns
  const suppliers = [...new Set(orders.map(order => order.supplier))];
  const departments = [...new Set(orders.map(order => order.department))];
  const creators = [...new Set(orders.map(order => order.createdBy))];

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
          <h1 className="text-3xl font-bold tracking-tight">Tous les Bons de Commande</h1>
          <p className="text-muted-foreground">
            Consultez l'historique complet des bons de commande
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
            <CardTitle className="text-sm font-medium">Total des bons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
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
            <CardTitle className="text-sm font-medium">Complétés</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'completed').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.reduce((sum, order) => sum + order.estimatedTotal, 0).toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
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
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
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
          <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Créé par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les créateurs</SelectItem>
              {creators.map(creator => (
                <SelectItem key={creator} value={creator}>{creator}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des bons de commande</CardTitle>
          <CardDescription>
            Historique complet des bons de commande
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
                    <TableHead className="text-right">Montant</TableHead>
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
                      <PaginationLink href="#">2</PaginationLink>
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
    </div>
  );
};

export default AllOrders;
