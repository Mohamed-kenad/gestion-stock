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

// Mock data
const mockAlerts = [
  { 
    id: 'PO-2025-001', 
    title: 'Commande ingrédients cuisine',
    createdBy: 'Ahmed Benali',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur A', 
    department: 'Cuisine',
    createdAt: '2025-05-15', 
    status: 'pending',
    priority: 'high',
    dueDate: '2025-05-22',
    totalItems: 3,
    estimatedTotal: 450.75,
    items: [
      { id: 1, name: 'Farine de blé', category: 'Ingrédients de base', quantity: 50, unit: 'kg', unitPrice: 2.5, total: 125 },
      { id: 2, name: 'Sucre', category: 'Ingrédients de base', quantity: 30, unit: 'kg', unitPrice: 1.8, total: 54 },
      { id: 3, name: 'Huile d\'olive', category: 'Huiles et graisses', quantity: 10, unit: 'L', unitPrice: 8.5, total: 85 }
    ]
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
    priority: 'medium',
    dueDate: '2025-05-25',
    totalItems: 5,
    estimatedTotal: 95.30,
    items: [
      { id: 1, name: 'Poivre noir', category: 'Épices', quantity: 2, unit: 'kg', unitPrice: 15.5, total: 31 },
      { id: 2, name: 'Sel', category: 'Épices', quantity: 5, unit: 'kg', unitPrice: 1.2, total: 6 },
      { id: 3, name: 'Cumin', category: 'Épices', quantity: 1, unit: 'kg', unitPrice: 12.8, total: 12.8 },
      { id: 4, name: 'Paprika', category: 'Épices', quantity: 1.5, unit: 'kg', unitPrice: 14.5, total: 21.75 },
      { id: 5, name: 'Cannelle', category: 'Épices', quantity: 2, unit: 'kg', unitPrice: 11.9, total: 23.8 }
    ]
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
    priority: 'low',
    dueDate: '2025-05-26',
    totalItems: 12,
    estimatedTotal: 860.25,
    items: [
      { id: 1, name: 'Vin rouge Merlot', category: 'Alcools', quantity: 12, unit: 'bouteille', unitPrice: 18.5, total: 222 },
      { id: 2, name: 'Vin blanc Chardonnay', category: 'Alcools', quantity: 12, unit: 'bouteille', unitPrice: 16.8, total: 201.6 },
      { id: 3, name: 'Champagne', category: 'Alcools', quantity: 6, unit: 'bouteille', unitPrice: 45.5, total: 273 }
    ]
  }
];

const ValidationAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // Alert details
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [validationNote, setValidationNote] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 800);
  }, []);

  // Filter alerts based on search term and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === '' || alert.priority === priorityFilter;
    const matchesDepartment = departmentFilter === '' || alert.department === departmentFilter;
    return matchesSearch && matchesPriority && matchesDepartment;
  });

  // Get unique departments for filter dropdowns
  const departments = [...new Set(alerts.map(alert => alert.department))];

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

    // Update alert status
    const updatedAlerts = alerts.filter(alert => alert.id !== selectedAlert.id);
    setAlerts(updatedAlerts);
    setIsApproveDialogOpen(false);
    
    // Show success message
    alert(`Bon de commande ${selectedAlert.id} approuvé avec succès`);
  };

  // Handle reject alert
  const handleRejectAlert = () => {
    if (!selectedAlert || !validationNote) return;

    // Update alert status
    const updatedAlerts = alerts.filter(alert => alert.id !== selectedAlert.id);
    setAlerts(updatedAlerts);
    setIsRejectDialogOpen(false);
    
    // Show success message
    alert(`Bon de commande ${selectedAlert.id} rejeté`);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 800);
  };

  // Priority badge color mapping
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Haute</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Moyenne</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Basse</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertes de Validation</h1>
          <p className="text-muted-foreground">
            Bons de commande en attente de validation
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
            <CardTitle className="text-sm font-medium">Total des alertes</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priorité haute</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => a.priority === 'high').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priorité moyenne</CardTitle>
            <Bell className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => a.priority === 'medium').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priorité basse</CardTitle>
            <Bell className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => a.priority === 'low').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une alerte..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
            {departments.map(department => (
              <SelectItem key={department} value={department}>{department}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bons de commande en attente</CardTitle>
          <CardDescription>
            Validez ou rejetez les bons de commande
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
                    <TableHead>Département</TableHead>
                    <TableHead>Date limite</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.length > 0 ? (
                    filteredAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.id}</TableCell>
                        <TableCell>{alert.title}</TableCell>
                        <TableCell>
                          <div>{alert.createdBy}</div>
                          <div className="text-xs text-muted-foreground">{alert.createdByRole}</div>
                        </TableCell>
                        <TableCell>{alert.department}</TableCell>
                        <TableCell>
                          <div>{alert.dueDate}</div>
                          <div className={`text-xs ${getDaysRemaining(alert.dueDate) <= 2 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {getDaysRemaining(alert.dueDate)} jours restants
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(alert.priority)}</TableCell>
                        <TableCell className="text-right">{alert.estimatedTotal.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openViewDialog(alert)}
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => openApproveDialog(alert)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approuver
                            </Button>
                            <Button 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openRejectDialog(alert)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Rejeter
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucune alerte trouvée
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

      {/* View Alert Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du bon de commande</DialogTitle>
            <DialogDescription>
              {selectedAlert && (
                <span>
                  {selectedAlert.id} - {selectedAlert.title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Informations générales</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Créé par:</span> {selectedAlert.createdBy} ({selectedAlert.createdByRole})
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date de création:</span> {selectedAlert.createdAt}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Département:</span> {selectedAlert.department}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Détails de l'alerte</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Priorité:</span> {getPriorityBadge(selectedAlert.priority)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date limite:</span> {selectedAlert.dueDate}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Jours restants:</span> {getDaysRemaining(selectedAlert.dueDate)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Fournisseur:</span> {selectedAlert.supplier}
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
                    {selectedAlert.items.map((item) => (
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
                        {selectedAlert.estimatedTotal.toFixed(2)} €
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
            <Button 
              variant="outline" 
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => {
                setIsViewDialogOpen(false);
                openApproveDialog(selectedAlert);
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
                openRejectDialog(selectedAlert);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Alert Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver le bon de commande</DialogTitle>
            <DialogDescription>
              {selectedAlert && (
                <span>
                  Vous êtes sur le point d'approuver le bon de commande {selectedAlert.id}
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
              onClick={handleApproveAlert}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer l'approbation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Alert Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le bon de commande</DialogTitle>
            <DialogDescription>
              {selectedAlert && (
                <span>
                  Vous êtes sur le point de rejeter le bon de commande {selectedAlert.id}
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
              onClick={handleRejectAlert}
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

export default ValidationAlerts;
