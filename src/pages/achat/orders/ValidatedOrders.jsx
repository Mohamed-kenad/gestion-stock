import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Calendar, Eye, RefreshCw, ShoppingCart, Download
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
const mockValidatedOrders = [
  { 
    id: 'PO-2025-002', 
    title: 'Commande légumes',
    createdBy: 'Fatima Zahra',
    createdByRole: 'Vendor',
    supplier: 'Fournisseur B', 
    department: 'Cuisine',
    createdAt: '2025-05-16', 
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-17',
    validationNote: 'Approuvé pour la cuisine principale. Vérifier la fraîcheur à la livraison.',
    purchaseStatus: 'pending',
    totalItems: 2,
    estimatedTotal: 180.20,
    items: [
      { id: 1, name: 'Tomates', category: 'Légumes', quantity: 20, unit: 'kg', unitPrice: 3.5, total: 70 },
      { id: 2, name: 'Oignons', category: 'Légumes', quantity: 15, unit: 'kg', unitPrice: 2.8, total: 42 }
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
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-13',
    validationNote: 'Approuvé pour le réapprovisionnement du bar.',
    purchaseStatus: 'pending',
    totalItems: 8,
    estimatedTotal: 560.75,
    items: [
      { id: 1, name: 'Eau minérale', category: 'Boissons', quantity: 100, unit: 'bouteille', unitPrice: 0.8, total: 80 },
      { id: 2, name: 'Jus d\'orange', category: 'Boissons', quantity: 50, unit: 'bouteille', unitPrice: 1.5, total: 75 },
      { id: 3, name: 'Coca-Cola', category: 'Boissons', quantity: 50, unit: 'bouteille', unitPrice: 1.2, total: 60 }
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
    approvedBy: 'Karim Mansouri',
    approvedAt: '2025-05-06',
    validationNote: 'Approuvé. Vérifier la maturité des fruits à la livraison.',
    purchaseStatus: 'pending',
    totalItems: 6,
    estimatedTotal: 230.40,
    items: [
      { id: 1, name: 'Pommes', category: 'Fruits', quantity: 15, unit: 'kg', unitPrice: 2.5, total: 37.5 },
      { id: 2, name: 'Bananes', category: 'Fruits', quantity: 10, unit: 'kg', unitPrice: 1.8, total: 18 },
      { id: 3, name: 'Oranges', category: 'Fruits', quantity: 12, unit: 'kg', unitPrice: 2.2, total: 26.4 }
    ]
  }
];

const ValidatedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [date, setDate] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  // Order details
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [purchaseNote, setPurchaseNote] = useState('');
  const [actualTotal, setActualTotal] = useState(0);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockValidatedOrders);
      setLoading(false);
    }, 800);
  }, []);

  // Filter orders based on search term, filters, and date range
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === '' || order.department === departmentFilter;
    const matchesSupplier = supplierFilter === '' || order.supplier === supplierFilter;
    
    // Date filtering
    let matchesDate = true;
    if (date.from && date.to) {
      const orderDate = new Date(order.approvedAt);
      matchesDate = orderDate >= date.from && orderDate <= date.to;
    }
    
    return matchesSearch && matchesDepartment && matchesSupplier && matchesDate;
  });

  // Get unique departments and suppliers for filter dropdowns
  const departments = [...new Set(orders.map(order => order.department))];
  const suppliers = [...new Set(orders.map(order => order.supplier))];

  // Open view dialog
  const openViewDialog = (order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  // Open process dialog
  const openProcessDialog = (order) => {
    setSelectedOrder(order);
    setPurchaseNote('');
    setActualTotal(order.estimatedTotal);
    setIsProcessDialogOpen(true);
  };

  // Handle process order
  const handleProcessOrder = () => {
    if (!selectedOrder) return;

    // Update order status
    const updatedOrders = orders.filter(order => order.id !== selectedOrder.id);
    setOrders(updatedOrders);
    setIsProcessDialogOpen(false);
    
    // Show success message
    alert(`Bon de commande ${selectedOrder.id} traité avec succès`);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOrders(mockValidatedOrders);
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
          <h1 className="text-3xl font-bold tracking-tight">Bons Validés à Traiter</h1>
          <p className="text-muted-foreground">
            Traitez les bons de commande approuvés par les chefs
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
            <CardTitle className="text-sm font-medium">Bons à traiter</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Départements</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(orders.map(order => order.department)).size}
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
              {new Set(orders.map(order => order.supplier)).size}
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

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bons de commande validés</CardTitle>
          <CardDescription>
            Liste des bons de commande approuvés à traiter
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
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Date approbation</TableHead>
                    <TableHead>Approuvé par</TableHead>
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
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>{order.department}</TableCell>
                        <TableCell>{order.approvedAt}</TableCell>
                        <TableCell>{order.approvedBy}</TableCell>
                        <TableCell className="text-right">{order.estimatedTotal.toFixed(2)} €</TableCell>
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
                            <Button 
                              variant="outline" 
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => openProcessDialog(order)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Traiter
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucun bon de commande à traiter
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
                    <p className="text-sm">
                      <span className="font-medium">Fournisseur:</span> {selectedOrder.supplier}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Approbation</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Approuvé par:</span> {selectedOrder.approvedBy}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date d'approbation:</span> {selectedOrder.approvedAt}
                    </p>
                    {selectedOrder.validationNote && (
                      <p className="text-sm">
                        <span className="font-medium">Note:</span> {selectedOrder.validationNote}
                      </p>
                    )}
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
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
            <Button 
              variant="outline" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => {
                setIsViewDialogOpen(false);
                openProcessDialog(selectedOrder);
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Traiter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Order Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Traiter le bon de commande</DialogTitle>
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
              <div>
                <h3 className="text-sm font-medium mb-2">Produits à acheter</h3>
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
                        Total estimé
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {selectedOrder.estimatedTotal.toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="actualTotal">Montant réel de l'achat</Label>
                  <div className="flex items-center mt-1">
                    <Input
                      id="actualTotal"
                      type="number"
                      step="0.01"
                      value={actualTotal}
                      onChange={(e) => setActualTotal(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <span className="ml-2">€</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="purchaseNote">Note d'achat</Label>
                  <Textarea
                    id="purchaseNote"
                    value={purchaseNote}
                    onChange={(e) => setPurchaseNote(e.target.value)}
                    placeholder="Ajoutez des détails sur l'achat, les modifications, ou les informations de livraison"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleProcessOrder}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Confirmer l'achat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidatedOrders;
