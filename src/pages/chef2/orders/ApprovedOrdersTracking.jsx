import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { ordersAPI } from '../../../lib/api';
import { 
  Search, Filter, Calendar, Eye, CheckCircle, Clock, Package, RefreshCw, AlertTriangle
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
import { addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pagination } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";

const ApprovedOrdersTracking = () => {
  const { user } = useSelector((state) => state.auth);
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [processingStatusFilter, setProcessingStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Fetch approved orders using React Query
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError,
    refetch: refetchOrders 
  } = useQuery({
    queryKey: ['approvedOrdersTracking', processingStatusFilter, dateRange, user.name],
    queryFn: () => ordersAPI.getAll(),
    select: (data) => {
      // Filter orders based on criteria
      return data.filter(order => {
        // Only show approved orders by this user
        const approvedByUser = order.status === 'approved' && order.approvedBy === user.name;
        
        // Filter by processing status if specified
        const processingMatch = 
          processingStatusFilter === 'all' || 
          (processingStatusFilter === 'pending' && !order.processingStatus) ||
          (processingStatusFilter === 'processing' && order.processingStatus === 'processing') ||
          (processingStatusFilter === 'completed' && order.processingStatus === 'completed');
        
        // Filter by date range
        const orderDate = new Date(order.approvedAt || order.createdAt);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;
        const dateMatch = (!fromDate || orderDate >= fromDate) && 
                          (!toDate || orderDate <= toDate);
        
        // Filter by search term
        const searchMatch = !searchTerm || 
          order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.createdBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return approvedByUser && processingMatch && dateMatch && searchMatch;
      }).sort((a, b) => {
        // Sort by most recent approval first
        const dateA = new Date(a.approvedAt || a.createdAt);
        const dateB = new Date(b.approvedAt || b.createdAt);
        return dateB - dateA;
      });
    },
    staleTime: 10000,
  });
  
  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  // Get processing status display info
  const getProcessingStatusInfo = (order) => {
    if (!order.processingStatus) {
      return {
        label: 'En attente de traitement',
        color: 'bg-amber-100 text-amber-800',
        icon: Clock,
        progress: 0
      };
    } else if (order.processingStatus === 'processing') {
      return {
        label: 'En cours de traitement',
        color: 'bg-blue-100 text-blue-800',
        icon: Package,
        progress: 50
      };
    } else if (order.processingStatus === 'completed') {
      return {
        label: 'Traité',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        progress: 100
      };
    }
    return {
      label: 'Statut inconnu',
      color: 'bg-gray-100 text-gray-800',
      icon: AlertTriangle,
      progress: 0
    };
  };

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suivi des bons approuvés</h1>
          <p className="text-muted-foreground">
            Suivez l'état des bons que vous avez approuvés et qui ont été transmis au service achat.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchOrders()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Filtrez les bons par statut de traitement, date ou recherchez par mot-clé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="processingStatus" className="text-sm font-medium">
                Statut de traitement
              </label>
              <Select
                value={processingStatusFilter}
                onValueChange={setProcessingStatusFilter}
              >
                <SelectTrigger id="processingStatus">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="completed">Traités</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <DatePickerWithRange
                date={dateRange}
                setDate={setDateRange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="search"
                  placeholder="Rechercher un bon..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Bons approuvés</CardTitle>
          <CardDescription>
            {orders.length} bon(s) trouvé(s) correspondant aux critères
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <p>Chargement des bons...</p>
            </div>
          ) : ordersError ? (
            <div className="flex justify-center py-8 text-red-500">
              <p>Erreur lors du chargement: {ordersError.message}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">
                Aucun bon approuvé trouvé correspondant aux critères de recherche
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Créé par</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Date d'approbation</TableHead>
                    <TableHead>Statut de traitement</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => {
                    const statusInfo = getProcessingStatusInfo(order);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.title}</TableCell>
                        <TableCell>{order.createdBy}</TableCell>
                        <TableCell>{order.department}</TableCell>
                        <TableCell>
                          {new Date(order.approvedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <statusInfo.icon className="h-4 w-4 text-muted-foreground" />
                              <Badge variant="outline" className={statusInfo.color}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <Progress value={statusInfo.progress} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell>{order.total?.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="mx-4 flex items-center text-sm text-muted-foreground">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto sm:max-h-[90vh] md:max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Détails du bon approuvé</DialogTitle>
            <DialogDescription>
              Référence: {selectedOrder?.id} • Approuvé le: {selectedOrder?.approvedAt && new Date(selectedOrder.approvedAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Créé par</h4>
                  <p>{selectedOrder.createdBy}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Département</h4>
                  <p>{selectedOrder.department}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Fournisseur</h4>
                  <p>{selectedOrder.supplier}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Titre</h4>
                <p className="font-medium">{selectedOrder.title}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Statut de traitement</h4>
                {(() => {
                  const statusInfo = getProcessingStatusInfo(selectedOrder);
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <statusInfo.icon className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <Progress value={statusInfo.progress} className="h-2" />
                    </div>
                  );
                })()}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Articles</h4>
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
                    {selectedOrder.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="text-right">{item.price?.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">{item.total?.toFixed(2)} DH</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-2 text-right">
                  <span className="font-medium">Total: {selectedOrder.total?.toFixed(2)} DH</span>
                </div>
              </div>
              
              {selectedOrder.comments && selectedOrder.comments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Commentaires</h4>
                  <ScrollArea className="max-h-32">
                    <ul className="space-y-2">
                      {selectedOrder.comments.map((comment, index) => (
                        <li key={index} className="rounded-md border p-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p>{comment.text}</p>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
              
              {selectedOrder.processingStatus === 'processing' && selectedOrder.processingNotes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Notes de traitement</h4>
                  <p className="rounded-md border p-2 text-sm">{selectedOrder.processingNotes}</p>
                </div>
              )}
              
              {selectedOrder.processingStatus === 'completed' && selectedOrder.completionNotes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Notes de complétion</h4>
                  <p className="rounded-md border p-2 text-sm">{selectedOrder.completionNotes}</p>
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

export default ApprovedOrdersTracking;
