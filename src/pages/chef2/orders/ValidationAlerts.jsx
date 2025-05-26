import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, Filter, Eye, RefreshCw, CheckCircle, X, Clock
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API functions for alerts
const fetchAlerts = async () => {
  const response = await axios.get(`${API_URL}/validationAlerts`);
  return response.data;
};

const approveAlert = async (alertId, note) => {
  // First get the current alert
  const response = await axios.get(`${API_URL}/validationAlerts/${alertId}`);
  const alert = response.data;
  
  // Update the alert status
  await axios.patch(`${API_URL}/validationAlerts/${alertId}`, {
    status: 'approved',
    validationNote: note,
    validatedAt: new Date().toISOString(),
  });
  
  // Return the updated alert
  return alert;
};

const rejectAlert = async (alertId, note) => {
  // First get the current alert
  const response = await axios.get(`${API_URL}/validationAlerts/${alertId}`);
  const alert = response.data;
  
  // Update the alert status
  await axios.patch(`${API_URL}/validationAlerts/${alertId}`, {
    status: 'rejected',
    validationNote: note,
    validatedAt: new Date().toISOString(),
  });
  
  // Return the updated alert
  return alert;
};

const ValidationAlerts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // Alert details
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [validationNote, setValidationNote] = useState('');

  // Access the query client
  const queryClient = useQueryClient();

  // Fetch alerts with React Query
  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['validationAlerts'],
    queryFn: fetchAlerts,
  });

  // Mutations for approving and rejecting alerts
  const approveMutation = useMutation({
    mutationFn: ({ alertId, note }) => approveAlert(alertId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validationAlerts'] });
      setIsApproveDialogOpen(false);
      // Show success message
      alert(`Bon de commande ${selectedAlert.id} approuvé avec succès`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ alertId, note }) => rejectAlert(alertId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validationAlerts'] });
      setIsRejectDialogOpen(false);
      // Show success message
      alert(`Bon de commande ${selectedAlert.id} rejeté`);
    },
  });

  // Filter alerts based on search term and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.createdBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === '' || alert.priority === priorityFilter;
    const matchesDepartment = departmentFilter === '' || alert.department === departmentFilter;
    return matchesSearch && matchesPriority && matchesDepartment;
  });

  // Get unique departments for filter dropdowns
  const departments = [...new Set(alerts.map(alert => alert.department).filter(Boolean))];

  // Open view dialog
  const openViewDialog = (alert) => {
    setSelectedAlert(alert);
    setIsViewDialogOpen(true);
  };

  // Open approve dialog
  const openApproveDialog = (alert) => {
    setSelectedAlert(alert);
    setValidationNote('');
    setIsApproveDialogOpen(true);
  };

  // Open reject dialog
  const openRejectDialog = (alert) => {
    setSelectedAlert(alert);
    setValidationNote('');
    setIsRejectDialogOpen(true);
  };

  // Handle approve alert
  const handleApproveAlert = () => {
    if (!selectedAlert) return;
    approveMutation.mutate({ alertId: selectedAlert.id, note: validationNote });
  };

  // Handle reject alert
  const handleRejectAlert = () => {
    if (!selectedAlert || !validationNote) return;
    rejectMutation.mutate({ alertId: selectedAlert.id, note: validationNote });
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Priority badge color mapping
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Haute</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Moyenne</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Basse</Badge>;
      default:
        return <Badge variant="outline">Inconnue</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alertes de validation</h1>
          <p className="text-muted-foreground">
            Gérez les alertes de validation pour les bons de commande en attente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Bell className="mr-2 h-5 w-5 text-red-500" />
              Alertes prioritaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {alerts.filter(a => a.priority === 'high').length}
            </p>
            <p className="text-sm text-muted-foreground">
              Bons nécessitant une attention immédiate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Clock className="mr-2 h-5 w-5 text-orange-500" />
              Alertes en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {alerts.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Total des bons à examiner
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Validés aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">
              Bons traités aujourd'hui
            </p>
          </CardContent>
        </Card>
      </div>

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
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les priorités</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="low">Basse</SelectItem>
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
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Aucune alerte trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.id}</TableCell>
                    <TableCell>{alert.title}</TableCell>
                    <TableCell>{alert.department}</TableCell>
                    <TableCell>{alert.supplier}</TableCell>
                    <TableCell>{alert.createdAt}</TableCell>
                    <TableCell>{getPriorityBadge(alert.priority)}</TableCell>
                    <TableCell>{alert.dueDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openViewDialog(alert)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-green-600" onClick={() => openApproveDialog(alert)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => openRejectDialog(alert)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="p-4 border-t">
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
      </div>

      {/* View Alert Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du bon de commande</DialogTitle>
            <DialogDescription>
              Informations détaillées sur le bon de commande
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Informations générales</h3>
                  <div className="mt-2 border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">ID:</span>
                      <span className="text-sm">{selectedAlert.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Titre:</span>
                      <span className="text-sm">{selectedAlert.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Créé par:</span>
                      <span className="text-sm">{selectedAlert.createdBy} ({selectedAlert.createdByRole})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Date de création:</span>
                      <span className="text-sm">{selectedAlert.createdAt}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Détails de la commande</h3>
                  <div className="mt-2 border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Fournisseur:</span>
                      <span className="text-sm">{selectedAlert.supplier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Département:</span>
                      <span className="text-sm">{selectedAlert.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Priorité:</span>
                      <span className="text-sm">{getPriorityBadge(selectedAlert.priority)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Date d'échéance:</span>
                      <span className="text-sm">{selectedAlert.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Articles commandés</h3>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Quantité</TableHead>
                        <TableHead className="text-right">Prix unitaire</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedAlert.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                          <TableCell className="text-right">{item.unitPrice.toFixed(2)} MAD</TableCell>
                          <TableCell className="text-right">{item.total.toFixed(2)} MAD</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <div className="border rounded-lg p-3 w-64">
                    <div className="flex justify-between font-medium">
                      <span>Total estimé:</span>
                      <span>{selectedAlert.estimatedTotal.toFixed(2)} MAD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="w-full sm:w-auto">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Alert Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approuver le bon de commande</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir approuver ce bon de commande ?
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="border rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">ID:</span>
                  <span className="text-sm">{selectedAlert.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Titre:</span>
                  <span className="text-sm">{selectedAlert.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Fournisseur:</span>
                  <span className="text-sm">{selectedAlert.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total:</span>
                  <span className="text-sm">{selectedAlert.estimatedTotal.toFixed(2)} MAD</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="approvalNote">Note d'approbation (optionnelle)</Label>
                <Textarea
                  id="approvalNote"
                  placeholder="Ajoutez une note ou un commentaire concernant votre approbation..."
                  value={validationNote}
                  onChange={(e) => setValidationNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
              Annuler
            </Button>
            <Button 
              variant="default" 
              onClick={handleApproveAlert}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Alert Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rejeter le bon de commande</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour le rejet de ce bon de commande.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="border rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">ID:</span>
                  <span className="text-sm">{selectedAlert.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Titre:</span>
                  <span className="text-sm">{selectedAlert.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Fournisseur:</span>
                  <span className="text-sm">{selectedAlert.supplier}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rejectionNote">Raison du rejet <span className="text-red-500">*</span></Label>
                <Textarea
                  id="rejectionNote"
                  placeholder="Veuillez expliquer pourquoi vous rejetez ce bon de commande..."
                  value={validationNote}
                  onChange={(e) => setValidationNote(e.target.value)}
                  rows={3}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Cette information sera partagée avec le demandeur.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectAlert}
              disabled={!validationNote}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              <X className="mr-2 h-4 w-4" />
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidationAlerts;
