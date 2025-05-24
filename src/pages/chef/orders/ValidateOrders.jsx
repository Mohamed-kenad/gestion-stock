import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '../../../lib/api';
import { 
  FileText, Search, CheckCircle, X, Eye, RefreshCw, Filter, Calendar
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const ValidateOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState(null); // 'approve' or 'reject'
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [validationNote, setValidationNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch orders using React Query
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersAPI.getAll,
    onError: (error) => {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur. Veuillez vérifier que le JSON Server est en cours d'exécution.",
        variant: "destructive"
      });
    },
    // Retry failed requests up to 3 times
    retry: 3
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: (updatedOrder) => ordersAPI.update(updatedOrder.id, updatedOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: reviewAction === 'approve' ? "Commande approuvée" : "Commande rejetée",
        description: reviewAction === 'approve' 
          ? "La commande a été approuvée avec succès." 
          : "La commande a été rejetée.",
      });
      setShowReviewDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // We don't need this useEffect since we're using React Query to fetch orders
  // React Query handles loading, error states, and caching for us

  // Filter orders based on search, status, and date
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.createdBy && typeof order.createdBy === 'string' && order.createdBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.department && typeof order.department === 'string' && order.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Check if order status matches the selected filter
    const matchesStatus = order.status === statusFilter;
    
    const matchesDate = !dateFilter || order.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Get unique departments and suppliers for filter dropdowns
  const departments = [...new Set(orders.map(order => order?.department || 'Non spécifié'))];
  const suppliers = [...new Set(orders.map(order => order?.supplier || 'Non spécifié'))];

  // Open view dialog
  const openViewDialog = (order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  // Open approve dialog
  const openApproveDialog = (order) => {
    setSelectedOrder(order);
    setValidationNote('');
    setIsApproveDialogOpen(true);
  };

  // Open reject dialog
  const openRejectDialog = (order) => {
    setSelectedOrder(order);
    setValidationNote('');
    setIsRejectDialogOpen(true);
  };

  // Handle order approval
  const handleApproveOrder = () => {
    // Note is optional for approval, so we don't need to check if it's empty
    setIsApproveDialogOpen(false);
    setLoading(true);
    
    // Create updated order object
    const updatedOrder = {
      ...selectedOrder,
      status: 'approved',
      reviewDate: new Date().toISOString().split('T')[0],
      reviewedBy: 'Chef User', // In a real app, this would be the current user
      reviewComment: validationNote,
      reviewAction: 'approve'
    };

    console.log('Approving order:', updatedOrder);
    
    // Use direct fetch call to update the order
    fetch(`http://localhost:3001/orders/${selectedOrder.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedOrder)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Order approved successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Commande approuvée",
        description: "La commande a été approuvée avec succès."
      });
      setLoading(false);
    })
    .catch(error => {
      console.error('Error approving order:', error);
      toast({
        title: "Erreur",
        description: `Erreur lors de l'approbation: ${error.message}`,
        variant: "destructive",
      });
      setLoading(false);
    });
  };

  // Handle order rejection
  const handleRejectOrder = () => {
    if (!validationNote.trim()) {
      toast({
        title: "Commentaire requis",
        description: "Veuillez ajouter un commentaire pour expliquer la raison du rejet.",
        variant: "destructive",
      });
      return;
    }

    setIsRejectDialogOpen(false);
    setLoading(true);
    
    // Create updated order object
    const updatedOrder = {
      ...selectedOrder,
      status: 'rejected',
      reviewDate: new Date().toISOString().split('T')[0],
      reviewedBy: 'Chef User', // In a real app, this would be the current user
      reviewComment: validationNote,
      reviewAction: 'reject'
    };

    console.log('Rejecting order:', updatedOrder);
    
    // Use direct fetch call to update the order
    fetch(`http://localhost:3001/orders/${selectedOrder.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedOrder)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Order rejected successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Commande rejetée",
        description: "La commande a été rejetée avec succès."
      });
      setLoading(false);
    })
    .catch(error => {
      console.error('Error rejecting order:', error);
      toast({
        title: "Erreur",
        description: `Erreur lors du rejet: ${error.message}`,
        variant: "destructive",
      });
      setLoading(false);
    });
  };

  // Helper function to get status badge based on order status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">En attente</span>;
      case 'approved':
        return <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">Approuvé</span>;
      case 'rejected':
        return <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-800">Rejeté</span>;
      default:
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">{status}</span>;
    }
  };

  // Handle refresh
  // Use React Query's refetch function instead of manual fetching
  const handleRefresh = () => {
    // Invalidate and refetch orders query
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    
    toast({
      title: "Rafraîchissement",
      description: "La liste des commandes a été rafraîchie.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Valider ou Rejeter les Bons</h1>
          <p className="text-muted-foreground">
            Examinez et approuvez les bons de commande en attente
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bons en attente</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'pending').reduce((sum, order) => sum + order.estimatedTotal, 0).toFixed(2)} €
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Départements</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(orders.filter(o => o.status === 'pending').map(o => o.department)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(orders.filter(o => o.status === 'pending').map(o => o.supplier)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes les dates</SelectItem>
            {/* Use a Set to get unique dates */}
            {[...new Set(orders.map(order => order.date))].map((date, index) => (
              <SelectItem key={`date-${index}-${date}`} value={date}>{date}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bons de commande en attente</CardTitle>
          <CardDescription>
            Validez ou rejetez les bons de commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading || isLoading ? (
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
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">{(order.estimatedTotal || 0).toFixed(2)} €</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openViewDialog(order)}
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {/* Only show approve/reject buttons for pending orders */}
                            {order.status === 'pending' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => openApproveDialog(order)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approuver
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => openRejectDialog(order)}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Rejeter
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun bon de commande en attente
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
                  <h3 className="text-sm font-medium">Fournisseur</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Nom:</span> {selectedOrder.supplier}
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
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell className="font-medium">{item.product || item.name || 'N/A'}</TableCell>
                        <TableCell>{item.category || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit || 'pcs'}
                        </TableCell>
                        <TableCell className="text-right">
                          {(item.price || item.unitPrice || 0).toFixed(2)} DH
                        </TableCell>
                        <TableCell className="text-right">
                          {(item.total || (item.price * item.quantity) || 0).toFixed(2)} DH
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {(selectedOrder.estimatedTotal || selectedOrder.total || 0).toFixed(2)} DH
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
            
            {/* Only show approve/reject buttons for pending orders */}
            {selectedOrder && selectedOrder.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openApproveDialog(selectedOrder);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openRejectDialog(selectedOrder);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Order Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver le bon de commande</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span>
                  Vous êtes sur le point d'approuver le bon de commande {selectedOrder.id || 'N/A'}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="approveNote">Note (optionnel)</Label>
            <Textarea
              id="approveNote"
              value={validationNote}
              onChange={(e) => setValidationNote(e.target.value)}
              placeholder="Ajoutez une note ou des instructions supplémentaires"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleApproveOrder}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer l'approbation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Order Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le bon de commande</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span>
                  Vous êtes sur le point de rejeter le bon de commande {selectedOrder.id || 'N/A'}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectNote">Motif du rejet</Label>
            <Textarea
              id="rejectNote"
              value={validationNote}
              onChange={(e) => setValidationNote(e.target.value)}
              placeholder="Veuillez indiquer la raison du rejet"
              className="mt-1"
            />
            {!validationNote && (
              <p className="text-sm text-red-500 mt-1">
                Le motif du rejet est obligatoire
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleRejectOrder}
              disabled={!validationNote}
              variant="destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidateOrders;
