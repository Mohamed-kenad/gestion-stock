import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Calendar, Eye, RefreshCw, Download
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { ordersAPI } from '../../../lib/api';
import { useQuery } from '@tanstack/react-query';

// Fallback mock data in case API fails
const fallbackDecisions = [
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
    approvedAt: '2025-05-17',
    validationNote: 'Approuvé pour la cuisine principale. Vérifier la fraîcheur à la livraison.',
    items: [
      { id: 1, name: 'Tomates', category: 'Légumes', quantity: 20, unit: 'kg', unitPrice: 3.5, total: 70 },
      { id: 2, name: 'Oignons', category: 'Légumes', quantity: 15, unit: 'kg', unitPrice: 2.8, total: 42 }
    ]
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
    approvedAt: '2025-05-18',
    validationNote: 'Prix trop élevés. Demander des devis à d\'autres fournisseurs.',
    items: [
      { id: 1, name: 'Boeuf', category: 'Viandes', quantity: 10, unit: 'kg', unitPrice: 18.5, total: 185 },
      { id: 2, name: 'Agneau', category: 'Viandes', quantity: 5, unit: 'kg', unitPrice: 22.0, total: 110 }
    ]
  },
  { 
    id: 'PO-2025-004', 
    title: 'Commande produits laitiers',
    createdBy: 'Fatima Zahra',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur A', 
    department: 'Pâtisserie',
    createdAt: '2025-05-10', 
    status: 'approved',
    totalItems: 2,
    estimatedTotal: 150.00,
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-11',
    validationNote: 'Approuvé pour les besoins de la pâtisserie.',
    items: [
      { id: 1, name: 'Lait', category: 'Produits laitiers', quantity: 50, unit: 'L', unitPrice: 1.2, total: 60 },
      { id: 2, name: 'Crème fraîche', category: 'Produits laitiers', quantity: 10, unit: 'L', unitPrice: 4.5, total: 45 }
    ]
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
    approvedAt: '2025-05-13',
    validationNote: 'Approuvé pour le réapprovisionnement du bar.',
    items: [
      { id: 1, name: 'Eau minérale', category: 'Boissons', quantity: 100, unit: 'bouteille', unitPrice: 0.8, total: 80 },
      { id: 2, name: 'Jus d\'orange', category: 'Boissons', quantity: 50, unit: 'bouteille', unitPrice: 1.5, total: 75 }
    ]
  },
  { 
    id: 'PO-2025-007', 
    title: 'Commande fruits',
    createdBy: 'Fatima Zahra',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur B', 
    department: 'Cuisine',
    createdAt: '2025-05-05', 
    status: 'approved',
    totalItems: 6,
    estimatedTotal: 230.40,
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-06',
    validationNote: 'Approuvé. Vérifier la maturité des fruits à la livraison.',
    items: [
      { id: 1, name: 'Pommes', category: 'Fruits', quantity: 15, unit: 'kg', unitPrice: 2.5, total: 37.5 },
      { id: 2, name: 'Bananes', category: 'Fruits', quantity: 10, unit: 'kg', unitPrice: 1.8, total: 18 }
    ]
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
    approvedAt: '2025-05-15',
    validationNote: 'Quantités trop importantes. Réduire de moitié et soumettre à nouveau.',
    items: [
      { id: 1, name: 'Fromage Gouda', category: 'Fromages', quantity: 8, unit: 'kg', unitPrice: 12.5, total: 100 },
      { id: 2, name: 'Fromage Emmental', category: 'Fromages', quantity: 6, unit: 'kg', unitPrice: 14.2, total: 85.2 }
    ]
  }
];

const DecisionHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [date, setDate] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  // Order details
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch decision history data using React Query
  const { data: decisions = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['decisionHistory'],
    queryFn: ordersAPI.getDecisionHistory,
    staleTime: 10000, // 10 seconds for more frequent updates during testing
    refetchOnWindowFocus: true, // Refresh when window gains focus
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Function to handle manual refresh
  const handleRefresh = () => {
    console.log('Manually refreshing decision history data...');
    refetch();
  };

  // Log decisions data for debugging
  useEffect(() => {
    console.log('Decision history data:', decisions);
  }, [decisions]);
  
  // Handle error
  useEffect(() => {
    if (error) {
      console.error('Error fetching decision history:', error);
    }
  }, [error]);

  // Filter decisions based on search term, filters, and date range
  const filteredDecisions = decisions.filter(decision => {
    const matchesSearch = decision.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         decision.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         decision.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         decision.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || decision.status === statusFilter;
    const matchesDepartment = departmentFilter === '' || decision.department === departmentFilter;
    const matchesSupplier = supplierFilter === '' || decision.supplier === supplierFilter;
    
    // Date filtering
    let matchesDate = true;
    if (date.from && date.to) {
      const decisionDate = new Date(decision.approvedAt);
      matchesDate = decisionDate >= date.from && decisionDate <= date.to;
    }
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesSupplier && matchesDate;
  });

  // Get unique departments and suppliers for filter dropdowns
  const departments = [...new Set(decisions.map(decision => decision.department))];
  const suppliers = [...new Set(decisions.map(decision => decision.supplier))];

  // Status badge color mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Open view dialog
  const openViewDialog = (decision) => {
    setSelectedOrder(decision);
    setIsViewDialogOpen(true);
  };

  // This function is now handled by React Query's refetch

  // Handle export
  const handleExport = () => {
    alert('Exporting decisions to CSV...');
    // Implement actual export functionality
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des Décisions</h1>
          <p className="text-muted-foreground">
            Consultez l'historique des bons de commande approuvés ou rejetés
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
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
            <CardTitle className="text-sm font-medium">Total des décisions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisions.filter(d => d.status === 'approved').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisions.filter(d => d.status === 'rejected').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant approuvé</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {decisions.filter(d => d.status === 'approved').reduce((sum, decision) => sum + decision.estimatedTotal, 0).toFixed(2)} €
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
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
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
        </div>
      </div>

      {/* Decisions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des décisions</CardTitle>
          <CardDescription>
            Liste des bons de commande approuvés ou rejetés
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
                    <TableHead>Date décision</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDecisions.length > 0 ? (
                    filteredDecisions.map((decision) => (
                      <TableRow key={decision.id}>
                        <TableCell className="font-medium">{decision.id}</TableCell>
                        <TableCell>{decision.title}</TableCell>
                        <TableCell>
                          <div>{decision.createdBy}</div>
                          <div className="text-xs text-muted-foreground">{decision.createdByRole}</div>
                        </TableCell>
                        <TableCell>{decision.supplier}</TableCell>
                        <TableCell>{decision.department}</TableCell>
                        <TableCell>{decision.approvedAt}</TableCell>
                        <TableCell>{getStatusBadge(decision.status)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={decision.validationNote}>
                            {decision.validationNote}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openViewDialog(decision)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucune décision trouvée
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

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du bon de commande</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span>
                  {selectedOrder.id} - {selectedOrder.title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Informations générales</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Créé par:</span> {selectedOrder.createdBy} ({selectedOrder.createdByRole})
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date de création:</span> {selectedOrder.createdAt}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Département:</span> {selectedOrder.department}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Décision</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Statut:</span> {getStatusBadge(selectedOrder.status)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Décidé par:</span> {selectedOrder.approvedBy}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date de décision:</span> {selectedOrder.approvedAt}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Note:</span> {selectedOrder.validationNote}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Produits commandés</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unitPrice.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right">
                          {item.total.toFixed(2)} €
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {selectedOrder.estimatedTotal.toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DecisionHistory;
