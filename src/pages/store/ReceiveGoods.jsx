import React, { useState, useEffect } from 'react';
import { 
  FileInput, Search, CheckCircle, X, Package, Truck, Calendar, ArrowDown, Eye, FileText
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Mock data - replace with actual API calls
const mockOrders = [
  { 
    id: 'PO-2025-001', 
    supplier: 'Fournisseur A', 
    orderDate: '2025-05-15', 
    expectedDelivery: '2025-05-20',
    status: 'pending',
    items: [
      { id: 1, name: 'Farine de blé', category: 'Ingrédients de base', quantity: 50, unit: 'kg', received: 0 },
      { id: 2, name: 'Sucre', category: 'Ingrédients de base', quantity: 25, unit: 'kg', received: 0 },
      { id: 3, name: 'Huile d\'olive', category: 'Huiles et graisses', quantity: 10, unit: 'L', received: 0 }
    ]
  },
  { 
    id: 'PO-2025-002', 
    supplier: 'Fournisseur B', 
    orderDate: '2025-05-16', 
    expectedDelivery: '2025-05-21',
    status: 'pending',
    items: [
      { id: 4, name: 'Tomates', category: 'Légumes', quantity: 30, unit: 'kg', received: 0 },
      { id: 7, name: 'Lait', category: 'Produits laitiers', quantity: 20, unit: 'L', received: 0 }
    ]
  },
  { 
    id: 'PO-2025-003', 
    supplier: 'Fournisseur C', 
    orderDate: '2025-05-17', 
    expectedDelivery: '2025-05-22',
    status: 'pending',
    items: [
      { id: 5, name: 'Poulet', category: 'Viandes', quantity: 25, unit: 'kg', received: 0 },
      { id: 8, name: 'Œufs', category: 'Produits laitiers', quantity: 50, unit: 'unité', received: 0 }
    ]
  },
  { 
    id: 'PO-2025-004', 
    supplier: 'Fournisseur A', 
    orderDate: '2025-05-10', 
    expectedDelivery: '2025-05-15',
    status: 'partial',
    items: [
      { id: 1, name: 'Farine de blé', category: 'Ingrédients de base', quantity: 100, unit: 'kg', received: 70 },
      { id: 6, name: 'Pommes de terre', category: 'Légumes', quantity: 80, unit: 'kg', received: 80 }
    ]
  },
];

const ReceiveGoods = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [receivedItems, setReceivedItems] = useState([]);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
  }, []);

  // Filter orders based on search term, status filter, and active tab
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && (order.status === 'pending' || order.status === 'partial')) || 
                      (activeTab === 'completed' && order.status === 'completed');
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Status badge color mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">En attente</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Partiel</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Complété</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Open receive dialog
  const openReceiveDialog = (order) => {
    setSelectedOrder(order);
    // Initialize received items with current values
    setReceivedItems(order.items.map(item => ({
      ...item,
      toReceive: 0,
      isFullyReceived: item.received === item.quantity
    })));
    setDeliveryNote('');
    setInvoiceNumber('');
    setIsReceiveDialogOpen(true);
  };

  // Handle item checkbox change
  const handleItemCheckChange = (itemId, checked) => {
    setReceivedItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              isFullyReceived: checked,
              toReceive: checked ? item.quantity - item.received : 0
            } 
          : item
      )
    );
  };

  // Handle item quantity change
  const handleQuantityChange = (itemId, quantity) => {
    const numQuantity = Number(quantity);
    setReceivedItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const maxReceivable = item.quantity - item.received;
          const validQuantity = Math.min(Math.max(0, numQuantity), maxReceivable);
          return { 
            ...item, 
            toReceive: validQuantity,
            isFullyReceived: validQuantity === maxReceivable
          };
        }
        return item;
      })
    );
  };

  // Handle receive goods submission
  const handleReceiveGoods = () => {
    if (!selectedOrder || !receivedItems.some(item => item.toReceive > 0)) {
      return;
    }

    // Clone orders array
    const updatedOrders = [...orders];
    const orderIndex = updatedOrders.findIndex(o => o.id === selectedOrder.id);
    
    if (orderIndex === -1) return;

    // Update order items with received quantities
    const updatedOrder = { ...updatedOrders[orderIndex] };
    updatedOrder.items = updatedOrder.items.map(item => {
      const receivedItem = receivedItems.find(ri => ri.id === item.id);
      return {
        ...item,
        received: item.received + (receivedItem?.toReceive || 0)
      };
    });

    // Check if all items are fully received
    const isFullyReceived = updatedOrder.items.every(item => item.received === item.quantity);
    updatedOrder.status = isFullyReceived ? 'completed' : 'partial';

    // Update orders state
    updatedOrders[orderIndex] = updatedOrder;
    setOrders(updatedOrders);
    setIsReceiveDialogOpen(false);

    // In a real app, you would send this receipt to the API
    console.log(`Goods received for order ${selectedOrder.id}. Invoice: ${invoiceNumber}. Note: ${deliveryNote}`);
    console.log('Received items:', receivedItems.filter(item => item.toReceive > 0));
    
    // Show success message
    alert(`Réception enregistrée pour la commande ${selectedOrder.id}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Réception des Marchandises</h1>
          <p className="text-muted-foreground">
            Gérez les livraisons et mettez à jour le stock
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes en attente</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réceptions partielles</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'partial').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livraisons attendues aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.expectedDelivery === new Date().toISOString().split('T')[0]).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(orders.map(o => o.supplier)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="completed">Complétées</TabsTrigger>
            <TabsTrigger value="all">Toutes</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pending" className="mt-0">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par n° de commande ou fournisseur..."
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
                <SelectItem value="partial">Partiel</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Bons de commande à réceptionner</CardTitle>
              <CardDescription>
                Enregistrez les livraisons pour mettre à jour le stock
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
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Date commande</TableHead>
                        <TableHead>Livraison prévue</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Produits</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.supplier}</TableCell>
                            <TableCell>{order.orderDate}</TableCell>
                            <TableCell>{order.expectedDelivery}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>{order.items.length} produits</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => alert(`Détails de la commande ${order.id}`)}
                                  title="Voir les détails"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => openReceiveDialog(order)}
                                  disabled={order.status === 'completed'}
                                >
                                  <ArrowDown className="h-4 w-4 mr-2" />
                                  Réceptionner
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Aucune commande trouvée
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

        <TabsContent value="completed" className="mt-0">
          {/* Same content as "pending" tab but filtered for completed status */}
          {/* This is handled by the filteredOrders logic */}
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          {/* Same content as "pending" tab but showing all orders */}
          {/* This is handled by the filteredOrders logic */}
        </TabsContent>
      </Tabs>

      {/* Receive Goods Dialog */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Réceptionner des marchandises
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span>
                  Bon de commande: {selectedOrder.id} | Fournisseur: {selectedOrder.supplier}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">N° de facture</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Numéro de facture fournisseur"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="deliveryDate">Date de livraison</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="deliveryNote">Note de livraison</Label>
              <Textarea
                id="deliveryNote"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="Informations complémentaires sur la livraison"
                className="mt-1"
              />
            </div>
            
            <div className="mt-2">
              <Label className="text-base font-medium">Produits à réceptionner</Label>
              <div className="border rounded-md mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Commandé</TableHead>
                      <TableHead className="text-right">Déjà reçu</TableHead>
                      <TableHead className="text-right">À recevoir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivedItems.map((item) => {
                      const remainingQuantity = item.quantity - item.received;
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={item.isFullyReceived}
                              onCheckedChange={(checked) => handleItemCheckChange(item.id, checked)}
                              disabled={remainingQuantity === 0}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                          <TableCell className="text-right">{item.received} {item.unit}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              max={remainingQuantity}
                              value={item.toReceive}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              disabled={remainingQuantity === 0}
                              className="w-20 text-right inline-block"
                            />
                            <span className="ml-2">{item.unit}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiveDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleReceiveGoods}
              disabled={!receivedItems.some(item => item.toReceive > 0)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer la réception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiveGoods;
