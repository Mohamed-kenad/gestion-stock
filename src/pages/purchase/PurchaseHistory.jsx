import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  RefreshCw,
  CheckCircle,
  Clock,
  Package
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API functions
const fetchPurchaseHistory = async () => {
  const response = await axios.get(`${API_URL}/orders`);
  // Filter orders that are in processing or completed status
  return response.data.filter(order => 
    order.status === 'processing' || 
    order.status === 'completed' || 
    order.status === 'delivered'
  );
};

const PurchaseHistory = () => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Items per page
  const itemsPerPage = 10;

  // Fetch purchase history data
  const { data: purchases = [], isLoading, refetch } = useQuery({
    queryKey: ['purchaseHistory'],
    queryFn: fetchPurchaseHistory,
  });

  // Filter purchases based on search term and filters
  const filteredPurchases = purchases.filter(purchase => {
    // Search filter
    const matchesSearch = 
      purchase.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      purchase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.createdBy?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === '' || purchase.status === statusFilter;
    
    // Department filter
    const matchesDepartment = departmentFilter === '' || purchase.department === departmentFilter;
    
    // Tab filter
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'processing' && purchase.status === 'processing') ||
      (activeTab === 'completed' && purchase.status === 'completed') ||
      (activeTab === 'delivered' && purchase.status === 'delivered');
    
    // Date range filter - to be implemented
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesTab;
  });

  // Get unique departments for filter dropdown
  const departments = [...new Set(purchases.map(purchase => purchase.department).filter(Boolean))];

  // Pagination
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle view purchase details
  const handleViewPurchase = (purchase) => {
    setSelectedPurchase(purchase);
    setViewDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En traitement</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Complété</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Livré</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historique des achats</h1>
          <p className="text-muted-foreground">
            Consultez l'historique de tous les achats effectués
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              En traitement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {purchases.filter(p => p.status === 'processing').length}
            </p>
            <p className="text-sm text-muted-foreground">
              Achats en cours de traitement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Complétés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {purchases.filter(p => p.status === 'completed').length}
            </p>
            <p className="text-sm text-muted-foreground">
              Achats complétés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Package className="mr-2 h-5 w-5 text-purple-500" />
              Livrés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {purchases.filter(p => p.status === 'delivered').length}
            </p>
            <p className="text-sm text-muted-foreground">
              Achats livrés
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="processing">En traitement</TabsTrigger>
          <TabsTrigger value="completed">Complétés</TabsTrigger>
          <TabsTrigger value="delivered">Livrés</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Rechercher..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tous les statuts</SelectItem>
                        <SelectItem value="processing">En traitement</SelectItem>
                        <SelectItem value="completed">Complété</SelectItem>
                        <SelectItem value="delivered">Livré</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tous les départements</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : paginatedPurchases.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Aucun achat trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Département</TableHead>
                      <TableHead>Date de traitement</TableHead>
                      <TableHead>Traité par</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.id}</TableCell>
                        <TableCell>{purchase.title}</TableCell>
                        <TableCell>{purchase.supplier}</TableCell>
                        <TableCell>{purchase.department}</TableCell>
                        <TableCell>{formatDate(purchase.processingDate || purchase.createdAt)}</TableCell>
                        <TableCell>{purchase.processingBy || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                        <TableCell>{purchase.total?.toFixed(2) || purchase.estimatedTotal?.toFixed(2) || 'N/A'} MAD</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewPurchase(purchase)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(index + 1)}
                          isActive={currentPage === index + 1}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {/* Same content as "all" tab but filtered for processing status */}
          <div className="bg-white rounded-lg border shadow-sm">
            {/* Table content similar to "all" tab */}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {/* Same content as "all" tab but filtered for completed status */}
          <div className="bg-white rounded-lg border shadow-sm">
            {/* Table content similar to "all" tab */}
          </div>
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          {/* Same content as "all" tab but filtered for delivered status */}
          <div className="bg-white rounded-lg border shadow-sm">
            {/* Table content similar to "all" tab */}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Purchase Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'achat</DialogTitle>
            <DialogDescription>
              Informations détaillées sur l'achat
            </DialogDescription>
          </DialogHeader>
          
          {selectedPurchase && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Informations générales</h3>
                  <div className="mt-2 border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">ID:</span>
                      <span className="text-sm">{selectedPurchase.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Titre:</span>
                      <span className="text-sm">{selectedPurchase.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Description:</span>
                      <span className="text-sm">{selectedPurchase.description || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Créé par:</span>
                      <span className="text-sm">{selectedPurchase.createdBy} ({selectedPurchase.createdByRole})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Date de création:</span>
                      <span className="text-sm">{formatDate(selectedPurchase.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Détails de l'achat</h3>
                  <div className="mt-2 border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Fournisseur:</span>
                      <span className="text-sm">{selectedPurchase.supplier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Département:</span>
                      <span className="text-sm">{selectedPurchase.department || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Statut:</span>
                      <span className="text-sm">{getStatusBadge(selectedPurchase.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Date de traitement:</span>
                      <span className="text-sm">{formatDate(selectedPurchase.processingDate || 'N/A')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Traité par:</span>
                      <span className="text-sm">{selectedPurchase.processingBy || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Articles achetés</h3>
                <div className="mt-2 border rounded-lg overflow-hidden">
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
                      {selectedPurchase.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product || item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                          <TableCell className="text-right">{item.price?.toFixed(2) || item.unitPrice?.toFixed(2)} MAD</TableCell>
                          <TableCell className="text-right">{item.total?.toFixed(2)} MAD</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <div className="border rounded-lg p-3 w-64">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{selectedPurchase.total?.toFixed(2) || selectedPurchase.estimatedTotal?.toFixed(2)} MAD</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPurchase.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes et commentaires</h3>
                  <div className="mt-2 border rounded-lg p-3">
                    <p className="text-sm">{selectedPurchase.notes}</p>
                  </div>
                </div>
              )}

              {selectedPurchase.history && selectedPurchase.history.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Historique des actions</h3>
                  <div className="mt-2 border rounded-lg p-3">
                    <ul className="space-y-2">
                      {selectedPurchase.history.map((event, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium">{formatDate(event.date)}</span> - {event.action || event.text}
                          {event.user && <span className="text-muted-foreground ml-1">par {event.user}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="w-full sm:w-auto">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseHistory;
