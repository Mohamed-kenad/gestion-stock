import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { ordersAPI } from '../../../lib/api';
import { 
  Search, Filter, Calendar, Eye, CheckCircle, X, AlertTriangle, RefreshCw
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
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pagination } from "@/components/ui/pagination";

const DecisionHistory = () => {
  const { user } = useSelector((state) => state.auth);
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Fetch orders using React Query
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError,
    refetch: refetchOrders 
  } = useQuery({
    queryKey: ['decisionHistory', statusFilter, dateRange, user.name],
    queryFn: () => ordersAPI.getAll(),
    select: (data) => {
      // Filter orders based on criteria
      return data.filter(order => {
        // Only show approved or rejected orders by this user
        const statusMatch = 
          (statusFilter === 'all' && (order.status === 'approved' || order.status === 'rejected')) ||
          (statusFilter === order.status);
        
        // Only show orders approved/rejected by this user
        const userMatch = 
          (order.status === 'approved' && order.approvedBy === user.name) ||
          (order.status === 'rejected' && order.rejectedBy === user.name);
        
        // Filter by date range
        const orderDate = new Date(order.approvedAt || order.rejectedAt || order.createdAt);
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
        
        return statusMatch && userMatch && dateMatch && searchMatch;
      }).sort((a, b) => {
        // Sort by most recent decision first
        const dateA = new Date(a.approvedAt || a.rejectedAt || a.createdAt);
        const dateB = new Date(b.approvedAt || b.rejectedAt || b.createdAt);
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

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historique des décisions</h1>
          <p className="text-muted-foreground">
            Consultez l'historique des bons que vous avez approuvés ou rejetés.
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
            Filtrez l'historique par statut, date ou recherchez par mot-clé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Période</Label>
              <DatePickerWithRange
                date={dateRange}
                setDate={setDateRange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
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
          <CardTitle>Historique des décisions</CardTitle>
          <CardDescription>
            {orders.length} bon(s) trouvé(s) correspondant aux critères
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <p>Chargement de l'historique...</p>
            </div>
          ) : ordersError ? (
            <div className="flex justify-center py-8 text-red-500">
              <p>Erreur lors du chargement: {ordersError.message}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">
                Aucune décision trouvée correspondant aux critères de recherche
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
                    <TableHead>Date de décision</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.title}</TableCell>
                      <TableCell>{order.createdBy}</TableCell>
                      <TableCell>{order.department}</TableCell>
                      <TableCell>
                        {new Date(order.approvedAt || order.rejectedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'approved' ? 'success' :
                            order.status === 'rejected' ? 'destructive' :
                            'outline'
                          }
                        >
                          {order.status === 'approved' ? 'Approuvé' :
                           order.status === 'rejected' ? 'Rejeté' :
                           'En attente'}
                        </Badge>
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
                  ))}
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
            <DialogTitle>Détails du bon</DialogTitle>
            <DialogDescription>
              Référence: {selectedOrder?.id} • Décision le: {selectedOrder?.approvedAt && new Date(selectedOrder.approvedAt || selectedOrder.rejectedAt).toLocaleDateString()}
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
                <h4 className="text-sm font-medium text-muted-foreground">Statut</h4>
                <div className="flex items-center space-x-2">
                  {selectedOrder.status === 'approved' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-600">Approuvé</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-600">Rejeté</span>
                    </>
                  )}
                  <span className="text-sm text-muted-foreground">
                    par {selectedOrder.approvedBy || selectedOrder.rejectedBy} le {new Date(selectedOrder.approvedAt || selectedOrder.rejectedAt).toLocaleDateString()}
                  </span>
                </div>
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

export default DecisionHistory;
